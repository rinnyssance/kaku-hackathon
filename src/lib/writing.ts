import type { KanjiContent, Stroke, StrokePoint } from "../../shared/contracts";

export interface WritingFeedback {
  correct: boolean;
  message: string;
  problemStroke?: number;
}

export function normalizePoint(point: StrokePoint, width: number, height: number): StrokePoint {
  if (width <= 0 || height <= 0) return { x: 0, y: 0 };
  return {
    x: Math.min(1, Math.max(0, point.x / width)),
    y: Math.min(1, Math.max(0, point.y / height)),
  };
}

function dominantDirection(stroke: Stroke): "horizontal" | "vertical" | "diagonal-down" | "diagonal-up" {
  const start = stroke[0];
  const end = stroke[stroke.length - 1] ?? start;
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  if (Math.abs(deltaX) < Math.abs(deltaY) * .45) return "vertical";
  if (Math.abs(deltaY) < Math.abs(deltaX) * .45) return "horizontal";
  return deltaY >= 0 ? "diagonal-down" : "diagonal-up";
}

function sampleStroke(stroke: Stroke, sampleCount = 12): Stroke {
  if (stroke.length < 2) return stroke;
  const lengths = stroke.slice(1).map((point, index) => Math.hypot(point.x - stroke[index].x, point.y - stroke[index].y));
  const totalLength = lengths.reduce((sum, length) => sum + length, 0);
  if (totalLength === 0) return Array.from({ length: sampleCount }, () => stroke[0]);

  return Array.from({ length: sampleCount }, (_, sampleIndex) => {
    const target = (totalLength * sampleIndex) / (sampleCount - 1);
    let traversed = 0;
    for (let segmentIndex = 0; segmentIndex < lengths.length; segmentIndex += 1) {
      const segmentLength = lengths[segmentIndex];
      if (traversed + segmentLength >= target) {
        const progress = segmentLength === 0 ? 0 : (target - traversed) / segmentLength;
        const start = stroke[segmentIndex];
        const end = stroke[segmentIndex + 1];
        return { x: start.x + (end.x - start.x) * progress, y: start.y + (end.y - start.y) * progress };
      }
      traversed += segmentLength;
    }
    return stroke.at(-1)!;
  });
}

function pathDifference(actual: Stroke, reference: Stroke): number {
  const actualSamples = sampleStroke(actual);
  const referenceSamples = sampleStroke(reference);
  return actualSamples.reduce((sum, point, index) => {
    const expected = referenceSamples[index];
    return sum + Math.hypot(point.x - expected.x, point.y - expected.y);
  }, 0) / actualSamples.length;
}

export function validateWriting(content: KanjiContent, strokes: Stroke[]): WritingFeedback {
  if (strokes.length !== content.strokeCount) {
    return { correct: false, message: `${content.character} uses ${content.strokeCount} strokes. You drew ${strokes.length}.` };
  }
  if (!content.referenceStrokes) {
    return { correct: true, message: "Stroke count matches. Full direction feedback is available for the showcase kanji." };
  }
  for (let index = 0; index < content.referenceStrokes.length; index += 1) {
    const actual = strokes[index];
    const reference = content.referenceStrokes[index];
    if (!actual || dominantDirection(actual) !== reference.direction) {
      return { correct: false, message: `Stroke ${index + 1} direction needs review.`, problemStroke: index + 1 };
    }
    const start = actual[0];
    const expectedStart = reference.points[0];
    if (Math.hypot(start.x - expectedStart.x, start.y - expectedStart.y) > .24) {
      return { correct: false, message: `Stroke ${index + 1} should begin closer to the highlighted start point.`, problemStroke: index + 1 };
    }
    const end = actual.at(-1)!;
    const expectedEnd = reference.points.at(-1)!;
    if (Math.hypot(end.x - expectedEnd.x, end.y - expectedEnd.y) > .24) {
      return { correct: false, message: `Stroke ${index + 1} should finish closer to the expected end region.`, problemStroke: index + 1 };
    }
    if (pathDifference(actual, reference.points) > .18) {
      return { correct: false, message: `Stroke ${index + 1} shape needs review.`, problemStroke: index + 1 };
    }
  }
  return { correct: true, message: "The stroke count, order, starts, and directions look right." };
}
