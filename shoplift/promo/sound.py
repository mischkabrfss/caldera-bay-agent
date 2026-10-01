# Bande-son synthétisée (aucun son sous licence) : beat 120 BPM, impacts aux changements de scène, clics de frappe, montée finale.
import math, random, struct, wave
SR, DUR = 44100, 15.0
N = int(SR * DUR)
out = [0.0] * N
random.seed(7)
def add(t0, n, f):
    i0 = int(t0 * SR)
    for k in range(n):
        if 0 <= i0 + k < N: out[i0 + k] += f(k / SR)
def kick(t, g=.9): add(t, int(.35 * SR), lambda x: g * math.sin(2 * math.pi * (45 * x + 90 * (1 - math.exp(-x * 28)) / 28)) * math.exp(-x * 9))
def hat(t, g=.12): add(t, int(.05 * SR), lambda x: g * (random.random() * 2 - 1) * math.exp(-x * 90))
def tick(t, g=.18): add(t, int(.02 * SR), lambda x: g * math.sin(2 * math.pi * 2400 * x) * math.exp(-x * 300))
def boom(t, g=1.0):
    add(t, int(1.0 * SR), lambda x: g * math.sin(2 * math.pi * (38 * x + 60 * (1 - math.exp(-x * 12)) / 12)) * math.exp(-x * 3.5))
    add(t, int(.25 * SR), lambda x: g * .35 * (random.random() * 2 - 1) * math.exp(-x * 18))
def whoosh(t_end, d=.45, g=.25):
    lp = [0.0]
    def f(x):
        p = x / d; a = .05 + .5 * p; lp[0] += a * ((random.random() * 2 - 1) - lp[0]); return g * lp[0] * math.sin(math.pi * p) ** 2
    add(t_end - d, int(d * SR), f)
def pluck(t, hz, g=.16): add(t, int(.5 * SR), lambda x: g * (math.sin(2 * math.pi * hz * x) + .4 * math.sin(4 * math.pi * hz * x)) * math.exp(-x * 7))
beat = .5
b = 0.0
while b < 13.0:
    kick(b, .55); hat(b + beat / 2); b += beat
for i, f in enumerate([220, 262, 330, 392] * 12):
    pluck(i * .25, f * (1.5 if 11 <= i * .25 < 13 else 1), .07)
for t in (.1, .45, .8): boom(t, .7)
for t in (2.4, 5.5, 8.5, 11.0): whoosh(t); boom(t, .8)
for k in range(15): tick(2.85 + k * .7 / 15)
tick(3.62, .35)
add(11.6, int(1.5 * SR), lambda x: .12 * math.sin(2 * math.pi * (200 + 500 * x / 1.5) * x) * (x / 1.5))  # montée vers le CTA
whoosh(13.1, .6, .35); boom(13.1, 1.1)
for hz in (523, 659, 784, 1047): add(13.6, int(1.4 * SR), lambda x, hz=hz: .07 * math.sin(2 * math.pi * hz * x) * math.exp(-x * 1.6))
peak = max(abs(v) for v in out)
fade = int(.3 * SR)
with wave.open('sound.wav', 'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<h', int(32000 * .9 * v / peak * min(1, (N - i) / fade))) for i, v in enumerate(out)))
print('ok', peak)
