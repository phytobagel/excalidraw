# JoeAPP Scratchpad SOC icon

When Excalidraw is embedded in JoeAPP Scratchpad (`?embed=joeapp` or `/excalidraw/`), the bottom-right encryption **shield** is replaced by a **brain / AI** button.

## Behavior

1. Click exports the current scene as a JPEG (`maxWidthOrHeight: 1600`).
2. Posts `{ source: "joeapp-excalidraw", type: "scratchpad-soc", imageDataUrl }` to the parent window (same origin).
3. JoeAPP listens and runs the Journal → SOC parse/review/route flow against that image.

Outside JoeAPP embeds, the original encryption shield link is unchanged.

## Files

| Piece | Location |
|-------|----------|
| Icon button | `excalidraw-app/components/JoeappSocIcon.tsx` |
| Footer swap | `excalidraw-app/components/AppFooter.tsx` |
| Parent handler | millsAPP `src/public/scratchpad-soc.js` |
