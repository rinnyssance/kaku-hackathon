
import { kanjiContent } from "../../shared/content";
import type { MasteryItem, Skill } from "../../shared/contracts";

export const STORAGE_KEY = "kaku-mastery-v1";

export function createInitialMastery(): MasteryItem[] {
  return kanjiContent.map((item) => ({
    kanjiId: item.id,
    mastery: { recognition: 50, reading: 50, writing: 50 },
    assessed: { recognition: false, reading: false, writing: false },
    hintsUsed: 0,
  }));
}

export function updateMastery(
  items: MasteryItem[],
  kanjiId: string,
  skill: Skill,
  result: { correct: boolean; retries: number; hintsUsed: number },
): MasteryItem[] {
  return items.map((item) => {
    if (item.kanjiId !== kanjiId) return item;
    const gain = result.hintsUsed > 0 ? 4 : result.retries > 0 ? 8 : 16;
    const nextValue = result.correct
      ? Math.min(100, item.mastery[skill] + gain)
      : Math.max(0, item.mastery[skill] - 12);
    return {
      ...item,
      mastery: { ...item.mastery, [skill]: nextValue },
      assessed: { ...item.assessed, [skill]: true },
      recentErrorSkill: result.correct ? undefined : skill,
      hintsUsed: result.hintsUsed,
      lastPracticedAt: new Date().toISOString(),
    };
  });
}

export function readMastery(): MasteryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createInitialMastery();
    const parsed = JSON.parse(stored) as MasteryItem[];
    return parsed.length === kanjiContent.length ? parsed : createInitialMastery();
  } catch {
    return createInitialMastery();
  }
}
