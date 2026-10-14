# Freedraw / pen performance (JoeAPP Scratchpad)

Handwriting with the pen tool used to slow down after a few sentences because
each pointer sample:

1. Appended a point (pen tablets fire many near-duplicates per stroke)
2. Called React `setState` (full App render + perfect-freehand outline regen)
3. Left dense point arrays on every finished stroke (static canvas + localStorage
   saves grow with each letter)

## Fixes

| Change | Where |
| --- | --- |
| Drop samples closer than `FREEDRAW_POINT_MIN_SCREEN_DISTANCE` (CSS px → scene via `/ zoom`) | `packages/element/src/freedrawPoints.ts`, `App` pointer-move |
| Coalesce freedraw paints to one `requestAnimationFrame` | `App.freedrawRenderRaf` |
| Ramer–Douglas–Peucker simplify on pointer-up (`FREEDRAW_FINALIZE_SIMPLIFY_TOLERANCE`) | `simplifyFreedrawStroke`, finalize path |
| Debounce local saves `300ms` → `800ms` | `excalidraw-app/app_constants.ts` |

## Verify

```bash
yarn test packages/element/src/__tests__/freedrawPoints.test.ts
# from millsAPP after rebuild:
npm run excalidraw:build
```

Then Scratchpad → pen: write several sentences; stroke lag should stay flat instead
of climbing after ~3 sentences.
