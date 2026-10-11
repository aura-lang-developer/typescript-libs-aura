#!/usr/bin/env bash
set -e

echo "Compilando proyecto Aura + TypeScript..."
bash scripts/build.sh

echo ""
echo "=========================================================="
echo " 🏃 3. Ejecutando Aplicación Aura Fin..."
echo "=========================================================="
node dist/main.mjs "$@"
