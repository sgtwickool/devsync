import { defineConfig, devices } from "@playwright/test"

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/e2e",
  /* Test timeout - increased for slower database operations */
  timeout: 60000,
  expect: {
    /* Expect timeout - increased for slower page loads */
    timeout: 15000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use */
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test */
    trace: "on-first-retry",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    /* Authentication setup - runs first to create session */
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    /* Authenticated browser tests - depend on setup */
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "tests/e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },

    // Webkit/Safari disabled - can be re-added when dependencies are installed
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"], storageState: "tests/e2e/.auth/user.json" },
    //   dependencies: ["setup"],
    // },

    /* Test against mobile viewports */
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        storageState: "tests/e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },

    // Webkit/Safari disabled - can be re-added when dependencies are installed
    // {
    //   name: "Mobile Safari",
    //   use: { ...devices["iPhone 12"], storageState: "tests/e2e/.auth/user.json" },
    //   dependencies: ["setup"],
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
