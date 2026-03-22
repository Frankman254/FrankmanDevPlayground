import { expect, test } from "@playwright/test";

test("home page shows the playground branding", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "A single home for games, useful apps and experiments.",
    }),
  ).toBeVisible();
});
