# Kaku: Major League Hackathon MVP

## Product Pitch

Kaku is a calm Japanese literacy trainer that turns "I recognize it" into "I can read and write it." The MVP demonstrates Kaku's core learning loop with a focused N5 kanji set:

**Recognize -> Read in context -> Write from memory -> Review the weakest skill.**

The experience should feel like beautifully designed Japanese stationery: warm paper, charcoal ink, restrained vermilion feedback, generous whitespace, and one clear task at a time.

## Hackathon Goal

Ship a polished, judge-ready web experience that proves the differentiator: mastery is tracked separately for recognition, reading, and writing. A learner completes a short study session and immediately sees why their next review is recommended.

## In Scope

### Content

- A curated set of 12-20 JLPT N5 kanji, starting with high-recognition characters such as 山, 川, 日, 月, 人, 木, 水, 火, 学, 校, 先, 生.
- For each kanji: meaning, one primary reading, one vocabulary example, JLPT label, and reference stroke data.
- No account creation required. Save progress locally in the browser.

### Four Essential Screens

1. **Study Threshold (home)**: resume session; choose Learn, Read, Write, or Review; view the three mastery dimensions.
2. **Recognition / Learn**: large kanji-or-meaning prompt, multiple-choice answer, immediate feedback, and recognition-mastery updates.
3. **Read in Context**: vocabulary word, meaning, and reading prompt; update reading mastery for that kanji.
4. **Practice Paper / Write**: squared drawing canvas with Clear, Hint, and Check; validate stroke count, start region, and dominant direction; update writing mastery.

### Review Logic

- Pick the due item with the lowest skill score, with a mild boost for recent errors.
- Label the reason visibly: `Needs review: Writing`, `Needs review: Reading`, or `Needs review: Recognition`.
- Use a transparent local rule rather than a full spaced-repetition algorithm:

```text
priority = (100 - weakest_skill_score) + recent_error_bonus
```

### Progress

- Store `recognition`, `reading`, and `writing` scores per kanji in `localStorage`.
- Show a compact Path panel for the available N5 set, plus the recommended next study action.

## Explicitly Out of Scope

- Login, cloud sync, social features, payments, or user-generated lists.
- Full JLPT N5-N1 catalog, complete dictionary, global search, or vocabulary graph exploration.
- Full stroke-order fidelity for every character, AI handwriting recognition, camera input, production audio, notifications, analytics, or native mobile apps.
- Complex adaptive scheduling beyond the transparent local review rule.

## Suggested Build Shape

- **Frontend:** React + TypeScript + Vite (or Next.js if the team already uses it).
- **Styling:** CSS variables or Tailwind using Ivory `#FFF9F2`, Paper `#F7F1E8`, Ink `#2F2B28`, Vermilion `#E9572E`, Aqua `#9CCDD3`, Sky `#DDF4FA`, and Sakura `#F2C8CF`.
- **Data:** checked-in TypeScript/JSON fixtures for the N5 subset plus browser local storage.
- **Drawing:** Pointer Events on a canvas; preserve strokes as ordered, normalized point arrays.

## Demo Script (2-3 Minutes)

1. Open Study Threshold and explain the three separate mastery dimensions.
2. Complete a recognition prompt incorrectly to create a weakness.
3. Complete a reading prompt using vocabulary context.
4. Draw a kanji on Practice Paper, use a hint, and show deterministic stroke feedback.
5. Open Review and show the explicit reason for the next item.
6. End on the Path/progress panel to show differentiated mastery.

## Acceptance Checklist

- A first-time visitor can complete the full loop without setup.
- Every answer updates one of the three skill scores.
- Review selects and explains a weak skill.
- The writing canvas supports separate strokes, clear, hint, check, and retry.
- The visual system remains calm and legible on desktop and mobile widths.

## Build Order

1. Create the content fixture and three-score progress model.
2. Implement home, recognition, and reading flows.
3. Add the drawing canvas and deterministic stroke validation.
4. Add review selection, rationale, and compact Path view.
5. Polish the visual system and rehearse the demo.
