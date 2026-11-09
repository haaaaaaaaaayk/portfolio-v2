#!/bin/sh
# Builds ~/something-word into public/spin, so it ships at hayko.me/spin.
# Run it again after changing something-word, then commit and push; it records the version it built.
set -e
SRC="${SPIN_DIR:-$HOME/something-word}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/spin"
cd "$SRC"
npx vite build --base /spin/ --outDir "$OUT" --emptyOutDir
git describe --tags --always --dirty > "$OUT/VERSION"
echo "spin $(cat "$OUT/VERSION") -> $OUT"
