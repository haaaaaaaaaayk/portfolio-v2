# Recording the Fogged Glass tile loop

The big tile in Work plays `public/work/fogged-glass.mp4`: 10 seconds, 1120×1120, recorded from the real app
(`~/foggy glass`). A rough human hand writes a smiley, "hi!", and "I ♥ you" on the Shinagawa gate photo; the loop
starts and ends on clean fog. To re-record (a new message, scene or hand):

1. **Start the app and the receiver**
   ```sh
   (cd ~/"foggy glass" && npx vite --port 5199 --strictPort) &
   mkdir -p /tmp/fogrec && python3 scripts/record-fog/upload_server.py /tmp/fogrec &
   ```
   Wait until `curl -s localhost:5199` answers before opening it. Opening it early leaves an error page.

2. **Open `http://localhost:5199/`** in Chrome. In the console, run `draw.js` (the setup), then
   `await __record()`. It:
   - puts the app in an 800×800 frame, so the canvas renders at 1600×1600;
   - closes the welcome card and wipes the default doodles;
   - saves a clean-fog frame (`clean.png`);
   - records the canvas while a pen with varying pressure draws the strokes (`love.webm`);
   - saves a poster frame at 7.4s (`love-poster.jpg`).

3. **Assemble the loop.** This prepends 0.4s of clean fog, dissolves back to clean glass at 7.4–8s and holds clean
   fog to 10s:
   ```sh
   cd /tmp/fogrec && ffmpeg -y -loop 1 -t 0.4 -i clean.png -i love.webm -loop 1 -t 2.6 -i clean.png -filter_complex "[0:v]fps=30,scale=1120:1120:flags=lanczos,format=yuv420p,setsar=1,settb=1/30,setpts=PTS-STARTPTS[c0];[1:v]fps=30,tpad=stop_mode=clone:stop_duration=3,trim=0:7.6,setpts=PTS-STARTPTS,scale=1120:1120:flags=lanczos,format=yuv420p,setsar=1,settb=1/30[dr];[c0][dr]concat=n=2:v=1:a=0,settb=1/30[a];[2:v]fps=30,scale=1120:1120:flags=lanczos,format=yuv420p,setsar=1,settb=1/30,setpts=PTS-STARTPTS[b];[a][b]xfade=transition=fade:duration=0.6:offset=7.4,format=yuv420p[v]" -map "[v]" -t 10 -r 30 -pix_fmt yuv420p -c:v libx264 -crf 24 -preset slow -profile:v high -movflags +faststart -an love.mp4
   ffmpeg -y -i love-poster.jpg -vf scale=1120:1120 -q:v 4 love-poster-1120.jpg
   cp love.mp4 ~/"portfolio v2/public/work/fogged-glass.mp4"; cp love-poster-1120.jpg ~/"portfolio v2/public/work/fogged-glass.jpg"
   ```

## Notes
- **The wipe's dissolve is added in step 3.** The app's own wipe plays on an overlay canvas the recording doesn't capture.
- **The canvas only emits frames when it changes.** That's why the clip is padded with its last frame and the clean still.
- **To change the hand,** edit `draw.js`:
  - `drift` and `tremor`: how shaky the lines are
  - `base`: speed
  - the pressure curve: thickness
  - the seed: a different but repeatable hand
- **To change the scene,** pick it in the app before running `__record()`. The tile crops to 16:9 on tablets, so keep
  the drawing inside the middle band (y ≈ 175–625 of 800).
