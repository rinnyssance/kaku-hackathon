
import type { MasteryItem, ReviewRecommendation } from "../../shared/contracts";
import { recommendReview } from "../../shared/review";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:10000";

export type EngineStatus = "waking" | "online" | "offline";

export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
  const response = await fetch(`${apiBaseUrl}/health`, { signal });
  return response.ok;
}

export async function fetchRecommendation(items: MasteryItem[]): Promise<ReviewRecommendation> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/review/recommendation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    if (!response.ok) throw new Error("Review engine unavailable");
    return { ...(await response.json() as ReviewRecommendation), source: "render" };
  } catch {
    return { ...recommendReview(items), source: "local" };
  }
}
