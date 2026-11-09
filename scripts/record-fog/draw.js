/* Paste into the console of http://localhost:5199/ (the Fogged Glass app), then run: await __record()
   Draws a smiley, "hi!", and "I ♥ you" with a rough human hand on the app's own canvas, and records it.
   See README.md for the full steps. */
(async () => {
  document.body.innerHTML = ''
  document.body.style.cssText = 'margin:0;background:#111'
  const f = document.createElement('iframe')
  f.id = 'rec'
  f.src = '/'
  f.style.cssText = 'position:fixed;left:0;top:0;width:800px;height:800px;border:0'
  document.body.append(f)
  await new Promise((r) => (f.onload = r))
  await new Promise((r) => setTimeout(r, 2500))
  const d = f.contentDocument
  d.getElementById('noteClose')?.click()
  await new Promise((r) => setTimeout(r, 500))
  d.getElementById('wipe').click()
  await new Promise((r) => setTimeout(r, 900))

  /* ---------- a human hand ---------- */
  let seed = 20261109 // change for a different (but repeatable) hand
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
  const rr = (a, b) => a + rnd() * (b - a)
  const noise = () => { const w = [0, 1, 2].map(() => ({ f: rr(0.6, 1.8), p: rr(0, 6.28), a: rr(0.6, 1) })); return (t) => w.reduce((s, k) => s + Math.sin(t * k.f * 6.28 + k.p) * k.a, 0) / 2 }
  const arc = (cx, cy, rx, ry, a0, a1, n = 48) => Array.from({ length: n + 1 }, (_, i) => { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] })
  const quad = (p0, p1, p2, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]] })
  const dense = (pts) => { const out = [pts[0]]; for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 2)); for (let k = 1; k <= n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]) } return out }
  /* humanise a path: drift (px) + tremor, then walk it slow-fast-slow with a pressure curve */
  const hand = (pts, { drift = 4, tremor = 0.7, base = 10, dab = false } = {}) => {
    const P = dense(pts), nx = noise(), ny = noise(), L = P.length
    const wob = P.map(([x, y], i) => { const t = i / L; return [x + nx(t) * drift + rr(-tremor, tremor), y + ny(t) * drift + rr(-tremor, tremor)] })
    const cum = [0]; for (let i = 1; i < L; i++) cum.push(cum[i - 1] + Math.hypot(wob[i][0] - wob[i - 1][0], wob[i][1] - wob[i - 1][1]))
    const total = cum[L - 1], out = [], pr = noise(); let s = 0, j = 0, guard = 0
    while (s <= total && guard++ < 5000) {
      while (j < L - 2 && cum[j + 1] < s) j++
      const k = cum[j + 1] > cum[j] ? Math.min(1, (s - cum[j]) / (cum[j + 1] - cum[j])) : 0
      const a = wob[j], b = wob[Math.min(j + 1, L - 1)], t = s / (total || 1)
      const press = Math.max(0.12, Math.min(0.85, 0.42 + pr(t) * 0.18 - (t < 0.12 ? (0.12 - t) * 2 : 0) - (t > 0.88 ? (t - 0.88) * 2.2 : 0)))
      out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, press])
      s += Math.max(1.5, base * (0.35 + 1.25 * Math.sin(Math.PI * Math.min(1, t)) + rr(-0.15, 0.15)))
    }
    return { pts: out, pauseAfter: dab ? rr(60, 110) : rr(90, 240) }
  }
  const strokes = []
  const add = (p, o) => strokes.push(hand(p, o))

  /* smiley: lopsided, overshoots its start */
  const S = { cx: 298 + rr(-4, 4), cy: 300 + rr(-4, 4), r: 90 }
  add(arc(S.cx, S.cy, S.r * 1.04, S.r * 0.93, -104, 276 + rr(14, 26), 70).map(([x, y], i) => [x + Math.sin(i / 9) * 3, y]), { drift: 6 })
  add([[S.cx - 33, S.cy - 38], [S.cx - 31, S.cy - 24], [S.cx - 32, S.cy - 13]], { drift: 1.5, base: 6 })
  add([[S.cx + 27, S.cy - 36], [S.cx + 30, S.cy - 12]], { drift: 1.5, base: 6 })
  add(arc(S.cx + 3, S.cy + 2, 54, 44, 14, 170, 30).map(([x, y], i, a) => [x, y + (i > a.length * 0.6 ? 3 : 0)]), { drift: 3 })
  /* hi! : leaning letters, wandering baseline */
  const H = { x: 452, top: 220, base: 374 }
  add([[H.x + 4, H.top], [H.x, H.base + 4]], { drift: 3 })
  add([...quad([H.x + 1, H.base - 50], [H.x + 28, H.base - 102], [H.x + 50, H.base - 48]), [H.x + 55, H.base + 2]], { drift: 3 })
  add([[H.x + 92, H.base - 70], [H.x + 90, H.base + 2]], { drift: 2 })
  add([[H.x + 93, H.base - 104], [H.x + 95, H.base - 98]], { drift: 0.5, base: 3, dab: true })
  add([[H.x + 140, H.top - 6], [H.x + 135, H.base - 42]], { drift: 2.5 })
  add([[H.x + 134, H.base - 10], [H.x + 136, H.base - 5]], { drift: 0.5, base: 3, dab: true })
  /* I ♥ you : drifts uphill, heart with uneven lobes */
  const R = { y: 474, base: 592 }, up = (x) => -(x - 200) * 0.05
  add([[208, R.y + up(208)], [211, R.base + up(211) + 3]], { drift: 2.5 })
  const heart = [], hx = 318, hy = 530 + up(318), hs = 4.0
  for (let i = 0; i <= 80; i++) { const t = Math.PI * 2 * (i / 80) + 0.05, lobe = Math.sin(t) > 0 ? 1.08 : 0.94; heart.push([hx + hs * 16 * Math.sin(t) ** 3 * lobe, hy - hs * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]) }
  heart.push([heart[1][0] + 3, heart[1][1] + 4])
  add(heart, { drift: 4 })
  const Y = { x: 428 }, yb = R.base + up(460)
  add([[Y.x, yb - 70], [Y.x + 24, yb - 16]], { drift: 2 })
  add([[Y.x + 48, yb - 74], ...quad([Y.x + 30, yb - 6], [Y.x + 20, yb + 34], [Y.x - 8, yb + 44]).slice(1)], { drift: 3 })
  add(arc(Y.x + 100, yb - 36, 31, 40, -80, 292, 40), { drift: 3.5 })
  add([[Y.x + 152, yb - 74], ...quad([Y.x + 150, yb + 8], [Y.x + 178, yb + 6], [Y.x + 198, yb - 30]).slice(1), [Y.x + 200, yb - 78], [Y.x + 203, yb + 2]], { drift: 3 })

  /* the finger: pen events with pressure on the app's own canvas */
  const draw = async () => {
    const cv = d.getElementById('view')
    const ev = (type, [x, y, p]) => cv.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 9, pointerType: 'pen', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1, pressure: type === 'pointerup' ? 0 : p, clientX: x, clientY: y }))
    const frame = () => new Promise((r) => requestAnimationFrame(r)), wait = (ms) => new Promise((r) => setTimeout(r, ms))
    for (const s of strokes) { const P = s.pts; ev('pointerdown', P[0]); await frame(); for (let i = 1; i < P.length; i++) { ev('pointermove', P[i]); if (i % 2 === 0) await frame() } ev('pointerup', P[P.length - 1]); await wait(s.pauseAfter) }
  }
  window.__draw = draw

  /* record: clean frame, the drawing, a poster at 7.4s; uploads to scripts/record-fog/upload_server.py */
  window.__record = async () => {
    const cv = d.getElementById('view')
    d.getElementById('wipe').click()
    await new Promise((r) => setTimeout(r, 1600))
    const up = async (name, b) => (await fetch('http://127.0.0.1:5600/' + name, { method: 'POST', body: b })).text()
    await up('clean.png', await new Promise((r) => cv.toBlob(r, 'image/png')))
    const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m))
    const rec = new MediaRecorder(cv.captureStream(30), { mimeType: mime, videoBitsPerSecond: 8_000_000 })
    const chunks = []; rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
    const done = new Promise((r) => (rec.onstop = r))
    rec.start(250); const t0 = performance.now()
    await new Promise((r) => setTimeout(r, 400)); await draw()
    while (performance.now() - t0 < 7400) await new Promise((r) => setTimeout(r, 50))
    const poster = await new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.9))
    while (performance.now() - t0 < 8400) await new Promise((r) => setTimeout(r, 50))
    rec.stop(); await done
    return [await up('love.webm', new Blob(chunks, { type: mime })), await up('love-poster.jpg', poster)]
  }
  console.log('ready: await __record()')
})()
