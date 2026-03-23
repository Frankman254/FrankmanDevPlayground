import { expect, test } from "@playwright/test";

test("home page shows the playground branding", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Un solo lugar para juegos, aplicaciones utiles y experimentos.",
    }),
  ).toBeVisible();
});
