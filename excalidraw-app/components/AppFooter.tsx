import { Footer } from "@excalidraw/excalidraw/index";
import React from "react";

import { isExcalidrawPlusSignedUser } from "../app_constants";

import { DebugFooter, isVisualDebuggerEnabled } from "./DebugCanvas";
import { EncryptedIcon } from "./EncryptedIcon";
import { JoeappSocIcon } from "./JoeappSocIcon";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

function isJoeappScratchpadEmbed(): boolean {
  try {
    const url = new URL(window.location.href);
    return (
      url.searchParams.get("embed") === "joeapp" ||
      url.pathname.startsWith("/excalidraw")
    );
  } catch {
    return false;
  }
}

export const AppFooter = React.memo(
  ({
    onChange,
    excalidrawAPI,
  }: {
    onChange: () => void;
    excalidrawAPI?: ExcalidrawImperativeAPI | null;
  }) => {
    const joeappEmbed = isJoeappScratchpadEmbed();

    return (
      <Footer>
        <div
          style={{
            display: "flex",
            gap: ".5rem",
            alignItems: "center",
          }}
        >
          {isVisualDebuggerEnabled() && <DebugFooter onChange={onChange} />}
          {joeappEmbed ? (
            <JoeappSocIcon excalidrawAPI={excalidrawAPI ?? null} />
          ) : (
            !isExcalidrawPlusSignedUser && <EncryptedIcon />
          )}
        </div>
      </Footer>
    );
  },
);
