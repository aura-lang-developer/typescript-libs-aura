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

# Ensure TS is built first
npx tsc

mkdir -p dist
"$AURAC" build tests/fin_test.aura -o dist/fin_test.mjs \
  --dts dist/ts/currency.d.ts \
  --dts dist/ts/crypto_signer.d.ts \
  --dts dist/ts/date_utils.d.ts \
  --dts dist/ts/terminal_ui.d.ts

node dist/fin_test.mjs
