
import { describe, expect, it } from "vitest";
import { contentById } from "../../shared/content";
import { normalizePoint, validateWriting } from "./writing";

describe("writing validation", () => {
  it("normalizes points to practice-paper bounds", () => {
    expect(normalizePoint({ x: 50, y: 25 }, 100, 100)).toEqual({ x: .5, y: .25 });
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
});
