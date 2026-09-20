# Hayk Sargsyan — Portfolio

Single-page portfolio. React + TypeScript + Vite, Tailwind CSS v4, Framer Motion.
All texture effects are Canvas 2D / CSS — no WebGL yet (Phase 2 seam is marked
in `src/components/Hero.tsx`, search for `PHASE 2`).

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
- **Links** — search for `[LINK:` (résumé PDF in `Resume.tsx`, socials in
  `Contact.tsx`).
- **Mascot** — search for `MASCOT:` in `src/components/Mascot.tsx` to swap in
  final bear art.
