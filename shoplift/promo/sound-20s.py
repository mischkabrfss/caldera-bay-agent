# Bande-son de youtube.html, entièrement synthétisée (aucun son sous licence) : 48 kHz stéréo.
# Beat 120 BPM qui démarre à l'iris (2,5 s), bruitages calés sur les animations, fin nette à 14,5 s.
import wave
import numpy as np

SR, DUR = 48000, 20.0
N = int(SR * DUR)
rng = np.random.default_rng(11)
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
def sweep_lp(x, f0, f1, curve=2.0):
    # passe-bas à une pôle dont la coupure glisse de f0 à f1
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

# ---------- instruments ----------
def kick(t0, g=.62):
    t = tt(.4); f = 52 + 170 * np.exp(-t * 38); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9.5)
    s += filt(noise(.4), lo=1500) * np.exp(-t * 700) * .35
    put('drums', t0, np.tanh(s * 1.7) / np.tanh(1.7), g)
CLAP = None
def clap(t0, g=.32):
    global CLAP
    if CLAP is None:
        t = tt(.3); e = sum((t >= o) * np.exp(-np.clip(t - o, 0, None) * 110) for o in (0, .010, .021)) + (t >= .03) * np.exp(-np.clip(t - .03, 0, None) * 20) * .8
        CLAP = filt(noise(.3) * e, lo=900, hi=4200)
    put('drums', t0, CLAP, g, pan=.05, verb=.35)
HAT = filt(noise(.3), lo=7500) * np.exp(-tt(.3) * 55)
OHAT = filt(noise(.4), lo=6500) * np.exp(-tt(.4) * 13)
def snare(t0, g=.25):
    t = tt(.22); s = filt(noise(.22), lo=1200, hi=9000) * np.exp(-t * 22) + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * .6
    put('drums', t0, s, g, verb=.2)
def saw(hz, t, maxk=30, tilt=0.0):
    s = np.zeros_like(t)
    for k in range(1, int(min(maxk, 11000 / hz)) + 1): s += np.sin(2 * np.pi * hz * k * t + k) / k * (np.exp(-t * tilt * k) if tilt else 1)
    return s
def pluck(t0, hz, g=.1, pan=0.0, bright=1.6):
    t = tt(.32); s = saw(hz, t, 24, bright) * np.minimum(1, t / .002) * np.exp(-t * 10)
    put('music', t0, fade(s), g, pan, verb=.3)
def bass(t0, hz, d=.24, g=.2):
    t = tt(d); s = .8 * np.sin(2 * np.pi * hz * t) + .4 * np.sin(4 * np.pi * hz * t) + .3 * saw(hz * 2, t, 10, .004)
    put('music', t0, fade(np.tanh(s * 1.5) * np.exp(-t * 2.5), .004, .02), g)
def pad(t0, notes, d, g=.05):
    t = tt(d); s = sum(saw(n * dt, t, 10) for n in notes for dt in (.997, 1.003)) * np.minimum(1, t / .35)
    put('music', t0, fade(s, .01, .3), g, verb=.4)
def impact(t0, g=.8):
    t = tt(1.8); f = 75 * np.exp(-t * 2.4) + 27; sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4)
    s = sub + filt(noise(1.8), hi=2200) * np.exp(-t * 8) * .45 + filt(noise(1.8), lo=4000) * np.exp(-t * 4) * .12
    put('sfx', t0, np.tanh(s * 1.4), g, verb=.45)
def whoosh(t_end, d=.42, g=.22, pans=(-.7, .7), up=True):
    n = int(d * SR); x = sweep_lp(rng.standard_normal(n), 250 if up else 7000, 7000 if up else 250, 2 if up else .5)
    p = np.linspace(0, 1, n); e = (p ** 1.6 if up else (1 - p) ** 1.6) * np.sin(np.pi * p) ** .4
    for k, pan in enumerate(pans): put('sfx', t_end - d, x * e * .9, g / len(pans) * 1.6, pan, verb=.2)
def blip(t0, f0, f1=None, d=.09, g=.12, pan=0.0, verb=.15):
    t = tt(d); f = np.full_like(t, f0) if f1 is None else f0 + (f1 - f0) * (t / d); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28)
    put('sfx', t0, fade(s, .001, .005), g, pan, verb)
def click(t0, g=.18, hz=3200, pan=0.0):
    t = tt(.03); s = filt(noise(.03), lo=1500, hi=9000) * np.exp(-t * 400) + np.sin(2 * np.pi * hz * t) * np.exp(-t * 500) * .5
    put('sfx', t0, s, g, pan)
def ping(t0, g=.13, pan=0.0):
    t = tt(.7); s = (np.sin(2 * np.pi * 1318.5 * t) + .35 * np.sin(2 * np.pi * 2637 * t)) * np.exp(-t * 7)
    for k, dl in enumerate((0, .125, .25)): put('sfx', t0 + dl, s, g * (.55 ** k), pan * (1 if k % 2 == 0 else -1), verb=.3)
def kaching(t0, g=.4):
    t = tt(1.4); s = sum(a * np.sin(2 * np.pi * 1245 * m * t) * np.exp(-t * dcy) for m, a, dcy in ((1, 1, 3.2), (2.76, .6, 4.5), (5.4, .35, 7), (8.93, .2, 9)))
    s += filt(noise(1.4), lo=6000) * np.exp(-t * 5) * (1 + .6 * np.sin(2 * np.pi * 23 * t)) * .25
    click(t0 - .035, .35, 2600); put('sfx', t0, s, g, .1, verb=.5)
def shimmer(t0, d=.45, g=.07):
    t = tt(d); s = sum(np.sin(2 * np.pi * f * t) * (.5 + .5 * np.sin(2 * np.pi * (9 + k) * t + k)) for k, f in enumerate((3520, 4186, 5274, 6272)))
    put('sfx', t0, fade(s * np.sin(np.pi * t / d), .01, .05), g, verb=.6)

A1, F1, C2, G1 = 55.0, 43.65, 65.41, 49.0
CH = {'Am': (A1, (220, 261.63, 329.63)), 'F': (F1, (174.61, 220, 261.63)), 'C': (C2, (261.63, 329.63, 392)), 'G': (G1, (196, 246.94, 293.66))}

# ---------- accroche (0–2,5 s) ----------
for i, (t0, hz) in enumerate([(0, 110), (.25, 130.8), (.5, 146.8), (.75, 164.8)]):
    kick(t0, .85); blip(t0, hz * 4, hz * 2, .16, .14); put('sfx', t0, filt(noise(.12), lo=2500) * np.exp(-tt(.12) * 45), .25, (-.4, .4, -.2, .2)[i])
    pluck(t0, hz * 2, .14, (-.3, .3, -.2, .2)[i], 1.0)
impact(1.0, .95); kick(1.0, 1.0); pad(1.0, (110, 130.81, 164.81), .5, .07)
whoosh(1.34, .22, .12)  # soulignement
whoosh(1.52, .3, .14)   # phrase
n = int(.32 * SR); put('sfx', 1.8, sweep_lp(rng.standard_normal(n), 2500, 5000) * (.5 + .5 * np.sin(2 * np.pi * 26 * tt(.32))) * np.sin(np.pi * np.linspace(0, 1, n)), .12, .3)  # trait de feutre
# montée : bruit + saw qui monte + roulement de caisse claire, puis silence avant le drop
n = int(.94 * SR); p = np.linspace(0, 1, n)
put('sfx', 1.5, sweep_lp(rng.standard_normal(n), 300, 9000, 2.5) * p ** 2.2 * .5, .5, verb=.2)
t = tt(.94); fsw = 110 * 2 ** (p * 3); put('music', 1.5, np.sin(2 * np.pi * np.cumsum(fsw) / SR) * p ** 2 * .3 + np.sin(4 * np.pi * np.cumsum(fsw) / SR) * p ** 2.5 * .1, .5)
tr = 1.5
while tr < 2.42:
    step = .125 if tr < 2.0 else .0625 if tr < 2.25 else .03125
    snare(tr, .07 + .2 * (tr - 1.5)); tr += step

# ---------- beat (2,5–14,5 s) ----------
prog = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am']
for b in range(34):  # 34 temps de 0,5 s
    t0 = 2.5 + b * .5
    kick(t0)
    if b % 2 == 1: clap(t0)
    put('drums', t0 + .25, OHAT, .12, .25)
    for s16 in range(4):
        put('drums', t0 + s16 * .125, HAT, (.085 if s16 % 2 else .05) * (.8 if 22 <= b <= 23 else 1), -.3 + .2 * s16)
for bar, name in enumerate(prog):
    t0 = 2.5 + bar * 2; root, tri = CH[name]
    pad(t0, tri, 2.0, .06)
    for e in range(16):
        tb = t0 + e * .125
        if tb >= 19.5: break
        if e % 2 == 1: bass(tb, root * (2 if e % 4 == 3 else 1))
        notes = [tri[0] * 2, tri[1] * 2, tri[2] * 2, tri[0] * 4, tri[2] * 2, tri[1] * 2, tri[0] * 4, tri[1] * 4]
        bright = max(.5, 2.2 - min(bar, 5) * .3)
        pluck(tb, notes[e % 8], .11 + .012 * min(bar, 5), (-.55, .55)[e % 2], bright)

# ---------- bruitages calés sur l'image ----------
impact(2.5, .9)
for k in range(15): click(2.74 + k * .26 / 15, .09 + .05 * rng.random(), 2800 + 900 * rng.random(), .15)  # frappe
click(3.03, .3, 2200); click(3.1, .2, 2600)  # clic souris
blip(3.13, 900, 260, .2, .16)  # morphing de la barre
whoosh(3.6, .36, .2)  # iris
last = 0
for i in range(int(.0 * SR), int(1.03 * SR), int(.004 * SR)):  # compteur de la jauge
    x = i / SR; v = int(64 * (1 - (1 - x / 1.03) ** 3))
    if v > last: last = v; click(3.42 + x, .045, 3800 + 20 * v, .1)
for tk in (4.48, 4.6, 4.72): blip(tk, 500, 1100, .08, .11, .4)
whoosh(4.3, .3, .1)
whoosh(5.5, .4, .3); impact(5.5, .7)
for tA, x in ((5.66, 1340), (5.85, 1600), (6.10, 1606), (6.28, 1336), (6.47, 1074), (6.71, 1080)): ping(tA, .12, (x - 960) / 960)
for tl in (7.3, 7.65, 7.98): blip(tl, 1760, None, .05, .09, .3); blip(tl + .06, 2349, None, .05, .08, .3)
whoosh(8.5, .3, .32, (-.9, -.2)); impact(8.5, .55)
whoosh(9.0, .4, .12, (.6,))
blip(8.92, 300, 700, .12, .12)
for tg in (9.04, 9.24, 9.44): blip(tg, 700, 1400, .07, .1, .5)
whoosh(9.8, .28, .26); impact(9.8, .45); whoosh(10.05, .25, .15, up=False)
blip(10.26, 500, 1000, .1, .14, .45); blip(10.72, 1500, 1900, .06, .1, .45)
for tp in (10.32, 10.43, 10.54): blip(tp, 600, 1250, .07, .08, -.1)
impact(13.5, .8)
def D(x):
    if x < 11.25: return 9
    if x < 11.5: p = (x - 11.25) / .25; return 9 - 5 * (p * p * (3 - 2 * p))
    if x < 11.6: return 4
    p = min(1, (x - 11.6) / .4); c = 1.65; return 4 - 3 * (1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2)
prev = 9
for i in range(int(11.2 * SR), int(12.05 * SR), int(.002 * SR)):
    x = i / SR; d = D(x)
    if int(np.floor(d + .5)) != int(np.floor(prev + .5)): click(x + 2.5, .16, 1700, -.2)
    prev = d
kaching(14.5, .42)
whoosh(15.5, .3, .22, up=True); kick(15.5, .7)
whoosh(17.0, .3, .3, (-.5, .5)); impact(17.0, 1.0)
pad(17.0, (220, 261.63, 329.63, 493.88), 1.5, .07); pluck(17.0, 440, .2, 0, .8); pluck(17.0, 659.3, .16, .3, .8)
kick(17.55, .9); put('sfx', 17.55, filt(noise(.15), lo=800, hi=5000) * np.exp(-tt(.15) * 30), .4, 0, .3)  # tampon
for k in range(10): click(17.6 + rng.random() * .5, .05, 5000 + 3000 * rng.random(), rng.random() * 2 - 1)  # confettis
blip(17.95, 400, 1300, .14, .2, 0, .3)
shimmer(18.25)
kick(19.5, 1.0); clap(19.5, .4); pad(19.5, (110, 220, 261.63, 329.63), .5, .08); pluck(19.5, 880, .16, 0, .8)  # fin nette
click(18.74, .3, 2200); click(18.8, .2, 2600)
# rapports (11–13,5 s)
impact(11.0, .65); whoosh(11.45, .38, .2, (.6,)); kick(11.85, .55); put('sfx', 11.85, filt(noise(.12), lo=1500, hi=6000) * np.exp(-tt(.12) * 35), .25, .3, .2)
for k in range(6): click(11.4 + k * .07, .06, 3000 + 200 * k, .4)
blip(12.4, 1320, 1760, .12, .14, .3); blip(12.52, 1760, None, .1, .1, .3)
# 3 étapes (15,5–17 s)
for k, tk in enumerate((15.56, 15.94, 16.32)): blip(tk, 500 + 150 * k, 1100 + 200 * k, .1, .16, (-.3, 0, .3)[k]); snare(tk, .18)

# ---------- mix ----------
duck = np.ones(N)
for b in range(34):
    i0 = int((2.5 + b * .5) * SR); n = min(int(.32 * SR), N - i0); x = np.arange(n) / SR
    duck[i0:i0 + n] = np.minimum(duck[i0:i0 + n], 1 - .55 * np.exp(-x / .07))
auto = np.ones(N); i0, i1 = int(13.5 * SR), int(14.5 * SR); auto[i0:i1] = .6  # on laisse respirer le prix
music = bus['music'] * duck * auto
irn = int(1.7 * SR); ti = np.arange(irn) / SR
ir = np.stack([filt(rng.standard_normal(irn), hi=6000) * np.exp(-ti * 3.2) for _ in range(2)]); ir[:, :int(.018 * SR)] = 0
rev = np.stack([np.fft.irfft(np.fft.rfft(bus['verb'][c], 2 * N) * np.fft.rfft(ir[c], 2 * N), 2 * N)[:N] for c in range(2)])
rev *= .5 / max(1e-9, np.abs(rev).max()) * np.abs(bus['verb']).max()
mix = bus['drums'] + music + bus['sfx'] + rev * .9
# égaliseur master : coupe sous 28 Hz, +3 dB d'air au-dessus de 4 kHz
Xf = np.fft.rfft(mix, axis=1); ff = np.fft.rfftfreq(N, 1 / SR)
H = (1 / np.sqrt(1 + (28 / np.maximum(ff, 1e-3)) ** 4)) * (1 + .41 / np.sqrt(1 + (4000 / np.maximum(ff, 1e-3)) ** 2))
mix = np.fft.irfft(Xf * H, n=N, axis=1)
mix *= 1.0 / np.abs(mix).max()
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
mix *= .89 / np.abs(mix).max()
f = np.ones(N); nf = int(.12 * SR); f[-nf:] = np.linspace(1, 0, nf); mix *= f
for a, b in ((0, 2.5), (2.5, 5.5), (5.5, 8.5), (8.5, 11), (11, 13.5), (13.5, 15.5), (15.5, 17), (17, 20)):
    seg = mix[:, int(a * SR):int(b * SR)]; print(f'{a:>5}-{b:<5} RMS {20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9):6.1f} dBFS  crête {20 * np.log10(np.abs(seg).max() + 1e-9):5.1f}')
with wave.open('sound-20s.wav', 'w') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype('<i2').tobytes())
