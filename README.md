# Kaku

Kaku is a Japanese literacy trainer built for the Major League Hacking hackathon. It treats recognition, reading, and writing as separate but connected skills, then explains exactly what the learner should review next.

## Live demo

- Frontend: https://kaku-hackathon.vercel.app
- Review API: https://kaku-review-engine.onrender.com
- Health check: https://kaku-review-engine.onrender.com/health

## Why Render matters

The Render-hosted Express service is Kaku's explainable adaptive review engine. It receives an anonymous mastery snapshot, ranks every kanji/skill pair, and returns the next practice recommendation with a learner-facing reason. If the free Render service is waking, the browser runs the same deterministic engine locally so the demo never blocks.

## Architecture

- React + TypeScript + Vite frontend on Vercel.
- Node + Express review API on Render.
- Shared, versioned kanji fixtures and review contracts.
- Browser `localStorage` for private, account-free mastery progress.
- Pointer Events canvas with deterministic validation for 山, 川, and 人.

## Run locally

```bash
npm install
npm run dev:api
npm run dev
```

Copy `.env.example` to `.env.local` when the API is not running at `http://localhost:10000`.

## Checks

```bash
npm test
npm run build
npm run test:e2e
```

## API

- `GET /health`
- `GET /api/v1/kanji`
- `POST /api/v1/review/recommendation`

## Two-minute demo

1. Start the guided session and explain the three independent mastery dimensions.
2. Complete a recognition card and a vocabulary reading card.
3. Draw 山 on the practice paper and show progressive hints or direction feedback.
4. Open adaptive review and point out the recommendation reason and Render status.
5. Finish on The Path to show each kanji as an evolving literacy node.

## Hackathon operations

Render's free web service can sleep after 15 minutes without traffic. Open the `/health` endpoint about two minutes before judging. The UI has a warm-up state and local fallback for resilience.

## Product brief

See [KAKU_HACKATHON_MVP.md](./KAKU_HACKATHON_MVP.md) for the scoped product specification.
