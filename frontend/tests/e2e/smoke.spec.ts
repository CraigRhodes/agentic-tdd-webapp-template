import { expect, test } from "@playwright/test";

test("hello page completes the frontend → backend round trip", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Hello, World" }),
  ).toBeVisible();
  await expect(page.getByText("Hello from the backend (ok)")).toBeVisible();
});
