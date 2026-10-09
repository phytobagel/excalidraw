# JoeAPP Scratchpad SOC icon

When Excalidraw is embedded in JoeAPP Scratchpad (`?embed=joeapp` or `/excalidraw/`), the bottom-right encryption **shield** is replaced by a **brain / AI** button.

## Behavior

1. Click exports a JPEG (`maxWidthOrHeight: 1600`):
   - If elements are selected (highlighted), only those elements are exported (including bound text and frame children).
   - If nothing is selected, the whole drawing is exported.
2. Posts `{ source: "joeapp-excalidraw", type: "scratchpad-soc", imageDataUrl, selectionOnly, sourceElementIds }` to the parent window (same origin). `selectionOnly` is `true` when a selection was used. `sourceElementIds` lists the exported element ids so JoeAPP can delete them after a conversion.
3. JoeAPP listens and runs the Scratchpad AI chooser (image→text, textbox, diagram, or SOC).

### Parent → iframe messages

All from `window.parent`, same origin, `{ source: "joeapp-parent", ... }`:

| `type` | Payload | Effect |
|--------|---------|--------|
| `scratchpad-insert-text` | `text`, `deleteSourceIds` | Delete source elements, insert a selected text element at viewport center |
| `scratchpad-insert-diagram` | `mermaid`, `deleteSourceIds` | Delete source elements, parse Mermaid → Excalidraw elements at viewport center |
| `scratchpad-delete-source` | `deleteSourceIds` | Delete source elements only (image→text / SOC finish) |

Helpers live in `joeappScratchpadConvert.ts`. Rebuild with millsAPP `npm run excalidraw:build`.

Outside JoeAPP embeds, the original encryption shield link is unchanged.

## Files

| Piece | Location |
|-------|----------|
| Icon button | `excalidraw-app/components/JoeappSocIcon.tsx` |
| Convert / delete helpers | `excalidraw-app/components/joeappScratchpadConvert.ts` |
| Footer swap | `excalidraw-app/components/AppFooter.tsx` |
| Parent handler | millsAPP `src/public/scratchpad-soc.js` |
