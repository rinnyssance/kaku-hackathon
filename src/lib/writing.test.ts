import { describe, expect, it } from "vitest";
import { contentById } from "../../shared/content";
import { normalizePoint, validateWriting } from "./writing";

describe("writing validation", () => {
  it("normalizes points to practice-paper bounds", () => {
    expect(normalizePoint({ x: 50, y: 25 }, 100, 100)).toEqual({ x: .5, y: .25 });
    expect(normalizePoint({ x: -10, y: 120 }, 100, 100)).toEqual({ x: 0, y: 1 });
  });

  it("accepts strokes that follow the reference paths", () => {
    const yama = contentById.get("yama")!;
    const feedback = validateWriting(yama, yama.referenceStrokes!.map((stroke) => stroke.points));
    expect(feedback.correct).toBe(true);
  });

  it("identifies a direction error for a showcase kanji", () => {
    const yama = contentById.get("yama")!;
    const feedback = validateWriting(yama, [
      [{ x: .28, y: .2 }, { x: .28, y: .8 }],
      [{ x: .5, y: .2 }, { x: .8, y: .2 }],
      [{ x: .72, y: .3 }, { x: .72, y: .8 }],
    ]);
    expect(feedback.correct).toBe(false);
    expect(feedback.problemStroke).toBe(2);
  });

  it("identifies an incorrect end region", () => {
    const yama = contentById.get("yama")!;
    const strokes = yama.referenceStrokes!.map((stroke) => stroke.points.map((point) => ({ ...point })));
    strokes[0][1] = { x: .28, y: .45 };
    const feedback = validateWriting(yama, strokes);
    expect(feedback.correct).toBe(false);
    expect(feedback.message).toContain("finish closer");
  });

  it("identifies a rough path mismatch", () => {
    const yama = contentById.get("yama")!;
    const strokes = yama.referenceStrokes!.map((stroke) => stroke.points.map((point) => ({ ...point })));
    strokes[0] = [{ x: .28, y: .22 }, { x: .85, y: .5 }, { x: .28, y: .76 }];
    const feedback = validateWriting(yama, strokes);
    expect(feedback.correct).toBe(false);
    expect(feedback.message).toContain("shape needs review");
  });
});
