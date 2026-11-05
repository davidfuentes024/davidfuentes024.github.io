import { defineCollection, type SchemaContext } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// The same shape for real posts and for the fixtures used by the tests.
const postSchema = ({ image }: SchemaContext) =>
  z
    .object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      draft: z.boolean().default(false),
      image: image().optional(),
      // Required with `image`; use "" only for purely decorative images.
      imageAlt: z.string().optional(),
    })
    .refine((post) => !post.image || post.imageAlt !== undefined, {
      message: "imageAlt is required when image is set",
      path: ["imageAlt"],
    });

// One folder per post: <base>/<slug>/index.mdx
const postLoader = (base: string) =>
  glob({
    pattern: "*/index.mdx",
    base,
    generateId: ({ entry }) => entry.split("/")[0],
  });

const posts = defineCollection({
  loader: postLoader("./src/content/posts"),
  schema: postSchema,
});

// Sample posts that only the tests read (npm test sets FIXTURE_POSTS). They live in
// their own collection so this config never changes between dev, build and test.
const fixtures = defineCollection({
  loader: postLoader("./tests/fixtures/posts"),
  schema: postSchema,
});

const work = defineCollection({
  // One folder per entry: src/content/work/<slug>/index.mdx
  loader: glob({
    pattern: "*/index.mdx",
    base: "./src/content/work",
    generateId: ({ entry }) => entry.split("/")[0],
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Link to the live site or the code, when there is one.
    href: z.url().optional(),
    // Lower numbers come first.
    order: z.number(),
  }),
});

// The About page text: src/content/about/index.mdx
const about = defineCollection({
  loader: glob({ pattern: "index.mdx", base: "./src/content/about" }),
  schema: z.object({}),
});

export const collections = { posts, fixtures, work, about };
