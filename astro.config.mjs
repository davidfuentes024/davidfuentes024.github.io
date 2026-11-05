// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { site } from "./src/site.config.ts";

// https://astro.build/config
export default defineConfig({
  site: site.url,
  // Preload links as they scroll into view so navigation feels instant.
  integrations: [mdx()],
  prefetch: { prefetchAll: true, defaultStrategy: "viewport" },
  markdown: {
    // Colors come from the --astro-code-* variables in src/styles/tokens.css.
    shikiConfig: { theme: "css-variables" },
    processor: unified({
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "append",
            properties: { className: ["anchor"], ariaLabel: "Link to this section" },
            content: { type: "text", value: "#" },
          },
        ],
      ],
    }),
  },
});
