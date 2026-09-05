#!/usr/bin/env node
/**
 * BEARINGS — static build.
 *
 * Reads the editorial content in /content, renders the site into /dist.
 * The hierarchy is: BEARINGS → SERIES → ENTRY → CONTENT SECTIONS.
 * Nothing here needs changing to add a series, an entry or a section —
 * see README.md.
 */
import { readdir, readFile, writeFile, mkdir, rm, cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { layout } from "./src/layout.mjs";
import { homePage } from "./src/pages/home.mjs";
import { seriesIndexPage } from "./src/pages/series-index.mjs";
import { seriesPage } from "./src/pages/series.mjs";
import { entryPage } from "./src/pages/entry.mjs";
import { aboutPage } from "./src/pages/about.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const dirs = {
  content: path.join(root, "content"),
  public: path.join(root, "public"),
  src: path.join(root, "src"),
  dist: path.join(root, "dist"),
};

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));

const readCollection = async (dir) => {
  if (!existsSync(dir)) return [];
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  return Promise.all(files.map((f) => readJson(path.join(dir, f))));
};

const byNumber = (a, b) => String(a.number).localeCompare(String(b.number), "en", { numeric: true });

const write = async (route, htmlString) => {
  const file = path.join(dirs.dist, route.replace(/^\//, ""), "index.html");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, htmlString.trim() + "\n", "utf8");
  return route;
};

const build = async () => {
  const site = await readJson(path.join(dirs.content, "site.json"));
  const allSeries = (await readCollection(path.join(dirs.content, "series"))).sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99)
  );
  const allEntries = (await readCollection(path.join(dirs.content, "entries"))).sort(byNumber);

  // Relate entries to their series — the numbering restarts within each series.
  const series = allSeries.map((s) => ({
    ...s,
    entries: allEntries.filter((e) => e.series === s.slug).sort(byNumber),
  }));

  const orphans = allEntries.filter((e) => !allSeries.some((s) => s.slug === e.series));
  orphans.forEach((e) => console.warn(`  ! entry "${e.slug}" refers to unknown series "${e.series}" — skipped`));

  const base = site.basePath || "";
  const ctx = {
    path: (href) => (href.startsWith("/") ? base + href : href),
    assetExists: (src) => Boolean(src) && existsSync(path.join(dirs.public, src.replace(/^\//, ""))),
  };

  await rm(dirs.dist, { recursive: true, force: true });
  await mkdir(dirs.dist, { recursive: true });

  const routes = [];

  routes.push(
    await write(
      "/",
      layout({
        site,
        url: "/",
        title: null,
        description: site.description,
        bodyClass: "is-home",
        content: homePage({ site, series, entries: allEntries, ctx }),
      })
    )
  );

  routes.push(
    await write(
      "/series/",
      layout({
        site,
        url: "/series/",
        title: "Series",
        description: site.seriesIndex.standfirst,
        bodyClass: "is-index",
        content: seriesIndexPage({ site, series, ctx }),
      })
    )
  );

  routes.push(
    await write(
      "/about/",
      layout({
        site,
        url: "/about/",
        title: "About",
        description: site.about.standfirst,
        bodyClass: "is-about",
        content: aboutPage({ site }),
      })
    )
  );

  for (const s of series) {
    routes.push(
      await write(
        `/series/${s.slug}/`,
        layout({
          site,
          url: `/series/${s.slug}/`,
          title: s.name,
          description: `${s.subtitle} ${s.standfirst || ""}`.trim(),
          bodyClass: "is-series",
          content: seriesPage({ series: s, ctx }),
        })
      )
    );

    for (const [i, entry] of s.entries.entries()) {
      routes.push(
        await write(
          `/series/${s.slug}/${entry.slug}/`,
          layout({
            site,
            url: `/series/${s.slug}/${entry.slug}/`,
            title: `${s.name} · ${entry.number} — ${entry.title}`,
            description: entry.standfirst,
            bodyClass: "is-entry",
            content: entryPage({
              site,
              series: s,
              entry,
              neighbours: { previous: s.entries[i - 1] || null, next: s.entries[i + 1] || null },
              ctx,
            }),
          })
        )
      );
    }
  }

  // Styles, scripts, photography.
  await cp(path.join(dirs.src, "styles"), path.join(dirs.dist, "styles"), { recursive: true });
  await cp(path.join(dirs.src, "scripts"), path.join(dirs.dist, "scripts"), { recursive: true });
  if (existsSync(dirs.public)) await cp(dirs.public, dirs.dist, { recursive: true });

  console.log(`BEARINGS — built ${routes.length} pages`);
  routes.forEach((r) => console.log(`  ${r}`));
  const missing = [];
  for (const s of series) {
    if (s.cover && !ctx.assetExists(s.cover.src)) missing.push(s.cover.src);
    for (const e of s.entries) {
      const images = [e.hero, ...(e.sections || []).flatMap((sec) => sec.items || sec.blocks || [])];
      images.filter((i) => i && i.src && !ctx.assetExists(i.src)).forEach((i) => missing.push(i.src));
    }
  }
  if (missing.length) {
    console.log(`\n  ${missing.length} slots are held open, waiting for files in /public:`);
    missing.forEach((m) => console.log(`    ${m}`));
  }
};

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
