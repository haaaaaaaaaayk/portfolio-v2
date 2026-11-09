/* Halftone Specimen reel: a 10 s, 3:4 loop for the Work tile, rendered frame by frame from the real app.
   Paste into the console of the halftone page (served at http://127.0.0.1:8765), then `await __reel()`.
   The source is the Golden Gate photo, cropped to 3:4 and served next to the page as ggb.jpg.
   Frames go to the receiver (upload_server.py on :5601); README.md has the ffmpeg step.

   Ten one-second shots, each a different effect and palette, and in each one a single setting moves,
   so the reel says both "many effects" and "you tune them". Every new shot prints over the last one
   as a wipe, the way the next pass comes off a press. The pointer glow follows a path that repeats
   every 10 s, and the shot playing at the loop point keeps its own clock, so frame 300 is frame 0. */
(() => {
  const FPS = 30, LEN = 10, W_OUT = 840, H_OUT = 1120, CSS_W = 420;   // renders as a 420 px card at 2x
  const WIPE = 0.36;                                                   // seconds per print-over

  const SHOTS = [
    { effect: 'press',     palette: 'riso',      size: 10, set: u => ({ angle: 15 + 30 * u, misreg: 30 }) },
    { effect: 'letters',   palette: 'midnight',  size: 14, word: 'GOLDEN GATE ', set: () => ({ contrast: 220, brightness: -8 }) },   // the tower reads as a dark gap in bright type
    { effect: 'engrave',   palette: 'klein',     size: 9,  set: u => ({ angle: 5 + 25 * u }) },
    { effect: 'hatch',     palette: 'sunflower', size: 10, set: () => ({ angle: 30 }) },
    { effect: 'mezzotint', palette: 'bloom',     size: 10 },
    { effect: 'toner',     palette: 'letter',    size: 10, set: () => ({ flicker: 70, invert: true }) },   // a copier prints the darks
    { effect: 'woodcut',   palette: 'harbor',    size: 10 },
    { effect: 'dots',      palette: 'fog',       set: u => ({ size: 7 + 9 * u, gap: 10, invert: true }) },   // newspaper: dark dots on light stock
    { effect: 'dither',    palette: 'repair',    size: 7 },
    { effect: 'press',     palette: 'gemini',    size: 12, set: u => ({ angle: 60 - 30 * u, misreg: 20 + 50 * u }) },
  ];
  const BASE = { contrast: 130, brightness: 0, invert: false, grain: true, gap: 12, flicker: 40, merge: true,
                 angle: 15, misreg: 30, gain: 35, pointer: 'glow', brush: 22, force: 45, speed: 100 };

  // A slow figure that closes every 10 s (whole cycles of 2π/10), so the glow is seamless too.
  const pathAt = T => {
    const k = (2 * Math.PI * T) / LEN, aspect = 3 / 4;
    return [0.5 + aspect * 0.3 * Math.sin(k) , 0.5 + 0.28 * Math.sin(2 * k + 0.6)];
  };

  const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const out = document.createElement('canvas');
  out.width = W_OUT; out.height = H_OUT;
  const ctx = out.getContext('2d');
  const gl_canvas = document.getElementById('gl');

  let lastWord = null;
  function drawShot(i, T) {
    const s = SHOTS[i], u = Math.min(1, Math.max(0, T - i));
    Object.assign(state, BASE, { effect: s.effect, palette: s.palette, source: 'image' },
      s.size ? { size: s.size } : {}, s.set ? s.set(u) : {});
    state.paletteEdits = {};
    if (s.word && s.word !== lastWord) {
      // updateLetters skips while the live loop is paused, so let it run for this one call
      const live = ok; ok = true; state.word = s.word; updateLetters(); ok = live; lastWord = s.word;
    }
    applyPalette();
    time = T;
    // the trail is the last 14 samples of the path, two frames apart, fading as the live trail does
    for (let k = 0; k < 14; k++) {
      const [x, y] = pathAt(T - (2 * k) / 60);
      trail[k * 3] = x; trail[k * 3 + 1] = y; trail[k * 3 + 2] = (0.75 / 14) * 3.2 * Math.pow(0.9, 2 * k);
    }
    setSize(W_OUT, H_OUT, W_OUT / CSS_W);
    render();
  }

  function frameAt(t) {
    const i = Math.floor(t) % SHOTS.length, local = t - Math.floor(t);
    const prev = (i + SHOTS.length - 1) % SHOTS.length;
    // The previous shot keeps running on its own clock; at the loop point that is 10 s on.
    const prevT = i === 0 ? t + LEN : t;
    if (local < WIPE) {
      drawShot(prev, prevT);
      ctx.drawImage(gl_canvas, 0, 0);
      const edge = Math.round(ease(local / WIPE) * H_OUT);
      drawShot(i, t);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W_OUT, edge); ctx.clip();
      ctx.drawImage(gl_canvas, 0, 0);
      ctx.restore();
    } else {
      drawShot(i, t);
      ctx.drawImage(gl_canvas, 0, 0);
    }
  }

  const send = (name, q = 0.93) => new Promise(res => out.toBlob(b =>
    fetch('http://127.0.0.1:5601/' + name, { method: 'POST', body: b }).then(res), 'image/jpeg', q));

  window.__reelFrame = t => { frameAt(t); return out; };
  const loadPhoto = () => new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => { setImage(img); res(); };
    img.onerror = rej;
    img.src = 'ggb.jpg';
  });
  window.__reelPhoto = loadPhoto;

  window.__reel = async (from = 0, to = FPS * LEN) => {
    await loadPhoto();
    ok = false;                       // pause the live loop so it can't touch time, trail or the canvas
    const saved = JSON.stringify(state);
    for (let f = from; f < to; f++) {
      frameAt(f / FPS);
      await send(`frame-${String(f).padStart(4, '0')}.jpg`);
    }
    frameAt(0.7);                     // poster: the first press, screens mid-turn
    await send('poster.jpg', 0.9);
    Object.assign(state, JSON.parse(saved));
    ok = true; applyPalette(); resize();
    return `sent ${to - from} frames + poster`;
  };
})();
