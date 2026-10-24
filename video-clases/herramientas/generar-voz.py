#!/usr/bin/env python3
"""
generar-voz.py · sintetiza la narración de una cápsula con Piper (sin conexión, gratis)
------------------------------------------------------------------------------------
Uso:  python3 herramientas/generar-voz.py capsulas/corona
      (normalmente lo llama construir.mjs)

Lee  <capsula>/guion.json  →  [{"id": "s3", "frases": ["...", "..."]}, ...]
Crea <capsula>/dist/audio/<id>.mp3  y  dist/audio/manifest.json:
     {"s3": {"d": 21.4, "s": [0.0, 3.1, 7.9], "h": "<hash del texto>"}}
     d = duración total (s) · s = segundo en que empieza cada frase.
El reproductor usa "s" para sincronizar animaciones y subtítulos con la voz.

Voz por defecto: es_ES-sharvard-medium, hablante 1 (F), length_scale 0.8 (≈25 % más rápida).
Variables de entorno opcionales:
  VOZ_MODELO   ruta al .onnx (por defecto voces/es_ES-sharvard-medium.onnx)
  VOZ_HABLANTE 0 = masculina, 1 = femenina (sharvard)
  VOZ_RITMO    length_scale: 1.0 normal, 0.8 rápida, 0.7 muy rápida
Dependencias:  pip install piper-tts lameenc numpy
"""
import hashlib, io, json, os, re, sys, wave
from pathlib import Path

import lameenc
import numpy as np
from piper import PiperVoice, SynthesisConfig

RAIZ = Path(__file__).resolve().parent.parent
cap = Path(sys.argv[1]).resolve()
modelo = Path(os.environ.get("VOZ_MODELO", RAIZ / "voces" / "es_ES-sharvard-medium.onnx"))
if not modelo.exists():
    sys.exit(f"No encuentro el modelo de voz: {modelo}\nDescárgalo con:  python3 -m piper.download_voices es_ES-sharvard-medium --data-dir {RAIZ/'voces'}")
hablante = int(os.environ.get("VOZ_HABLANTE", "1"))
ritmo = float(os.environ.get("VOZ_RITMO", "0.8"))
PAUSA_FRASE = 0.14   # silencio entre frases (s)
COLA = 0.10          # silencio al final del clip (s)

voz = PiperVoice.load(str(modelo))
cfg = SynthesisConfig(speaker_id=hablante if voz.config.num_speakers > 1 else None,
                      length_scale=ritmo, noise_scale=0.6, noise_w_scale=0.8)
SR = voz.config.sample_rate

def normalizar(t: str) -> str:
    """Lo que se lee en voz alta: sin comillas angulares ni símbolos que la voz pronuncia mal."""
    t = t.replace("«", "").replace("»", "").replace("…", ".").replace("·", ",")
    t = re.sub(r"\bart\.\s*", "artículo ", t, flags=re.I)
    t = re.sub(r"\barts\.\s*", "artículos ", t, flags=re.I)
    return re.sub(r"\s+", " ", t).strip()

def sintetizar(texto: str) -> np.ndarray:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        voz.synthesize_wav(normalizar(texto), w, syn_config=cfg)
    buf.seek(0)
    with wave.open(buf) as r:
        return np.frombuffer(r.readframes(r.getnframes()), dtype=np.int16)

def a_mp3(pcm: np.ndarray) -> bytes:
    enc = lameenc.Encoder()
    enc.set_bit_rate(48); enc.set_in_sample_rate(SR); enc.set_channels(1); enc.set_quality(2)
    return enc.encode(pcm.tobytes()) + enc.flush()

guion = json.loads((cap / "guion.json").read_text(encoding="utf8"))
out = cap / "dist" / "audio"; out.mkdir(parents=True, exist_ok=True)
man_path = out / "manifest.json"
manifest = json.loads(man_path.read_text(encoding="utf8")) if man_path.exists() else {}
firma_voz = f"{modelo.name}|{hablante}|{ritmo}|{PAUSA_FRASE}"
nuevos = 0
for clip in guion:
    h = hashlib.sha1((firma_voz + "\n" + "\n".join(clip["frases"])).encode()).hexdigest()[:16]
    mp3 = out / f"{clip['id']}.mp3"
    if manifest.get(clip["id"], {}).get("h") == h and mp3.exists():
        continue
    partes, inicios, t = [], [], 0.0
    hueco = np.zeros(int(SR * PAUSA_FRASE), dtype=np.int16)
    for k, frase in enumerate(clip["frases"]):
        a = sintetizar(frase)
        inicios.append(round(t, 2)); partes.append(a); t += len(a) / SR
        if k < len(clip["frases"]) - 1:
            partes.append(hueco); t += len(hueco) / SR
    pcm = np.concatenate(partes + [np.zeros(int(SR * COLA), dtype=np.int16)])
    mp3.write_bytes(a_mp3(pcm))
    manifest[clip["id"]] = {"d": round(len(pcm) / SR, 2), "s": inicios, "h": h}
    nuevos += 1
    print(f"  · {clip['id']:<8} {manifest[clip['id']]['d']:>6.1f} s")
validos = {c["id"] for c in guion}
for k in list(manifest):
    if k not in validos:
        manifest.pop(k); (out / f"{k}.mp3").unlink(missing_ok=True)
man_path.write_text(json.dumps(manifest, separators=(",", ":")), encoding="utf8")
total = sum(v["d"] for k, v in manifest.items() if "-" not in k)
print(f"Voz: {nuevos} clips nuevos · narración principal {total/60:.1f} min")
