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
  await expect(page.locator('[data-slot="dropdown-menu-trigger"]')).toBeVisible();

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
  await page.locator('[data-slot="dropdown-menu-trigger"]').click();
  await page.getByRole("menuitem", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByText("Write project README")).toBeVisible();
});

test("AI quick add either parses the task or fails gracefully — never crashes", async ({ page }) => {
  const email = `e2e-${Date.now()}-quickadd@example.com`;
  await page.goto("/signup");
  await page.fill("#email", email);
  await page.fill("#password", "password123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/tasks$/);

  await page.getByPlaceholder(/Call the dentist/).fill("Call the dentist tomorrow, high priority");
  await page.getByRole("button", { name: "Parse it" }).click();

  // Whether an AI provider key is configured in this environment or not, the
  // UI must land in one of two known-good states — a pre-filled confirm
  // dialog (key present, parse succeeded) or a readable error toast (no key,
  // or the call failed) — and never an unhandled crash.
  await expect(
    page.getByText(/AI quick add is not configured|Couldn't parse|Confirm AI-parsed task/),
  ).toBeVisible({ timeout: 20_000 });
});
