import { expect, test } from "./fixtures";

test("loads the prerendered homepage", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("New React Router App");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByText("What's next?")).toBeVisible();
});

test("returns 404 for an unknown static path", async ({ request }) => {
  const response = await request.get("/definitely-not-prerendered");

  expect(response.status()).toBe(404);
});
