
import { describe, expect, it } from "vitest";
import { createInitialMastery } from "../src/lib/mastery";
import { recommendReview } from "./review";

describe("recommendReview", () => {
  it("prioritizes a recent skill-specific error", () => {
    const mastery = createInitialMastery();
    mastery[1].recentErrorSkill = "writing";
    mastery[1].assessed.writing = true;
    const recommendation = recommendReview(mastery);
    expect(recommendation.kanjiId).toBe(mastery[1].kanjiId);
    expect(recommendation.skill).toBe("writing");
    expect(recommendation.reason).toContain("recent error");
  });

  it("uses fixture order as a stable final tie breaker", () => {
    const recommendation = recommendReview(createInitialMastery());
    expect(recommendation.kanjiId).toBe("yama");
    expect(recommendation.skill).toBe("recognition");
  });
});
