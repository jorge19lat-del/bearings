import "server-only";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";

/*
 * The editorial content lives in /content as plain JSON. It is read at build time
 * only: every page is pre-rendered, so nothing here runs when a reader visits.
 */

export type Ratio = "3x2" | "4x5" | "1x1" | "16x9" | "5x4" | "2x3";

export type Image = {
  src?: string;
  alt?: string;
  ratio?: Ratio;
  layout?: "full" | "bleed" | "wide" | "inset" | "pair" | "lead" | "row" | "index";
  caption?: string;
  tone?: number;
  note?: string;
};

export type StoryBlock =
  | { type: "lead" | "paragraph" | "subhead"; text: string }
  | { type: "break" }
  | { type: "pullquote"; text: string; attribution?: string }
  | ({ type: "figure" } & Image);

export type Moment = {
  place?: string;
  time?: string;
  text?: string;
  quote?: string;
  attribution?: string;
  kind?: "observation" | "quote";
};

export type Motion = {
  provider?: "vimeo" | "youtube";
  id?: string;
  src?: string;
  poster?: string;
  title?: string;
  caption?: string;
  note?: string;
  ratio?: "16x9" | "4x3";
};

export type Section = { type: string; label?: string; id?: string; note?: string } & (
  | { type: "story"; blocks: StoryBlock[] }
  | { type: "moments"; items: Moment[] }
  | { type: "images"; items: Image[] }
  | { type: "field-notes"; items: { date: string; place?: string; lines: string[] }[] }
  | { type: "videos"; items: Motion[] }
  | { type: "films"; items: Motion[] }
  | {
      type: "voice";
      items: { title?: string; src?: string; duration?: string; note?: string; transcript?: string[] }[];
    }
  | { type: "interview"; preamble?: string; exchanges: { q: string; a: string | string[] }[] }
);

export type Entry = {
  slug: string;
  series: string;
  number: string;
  title: string;
  location: string;
  dateline: string;
  duration?: string;
  subjects?: string;
  standfirst: string;
  introduction?: string[];
  hero?: Image;
  credits?: { label: string; value: string }[];
  sections?: Section[];
};

export type Forthcoming = { number: string; title: string; location?: string; note?: string; status?: string };

export type Series = {
  slug: string;
  name: string;
  subtitle: string;
  meaning?: string;
  status: string;
  began: string;
  order: number;
  standfirst: string;
  introduction: string[];
  cover?: Image;
  forthcoming?: Forthcoming[];
  entries: Entry[];
};

type Block = { label: string; text: string[] };

export type Site = {
  title: string;
  tagline: string;
  description: string;
  navigation: { label: string; href: string }[];
  home: {
    statement: string;
    introduction: string[];
    featured: { series: string; entry: string; note?: string };
    closing: string;
  };
  seriesIndex: { title: string; standfirst: string; introduction: string[] };
  about: {
    title: string;
    standfirst: string;
    manifesto: string[];
    name?: Block;
    method?: Block;
    colophon?: Block;
  };
  footer: { note: string; copyright: string };
};

const CONTENT = path.join(process.cwd(), "content");
const PUBLIC = path.join(process.cwd(), "public");

const readJson = <T>(file: string): T => JSON.parse(readFileSync(file, "utf8")) as T;

const readCollection = <T>(dir: string): T[] =>
  readdirSync(path.join(CONTENT, dir))
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJson<T>(path.join(CONTENT, dir, f)));

const byNumber = (a: { number: string }, b: { number: string }) =>
  a.number.localeCompare(b.number, "en", { numeric: true });

export const getSite = cache((): Site => readJson<Site>(path.join(CONTENT, "site.json")));

/** Every series, in order, each carrying its own entries — numbered within the series. */
export const getAllSeries = cache((): Series[] => {
  const entries = readCollection<Entry>("entries").sort(byNumber);
  return readCollection<Omit<Series, "entries">>("series")
    .sort((a, b) => a.order - b.order)
    .map((s) => ({ ...s, entries: entries.filter((e) => e.series === s.slug) }));
});

export const getSeries = (slug: string) => getAllSeries().find((s) => s.slug === slug);

export const getEntry = (seriesSlug: string, entrySlug: string) => {
  const series = getSeries(seriesSlug);
  const index = series ? series.entries.findIndex((e) => e.slug === entrySlug) : -1;
  if (!series || index < 0) return undefined;
  return {
    series,
    entry: series.entries[index],
    previous: series.entries[index - 1],
    next: series.entries[index + 1],
  };
};

export const entryHref = (series: { slug: string }, entry: { slug: string }) =>
  `/series/${series.slug}/${entry.slug}`;

/** A photograph is used only once its file exists in /public; until then its slot is held open. */
export const assetExists = (src?: string) =>
  Boolean(src && src.startsWith("/") && !src.includes("..") && existsSync(path.join(PUBLIC, src)));

export const pad = (n: number) => String(n).padStart(2, "0");

export const slugify = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** The canonical address of the site. Set NEXT_PUBLIC_SITE_URL once a domain is attached. */
export const siteUrl = () => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;
  return "http://localhost:3000";
};
