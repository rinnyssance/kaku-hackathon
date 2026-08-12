
import type { KanjiContent, Stroke, StrokePoint } from "../../shared/contracts";

export interface WritingFeedback {
  correct: boolean;
  message: string;
  problemStroke?: number;
}

export function normalizePoint(point: StrokePoint, width: number, height: number): StrokePoint {
  return { x: point.x / width, y: point.y / height };
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
    if (Math.hypot(start.x - expectedStart.x, start.y - expectedStart.y) > .32) {
      return { correct: false, message: `Stroke ${index + 1} should begin closer to the highlighted start point.`, problemStroke: index + 1 };
    }
  }
  return { correct: true, message: "The stroke count, order, starts, and directions look right." };
}
