import { pointDistanceSq, pointFrom } from "@excalidraw/math";

import type { LocalPoint } from "@excalidraw/math";

/**
 * Whether a candidate freedraw sample is far enough from the last kept
 * point to bother storing. Distance is in scene units; pass
 * `minScreenDistance / zoom` so dense pen tablets don't explode point count.
 */
export const shouldKeepFreedrawPoint = (
  lastPoint: LocalPoint | undefined,
  nextX: number,
  nextY: number,
  minSceneDistance: number,
): boolean => {
  if (!lastPoint) {
    return true;
  }
  if (lastPoint[0] === nextX && lastPoint[1] === nextY) {
    return false;
  }
  if (minSceneDistance <= 0) {
    return true;
  }
  return (
    pointDistanceSq(lastPoint, pointFrom(nextX, nextY)) >=
    minSceneDistance * minSceneDistance
  );
};

/**
 * Ramer–Douglas–Peucker that returns kept indices so pressures can stay
 * aligned with geometry when a stroke is finalized.
 */
export const simplifyFreedrawPointIndices = (
  points: readonly LocalPoint[],
  tolerance: number,
): number[] => {
  const last = points.length - 1;
  if (last < 2 || tolerance <= 0) {
    return points.map((_, index) => index);
  }

  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[last] = 1;

  const stack: Array<[number, number]> = [[0, last]];
  const tolSq = tolerance * tolerance;

  while (stack.length) {
    const [start, end] = stack.pop()!;
    const startPoint = points[start];
    const endPoint = points[end];
    const dx = endPoint[0] - startPoint[0];
    const dy = endPoint[1] - startPoint[1];
    const lengthSq = dx * dx + dy * dy;

    let maxDistSq = 0;
    let maxIndex = start;

    for (let i = start + 1; i < end; i++) {
      const point = points[i];
      let distSq: number;
      if (lengthSq === 0) {
        distSq = pointDistanceSq(point, startPoint);
      } else {
        // perpendicular distance to the chord, squared
        const t =
          ((point[0] - startPoint[0]) * dx + (point[1] - startPoint[1]) * dy) /
          lengthSq;
        const projX = startPoint[0] + t * dx;
        const projY = startPoint[1] + t * dy;
        const ex = point[0] - projX;
        const ey = point[1] - projY;
        distSq = ex * ex + ey * ey;
      }
      if (distSq > maxDistSq) {
        maxDistSq = distSq;
        maxIndex = i;
      }
    }

    if (maxDistSq > tolSq && maxIndex !== start) {
      keep[maxIndex] = 1;
      if (maxIndex - start > 1) {
        stack.push([start, maxIndex]);
      }
      if (end - maxIndex > 1) {
        stack.push([maxIndex, end]);
      }
    }
  }

  const indices: number[] = [];
  for (let i = 0; i < keep.length; i++) {
    if (keep[i]) {
      indices.push(i);
    }
  }
  return indices;
};

export const simplifyFreedrawStroke = <P extends LocalPoint>(
  points: readonly P[],
  pressures: readonly number[],
  tolerance: number,
): { points: P[]; pressures: number[] } => {
  if (points.length < 3 || tolerance <= 0) {
    return { points: points.slice() as P[], pressures: pressures.slice() };
  }

  const indices = simplifyFreedrawPointIndices(points, tolerance);
  if (indices.length === points.length) {
    return { points: points.slice() as P[], pressures: pressures.slice() };
  }

  return {
    points: indices.map((index) => points[index]) as P[],
    pressures:
      pressures.length === points.length
        ? indices.map((index) => pressures[index])
        : pressures.slice(),
  };
};
