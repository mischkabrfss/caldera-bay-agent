# Bande-son de tiktok.html (20 s, 48 kHz stéréo) : voix off (voice.py) + musique et bruitages synthétisés (aucun son sous licence).
# Écrit aussi voice/timeline.json (heure exacte de chaque mot et des temps forts), lu par tiktok.html : image et son restent calés.
# Usage : python3 voice.py && python3 tiktok-sound.py  →  tiktok-sound.wav (−14 LUFS, norme TikTok)
import json, os, subprocess, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
FF = os.environ.get('FFMPEG', 'ffmpeg')
SR, DUR = 48000, 20.0
N = int(SR * DUR)
rng = np.random.default_rng(7)

# ---------- voix : placement de chaque phrase ----------
START = [0.15, 1.70, 2.62, 3.45, 6.00, 8.90, 10.80, 12.80, 14.85, 16.85]  # début du 1er mot de chaque phrase (s)
DELAY = 0.065  # décalage du décodeur MP3 : le 1er mot s'entend ~65 ms après l'instant annoncé par edge-tts
data = json.load(open(f'{HERE}/voice/words.json'))

def read_wav(path):
    w = wave.open(path); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
    if w.getnchannels() == 2: x = x.reshape(-1, 2).mean(1)
    assert w.getframerate() == SR, path
    return x

voice = np.zeros(N)
lines = []
for i, (line, s) in enumerate(zip(data['lines'], START)):
    mp3, wav = f'{HERE}/voice/{i:02d}.mp3', f'{HERE}/voice/{i:02d}.wav'
    subprocess.run([FF, '-loglevel', 'error', '-y', '-i', mp3, '-ar', str(SR), '-ac', '1', wav], check=True)
    x = read_wav(wav)
    w0 = line['words'][0]['t']
    at = s - (w0 + DELAY)
    env = np.convolve(np.abs(x), np.ones(240) / 240, 'same'); on = np.where(env > .006)[0]
    a = int(round(at * SR)); n = min(len(x), N - a)
    voice[a:a + n] += x[:n]
    lines.append({'text': line['text'], 'start': s, 'end': round(at + on[-1] / SR, 3),
                  'words': [{'w': w['w'], 't': round(s + w['t'] - w0, 3)} for w in line['words']]})

def W(li, wi): return lines[li]['words'][wi]['t']
cues = {
    'hook1': W(0, 0), 'hook2': W(0, 2), 'hook3': W(0, 3), 'hookQ': W(0, 5), 'look': W(1, 0),
    's2': 2.55, 'type0': 2.70, 'type1': 3.12, 'click': 3.30, 'gauge0': W(3, 0), 'chip30': W(3, 2), 'score': W(3, 8),
    's3': 5.95, 'card1': W(4, 0), 'card2': W(4, 1), 'card3': W(4, 4), 'card4': W(4, 6), 'expand': W(4, 7), 'fixed': W(4, 7) + .38,
    's4': 8.85, 'hot': W(5, 3),
    's5': 10.75, 'best': W(6, 1), 'rivals': W(6, 4),
    's6': 12.75, 'ten': W(7, 1), 'msg1': W(7, 2) + .05, 'msg2': W(7, 4) - .05, 'checked': W(7, 5),
    's7': 14.80, 'logo': W(8, 0), 'free': W(8, 4), 'button': W(8, 4) + .55, 'bio0': W(9, 0), 'bio': W(9, 2), 'tap': 18.15,
    'end': DUR,
}
cues = {k: round(v, 3) for k, v in cues.items()}
json.dump({'dur': DUR, 'voice': data['voice'], 'lines': lines, 'cues': cues}, open(f'{HERE}/voice/timeline.json', 'w'), ensure_ascii=False, indent=1)
C = cues

# ---------- outils de synthèse ----------
bus = {k: np.zeros((2, N)) for k in ('drums', 'music', 'sfx', 'verb')}
def tt(d): return np.arange(int(d * SR)) / SR
def put(name, t0, sig, g=1.0, pan=0.0, verb=0.0):
    i = int(round(t0 * SR))
    if i >= N or len(sig) == 0: return
    if i < 0: sig, i = sig[-i:], 0
    n = min(len(sig), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.4142, np.sin((pan + 1) * np.pi / 4) * 1.4142
    bus[name][0, i:i + n] += sig[:n] * g * l; bus[name][1, i:i + n] += sig[:n] * g * r
    if verb: bus['verb'][0, i:i + n] += sig[:n] * g * verb * l; bus['verb'][1, i:i + n] += sig[:n] * g * verb * r
def filt(x, lo=None, hi=None, order=2):
    pad = 4096; y = np.concatenate([x, np.zeros(pad)]); X = np.fft.rfft(y); f = np.fft.rfftfreq(len(y), 1 / SR); H = np.ones_like(f)
    if hi: H /= np.sqrt(1 + (f / hi) ** (2 * order))
    if lo: H /= np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (2 * order))
    return np.fft.irfft(X * H, n=len(y))[:len(x)]
def shelf(x, f0, gain_db):  # aigus (+gain au-dessus de f0), en douceur
    pad = 4096; y = np.concatenate([x, np.zeros(pad)]); X = np.fft.rfft(y); f = np.fft.rfftfreq(len(y), 1 / SR)
    g = 10 ** (gain_db / 20); H = 1 + (g - 1) / (1 + (f0 / np.maximum(f, 1e-3)) ** 2)
    return np.fft.irfft(X * H, n=len(y))[:len(x)]
def sweep_lp(x, f0, f1, curve=2.0):
    n = len(x); y = np.empty(n); z = 0.0
    fc = f0 + (f1 - f0) * np.linspace(0, 1, n) ** curve; a = 1 - np.exp(-2 * np.pi * fc / SR)
    for i in range(n): z += a[i] * (x[i] - z); y[i] = z
    return y
def noise(d): return rng.standard_normal(int(d * SR))
def fade(s, a=.003, r=.01):
    n = len(s); e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return s * e
def saw(hz, t, maxk=30, tilt=0.0):
    s = np.zeros_like(t)
    for k in range(1, int(min(maxk, 11000 / hz)) + 1): s += np.sin(2 * np.pi * hz * k * t + k) / k * (np.exp(-t * tilt * k) if tilt else 1)
    return s

# ---------- instruments ----------
def kick(t0, g=.6):
    t = tt(.42); f = 50 + 190 * np.exp(-t * 40); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8.5)
    s += filt(noise(.42), lo=1800) * np.exp(-t * 650) * .4
    put('drums', t0, np.tanh(s * 1.9) / np.tanh(1.9), g)
CLAP_T = tt(.32)
CLAP = filt(noise(.32) * (sum((CLAP_T >= o) * np.exp(-np.clip(CLAP_T - o, 0, None) * 120) for o in (0, .009, .019)) + (CLAP_T >= .028) * np.exp(-np.clip(CLAP_T - .028, 0, None) * 18) * .8), lo=950, hi=5200)
def clap(t0, g=.3): put('drums', t0, CLAP, g, .04, verb=.3)
HAT = filt(noise(.25), lo=8000) * np.exp(-tt(.25) * 60)
OHAT = filt(noise(.42), lo=6800) * np.exp(-tt(.42) * 11)
def snare(t0, g=.22):
    t = tt(.2); s = filt(noise(.2), lo=1300, hi=9000) * np.exp(-t * 24) + np.sin(2 * np.pi * 200 * t) * np.exp(-t * 32) * .6
    put('drums', t0, s, g, verb=.15)
def pluck(t0, hz, g=.1, pan=0.0, bright=1.6, d=.3):
    t = tt(d); s = saw(hz, t, 24, bright) * np.minimum(1, t / .002) * np.exp(-t * 11)
    put('music', t0, fade(s), g, pan, verb=.28)
def bass(t0, hz, d=.2, g=.2):
    t = tt(d); s = .85 * np.sin(2 * np.pi * hz * t) + .35 * np.sin(4 * np.pi * hz * t) + .25 * saw(hz * 2, t, 10, .004)
    put('music', t0, fade(np.tanh(s * 1.6) * np.exp(-t * 3), .004, .02), g)
def pad(t0, notes, d, g=.045):
    t = tt(d); s = sum(saw(n * dt, t, 10) for n in notes for dt in (.996, 1.004)) * np.minimum(1, t / .25)
    put('music', t0, fade(filt(s, hi=3200), .01, .25), g, verb=.4)
def impact(t0, g=.8, d=1.6):
    t = tt(d); f = 70 * np.exp(-t * 2.6) + 28; sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.8)
    s = sub + filt(noise(d), hi=2400) * np.exp(-t * 9) * .5 + filt(noise(d), lo=4500) * np.exp(-t * 5) * .14
    put('sfx', t0, np.tanh(s * 1.5), g, verb=.4)
def thump(t0, g=.45):
    t = tt(.35); f = 90 * np.exp(-t * 14) + 45; s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11) + filt(noise(.35), lo=900, hi=5000) * np.exp(-t * 60) * .5
    put('sfx', t0, np.tanh(s * 1.4), g, verb=.15)
def whoosh(t_end, d=.4, g=.22, pans=(-.7, .7), up=True):
    n = int(d * SR); x = sweep_lp(rng.standard_normal(n), 300 if up else 8000, 8000 if up else 300, 2 if up else .5)
    p = np.linspace(0, 1, n); e = (p ** 1.6 if up else (1 - p) ** 1.6) * np.sin(np.pi * p) ** .4
    for pan in pans: put('sfx', t_end - d, x * e * .9, g / len(pans) * 1.6, pan, verb=.2)
def blip(t0, f0, f1=None, d=.09, g=.12, pan=0.0, verb=.15, wave_='sin'):
    t = tt(d); f = np.full_like(t, f0) if f1 is None else f0 + (f1 - f0) * (t / d); ph = 2 * np.pi * np.cumsum(f) / SR
    s = (np.sin(ph) if wave_ == 'sin' else np.sign(np.sin(ph)) * .55) * np.exp(-t * 26)
    put('sfx', t0, fade(s, .001, .006), g, pan, verb)
def click(t0, g=.18, hz=3200, pan=0.0):
    t = tt(.03); s = filt(noise(.03), lo=1500, hi=9000) * np.exp(-t * 400) + np.sin(2 * np.pi * hz * t) * np.exp(-t * 500) * .5
    put('sfx', t0, s, g, pan)
def ping(t0, g=.13, pan=0.0, hz=1318.5):
    t = tt(.7); s = (np.sin(2 * np.pi * hz * t) + .35 * np.sin(4 * np.pi * hz * t)) * np.exp(-t * 7)
    for k, dl in enumerate((0, .12, .24)): put('sfx', t0 + dl, s, g * (.5 ** k), pan * (1 if k % 2 == 0 else -1), verb=.3)
def kaching(t0, g=.4):
    t = tt(1.4); s = sum(a * np.sin(2 * np.pi * 1245 * m * t) * np.exp(-t * dcy) for m, a, dcy in ((1, 1, 3.2), (2.76, .6, 4.5), (5.4, .35, 7), (8.93, .2, 9)))
    s += filt(noise(1.4), lo=6000) * np.exp(-t * 5) * (1 + .6 * np.sin(2 * np.pi * 23 * t)) * .25
    click(t0 - .035, .35, 2600); put('sfx', t0, s, g, .1, verb=.5)
def shimmer(t0, d=.5, g=.07):
    t = tt(d); s = sum(np.sin(2 * np.pi * f * t) * (.5 + .5 * np.sin(2 * np.pi * (9 + k) * t + k)) for k, f in enumerate((3520, 4186, 5274, 6272)))
    put('sfx', t0, fade(s * np.sin(np.pi * t / d), .01, .05), g, verb=.6)
def buzzer(t0, g=.2):  # « faux ! » : deux notes carrées descendantes
    for k, (f, d) in enumerate(((330, .13), (247, .26))):
        t = tt(d); s = np.sign(np.sin(2 * np.pi * f * t)) * .5 + np.sin(2 * np.pi * f * .5 * t) * .5
        put('sfx', t0 + k * .14, fade(filt(s, hi=2600) * np.exp(-t * 3), .002, .03), g, verb=.15)
def success(t0, g=.16):  # « corrigé ! » : deux notes qui montent
    for k, f in enumerate((1046.5, 1568)): blip(t0 + k * .09, f, None, .22, g, .2 * (k * 2 - 1), .35)
def glitch(t0, d=.22, g=.25):
    n = int(d * SR); x = rng.standard_normal(n); step = rng.integers(20, 160, 40)
    gates = np.repeat(rng.random(len(step)) > .45, step)[:n]; gates = np.pad(gates, (0, max(0, n - len(gates))))
    crushed = np.round(np.repeat(x[::12], 12)[:n] * 3) / 3
    put('sfx', t0, filt(crushed * gates, lo=400, hi=7000) * np.linspace(1, .2, n), g, verb=.1)
def scan(t0, d=.7, g=.12):
    t = tt(d); n = len(t); x = sweep_lp(rng.standard_normal(n), 600, 5000, 1.2) * (.6 + .4 * np.sin(2 * np.pi * 18 * t))
    hum = np.sin(2 * np.pi * (220 + 440 * t / d) * t) * .3
    put('sfx', t0, fade((x + hum) * np.sin(np.pi * t / d) ** .5, .01, .05), g, pan=0, verb=.25)
def pop(t0, g=.14, hz=700, pan=0.0):
    t = tt(.08); f = hz * (1 + 1.6 * np.exp(-t * 60)); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40)
    put('sfx', t0, s, g, pan, .1)
def boing(t0, g=.13):
    t = tt(.45); f = 260 + 380 * np.exp(-t * 9) * np.abs(np.cos(2 * np.pi * 7 * t)); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5)
    put('sfx', t0, fade(s, .002, .05), g, .1, .2)
def riser(t0, d, g=.4):
    n = int(d * SR); p = np.linspace(0, 1, n)
    put('sfx', t0, sweep_lp(rng.standard_normal(n), 300, 9500, 2.4) * p ** 2.2 * .5, g, verb=.25)
    fsw = 110 * 2 ** (p * 3); put('music', t0, (np.sin(2 * np.pi * np.cumsum(fsw) / SR) * p ** 2 * .3), g * .8)
def crackle(t0, d=.7, g=.08):
    for k in range(40):
        u = rng.random() ** 1.6 * d; click(t0 + u, g * (1 - u / d) * (.5 + rng.random()), 2500 + 4000 * rng.random(), rng.uniform(-.8, .8))

A1, F1, C2, G1 = 55.0, 43.65, 65.41, 49.0
CH = {'Am': (A1, (220, 261.63, 329.63)), 'F': (F1, (174.61, 220, 261.63)), 'C': (C2, (261.63, 329.63, 392)), 'G': (G1, (196, 246.94, 293.66))}

# ---------- accroche (0 – 2,55 s) : silence + impacts, pas de beat ----------
glitch(0.0, .18, .3); impact(0.0, .55, 1.0)
pad(0.0, (110, 130.81, 164.81), 2.4, .03)
whoosh(C['hook1'], .14, .12); impact(C['hook1'], .6, 1.1); thump(C['hook1'], .35)
whoosh(C['hook2'], .14, .12); impact(C['hook2'], .7, 1.1); thump(C['hook2'], .4)
impact(C['hook3'], 1.0, 1.8); buzzer(C['hook3'] + .02, .22); glitch(C['hook3'], .14, .2)
pop(C['hookQ'], .16, 900)
whoosh(C['look'], .25, .16, up=False)
riser(C['look'] + .1, C['s2'] - C['look'] - .18, .45)
tr = C['look'] + .3
while tr < C['s2'] - .1:
    step = .12 if tr < C['s2'] - .45 else .06 if tr < C['s2'] - .22 else .03
    snare(tr, .05 + .18 * (tr - C['look']) / (C['s2'] - C['look'])); tr += step
whoosh(C['s2'], .3, .22)

# ---------- beat 128 BPM (2,55 – 19,43 s) ----------
BEAT = 60 / 128; T0 = C['s2']; NB = 36  # 9 mesures
prog = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am']
for b in range(NB):
    t0 = T0 + b * BEAT
    kick(t0, .55)
    if b % 2 == 1: clap(t0, .28)
    put('drums', t0 + BEAT / 2, OHAT, .09, .25)
    for s16 in range(4):
        put('drums', t0 + s16 * BEAT / 4, HAT, (.07 if s16 % 2 else .04), -.3 + .2 * s16)
for bar, name in enumerate(prog):
    t0 = T0 + bar * 4 * BEAT; root, tri = CH[name]
    pad(t0, tri, 4 * BEAT, .04)
    for e in range(16):
        tb = t0 + e * BEAT / 4
        if e % 4 == 2: bass(tb, root * 2, .19, .2)
        if e % 4 == 3: bass(tb, root * 2, .1, .12)
        notes = [tri[0] * 2, tri[1] * 2, tri[2] * 2, tri[0] * 4, tri[2] * 2, tri[1] * 2, tri[0] * 4, tri[1] * 4]
        pluck(tb, notes[e % 8], .075 + (.02 if bar >= 3 else 0), (-.5, .5)[e % 2], 1.2 if bar < 3 else 1.6)
end_hit = T0 + NB * BEAT
impact(end_hit, .55, 1.2); pad(end_hit, (220, 261.63, 329.63, 440), 1.0, .05)

# ---------- bruitages calés sur l'image ----------
impact(C['s2'], .75)
for k in range(14): click(C['type0'] + k * (C['type1'] - C['type0']) / 14, .08 + .05 * rng.random(), 2800 + 900 * rng.random(), .1)
whoosh(C['click'] - .02, .3, .06, (.5,))
click(C['click'], .32, 2200); pop(C['click'] + .02, .12, 500)
whoosh(C['gauge0'] + .15, .25, .12)
pop(C['chip30'], .12, 1100, -.3)
last = -1
g0, g1 = C['gauge0'] + .12, C['score']
for i in range(0, int((g1 - g0) * SR), int(.004 * SR)):
    x = i / SR / (g1 - g0); v = int(64 * (1 - (1 - x) ** 3))
    if v > last: last = v; click(g0 + i / SR, .04, 3600 + 25 * v, .1)
ping(C['score'], .16, 0, 1568); impact(C['score'], .55); shimmer(C['score'] + .05, .6, .07)

whoosh(C['s3'], .3, .2); impact(C['s3'], .35, .8)
for k, key in enumerate(('card1', 'card2', 'card3', 'card4')):
    thump(C[key], .4); blip(C[key] + .03, 520, 300, .12, .1, (-.4, .4)[k % 2], wave_='sq')
whoosh(C['expand'], .25, .14); shimmer(C['expand'], .5, .06)
success(C['fixed'], .15)

whoosh(C['s4'], .32, .22); impact(C['s4'], .5)
ping(C['s4'] + .1, .09, -.2, 880)
for k in range(6): whoosh(C['s4'] + .16 + k * .07, .12, .05, ((-.6, .6)[k % 2],))
impact(C['hot'], .45, 1.0); ping(C['hot'] + .02, .12, .2, 1760)

whoosh(C['s5'], .32, .22); impact(C['s5'], .4)
scan(C['s5'] + .15, .75, .1)
for k, dt in enumerate((.2, .32, .45, .58, .7)): pop(C['s5'] + .15 + dt, .11, 600 + 120 * k, (-.5, .5)[k % 2])
impact(C['best'], .4, .9); impact(C['rivals'], .35, .8)

whoosh(C['s6'], .32, .22)
impact(C['ten'], .8, 1.4); thump(C['ten'], .4)
pop(C['msg1'], .14, 800, -.3); pop(C['msg2'], .14, 950, .3)
impact(C['checked'], .45, .9); ping(C['checked'] + .03, .1, 0, 1318.5)

whoosh(C['s7'], .4, .3); impact(C['s7'], .9, 1.8); glitch(C['s7'], .1, .15)
whoosh(C['logo'] + .1, .2, .1, up=False)
kaching(C['free'], .42); impact(C['free'], .7, 1.4); crackle(C['free'] + .05, .8, .07)
pop(C['button'], .13, 650)
whoosh(C['bio0'], .2, .12); boing(C['bio'], .16)
click(C['tap'], .3, 2300); pop(C['tap'] + .02, .12, 520)

# ---------- voix : traitement (passe-haut, compresseur doux, présence) ----------
v = filt(voice, lo=85, order=2)
env = np.sqrt(np.convolve(v ** 2, np.ones(480) / 480, 'same') + 1e-12)
thr = 10 ** (-24 / 20); ratio = 2.6
gain = np.where(env > thr, (thr * (env / thr) ** (1 / ratio)) / env, 1.0)
gs = np.empty_like(gain); z = 1.0; a_att, a_rel = 1 - np.exp(-1 / (.004 * SR)), 1 - np.exp(-1 / (.09 * SR))
for i in range(len(gain)):
    z += (a_att if gain[i] < z else a_rel) * (gain[i] - z); gs[i] = z
v = shelf(v * gs, 3200, 2.5)
v /= np.abs(v).max() + 1e-9

# ---------- mixage : la musique s'efface sous la voix (ducking) ----------
venv = np.convolve(np.abs(v), np.ones(1200) / 1200, 'same'); venv /= venv.max()
duck = 1 - .62 * np.clip(venv / .12, 0, 1)
dz = np.empty_like(duck); z = 1.0; a_att, a_rel = 1 - np.exp(-1 / (.02 * SR)), 1 - np.exp(-1 / (.25 * SR))
for i in range(N):
    z += (a_att if duck[i] < z else a_rel) * (duck[i] - z); dz[i] = z

# réverbération simple (échos diffus) pour le bus verb
verb = np.zeros_like(bus['verb'])
for d_, g_ in ((.031, .5), (.047, .42), (.071, .36), (.097, .3), (.131, .24), (.173, .18), (.229, .13), (.311, .09)):
    k = int(d_ * SR); verb[0, k:] += bus['verb'][0, :-k] * g_; verb[1, k + 37:] += bus['verb'][1, :-(k + 37)] * g_
verb = np.stack([filt(verb[0], lo=300, hi=6000), filt(verb[1], lo=300, hi=6000)])

music = (bus['drums'] * .9 + bus['music'] + verb * .35) * dz
sfx = bus['sfx'] * (1 - .25 * (1 - dz))
mix = music * .55 + sfx * .8 + np.stack([v, v]) * .9
mix = np.tanh(mix * 1.1) / 1.1
mix *= np.minimum(1, (DUR - np.arange(N) / SR) / .25)  # fin propre (pas de clic)
raw = f'{HERE}/voice/mix-raw.wav'
with wave.open(raw, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix.T, -1, 1) * 32767).astype(np.int16).tobytes())

# ---------- normalisation −14 LUFS / −1 dBTP (deux passes ffmpeg) ----------
m = subprocess.run([FF, '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1:LRA=9:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
af = f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
subprocess.run([FF, '-loglevel', 'error', '-y', '-i', raw, '-af', af, '-ar', str(SR), f'{HERE}/tiktok-sound.wav'], check=True)
print('ok', {k: v for k, v in cues.items()})
