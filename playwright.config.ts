import { defineConfig, devices } from "@playwright/test";

const APP_PORT = Number(process.env.TEST_APP_PORT || 3177);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${APP_PORT}`,
    trace: "off",
  },
  projects: [
    {
      name: "chromium",
      // Installed Chrome: Playwright's Chromium download is geo-blocked in some regions.
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: {
    command: "node tests/fixtures/start-test-app.mjs",
    url: `http://127.0.0.1:${APP_PORT}/posts`,
    timeout: 180_000,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
  },
});
