# Blog

Personal site and blog built with [Astro](https://astro.build), deployed to GitHub Pages.

## Commands

| Command             | Action                                                                  |
| ------------------- | ----------------------------------------------------------------------- |
| `npm install`       | Install dependencies                                                    |
| `npm run dev`       | Start the dev server with the default theme                             |
| `npm run dev:<theme>` | Dev server with one theme: `burgundy`, `dragon`, `graphite`, `neon`, `nord`, `onedark`, `paper` |
| `npm run dev:all`   | One dev server per theme, on ports 4331 to 4336                         |
| `npm run build`     | Check color contrast, then build to `dist/`                             |
| `npm run preview`   | Serve the production build                                              |
| `npm run new:post -- "Title"` | Create a draft post in `src/content/posts/` |
| `npm test`          | Build with fixture posts and run the axe tests on every theme and mode  |

In development a small selector in the sidebar switches the palette live. It does not exist in production builds.

## Writing a post

Run `npm run new:post -- "My post"` (or create `src/content/posts/<slug>/index.mdx` by hand) and put its images in the same folder. New posts start with `draft: true`; set it to `false` to publish.

```mdx
---
title: My post
description: One sentence summary.
date: 2026-10-28
draft: false # optional
image: ./cover.png # optional header image
imageAlt: Describes the image # required with image
---
```

The post is served at `/writing/<slug>/`. Commit and push to `main` and the workflow in `.github/workflows/deploy.yml` publishes it.

## Customizing

- `src/site.config.ts`: name, description, navigation, social links, About text and which sections are on.
- `src/content/work/<slug>/index.mdx`: one MDX page per Work entry (status, visibility, link and `order` in the frontmatter). The Work list links to these pages.
- `src/styles/tokens.css`: type, space, layout and shape.
- `src/styles/themes/<name>.css`: the colors of each theme, in light and dark.

## Choosing a theme

Set the default in `src/site.config.ts` (`activeTheme` falls back to `burgundy`) or build with `SITE_THEME=<name>`. To keep only one theme, delete the other files in `src/styles/themes/` and their lines in `index.css` and `themes` in `site.config.ts`.

`npm run build` checks the contrast of every theme in both modes and fails if the active theme drops below its minimum: 10:1 for body text, 12:1 for headings, 7:1 for muted text, 5:1 for links, 4.5:1 for code, and 3:1 for borders and focus.

## Deployment

In the repository settings, set Pages > Source to **GitHub Actions**. The repository must be named `<user>.github.io`.
