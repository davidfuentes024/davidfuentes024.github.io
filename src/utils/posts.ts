import { getCollection, type CollectionEntry } from "astro:content";
import { site } from "../site.config";

export type Post = CollectionEntry<"posts"> | CollectionEntry<"fixtures">;

export type MonthGroup = { month: number; label: string; posts: Post[] };
export type YearGroup = { year: number; months: MonthGroup[] };

export async function getPosts(): Promise<Post[]> {
  // The test build reads fixture posts so the post template is covered without real posts.
  const collection = process.env.FIXTURE_POSTS ? "fixtures" : "posts";
  const posts: Post[] = await getCollection(collection, ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

// Dates are stored as UTC midnight, so format in UTC to avoid off-by-one days.
const format = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(site.dateLocale, { timeZone: "UTC", ...options });

const monthLabel = format({ month: "long" });
const shortDate = format({ month: "short", day: "numeric" });
const longDate = format({ year: "numeric", month: "long", day: "numeric" });

export const formatShortDate = (date: Date) => shortDate.format(date);
export const formatLongDate = (date: Date) => longDate.format(date);

export function groupByYearAndMonth(posts: Post[]): YearGroup[] {
  const years: YearGroup[] = [];
  for (const post of posts) {
    const year = post.data.date.getUTCFullYear();
    const month = post.data.date.getUTCMonth();
    let yearGroup = years.find((group) => group.year === year);
    if (!yearGroup) {
      yearGroup = { year, months: [] };
      years.push(yearGroup);
    }
    let monthGroup = yearGroup.months.find((group) => group.month === month);
    if (!monthGroup) {
      monthGroup = { month, label: monthLabel.format(post.data.date), posts: [] };
      yearGroup.months.push(monthGroup);
    }
    monthGroup.posts.push(post);
  }
  return years;
}

export function readingTime(body: string | undefined): number {
  const words = (body ?? "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / site.wordsPerMinute));
}
