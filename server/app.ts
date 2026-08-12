
import cors from "cors";
import express from "express";
import { z } from "zod";
import { kanjiContent } from "../shared/content.js";
import { recommendReview } from "../shared/review.js";

const skillSchema = z.enum(["recognition", "reading", "writing"]);
const masterySchema = z.object({
  kanjiId: z.string().refine((id) => kanjiContent.some((item) => item.id === id), "Unknown kanji ID"),
  mastery: z.object({ recognition: z.number().min(0).max(100), reading: z.number().min(0).max(100), writing: z.number().min(0).max(100) }),
  assessed: z.object({ recognition: z.boolean(), reading: z.boolean(), writing: z.boolean() }),
  recentErrorSkill: skillSchema.optional(),
  hintsUsed: z.number().int().min(0).max(3),
  lastPracticedAt: z.string().datetime().optional(),
});
const requestSchema = z.object({ items: z.array(masterySchema).min(1).max(kanjiContent.length) });

export function createApp() {
  const app = express();
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin not allowed"));
    },
  }));
  app.use(express.json({ limit: "32kb" }));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", service: "kaku-review-engine", version: "1.0.0" });
  });

  app.get("/api/v1/kanji", (_request, response) => {
    response.json({ items: kanjiContent });
  });

  app.post("/api/v1/review/recommendation", (request, response) => {
    const parsed = requestSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({
        error: "invalid_request",
        message: "The mastery snapshot was invalid.",
        issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      });
      return;
    }
    response.json(recommendReview(parsed.data.items));
  });

  app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    response.status(error.message === "Origin not allowed" ? 403 : 500).json({
      error: error.message === "Origin not allowed" ? "origin_not_allowed" : "server_error",
      message: error.message,
    });
  });

  return app;
}
