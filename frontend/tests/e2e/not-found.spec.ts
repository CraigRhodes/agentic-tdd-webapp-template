import { expect, test } from "@playwright/test";

test("an unknown URL shows the not-found screen with a way back home", async ({
  page,
}) => {
  await page.goto("/reports/2024-annual");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(
    page.getByRole("heading", { name: "Hello, World" }),
  ).toBeVisible();
});
