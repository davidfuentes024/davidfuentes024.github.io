# Blog

Personal site and blog built with [Astro](https://astro.build), deployed to GitHub Pages.

## Commands

| Command             | Action                                                                  |
| ------------------- | ----------------------------------------------------------------------- |
| `npm install`       | Install dependencies                                                    |
| `npm run dev`       | Start the dev server with the default theme                             |
| `npm run build`     | Build to `dist/`                             |
| `npm run preview`   | Serve the production build                                              |
| `npm run new:post -- "Title"` | Create a draft post in `src/content/posts/` |

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
- `src/styles/tokens.css`: colors (burgundy, light and dark), type, space, layout and shape.

## Deployment

In the repository settings, set Pages > Source to **GitHub Actions**. The repository must be named `<user>.github.io`.
