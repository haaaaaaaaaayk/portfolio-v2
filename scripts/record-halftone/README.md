# Recording the Halftone Specimen tile loop

`public/work/halftone.mp4` is 10 seconds at 600×800 (3:4) and loops seamlessly. It's rendered frame by frame from
the real app (`~/halftone-specimen`) with the Golden Gate photo as the source. There are ten one-second shots, each a
different effect and palette, and in each one a single setting moves. Each new shot prints down over the last one.
`public/work/halftone.jpg` is the poster.

1. **Serve the app with the photo next to it, and start the receiver**
   ```sh
   mkdir -p /tmp/ht && cp ~/halftone-specimen/index.html /tmp/ht/
   sips -c 1066 800 --cropOffset 40 0 ~/Downloads/GoldenGateBridge_IconicBridgePhoto.jpg --out /tmp/ht/ggb.jpg
   cp scripts/record-halftone/reel.js /tmp/ht/
   (cd /tmp/ht && python3 -m http.server 8765 --bind 127.0.0.1) &
   mkdir -p /tmp/htrec && python3 scripts/record-halftone/upload_server.py /tmp/htrec &
   ```

2. **Open `http://127.0.0.1:8765/index.html`** in Chrome. In the console, run:
   ```js
   (0, eval)(await (await fetch('reel.js')).text()); await __reel();
   ```
   It pauses the live loop and renders 300 frames (30 fps) at 840×1120. It also renders a poster at 0.7 s. All of it
   goes to `/tmp/htrec`. Then it puts the page back the way it was.
   - `__reelFrame(t)` returns the composited frame at time `t` (seconds) on a canvas, for checking one moment.

3. **Encode**
   ```sh
   cd /tmp/htrec
   ffmpeg -y -framerate 30 -i frame-%04d.jpg -frames:v 300 -vf scale=600:800:flags=lanczos -c:v libx264 -crf 30 -preset veryslow -profile:v high -pix_fmt yuv420p -movflags +faststart -an halftone.mp4
   ffmpeg -y -i poster.jpg -vf scale=600:800:flags=lanczos -q:v 4 halftone.jpg
   cp halftone.mp4 halftone.jpg ~/"portfolio v2/public/work/"
   ```

## Notes
- **The loop is exact.** The pointer path closes every 10 s. The shot on screen at the loop point (the last one,
  wiping into the first) keeps its own clock at t + 10, so frame 300 would equal frame 0.
- **Halftone dots are hard to compress.** CRF 30 at 600×800 looks the same as CRF 26 at the tile's size and is
  about 2 MB. Don't go below 544×728, the portrait tile at 2×.
- **To change the reel,** edit `SHOTS` in `reel.js`: the effect, palette, cell size, and a `set(u)` that moves
  settings across the shot (`u` runs 0 to 1). `WIPE` sets how long each print-over takes.
- **Photo choices that matter:** Toner and Dots use Invert, so the darks print the way a copier or newspaper prints
  them. Letters uses high contrast, so the tower reads as a quiet column through the type.
