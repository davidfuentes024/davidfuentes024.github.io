/*
 * Site-wide content and settings. Edit values here; components only read them.
 * Fields marked TODO are placeholders to replace with real values.
 */
export const site = {
  name: "David Fuentes",
  title: "David Fuentes",
  description: "Systems Engineer.",
  url: "https://davidfuentes024.github.io",
  lang: "en",
  dateLocale: "en-US",
  postsPerFeed: 20,
  wordsPerMinute: 200,
  themeStorageKey: "theme",
};

// Turn sections on or off here. A disabled section has no menu entry and no page.
export const features = {
  work: true,
};

export const nav = [
  { label: "About", href: "/" },
  { label: "Writing", href: "/writing/" },
  { label: "Work", href: "/work/", feature: "work" as const },
];

// Entries with an empty `handle` are hidden everywhere.
export const socials = [
  {
    id: "github",
    label: "GitHub",
    handle: "davidfuentes024",
    href: "https://github.com/davidfuentes024",
  },
  {
    id: "x",
    label: "X",
    handle: "_fuentesdavid",
    href: "https://x.com/_fuentesdavid",
  },
  {
    id: "email",
    label: "Email",
    handle: "juandav1122@hotmail.com",
    href: "mailto:juandav1122@hotmail.com",
  },
];

export const about = {
  // File name inside src/assets. Replace it with your own photo.
  imageFile: "about.jpeg",
  imageAlt: "A cat dressed as a wizard",
};

export const emptyWriting = "Nothing published yet.";
