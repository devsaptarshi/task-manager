import { expect, test } from "@playwright/test";

test("signup, create a task, mark it done, log out, log back in", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  const password = "password123";

  // Sign up
  await page.goto("/signup");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByText(email)).toBeVisible();

  // Create a task
  await page.getByRole("button", { name: "New task" }).click();
  await page.fill("#task-title", "Write project README");
  await page.getByRole("button", { name: "Create task" }).click();
  await expect(page.getByText("Write project README")).toBeVisible();

  // Mark it done via the inline status select, scoped to this task's row
  const taskRow = page.getByTestId("task-item").filter({ hasText: "Write project README" });
  await taskRow.getByRole("combobox").click();
  await page.getByRole("option", { name: "Done" }).click();
  await expect(taskRow.getByText("Write project README")).toHaveClass(/line-through/);

  // Log out, then log back in — the task should still be there, scoped to this user
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByText("Write project README")).toBeVisible();
});

test("AI quick add fails gracefully without an API key configured", async ({ page }) => {
  const email = `e2e-${Date.now()}-quickadd@example.com`;
  await page.goto("/signup");
  await page.fill("#email", email);
  await page.fill("#password", "password123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/tasks$/);

  await page.getByPlaceholder(/Call the dentist/).fill("Call the dentist tomorrow, high priority");
  await page.getByRole("button", { name: "AI quick add" }).click();

  // Without ANTHROPIC_API_KEY set, the route returns a clear error instead of crashing.
  await expect(page.getByText(/AI quick add is not configured|Couldn't parse/)).toBeVisible();
});
