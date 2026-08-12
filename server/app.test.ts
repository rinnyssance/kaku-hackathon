
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createInitialMastery } from "../src/lib/mastery";
import { createApp } from "./app";

describe("Kaku API", () => {
  it("reports health", async () => {
    const response = await request(createApp()).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.service).toBe("kaku-review-engine");
  });

  it("returns all 12 content records", async () => {
    const response = await request(createApp()).get("/api/v1/kanji");
    expect(response.body.items).toHaveLength(12);
  });

  it("rejects invalid mastery scores", async () => {
    const mastery = createInitialMastery();
    mastery[0].mastery.writing = 101;
    const response = await request(createApp()).post("/api/v1/review/recommendation").send({ items: mastery });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("invalid_request");
  });
});
