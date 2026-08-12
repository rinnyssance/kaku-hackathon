
import type { KanjiContent } from "./contracts.js";

export const kanjiContent: KanjiContent[] = [
  {
    id: "yama", character: "山", meaning: "mountain", reading: "やま",
    vocabulary: { word: "火山", reading: "かざん", meaning: "volcano" },
    distractorMeanings: ["river", "tree", "person"], distractorReadings: ["かわ", "つき", "ひと"], strokeCount: 3,
    referenceStrokes: [
      { direction: "vertical", points: [{ x: .28, y: .22 }, { x: .28, y: .76 }] },
      { direction: "vertical", points: [{ x: .5, y: .12 }, { x: .5, y: .78 }] },
      { direction: "vertical", points: [{ x: .72, y: .28 }, { x: .72, y: .76 }] }
    ]
  },
  {
    id: "kawa", character: "川", meaning: "river", reading: "かわ",
    vocabulary: { word: "川口", reading: "かわぐち", meaning: "river mouth" },
    distractorMeanings: ["mountain", "water", "fire"], distractorReadings: ["やま", "みず", "ひ"], strokeCount: 3,
    referenceStrokes: [
      { direction: "vertical", points: [{ x: .28, y: .18 }, { x: .24, y: .8 }] },
      { direction: "vertical", points: [{ x: .5, y: .16 }, { x: .48, y: .82 }] },
      { direction: "vertical", points: [{ x: .72, y: .12 }, { x: .76, y: .78 }] }
    ]
  },
  {
    id: "hito", character: "人", meaning: "person", reading: "ひと",
    vocabulary: { word: "日本人", reading: "にほんじん", meaning: "Japanese person" },
    distractorMeanings: ["student", "day", "school"], distractorReadings: ["せん", "ひ", "き"], strokeCount: 2,
    referenceStrokes: [
      { direction: "diagonal-down", points: [{ x: .52, y: .18 }, { x: .25, y: .8 }] },
      { direction: "diagonal-down", points: [{ x: .5, y: .3 }, { x: .78, y: .8 }] }
    ]
  },
  { id: "hi", character: "日", meaning: "day / sun", reading: "ひ", vocabulary: { word: "日本", reading: "にほん", meaning: "Japan" }, distractorMeanings: ["month", "fire", "water"], distractorReadings: ["つき", "ひと", "き"], strokeCount: 4 },
  { id: "tsuki", character: "月", meaning: "month / moon", reading: "つき", vocabulary: { word: "月曜日", reading: "げつようび", meaning: "Monday" }, distractorMeanings: ["day", "school", "river"], distractorReadings: ["ひ", "かわ", "みず"], strokeCount: 4 },
  { id: "ki", character: "木", meaning: "tree", reading: "き", vocabulary: { word: "木曜日", reading: "もくようび", meaning: "Thursday" }, distractorMeanings: ["water", "fire", "mountain"], distractorReadings: ["ひ", "やま", "つき"], strokeCount: 4 },
  { id: "mizu", character: "水", meaning: "water", reading: "みず", vocabulary: { word: "水曜日", reading: "すいようび", meaning: "Wednesday" }, distractorMeanings: ["fire", "river", "tree"], distractorReadings: ["ひ", "かわ", "き"], strokeCount: 4 },
  { id: "hi-fire", character: "火", meaning: "fire", reading: "ひ", vocabulary: { word: "火曜日", reading: "かようび", meaning: "Tuesday" }, distractorMeanings: ["water", "person", "moon"], distractorReadings: ["みず", "ひと", "つき"], strokeCount: 4 },
  { id: "gaku", character: "学", meaning: "study", reading: "がく", vocabulary: { word: "学生", reading: "がくせい", meaning: "student" }, distractorMeanings: ["teacher", "school", "ahead"], distractorReadings: ["こう", "せん", "せい"], strokeCount: 8 },
  { id: "kou", character: "校", meaning: "school", reading: "こう", vocabulary: { word: "学校", reading: "がっこう", meaning: "school" }, distractorMeanings: ["study", "teacher", "tree"], distractorReadings: ["がく", "せい", "き"], strokeCount: 10 },
  { id: "sen", character: "先", meaning: "ahead / previous", reading: "せん", vocabulary: { word: "先生", reading: "せんせい", meaning: "teacher" }, distractorMeanings: ["student", "school", "person"], distractorReadings: ["せい", "こう", "ひと"], strokeCount: 6 },
  { id: "sei", character: "生", meaning: "life / birth", reading: "せい", vocabulary: { word: "学生", reading: "がくせい", meaning: "student" }, distractorMeanings: ["day", "study", "ahead"], distractorReadings: ["がく", "せん", "ひ"], strokeCount: 5 }
];

export const contentById = new Map(kanjiContent.map((item) => [item.id, item]));
