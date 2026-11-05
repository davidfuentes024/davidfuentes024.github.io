import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { themes } from "../src/site.config";

// The build under test uses fixture posts (see npm test).
const pages = ["/", "/writing/", "/writing/hello-world/", "/writing/writing-in-markdown/", "/work/", "/work/diesel-universal/", "/404.html"];
const modes = ["light", "dark"] as const;
const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

// Every theme and mode is checked in the browser with real computed colors.
for (const palette of themes) {
  for (const mode of modes) {
    for (const path of pages) {
      test(`${path} has no axe violations (${palette}, ${mode})`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: mode });
        await page.goto(path, { waitUntil: "networkidle" });
        await page.evaluate((name) => {
          document.documentElement.dataset.palette = name;
        }, palette);
        const results = await new AxeBuilder({ page }).withTags(tags).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
}

test("theme follows the system and the toggle overrides it", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: /switch to light theme/i }).click();
  await expect(html).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "light");
});

test("posts are grouped by year and month", async ({ page }) => {
  await page.goto("/writing/");
  const headings = await page.locator("main h2, main h3").allTextContents();
  expect(headings).toEqual(["2026", "October"]);
});

test("links to the other pages and the contact details are on every page", async ({ page }) => {
  for (const path of pages.slice(0, 6)) {
    await page.goto(path);
    await expect(page.locator("aside").getByRole("link", { name: "About" })).toBeVisible();
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "GitHub" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Email" })).toBeVisible();
  }
});

test("navigating between pages does not reload the document and keeps the theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.getByRole("button", { name: /switch to light theme/i }).click();
  await page.evaluate(() => {
    (window as unknown as { marker: number }).marker = 1;
  });
  await page.locator("aside").getByRole("link", { name: "Work" }).click();
  await expect(page).toHaveURL(/\/work\/$/);
  await page.getByRole("link", { name: "Diesel Universal" }).click();
  await expect(page).toHaveURL(/\/work\/diesel-universal\/$/);
  expect(await page.evaluate(() => (window as unknown as { marker?: number }).marker)).toBe(1);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  // The toggle still works on the new page.
  await page.getByRole("button", { name: /switch to dark theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("About comes first in the menu and the current section shows a dot", async ({ page }) => {
  await page.goto("/work/");
  const links = page.locator("aside nav a");
  await expect(links).toHaveText(["About", "Writing", "Work"]);
  await expect(page.locator("aside nav a[aria-current='page']")).toHaveText("Work");
  await expect(page.locator("aside nav a[aria-current='page'] .dot")).toBeVisible();
  await expect(page.locator("aside nav a .dot")).toHaveCount(1);
});

test("the footer has only icons and the copyright, beside the content and not under the menu", async ({ page }) => {
  await page.goto("/work/");
  const footer = page.locator("footer");
  await expect(footer).toContainText(/© \d{4} David Fuentes/);
  await expect(footer.getByText("juandav1122")).toHaveCount(0);
  const [footerBox, mainBox, sidebarBox] = await Promise.all([
    footer.boundingBox(),
    page.locator("main").boundingBox(),
    page.locator("aside").boundingBox(),
  ]);
  expect(footerBox!.x).toBeGreaterThanOrEqual(mainBox!.x - 1);
  expect(footerBox!.x).toBeGreaterThan(sidebarBox!.x + sidebarBox!.width);
});

test("the footer keeps a fixed distance from the bottom of the page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const distances: number[] = [];
  // A short page and a long one must give the same distance.
  for (const path of ["/work/", "/writing/writing-in-markdown/"]) {
    await page.goto(path);
    distances.push(
      await page.evaluate(() => {
        const bottom = document.querySelector("footer")!.getBoundingClientRect().bottom + window.scrollY;
        return Math.round(document.documentElement.scrollHeight - bottom);
      }),
    );
  }
  expect(distances[0]).toBe(distances[1]);
  expect(distances[0]).toBe(32);
});

test("on a short page the footer rests at the bottom of the window", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/work/");
  const bottom = await page.evaluate(() => Math.round(window.innerHeight - document.querySelector("footer")!.getBoundingClientRect().bottom));
  expect(bottom).toBe(32);
});

test("the Work page lists every entry", async ({ page }) => {
  await page.goto("/work/");
  const links = page.locator("main ul a");
  await expect(links).toHaveText(["Diesel Universal", "Library self-checkout, UPB", "qs-music"]);
});

test("the dot sits before the selected word, and only that item has the accent", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/work/");
  const current = page.locator("aside nav a[aria-current='page']");
  const [dot, word] = await Promise.all([current.locator(".dot").boundingBox(), current.locator("span:not(.dot)").boundingBox()]);
  expect(dot!.x + dot!.width).toBeLessThanOrEqual(word!.x);
  // The dot hangs in the margin: the selected word lines up with the others.
  const firstWord = await page.locator("aside nav a span:not(.dot)").first().boundingBox();
  expect(Math.abs(word!.x - firstWord!.x)).toBeLessThanOrEqual(1);
  const colors = await page.locator("aside nav a").evaluateAll((links) => links.map((link) => getComputedStyle(link).color));
  expect(new Set(colors).size).toBe(2);
  expect(colors[2]).not.toBe(colors[0]);
  expect(colors[0]).toBe(colors[1]);
});
