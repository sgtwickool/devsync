import { test as setup, expect } from "@playwright/test"

const authFile = "tests/e2e/.auth/user.json"

/**
 * This setup authenticates a test user and saves the session state.
 * Other tests can then reuse this state to skip the login step.
 *
 * Prerequisites:
 * - A test user must exist in the database with these credentials
 * - Run: npm run db:seed (if you have a seed script) or create manually
 */
setup("authenticate", async ({ page }) => {
  // Navigate to login page
  await page.goto("/login")

  // Fill in credentials
  await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || "test@example.com")
  await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || "password123")

  // Submit login form
  await page.getByRole("button", { name: /sign in/i }).click()

  // Wait for successful login - should redirect to dashboard
  await expect(page).toHaveURL(/dashboard/, { timeout: 30000 })

  // Save authentication state
  await page.context().storageState({ path: authFile })
})
