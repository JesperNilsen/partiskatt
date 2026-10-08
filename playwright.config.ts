import { createServer } from 'node:net';
import { defineConfig, devices } from '@playwright/test';

/**
 * L12: automated small-screen + accessibility check.
 *
 * Serves the production build (vite build && vite preview) on a free port the
 * OS hands out, so it never collides with another lane's dev/preview server.
 * This suite is deliberately NOT part of `npm run check` (Netlify's build
 * command) — it has its own `npm run e2e`.
 */
/**
 * The main process loads this config first and publishes the port in the
 * environment, so the workers it spawns reuse the same one instead of each
 * asking the OS for another. E2E_PORT pins it by hand.
 */
async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as { port: number };
      server.close(() => resolve(port));
    });
  });
}

const PORT = Number(process.env.E2E_PORT ?? (await freePort()));
process.env.E2E_PORT = String(PORT);

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
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    // A fresh port every run means there is never a server of ours to reuse.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
