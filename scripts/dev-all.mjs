// Starts one dev server per theme so they can be compared side by side.
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const themes = ["burgundy", "dragon", "graphite", "neon", "nord", "onedark", "paper"];
// Away from Astro's default 4321 so it does not clash with a regular `npm run dev`.
const basePort = 4331;
// The servers share one .astro/ content cache, so starting them together races on it.
const staggerMs = 4000;

const children = [];

const stop = () => {
  children.forEach((child) => child.kill());
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

for (const [index, theme] of themes.entries()) {
  const port = basePort + index;
  children.push(
    spawn("npx", ["astro", "dev", "--ignore-lock", "--port", String(port)], {
      env: { ...process.env, SITE_THEME: theme },
      stdio: ["ignore", "ignore", "inherit"],
    }),
  );
  console.log(`${theme.padEnd(9)} http://localhost:${port}`);
  await sleep(staggerMs);
}
