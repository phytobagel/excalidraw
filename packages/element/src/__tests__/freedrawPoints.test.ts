import { pointFrom } from "@excalidraw/math";
import { describe, expect, it } from "vitest";

import type { LocalPoint } from "@excalidraw/math";

import {
  shouldKeepFreedrawPoint,
  simplifyFreedrawStroke,
} from "../freedrawPoints";

describe("shouldKeepFreedrawPoint", () => {
  it("keeps the first point", () => {
    expect(shouldKeepFreedrawPoint(undefined, 0, 0, 1)).toBe(true);
  });

  it("drops exact duplicates", () => {
    expect(
      shouldKeepFreedrawPoint(pointFrom<LocalPoint>(1, 2), 1, 2, 0),
    ).toBe(false);
  });

  it("drops points inside the min distance", () => {
    expect(
      shouldKeepFreedrawPoint(pointFrom<LocalPoint>(0, 0), 0.5, 0, 1),
    ).toBe(false);
    expect(
      shouldKeepFreedrawPoint(pointFrom<LocalPoint>(0, 0), 1, 0, 1),
    ).toBe(true);
  });
});

describe("simplifyFreedrawStroke", () => {
  it("preserves short strokes", () => {
    const points = [pointFrom<LocalPoint>(0, 0), pointFrom<LocalPoint>(1, 0)];
    const result = simplifyFreedrawStroke(points, [0.2, 0.4], 0.5);
    expect(result.points).toEqual(points);
    expect(result.pressures).toEqual([0.2, 0.4]);
  });

  it("drops colinear midpoints and keeps pressures aligned", () => {
    const points = [
      pointFrom<LocalPoint>(0, 0),
      pointFrom<LocalPoint>(1, 0),
      pointFrom<LocalPoint>(2, 0),
      pointFrom<LocalPoint>(3, 0),
    ];
    const pressures = [0.1, 0.2, 0.3, 0.4];
    const result = simplifyFreedrawStroke(points, pressures, 0.1);
    expect(result.points).toEqual([
      pointFrom<LocalPoint>(0, 0),
      pointFrom<LocalPoint>(3, 0),
    ]);
    expect(result.pressures).toEqual([0.1, 0.4]);
  });

  it("keeps a corner that exceeds tolerance", () => {
    const points = [
      pointFrom<LocalPoint>(0, 0),
      pointFrom<LocalPoint>(1, 0),
      pointFrom<LocalPoint>(1, 2),
      pointFrom<LocalPoint>(2, 2),
    ];
    const result = simplifyFreedrawStroke(points, [], 0.5);
    expect(result.points.length).toBeGreaterThanOrEqual(3);
    expect(result.points[0]).toEqual(pointFrom<LocalPoint>(0, 0));
    expect(result.points[result.points.length - 1]).toEqual(
      pointFrom<LocalPoint>(2, 2),
    );
  });
});
