# JoeAPP Scratchpad SOC icon

When Excalidraw is embedded in JoeAPP Scratchpad (`?embed=joeapp` or `/excalidraw/`), the bottom-right encryption **shield** is replaced by a **brain / AI** button.

## Behavior

1. Click exports a JPEG (`maxWidthOrHeight: 1600`):
   - If elements are selected (highlighted), only those elements are exported (including bound text and frame children).
   - If nothing is selected, the whole drawing is exported.
2. Posts `{ source: "joeapp-excalidraw", type: "scratchpad-soc", imageDataUrl, selectionOnly }` to the parent window (same origin). `selectionOnly` is `true` when a selection was used.
3. JoeAPP listens and runs the Journal → SOC parse/review/route flow against that image.

### Insert text from parent

When JoeAPP chooses **Create textbox from image**, the parent posts:

`{ source: "joeapp-parent", type: "scratchpad-insert-text", text }`

(same origin, from `window.parent`). The icon listens and inserts a selected text element at the visible viewport center.

Outside JoeAPP embeds, the original encryption shield link is unchanged.

## Files

| Piece | Location |
|-------|----------|
| Icon button | `excalidraw-app/components/JoeappSocIcon.tsx` |
| Footer swap | `excalidraw-app/components/AppFooter.tsx` |
| Parent handler | millsAPP `src/public/scratchpad-soc.js` |
