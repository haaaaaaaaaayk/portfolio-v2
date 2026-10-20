export const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, aPos.y * 0.5 + 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

/**
 * One fragment program, three of Hayk’s experiments:
 * Fogged Glass (condensation + wipe + droplets),
 * Halftone Specimen (CMYK + accent fifth ink),
 * Overtaken (trail organism from the bottom).
 * Mix with uMix.xyz. WebGL 1.
 */
export const FRAG = `
precision mediump float;
varying vec2 vUv;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uMix;
uniform float uFog;
uniform float uFreeze;
uniform float uResolve;
uniform float uGrid;
uniform float uTone;
uniform float uEffect;
uniform float uColor;
uniform float uGain;
uniform float uTrail;
uniform float uWarp;
uniform float uScrollVel;
uniform float uStrip;
uniform float uFeedback;
uniform sampler2D uHeat;
uniform sampler2D uClear;
uniform sampler2D uSource;
uniform sampler2D uTrailMap;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p *= 2.07;
    a *= 0.5;
  }
  return v;
}

vec2 warpUv(vec2 uv) {
  vec2 d = uv - uPointer;
  float inf = exp(-dot(d, d) * 22.0);
  return uv + d * inf * uWarp * 0.22;
}

vec4 fogged(vec2 uv) {
  float heat = texture2D(uHeat, uv).r;
  float n = fbm(uv * vec2(6.0, 9.0) + vec2(0.0, uTime * 0.018 * (1.0 - uFreeze)));
  float grain = noise(uv * uRes * 0.28);
  float cond = smoothstep(0.08, 0.68, n * 0.82 + grain * 0.28);
  cond = mix(0.62, 1.0, cond);
  cond *= uFog;
  cond *= (1.0 - heat);

  vec2 dUv = uv;
  dUv.y -= (1.0 - uFreeze) * 0.03 * (0.4 + heat);
  float scale = 13.0;
  vec2 cell = floor(dUv * scale);
  vec2 f = fract(dUv * scale);
  vec2 rnd = vec2(hash(cell), hash(cell + 19.2));
  vec2 c = 0.22 + 0.56 * rnd;
  float stretch = 1.0 + rnd.y * 2.1 * (1.0 - uFreeze);
  vec2 p = (f - c) * vec2(1.0, stretch);
  float dist = length(p);
  float rad = 0.055 + hash(cell + 3.1) * 0.11;
  float drop = smoothstep(rad, rad * 0.32, dist);
  float rim = smoothstep(rad * 1.18, rad, dist) * smoothstep(rad * 0.45, rad * 0.88, dist);
  drop *= smoothstep(0.15, 0.55, cond + 0.15);

  /* Cool milk, not paper-white — otherwise frost vanishes on #EEEEF0. */
  float alpha = clamp(cond * 0.78 + rim * 0.28, 0.0, 0.88);
  alpha *= (1.0 - drop * 0.9);

  vec3 frost = vec3(0.78, 0.82, 0.86);
  vec3 veil = vec3(0.62, 0.68, 0.72);
  vec3 rimCol = mix(frost, vec3(0.102, 0.929, 0.773), 0.22);
  vec3 rgb = mix(veil, mix(frost, rimCol, rim), 0.72 + grain * 0.18);
  float spec = pow(max(0.0, 1.0 - dist / max(rad, 0.001)), 7.0) * drop;
  rgb += vec3(spec * 0.55);
  return vec4(rgb * alpha, alpha);
}

float screenDot(vec2 uv, float ang, float freq, float amt) {
  float cs = cos(ang);
  float sn = sin(ang);
  vec2 p = vec2(cs * uv.x - sn * uv.y, sn * uv.x + cs * uv.y) * freq;
  vec2 g = fract(p) - 0.5;
  float d = mix(length(g), abs(g.x) * 1.2, uEffect);
  float r = clamp(amt, 0.0, 1.0) * 0.62;
  return 1.0 - smoothstep(r, r + 0.045, d);
}

vec4 halftone(vec2 uv) {
  vec4 src = texture2D(uSource, uv);
  vec3 inv = 1.0 - src.rgb;
  float k = min(inv.r, min(inv.g, inv.b));
  float denom = max(1.0 - k, 0.001);
  float ck = (inv.r - k) / denom;
  float mk = (inv.g - k) / denom;
  float yk = (inv.b - k) / denom;

  float freq = uGrid * (1.0 + uScrollVel * 0.85);
  freq = mix(freq, freq * 2.2, uResolve);
  float gain = mix(uTone, uTone * 0.42, uResolve);

  vec2 aspect = vec2(1.0, uRes.y / max(uRes.x, 1.0));
  float pd = length((uv - uPointer) * aspect);
  float near = exp(-pd * 8.0);
  freq *= 1.0 + near * 0.85;
  gain *= 1.0 - near * 0.4;

  float C = screenDot(uv, 0.2618, freq, ck * gain);
  float M = screenDot(uv, 1.3090, freq, mk * gain);
  float Y = screenDot(uv, 0.0, freq, yk * gain);
  float K = screenDot(uv, 0.7854, freq, k * gain);
  float A = screenDot(uv, 0.5236, freq, src.g * 0.38 * gain * uColor);

  vec3 col = vec3(0.980);
  float chroma = uColor;
  col = mix(col, vec3(0.0, 0.62, 0.89), C * chroma);
  col = mix(col, vec3(0.85, 0.0, 0.48), M * chroma);
  col = mix(col, vec3(1.0, 0.92, 0.0), Y * chroma);
  col = mix(col, vec3(0.086, 0.086, 0.086), K);
  col = mix(col, vec3(0.102, 0.929, 0.773), A * chroma);
  return vec4(col, 1.0);
}

vec4 overtaken(vec2 uv) {
  float cleared = texture2D(uClear, uv).r;
  float front = clamp(uGain * 0.52 + uTrail * 0.58, 0.0, 1.35);
  float n = fbm(vec2(uv.x * 3.6, uv.y * 2.8 - uTime * 0.11));
  float n2 = fbm(vec2(uv.x * 8.5 + n, uv.y * 5.5) + vec2(uTime * 0.04, 0.0));
  float body = smoothstep(front + 0.2, front - 0.06, uv.y + n2 * 0.24);
  float tongues = smoothstep(0.42, 0.92, n) * smoothstep(front + 0.32, front, uv.y);
  float org = clamp(body + tongues * 0.7, 0.0, 1.0);
  org *= (1.0 - cleared);

  float g = step(0.965, hash(vec2(floor(uv.y * 80.0), floor(uTime * 9.0)))) * org * uGain;
  vec3 col = mix(vec3(0.086), vec3(0.102, 0.929, 0.773), n2 * 0.38);
  col = mix(col, vec3(0.216, 0.525, 1.0), g);
  float alpha = org * 0.93;
  return vec4(col * alpha, alpha);
}

void main() {
  vec2 uv = warpUv(vUv);
  vec2 uvH = uv;
  if (uStrip > 0.001 && uv.y < uStrip) {
    uvH = vec2(uv.x, (uv.y / uStrip) * 0.22 + uPointer.y * 0.55);
  }

  vec4 fogC = vec4(0.0);
  vec4 toneC = vec4(0.0);
  vec4 overC = vec4(0.0);
  if (uMix.x > 0.001) fogC = fogged(uv);
  if (uMix.y > 0.001) toneC = halftone(uvH);
  if (uMix.z > 0.001) overC = overtaken(uv);

  vec4 col = vec4(0.0);
  col = mix(col, toneC, toneC.a * uMix.y);
  float fa = fogC.a * uMix.x;
  col = vec4(col.rgb * (1.0 - fa) + fogC.rgb, col.a * (1.0 - fa) + fa);
  float oa = overC.a * uMix.z;
  col = vec4(mix(col.rgb, overC.rgb, oa), col.a * (1.0 - oa) + oa);

  if (uFeedback > 0.001) {
    float t = texture2D(uTrailMap, vUv).r;
    vec3 acc = vec3(0.102, 0.929, 0.773);
    col.rgb = mix(col.rgb, acc, t * uFeedback * 0.6);
    col.a = max(col.a, t * uFeedback * 0.45);
  }

  gl_FragColor = col;
}
`
