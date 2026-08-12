
import { contentById, kanjiContent } from "./content.js";
import type { MasteryItem, ReviewRecommendation, Skill } from "./contracts.js";

const skills: Skill[] = ["recognition", "reading", "writing"];

export function recommendReview(items: MasteryItem[]): ReviewRecommendation {
  const candidates = items.flatMap((item) => skills.map((skill) => {
    const recentErrorBonus = item.recentErrorSkill === skill ? 20 : 0;
    const hintBonus = Math.min(item.hintsUsed * 5, 10);
    const unassessedBonus = item.assessed[skill] ? 0 : 5;
    return {
      kanjiId: item.kanjiId,
      skill,
      priority: 100 - item.mastery[skill] + recentErrorBonus + hintBonus + unassessedBonus,
      lastPracticedAt: item.lastPracticedAt ?? "",
      recentErrorBonus,
      hintBonus,
    };
  }));

  candidates.sort((left, right) =>
    right.priority - left.priority ||
    left.lastPracticedAt.localeCompare(right.lastPracticedAt) ||
    kanjiContent.findIndex((item) => item.id === left.kanjiId) - kanjiContent.findIndex((item) => item.id === right.kanjiId)
  );

  const winner = candidates[0] ?? {
    kanjiId: kanjiContent[0].id,
    skill: "recognition" as Skill,
    priority: 105,
    recentErrorBonus: 0,
    hintBonus: 0,
  };
  const character = contentById.get(winner.kanjiId)?.character ?? winner.kanjiId;
  const reason = winner.recentErrorBonus
    ? `Review ${character} ${winner.skill} because a recent error made this the weakest skill.`
    : winner.hintBonus
      ? `Review ${character} ${winner.skill} because hints were needed recently.`
      : `Review ${character} ${winner.skill} because it has the lowest current mastery.`;

  return { kanjiId: winner.kanjiId, skill: winner.skill, priority: winner.priority, reason };
}
