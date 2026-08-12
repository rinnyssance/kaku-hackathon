
import { describe, expect, it } from "vitest";
import { createInitialMastery, updateMastery } from "./mastery";

describe("mastery updates", () => {
  it("rewards a first-attempt answer more than a hinted answer", () => {
    const initial = createInitialMastery();
    const direct = updateMastery(initial, "yama", "recognition", { correct: true, retries: 0, hintsUsed: 0 });
    const hinted = updateMastery(initial, "yama", "recognition", { correct: true, retries: 0, hintsUsed: 1 });
    expect(direct[0].mastery.recognition).toBeGreaterThan(hinted[0].mastery.recognition);
  });

  it("records the skill responsible for an error", () => {
    const updated = updateMastery(createInitialMastery(), "yama", "writing", { correct: false, retries: 0, hintsUsed: 0 });
    expect(updated[0].recentErrorSkill).toBe("writing");
    expect(updated[0].assessed.writing).toBe(true);
  });
});
