// Creates src/content/posts/<slug>/index.mdx from a title: npm run new:post -- "My post"
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('Usage: npm run new:post -- "Post title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
if (!slug) {
  console.error("The title must contain letters or numbers.");
  process.exit(1);
}

const dir = `src/content/posts/${slug}`;
const file = `${dir}/index.mdx`;
if (existsSync(file)) {
  console.error(`${file} already exists.`);
  process.exit(1);
}

mkdirSync(dir, { recursive: true });
const date = new Date().toISOString().slice(0, 10);
writeFileSync(
  file,
  `---\ntitle: ${JSON.stringify(title)}\ndescription: One sentence summary.\ndate: ${date}\ndraft: true\n---\n\nWrite your post here.\n`,
);
console.log(`Created ${file} (draft: true). Set draft: false to publish.`);
