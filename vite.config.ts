import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4721,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 4722,
    strictPort: true,
    host: true,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  test: {
    // Engine tests run in node; UI test files opt into jsdom with
    // `// @vitest-environment jsdom` at the top of the file.
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
  },
});
