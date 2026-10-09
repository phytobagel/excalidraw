import {
  CaptureUpdateAction,
  convertToExcalidrawElements,
  getCommonBounds,
  getVisibleSceneBounds,
  newElementWith,
} from "@excalidraw/excalidraw";

import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

function normalizeDeleteIds(ids: unknown): string[] {
  return (Array.isArray(ids) ? ids : [])
    .map((id) => String(id || "").trim())
    .filter(Boolean);
}

function markDeleted(
  elements: readonly ExcalidrawElement[],
  deleteIds: string[],
): ExcalidrawElement[] {
  if (!deleteIds.length) {
    return [...elements];
  }
  const deleteSet = new Set(deleteIds);
  return elements.map((el) =>
    deleteSet.has(el.id) ? newElementWith(el, { isDeleted: true }) : el,
  );
}

function centerElementsInViewport(
  api: ExcalidrawImperativeAPI,
  elements: ExcalidrawElement[],
): ExcalidrawElement[] {
  if (!elements.length) {
    return elements;
  }
  const [minX, minY, maxX, maxY] = getCommonBounds(elements);
  const [vMinX, vMinY, vMaxX, vMaxY] = getVisibleSceneBounds(api.getAppState());
  const dx = vMinX + (vMaxX - vMinX) / 2 - (minX + maxX) / 2;
  const dy = vMinY + (vMaxY - vMinY) / 2 - (minY + maxY) / 2;
  if (dx === 0 && dy === 0) {
    return elements;
  }
  return elements.map((el) =>
    newElementWith(el, { x: el.x + dx, y: el.y + dy }),
  );
}

function applySceneUpdate(
  api: ExcalidrawImperativeAPI,
  {
    deleteIds,
    addElements,
  }: {
    deleteIds?: unknown;
    addElements?: readonly ExcalidrawElement[];
  },
) {
  const ids = normalizeDeleteIds(deleteIds);
  const additions = addElements ? [...addElements] : [];
  if (!ids.length && !additions.length) {
    return;
  }

  const nextElements = [
    ...markDeleted(api.getSceneElementsIncludingDeleted(), ids),
    ...additions,
  ];
  const selectedElementIds: Record<string, true> = {};
  for (const el of additions) {
    selectedElementIds[el.id] = true;
  }

  api.updateScene({
    elements: nextElements,
    appState: additions.length
      ? { selectedElementIds }
      : { selectedElementIds: {} },
    captureUpdate: CaptureUpdateAction.IMMEDIATELY,
  });
}

export function deleteSourceElements(
  api: ExcalidrawImperativeAPI,
  deleteIds: unknown,
) {
  applySceneUpdate(api, { deleteIds });
}

export function insertTextboxReplacingSource(
  api: ExcalidrawImperativeAPI,
  text: string,
  deleteIds: unknown,
) {
  const [minX, minY, maxX, maxY] = getVisibleSceneBounds(api.getAppState());
  const [textElement] = convertToExcalidrawElements([
    {
      type: "text",
      x: minX + (maxX - minX) / 2,
      y: minY + (maxY - minY) / 2,
      text,
    },
  ]);
  if (!textElement) {
    throw new Error("Could not create text element.");
  }
  applySceneUpdate(api, { deleteIds, addElements: [textElement] });
}

async function parseMermaid(definition: string) {
  const { parseMermaidToExcalidraw } = await import(
    "@excalidraw/mermaid-to-excalidraw"
  );
  try {
    return await parseMermaidToExcalidraw(definition);
  } catch (error) {
    if (!definition.includes('"')) {
      throw error;
    }
    return parseMermaidToExcalidraw(definition.replace(/"/g, "'"));
  }
}

export async function insertMermaidReplacingSource(
  api: ExcalidrawImperativeAPI,
  mermaid: string,
  deleteIds: unknown,
) {
  const definition = String(mermaid || "").trim();
  if (!definition) {
    throw new Error("Mermaid definition is empty.");
  }

  const parsed = await parseMermaid(definition);
  const converted = convertToExcalidrawElements(parsed.elements || [], {
    regenerateIds: true,
  });
  if (!converted.length) {
    throw new Error("Could not create diagram elements.");
  }

  if (parsed.files) {
    api.addFiles(Object.values(parsed.files));
  }

  applySceneUpdate(api, {
    deleteIds,
    addElements: centerElementsInViewport(api, [...converted]),
  });
}
