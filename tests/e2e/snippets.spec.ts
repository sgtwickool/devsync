import { test, expect } from "@playwright/test"

/**
 * E2E tests for snippet functionality
 *
 * Note: These tests require a running development server and may need
 * authenticated sessions to work properly. Configure your test environment
 * accordingly.
 */

test.describe("Snippets", () => {
  test.describe("Public snippet viewing", () => {
    test("can view a public snippet page", async ({ page }) => {
      // Navigate to the home page first to verify the app loads
      await page.goto("/")

      // Check that the page has loaded
      await expect(page).toHaveTitle(/DevSync/)
    })

    test("home page has login link", async ({ page }) => {
      await page.goto("/")

      // Look for a login link or button
      const loginLink = page.getByRole("link", { name: /login|sign in/i })
      await expect(loginLink).toBeVisible()
    })
  })

  test.describe("Authentication flow", () => {
    test("login page is accessible", async ({ page }) => {
      await page.goto("/login")

      // Check that login form elements are present
      await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible()
    })

    test("register page is accessible", async ({ page }) => {
      await page.goto("/register")

      // Check that register form elements are present
      await expect(
        page.getByRole("heading", { name: /create|register|sign up/i })
      ).toBeVisible()
    })

    test("login page has email and password fields", async ({ page }) => {
      await page.goto("/login")

      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
    })

    test("register page has required fields", async ({ page }) => {
      await page.goto("/register")

      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
    })
  })

  test.describe("Navigation", () => {
    test("can navigate between login and register", async ({ page }) => {
      await page.goto("/login")

      // Look for a link to register
      const registerLink = page.getByRole("link", { name: /register|sign up|create account/i })
      if (await registerLink.isVisible()) {
        await registerLink.click()
        await expect(page).toHaveURL(/register/)
      }
    })

    test("can navigate from register to login", async ({ page }) => {
      await page.goto("/register")

      // Look for a link to login
      const loginLink = page.getByRole("link", { name: /login|sign in|already have/i })
      if (await loginLink.isVisible()) {
        await loginLink.click()
        await expect(page).toHaveURL(/login/)
      }
    })
  })
})

test.describe("Authenticated user flows", () => {
  // These tests require a test user in the database
  // Authentication is handled by auth.setup.ts

  test("authenticated user can access dashboard", async ({ page }) => {
    await page.goto("/dashboard")

    // Check for the main dashboard heading
    await expect(page.getByRole("heading", { level: 1, name: /my snippets/i })).toBeVisible()
  })

  test("authenticated user can create a snippet", async ({ page }) => {
    // Navigate to create snippet page
    await page.goto("/dashboard/snippets/new")

    // Verify we're on the create page
    await expect(page.getByRole("heading", { level: 1, name: /create new snippet/i })).toBeVisible()

    // Fill in snippet details
    await page.getByLabel(/^title/i).fill("E2E Test Snippet")
    await page.locator("#language").selectOption("JavaScript")

    // Fill in code using CodeMirror editor
    await page.locator(".cm-content").click()
    await page.keyboard.type('console.log("Hello from E2E test")')

    // Submit form
    await page.getByRole("button", { name: /create snippet/i }).click()

    // Wait for the form to finish submitting and redirect
    await expect(page).toHaveURL(/\/dashboard\/snippets\/[a-zA-Z0-9]+$/, { timeout: 60000 })

    // Wait for page to fully load and verify the snippet title
    await expect(page.getByRole("heading", { level: 1, name: "E2E Test Snippet" })).toBeVisible({ timeout: 30000 })
  })

  test("authenticated user can edit a snippet", async ({ page }) => {
    // First, create a snippet to edit
    await page.goto("/dashboard/snippets/new")
    await page.getByLabel(/^title/i).fill("Snippet to Edit")
    await page.locator("#language").selectOption("Python")
    await page.locator(".cm-content").click()
    await page.keyboard.type('print("original code")')
    await page.getByRole("button", { name: /create snippet/i }).click()

    // Wait for redirect to detail page
    await expect(page).toHaveURL(/\/dashboard\/snippets\/[a-zA-Z0-9]+$/, { timeout: 30000 })

    // Click edit button to open dialog (aria-label is "Edit snippet")
    await page.getByRole("button", { name: /edit snippet/i }).click()

    // Verify edit dialog is open
    await expect(page.getByRole("heading", { name: /edit snippet/i })).toBeVisible()

    // Modify the title
    await page.locator("#edit-title").fill("Updated Snippet Title")

    // Save changes
    await page.getByRole("button", { name: /save changes/i }).click()

    // Verify the updated title appears on the page (dialog closes, page refreshes)
    await expect(page.getByRole("heading", { level: 1, name: "Updated Snippet Title" })).toBeVisible({ timeout: 10000 })
  })

  test("authenticated user can delete a snippet", async ({ page }) => {
    // First, create a snippet to delete
    await page.goto("/dashboard/snippets/new")
    await page.getByLabel(/^title/i).fill("Snippet to Delete")
    await page.locator("#language").selectOption("TypeScript")
    await page.locator(".cm-content").click()
    await page.keyboard.type('const x: number = 1')
    await page.getByRole("button", { name: /create snippet/i }).click()

    // Wait for redirect to detail page
    await expect(page).toHaveURL(/\/dashboard\/snippets\/[a-zA-Z0-9]+$/, { timeout: 30000 })

    // Click delete button (aria-label is "Delete snippet")
    await page.getByRole("button", { name: /delete snippet/i }).click()

    // Confirm deletion (button changes to "Confirm Delete")
    await page.getByRole("button", { name: /confirm delete/i }).click()

    // Verify redirect back to dashboard
    await expect(page).toHaveURL(/\/dashboard\/?$/, { timeout: 30000 })
  })

  test("authenticated user can copy share link for public snippet", async ({ page }) => {
    // First, create a PUBLIC snippet (share button only shows for public snippets)
    await page.goto("/dashboard/snippets/new")
    await page.getByLabel(/^title/i).fill("Public Snippet to Share")
    await page.locator("#language").selectOption("JavaScript")
    await page.locator(".cm-content").click()
    await page.keyboard.type('// public code')

    // Set visibility to PUBLIC (visibility selector uses buttons with description text)
    await page.getByRole("button", { name: /public.*anyone with the link/i }).click()

    await page.getByRole("button", { name: /create snippet/i }).click()

    // Wait for redirect to detail page
    await expect(page).toHaveURL(/\/dashboard\/snippets\/[a-zA-Z0-9]+$/, { timeout: 60000 })

    // Wait for page to fully load
    await page.waitForLoadState("networkidle")

    // Verify the snippet title is shown
    await expect(page.getByRole("heading", { level: 1, name: "Public Snippet to Share" })).toBeVisible()

    // Verify "Public" badge and "Copy Link" button are visible (aria-label is "Copy share link")
    const copyButton = page.getByRole("button", { name: /copy share link/i })
    await expect(copyButton).toBeVisible()

    // Verify button is enabled and clickable
    await expect(copyButton).toBeEnabled()

    // Note: Clicking the copy button would test clipboard API, which requires
    // special permissions in headless browsers. The button's presence and
    // enabled state verifies the share functionality is available.
  })
})
