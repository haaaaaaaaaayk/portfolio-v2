#!/bin/sh
# Copies ~/halftone-specimen into public/halftone, so it ships at hayko.me/halftone.
# It is one self-contained HTML file, so there is nothing to build. Run it again after
# changing halftone-specimen, then commit and push; it records the version it copied.
set -e
SRC="${HALFTONE_DIR:-$HOME/halftone-specimen}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/halftone"
mkdir -p "$OUT"
cp "$SRC/index.html" "$OUT/index.html"
git -C "$SRC" describe --tags --always --dirty > "$OUT/VERSION"
echo "halftone specimen $(cat "$OUT/VERSION") -> $OUT"
