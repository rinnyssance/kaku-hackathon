
export type Skill = "recognition" | "reading" | "writing";

export interface SkillMastery {
  recognition: number;
  reading: number;
  writing: number;
}

export interface MasteryItem {
  kanjiId: string;
  mastery: SkillMastery;
  assessed: Record<Skill, boolean>;
  recentErrorSkill?: Skill;
  hintsUsed: number;
  lastPracticedAt?: string;
}

export interface ReviewRequest { items: MasteryItem[]; }

export interface ReviewRecommendation {
  kanjiId: string;
  skill: Skill;
  priority: number;
  reason: string;
  source?: "render" | "local";
}

export interface StrokePoint { x: number; y: number; }
export type Stroke = StrokePoint[];

export interface ReferenceStroke {
  points: StrokePoint[];
  direction: "horizontal" | "vertical" | "diagonal-down" | "diagonal-up";
}

export interface KanjiContent {
  id: string;
  character: string;
  meaning: string;
  reading: string;
  vocabulary: { word: string; reading: string; meaning: string };
  distractorMeanings: string[];
  distractorReadings: string[];
  strokeCount: number;
  referenceStrokes?: ReferenceStroke[];
}
