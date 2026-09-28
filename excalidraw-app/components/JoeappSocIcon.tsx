import { Tooltip } from "@excalidraw/excalidraw/components/Tooltip";
import { brainIcon } from "@excalidraw/excalidraw/components/icons";
import {
  exportToBlob,
  getNonDeletedElements,
  MIME_TYPES,
} from "@excalidraw/excalidraw";
import { getDataURL } from "@excalidraw/excalidraw/data/blob";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const MESSAGE_SOURCE = "joeapp-excalidraw";
const MESSAGE_TYPE = "scratchpad-soc";

type Props = {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
};

export const JoeappSocIcon = ({ excalidrawAPI }: Props) => {
  const onClick = async () => {
    if (!excalidrawAPI) {
      console.warn("Scratchpad SOC: Excalidraw API not ready.");
      return;
    }

    const elements = getNonDeletedElements(excalidrawAPI.getSceneElements());
    if (!elements.length) {
      window.alert("Draw something on the scratchpad first.");
      return;
    }

    try {
      const appState = excalidrawAPI.getAppState();
      const blob = await exportToBlob({
        elements,
        appState: {
          ...appState,
          exportBackground: true,
          viewBackgroundColor: appState.viewBackgroundColor,
        },
        files: excalidrawAPI.getFiles(),
        mimeType: MIME_TYPES.jpg,
        maxWidthOrHeight: 1600,
      });
      const imageDataUrl = await getDataURL(blob);

      if (window.parent === window) {
        console.warn("Scratchpad SOC: not embedded; nowhere to send the image.");
        return;
      }

      window.parent.postMessage(
        {
          source: MESSAGE_SOURCE,
          type: MESSAGE_TYPE,
          imageDataUrl,
        },
        window.location.origin,
      );
    } catch (error) {
      console.warn("Scratchpad SOC: could not export canvas image.", error);
      window.alert("Could not export the scratchpad image.");
    }
  };

  return (
    <button
      type="button"
      className="encrypted-icon tooltip joeapp-soc-icon"
      aria-label="Parse scratchpad into inbox (SOC)"
      title="Parse scratchpad into inbox"
      onClick={() => {
        void onClick();
      }}
    >
      <Tooltip label="Parse drawing into inbox items (SOC)" long={true}>
        {brainIcon}
      </Tooltip>
    </button>
  );
};
