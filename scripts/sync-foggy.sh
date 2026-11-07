#!/bin/sh
# Builds ~/foggy glass into public/foggy_shinagawa, so it ships at hayko.me/foggy_shinagawa.
# Run it again after changing foggy glass, then commit and push; it records the version it built.
set -e
SRC="${FOGGY_DIR:-$HOME/foggy glass}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/foggy_shinagawa"
cd "$SRC"
npx vite build --base /foggy_shinagawa/ --outDir "$OUT" --emptyOutDir
rm -f "$OUT/sounds/README.md"
git describe --tags --always --dirty > "$OUT/VERSION"
echo "foggy glass $(cat "$OUT/VERSION") -> $OUT"
