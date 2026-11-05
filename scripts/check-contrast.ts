import { readdirSync, readFileSync } from "node:fs";
import { activeTheme } from "../src/site.config";

// Checks every theme in both modes. Only the active theme can fail the build;
// the others are reported so you can compare them while choosing.
const THEMES_DIR = new URL("../src/styles/themes/", import.meta.url);
const TOKENS_FILE = new URL("../src/styles/tokens.css", import.meta.url);

const backgrounds = ["--color-bg", "--color-bg-alt"];
// Minimum contrast ratio per token (text WCAG AA is 4.5, non-text is 3).
const minimums: Record<string, number> = {
  "--color-heading": 12,
  "--color-text": 10,
  "--color-text-muted": 7,
  "--color-accent": 5,
  "--color-code-text": 7,
  "--color-code-comment": 4.5,
  "--color-code-keyword": 4.5,
  "--color-code-string": 4.5,
  "--color-code-function": 4.5,
  "--color-code-constant": 4.5,
  "--color-code-parameter": 4.5,
  "--color-code-punctuation": 4.5,
  "--color-border": 3,
  "--color-focus": 3,
};

type Theme = "light" | "dark";

function declarations(css: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const [, name, value] of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) map.set(name, value.trim());
  return map;
}

const shared = declarations(readFileSync(TOKENS_FILE, "utf8"));

function resolve(tokens: Map<string, string>, name: string, theme: Theme): string {
  const value = tokens.get(name);
  if (!value) throw new Error(`Missing token ${name}`);
  const variable = value.match(/^var\((--[\w-]+)\)$/);
  if (variable) return resolve(tokens, variable[1], theme);
  const pair = value.match(/^light-dark\(\s*(#[0-9a-fA-F]{6})\s*,\s*(#[0-9a-fA-F]{6})\s*\)$/);
  if (pair) return theme === "light" ? pair[1] : pair[2];
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  throw new Error(`Cannot resolve ${name}: ${value}`);
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

let activeFailures = 0;
const summary: string[] = [];

for (const file of readdirSync(THEMES_DIR).filter((name) => name.endsWith(".css") && name !== "index.css")) {
  const name = file.replace(/\.css$/, "");
  const tokens = new Map([...shared, ...declarations(readFileSync(new URL(file, THEMES_DIR), "utf8"))]);
  let failures = 0;
  let lowest = Infinity;
  for (const theme of ["light", "dark"] as Theme[]) {
    for (const [token, min] of Object.entries(minimums)) {
      for (const bg of backgrounds) {
        const ratio = contrast(resolve(tokens, token, theme), resolve(tokens, bg, theme));
        lowest = Math.min(lowest, ratio);
        if (ratio < min) {
          failures++;
          console.log(`FAIL ${name} ${theme} ${token} on ${bg}: ${ratio.toFixed(2)} (min ${min})`);
        }
      }
    }
  }
  if (name === activeTheme) activeFailures = failures;
  summary.push(`${name === activeTheme ? "*" : " "} ${name.padEnd(9)} ${failures === 0 ? "pass" : `${failures} failing`}`);
}

console.log(`\nContrast by theme (* = active, only the active theme can fail the build):\n${summary.join("\n")}`);

if (activeFailures > 0) {
  console.error(`\nThe active theme "${activeTheme}" has ${activeFailures} failing color pair(s).`);
  process.exit(1);
}
