#!/usr/bin/env bash
set -e

AURAC="${HOME}/.cargo/bin/aurac"

if ! command -v "$AURAC" &> /dev/null; then
    if command -v aurac &> /dev/null; then
        AURAC="aurac"
    else
        echo "Error: 'aurac' compiler not found at ~/.cargo/bin/aurac or in PATH."
        exit 1
    fi
fi

echo "=========================================================="
echo " 🔨 1. Compilando Librerías TypeScript con tsc..."
echo "=========================================================="
npx tsc

echo ""
echo "=========================================================="
echo " 🚀 2. Compilando Aplicación Aura Lang con aurac..."
echo "=========================================================="
mkdir -p dist

"$AURAC" build src/aura/main.aura -o dist/main.mjs \
  --dts dist/ts/currency.d.ts \
  --dts dist/ts/crypto_signer.d.ts \
  --dts dist/ts/date_utils.d.ts \
  --dts dist/ts/terminal_ui.d.ts

echo ""
echo "✨ Build completado exitosamente: dist/main.mjs generado."
