#!/bin/bash
set -e

# Asegurarnos de que el directorio lib/ existe
mkdir -p lib

echo "Descargando archivos de v86 (emulador y BIOS)..."

# URLs base directamente desde copy.sh/v86
BASE_URL="https://copy.sh/v86/build"
BIOS_URL="https://copy.sh/v86/bios"

echo "- Descargando v86.js..."
curl -L -# -o lib/v86.js "$BASE_URL/libv86.js"

echo "- Descargando v86.wasm..."
curl -L -# -o lib/v86.wasm "$BASE_URL/v86.wasm"

echo "- Descargando seabios.bin..."
curl -L -# -o lib/seabios.bin "$BIOS_URL/seabios.bin"

echo "- Descargando vgabios.bin..."
curl -L -# -o lib/vgabios.bin "$BIOS_URL/vgabios.bin"

echo "¡Descarga de v86 completada exitosamente en lib/!"
