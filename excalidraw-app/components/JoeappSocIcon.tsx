import { useEffect } from "react";

import { Tooltip } from "@excalidraw/excalidraw/components/Tooltip";
import { brainIcon } from "@excalidraw/excalidraw/components/icons";
import {
  exportToBlob,
  getNonDeletedElements,
  MIME_TYPES,
} from "@excalidraw/excalidraw";
import { getSelectedElements } from "@excalidraw/element";
import { getDataURL } from "@excalidraw/excalidraw/data/blob";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import {
  deleteSourceElements,
  insertMermaidReplacingSource,
  insertTextboxReplacingSource,
} from "./joeappScratchpadConvert";

const MESSAGE_SOURCE = "joeapp-excalidraw";
const MESSAGE_TYPE = "scratchpad-soc";
const PARENT_SOURCE = "joeapp-parent";
const INSERT_TEXT_TYPE = "scratchpad-insert-text";
const INSERT_DIAGRAM_TYPE = "scratchpad-insert-diagram";
const DELETE_SOURCE_TYPE = "scratchpad-delete-source";

type Props = {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
};

export const JoeappSocIcon = ({ excalidrawAPI }: Props) => {
  useEffect(() => {
    if (!excalidrawAPI) {
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      if (event.source !== window.parent) {
        return;
      }
      const data = event.data;
      if (!data || data.source !== PARENT_SOURCE) {
        return;
      }

      const type = String(data.type || "");
      try {
        if (type === INSERT_TEXT_TYPE) {
          const text = String(data.text || "").trim();
          if (!text) {
            console.warn("Scratchpad insert-text: missing text.");
            return;
          }
          insertTextboxReplacingSource(
            excalidrawAPI,
            text,
            data.deleteSourceIds,
          );
          return;
        }
        if (type === INSERT_DIAGRAM_TYPE) {
          const mermaid = String(data.mermaid || "").trim();
          if (!mermaid) {
            console.warn("Scratchpad insert-diagram: missing mermaid.");
            return;
          }
          void insertMermaidReplacingSource(
            excalidrawAPI,
            mermaid,
            data.deleteSourceIds,
          ).catch((error) => {
            console.warn(
              "Scratchpad insert-diagram: could not add diagram.",
              error,
            );
          });
          return;
        }
        if (type === DELETE_SOURCE_TYPE) {
          deleteSourceElements(excalidrawAPI, data.deleteSourceIds);
        }
      } catch (error) {
        console.warn("Scratchpad parent message failed.", type, error);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [excalidrawAPI]);

  const onClick = async () => {
    if (!excalidrawAPI) {
      console.warn("Scratchpad SOC: Excalidraw API not ready.");
      return;
    }

    const appState = excalidrawAPI.getAppState();
    const allElements = getNonDeletedElements(
      excalidrawAPI.getSceneElements(),
    );
    if (!allElements.length) {
      window.alert("Draw something on the scratchpad first.");
      return;
    }

    // When something is highlighted, export only that selection (plus bound
    // text / frame children). Otherwise export the whole drawing.
    const selectedElements = getSelectedElements(allElements, appState, {
      includeBoundTextElement: true,
      includeElementsInFrames: true,
    });
    const elements = selectedElements.length ? selectedElements : allElements;
    const sourceElementIds = elements.map((el) => el.id);

    try {
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
          selectionOnly: selectedElements.length > 0,
          sourceElementIds,
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
      aria-label="Parse selection or scratchpad into inbox (SOC)"
      title="Parse selection or drawing into inbox"
      onClick={() => {
        void onClick();
      }}
    >
      <Tooltip
        label="Parse selection (or whole drawing) into inbox items (SOC)"
        long={true}
      >
        {brainIcon}
      </Tooltip>
    </button>
  );
};
