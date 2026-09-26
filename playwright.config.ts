import { defineConfig, devices } from '@playwright/test';

/**
 * L12: automated small-screen + accessibility check.
 *
 * Serves the production build (vite build && vite preview) on a dedicated
 * port so it never collides with another lane's dev/preview server.
 * This suite is deliberately NOT part of `npm run check` (Netlify's build
 * command) — it has its own `npm run e2e`.
 */
const PORT = 4912;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4912 --strictPort',
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
