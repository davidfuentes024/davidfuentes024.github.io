import { defineConfig } from "@playwright/test";

// A dedicated port, never reused, so tests always hit the production build and
// not a dev server that happens to be running.
const PORT = 4399;

export default defineConfig({
  testDir: "./tests",
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `npm run preview -- --port ${PORT} --ignore-lock`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
  },
});
