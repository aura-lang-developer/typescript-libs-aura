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

echo "=================================================================="
echo " 🔍 INSPECIONANDO DEFINICIONES TYPESCRIPT (.d.ts) CON AURAC"
echo " Demostración de ingestión directa de tipos de TS en Aura Lang"
echo "=================================================================="
echo ""

echo "------------------------------------------------------------------"
echo " ▶ 1. dist/ts/currency.d.ts (Monedas y Tasas FX)"
echo "------------------------------------------------------------------"
"$AURAC" dts-import dist/ts/currency.d.ts
echo ""

echo "------------------------------------------------------------------"
echo " ▶ 2. dist/ts/crypto_signer.d.ts (Firmas Criptográficas SHA-256)"
echo "------------------------------------------------------------------"
"$AURAC" dts-import dist/ts/crypto_signer.d.ts
echo ""

echo "------------------------------------------------------------------"
echo " ▶ 3. dist/ts/date_utils.d.ts (Liquidación Financiera T+N con date-fns)"
echo "------------------------------------------------------------------"
"$AURAC" dts-import dist/ts/date_utils.d.ts
echo ""

echo "------------------------------------------------------------------"
echo " ▶ 4. dist/ts/terminal_ui.d.ts (Diseño Terminal con colorette)"
echo "------------------------------------------------------------------"
"$AURAC" dts-import dist/ts/terminal_ui.d.ts
echo ""

echo "✨ Todas las definiciones de TypeScript fueron procesadas y verificadas por Aura Lang."
