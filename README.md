# Hayk Sargsyan — Portfolio

Single-page portfolio. React + TypeScript + Vite, Tailwind CSS v4, Framer Motion.
Eleven distinct layouts share one content source and the **24th System** tokens.
The only carry-over from the previous version is liquid glass (`.glass`,
`.glass-dark`, `.sheen`) floating over `LiquidField`. Variants 6–10 layer
Hayk’s Fogged Glass, Halftone Specimen, and Overtaken experiments as WebGL
atmospheres on top of that system.

## Design tokens

All tokens live in the `@theme` block of `src/index.css`. One weight (400);
hierarchy is size, spacing, and color.

- **Color** — ink `#161616` (muted `#666666`, active `#111111`, pressed `#333333`);
  surfaces `#FFFFFF` / `#FAFAFA` / `#F3F3F3` (canvas `#EEEEF0`, control `#EDEDED`,
  control-hover `#E3E3E3`); accent `#1AEDC5`; field border `rgb(0 0 0 / .18)`,
  focus = accent, error `#B3261E`, success `#276738`, disabled `#8A8A8A` on `#F2F2F2`;
  media `#3786FF`; rules `rgb(0 0 0 / .10)` and `.07`.
- **Type** — `caption 12/20 · compact 14/20 · secondary 16/24 · body 18/28 ·
  heading 20/28 · title 24/32 · role 32/40 · specimen 48/56 · display 96/104`.
- **Spacing** — 4px unit; paragraph 16, module 32, section 64. Controls 44 / 36 / 32.
  Form width 420px.
- **Radius** — cards and multi-line fields 20; single-line controls and alerts full;
  tiny marks 2; media 12.
- **Motion** — open 360 ms `ease-open`, close 260 ms `ease-close`;
  everything respects `prefers-reduced-motion`.

## Fonts

Switchable via `data-font` on `<html>`, persisted to `localStorage`, and set from
`?font=`. All three stacks are weight 400.

1. **sf** (default) — SF Pro system stack. Not bundled.
2. **haas** — Alte Haas Grotesk Regular from `public/fonts/AlteHaasGroteskRegular.ttf`.
   Applies `letter-spacing: -0.04em` globally while active.
3. **helvetica-now** — `local()` Helvetica Now, falling back to Helvetica Neue.
   Not bundled.

## Query params

| Param | Values | Default |
| --- | --- | --- |
| `?v=` | `1` … `11` | `1` (or last `localStorage` value) |
| `?font=` | `sf` · `haas` · `helvetica-now` | `sf` |
| `?ui=0` | hides the floating switcher | switcher visible |

The floating glass switcher (variant 1–11 + font) is 44px, full radius, keyboard
accessible (Enter/Space opens, Esc closes). URL and `localStorage` stay in sync
so a link can be shared.

## Variants

1. **Desktop OS** (`src/variants/v1-desktop-os`) — A desktop metaphor: glass
   windows with z-order and a draggable title bar, a dock, a menu-bar clock
   (`useClock`), and a ⌘K / Ctrl+K command palette. On small screens the same
   apps become stacked sheets above the dock.

2. **Index** (`src/variants/v2-index`) — Text-first numbered list on a 64px
   rhythm. Hovering a case (fine pointer) shows a cursor-following glass
   preview; click expands the case sheet inline.

3. **Spatial canvas** (`src/variants/v3-spatial-canvas`) — A pan/zoom moodboard
   of glass cards (work, about, cities, résumé, contact). Minimap and Fit all
   frame the board; click a card to focus, then open a case overlay.

4. **Editorial** (`src/variants/v4-editorial`) — Magazine pacing: display-size
   type, a sticky glass masthead that compresses on scroll, horizontal snap
   case studies with `useScroll` progress, and a skills marquee.

5. **Lab** (`src/variants/v5-lab`) — Live knobs for glass blur / saturate / tint
   and the pointer-reactive liquid field, a 24th controls specimen filled with
   Hayk’s content, token swatches, and an FPS readout.

6. **Fogged glass** (`src/variants/v6-fogged-glass`) — Fogged Glass as weather:
   a full-viewport condensation shader (`Finger Wetness Fog`). Drag to wipe;
   droplets bead, streak, and freeze if you hold still. Case studies sit as
   glass panes behind the fog. Footer dock: Finger / Wetness / Fog sliders,
   humidity / time, Snapshot, and “use your own photo”. Right-click or
   long-press opens the original snapshot chrome.

7. **Halftone** (`src/variants/v7-halftone`) — Halftone Specimen as the type
   engine: CMYK plus accent `#1AEDC5` as a fifth ink. Body copy dissolves into
   dots at rest and resolves on hover / scroll. Customize Effect, Color, Grid,
   Tone, Source (defaults `180 : 190`). Footer is a live halftone strip of the
   page source; scroll velocity drives dot size.

8. **Overtaken** (`src/variants/v8-overtaken`) — “Hayk hates hiking.” The
   organism starts as a footer and climbs as you move up the trail, scroll, or
   sit idle. Clicking a case punches a hole and springs open a 24th-system
   reading circle.

9. **Triptych** (`src/variants/v9-triptych`) — One WebGL context, three stages
   (Fogged / Halftone / Overtaken) mixed on a glass bus. Scroll crossfades;
   pointer warps locally; keys `1` `2` `3` solo a shader. Footer is a mix-bus
   waveform.

10. **Night lab** (`src/variants/v10-night-lab`) — The three shaders are
    instruments. Hold `F` / `H` / `O` (or `1` `2` `3`) to layer fog, halftone,
    overtaken. Case studies are tracks. Optional pointer oscillator (Web Audio,
    no files). DPR capped; pauses when the tab is hidden.

11. **Trail** (`src/variants/v11-trail`) — Opens on the "Hayk hates hiking"
    scene (ported verbatim from the artifact into `scene.ts`), centered with
    feathered edges. Scroll for the pitch, then the projects; a project opens
    in `CaseDialog`.

Shader engine: `src/shaders/` (one context per variant). Experiments as copy:
`src/shaders/copy.ts`.

## Run locally

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build → dist/
npm run preview  # preview the production build
```

## Deploy to GitHub Pages

The Vite config already uses `base: './'`, so the build works from any sub-path.

1. Create a GitHub repo and push this project.
2. Run:

   ```bash
   npm run deploy
   ```

   This builds the site and pushes `dist/` to a `gh-pages` branch via the
   `gh-pages` package.
3. In the repo settings → Pages, set the source to the `gh-pages` branch.

## Placeholders to replace

- **Images** — search the codebase for `[IMAGE:` (all in `ImageSlot` usages).
  Replace each slot with a real `<img>`; keep the wrapper for layout.
- **Links** — search for `[LINK:` (résumé PDF, socials in content).
