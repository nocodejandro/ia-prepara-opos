#!/usr/bin/env bash
# =====================================================================
#  instalar.sh · prepara un servidor o PC para crear video-clases
#  Uso:  cd video-clases && bash instalar.sh
#  Hace: dependencias de Node y Python, voz es_ES-sharvard-medium,
#        Chromium para las previsualizaciones y una prueba final.
#  Se puede ejecutar varias veces: lo que ya está instalado se salta.
# =====================================================================
set -u
cd "$(dirname "$0")"
ok(){ printf '\033[32m✔ %s\033[0m\n' "$1"; }
aviso(){ printf '\033[33m! %s\033[0m\n' "$1"; }
fallo(){ printf '\033[31m✘ %s\033[0m\n' "$1"; exit 1; }

command -v node >/dev/null || fallo "Falta Node.js 18 o superior"
PY=$(command -v python3 || command -v python) || fallo "Falta Python 3.10 o superior"
ok "Node $(node -v) · $($PY --version)"

npm install --no-audit --no-fund --silent && ok "Dependencias de Node" || fallo "npm install"
$PY -m pip install -q -r requirements.txt 2>/dev/null \
  || $PY -m pip install -q --user -r requirements.txt 2>/dev/null \
  || $PY -m pip install -q --break-system-packages -r requirements.txt \
  || fallo "pip install (prueba con un entorno virtual: python3 -m venv .venv && source .venv/bin/activate)"
ok "Dependencias de Python (piper-tts, lameenc, numpy)"

mkdir -p voces
if [ -f voces/es_ES-sharvard-medium.onnx ] && [ -f voces/es_ES-sharvard-medium.onnx.json ]; then
  ok "Voz ya descargada"
else
  $PY -m piper.download_voices es_ES-sharvard-medium --data-dir voces >/dev/null 2>&1
  if [ ! -f voces/es_ES-sharvard-medium.onnx ]; then
    aviso "Descarga directa no disponible; uso la copia de GitHub (sherpa-onnx)"
    URL=https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-es_ES-sharvard-medium.tar.bz2
    TMP=$(mktemp -d)
    curl -fsSL "$URL" -o "$TMP/voz.tar.bz2" && tar xjf "$TMP/voz.tar.bz2" -C "$TMP" \
      && cp "$TMP"/vits-piper-es_ES-sharvard-medium/es_ES-sharvard-medium.onnx* voces/
    rm -rf "$TMP"
  fi
  [ -f voces/es_ES-sharvard-medium.onnx ] && ok "Voz es_ES-sharvard-medium" || fallo "No se pudo descargar la voz"
fi

if [ -n "${CHROMIUM_PATH:-}" ]; then
  ok "Chromium: $CHROMIUM_PATH"
elif npx playwright install chromium >/dev/null 2>&1; then
  ok "Chromium para previsualizar"
else
  aviso "No se pudo instalar Chromium. En Linux prueba: sudo npx playwright install --with-deps chromium"
fi

echo "Prueba: montando la cápsula de la Corona…"
node herramientas/construir.mjs capsulas/corona >/dev/null && ok "Construcción y voz funcionan" || fallo "construir.mjs"
if node herramientas/previsualizar.mjs capsulas/corona | grep -q "Sin errores"; then
  ok "Previsualización: capsulas/corona/preview/hoja.png"
else
  aviso "La previsualización no funcionó (revisa Chromium). La construcción sí está lista."
fi
echo
ok "Todo listo. Abre Claude Code en la raíz del repositorio y pide: «Usa la skill video-clase y hazme…»"
