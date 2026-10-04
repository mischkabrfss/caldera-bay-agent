# Voix off de tiktok.html : voix neuronale Microsoft (edge-tts) + minutage de chaque mot (sous-titres synchronisés).
# Usage : SSL_CERT_FILE=… python3 voice.py  →  voice/NN.mp3 + voice/words.json
import asyncio, json, os, ssl
import aiohttp
import edge_tts
import edge_tts.communicate

# Derrière un proxy HTTPS d'entreprise : faire confiance à son certificat (SSL_CERT_FILE) en plus de ceux de certifi.
if os.environ.get('SSL_CERT_FILE'):
    edge_tts.communicate._SSL_CTX = ssl.create_default_context(cafile=os.environ['SSL_CERT_FILE'])

# Qualité : edge-tts demande du MP3 48 kb/s ; le serveur accepte aussi 96 kb/s (moins d'artefacts sur la voix).
_send = aiohttp.ClientWebSocketResponse.send_str
async def _send_hq(self, data, *a, **k):
    return await _send(self, data.replace('audio-24khz-48kbitrate-mono-mp3', 'audio-24khz-96kbitrate-mono-mp3'), *a, **k)
aiohttp.ClientWebSocketResponse.send_str = _send_hq

VOICE = os.environ.get('VOICE', 'fr-FR-RemyMultilingualNeural')
RATE = os.environ.get('RATE', '+10%')
# Texte envoyé à la voix. Mots anglais écrits « à l'oreille » (vérifié par reconnaissance vocale anglaise) :
# Shopify → « Shopifaille » (prononciation française courante, sans le « fi » final), sourcing → « sôr-ssinng ».
# Les sous-titres affichent la vraie orthographe (tiktok.html).
LINES = [
    'Stop !',
    'Ta boutique Shopifaille ne vend pas ?',
    'Je te montre pourquoi en trente secondes.',
    'Tu colles ton lien…',
    'et boum : ton score sur cent.',
    'Chaque erreur qui te coûte des ventes : expliquée.',
    'Les produits qui cartonnent en ce moment.',
    'Les best-sellers de tes concurrents.',
    'Et dix agents de sôr-ssinng vérifiés.',
    'Ta première analyse est gratuite.',
    'Lien en commentaire. Allez, fonce !',  # « Fonce ! » seul était mal prononcé
]
DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'voice')

async def say(i, text):
    audio, words = b'', []
    async for c in edge_tts.Communicate(text, VOICE, rate=RATE, boundary='WordBoundary').stream():
        if c['type'] == 'audio': audio += c['data']
        elif c['type'] == 'WordBoundary': words.append({'w': c['text'], 't': c['offset'] / 1e7, 'd': c['duration'] / 1e7})
    with open(os.path.join(DIR, f'{i:02d}.mp3'), 'wb') as f: f.write(audio)
    return {'text': text, 'words': words}

async def main():
    os.makedirs(DIR, exist_ok=True)
    out = [await say(i, t) for i, t in enumerate(LINES)]
    json.dump({'voice': VOICE, 'rate': RATE, 'lines': out}, open(os.path.join(DIR, 'words.json'), 'w'), ensure_ascii=False, indent=1)
    for i, l in enumerate(out): print(i, ' '.join(f"{w['w']}@{w['t']:.2f}" for w in l['words']))

asyncio.run(main())
