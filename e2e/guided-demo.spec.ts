
import { expect, test } from "@playwright/test";

test("guided demo reaches the adaptive review story", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Knowing a kanji/ })).toBeVisible();
  await page.getByRole("button", { name: /Start guided session/ }).click();
  await page.getByRole("button", { name: "mountain" }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByText("Reading in context")).toBeVisible();
  await page.getByRole("button", { name: "かわぐち" }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByText("Practice Paper")).toBeVisible();
});
