# Stroke color wheel

The stroke (and background) color popover hex row includes a circular **color wheel** control next to the eyedropper.

- Clicking it opens the browser/OS native color picker (`input type="color"`).
- Choosing a color updates the element stroke/background immediately (live `onInput` while dragging).
- In dark mode, picks are converted with `removeDarkModeFilter` (same as the eyedropper) so the color you choose is the color you see on the canvas — not the inverted storage value.
- Transparent colors cannot be represented by the native control; the swatch falls back to default ink until a real color is picked.

## Files

| Piece | Location |
|-------|----------|
| Control | `packages/excalidraw/components/ColorPicker/ColorInput.tsx` |
| Styles | `packages/excalidraw/components/ColorPicker/ColorPicker.scss` |
| Label | `packages/excalidraw/locales/en.json` → `labels.colorWheel` |
