# BEARINGS

An independent editorial project. Stories about people who have found their own way
of being in the world.

The site is a small static publication: plain HTML, CSS and a little JavaScript,
generated from the editorial content in `/content`. There is no framework and there
are no dependencies, so it will still build in five years.

```
BEARINGS
└── SERIES
    └── ENTRY (numbered within its series)
        └── CONTENT SECTIONS
```

---

## Running it

```bash
npm run build     # content + templates → /dist
npm run serve     # preview /dist at http://localhost:4321
npm run dev       # both
```

`/dist` is generated and is not committed — it is built on publish.

---

## Publishing

`.github/workflows/pages.yml` builds the site and publishes it to GitHub Pages on
every push. It needs one setting, once:

> **Settings → Pages → Build and deployment → Source: GitHub Actions**

Without that, GitHub serves the repository's files directly and a visitor sees this
README rather than the site.

The workflow asks GitHub Pages where the site will live and builds it for that
address, so it works both at a domain root and at `…github.io/bearings/`. Nothing
in the content needs to change if a custom domain is added later.

To publish anywhere else (Netlify, Vercel, Cloudflare Pages, a folder on a server),
run `npm run build` and upload `/dist`. If that host serves the site from a
sub-folder, build with `BASE_PATH=/sub-folder npm run build`, or set
`"basePath": "/sub-folder"` in `content/site.json`.

---

## The content model

Everything editorial lives in `/content`. Nothing else needs touching to publish.

```
content/
├── site.json                       Site text: home, series index, about, footer
├── series/
│   ├── densho.json                 One file per series
│   └── summit.json
└── entries/
    └── densho-001-indonesia.json   One file per entry
```

### A series

`content/series/<slug>.json`

| Field          | Meaning                                                    |
| -------------- | ---------------------------------------------------------- |
| `slug`         | URL segment — `/series/densho/`                            |
| `name`         | Series name, e.g. `DENSHŌ`                                 |
| `subtitle`     | One line, e.g. `Stories of craftsmanship.`                 |
| `meaning`      | Optional note on the name                                  |
| `standfirst`   | One sentence, used on the series index                     |
| `introduction` | Array of paragraphs                                        |
| `cover`        | Image object (see below)                                   |
| `status`       | `Ongoing`, `In progress`, `Complete` — shown as metadata   |
| `began`        | Year                                                       |
| `order`        | Position on the series index                               |
| `forthcoming`  | Optional list of announced-but-unpublished entries         |

### An entry

`content/entries/<anything>.json`. The filename is not meaningful; `series` and
`slug` are.

| Field          | Meaning                                                       |
| -------------- | ------------------------------------------------------------- |
| `series`       | The `slug` of its series — this is the relation                |
| `number`       | `001` — **restarts within each series**                        |
| `slug`         | URL segment — `/series/densho/001-indonesia/`                  |
| `title`        | e.g. `Indonesia`                                               |
| `location`     | e.g. `Surakarta, Central Java`                                 |
| `dateline`     | e.g. `March 2025`                                              |
| `duration`     | Optional, e.g. `Eleven days`                                   |
| `subjects`     | Optional one-line description of who the entry is about        |
| `standfirst`   | The sentence that carries the entry on index pages             |
| `introduction` | Array of paragraphs shown beneath the hero                     |
| `hero`         | Image object                                                   |
| `credits`      | Optional `[{ "label": …, "value": … }]`                        |
| `sections`     | The body of the entry — see below                              |

Entries are sorted by `number` within their series. Adding
`content/entries/densho-002-cordoba.json` with `"series": "densho"` publishes it at
`/series/densho/002-cordoba/` and lists it everywhere it belongs. Nothing else changes.

### Sections

An entry contains whichever sections it actually has, in the order it lists them.
No section is required, and no two entries need the same shape.

| `type`         | Default label  | Shape                                                     |
| -------------- | -------------- | --------------------------------------------------------- |
| `story`        | The Story      | `blocks`: `lead`, `paragraph`, `subhead`, `pullquote`, `figure`, `break` |
| `moments`      | The Moments    | `items`: `{ place, time, text }` or `{ quote, attribution, kind: "quote" }` |
| `images`       | The Images     | `items`: image objects with `layout`                       |
| `field-notes`  | Field Notes    | `items`: `{ date, place, lines: [] }`                      |
| `videos`       | The Videos     | `items`: `{ provider: "vimeo"｜"youtube", id }` or `{ src, poster }` |
| `films`        | The Films      | as `videos`, given more room                               |
| `voice`        | The Voice      | `items`: `{ title, src, duration, note, transcript }`      |
| `interview`    | The Interview  | `preamble`, `exchanges: [{ q, a }]`                        |

Any section may override its heading with `"label": "…"`, and may carry a `"note"`
shown beside the heading.

```jsonc
"sections": [
  { "type": "story",  "blocks": [ … ] },
  { "type": "images", "items":  [ … ] },
  { "type": "videos", "items":  [ … ] }
]
```

To invent a new form of documentation, add one entry to `SECTION_TYPES` in
`src/sections.mjs` — a label and a render function. Nothing else in the site needs
to know about it.

### Images

```jsonc
{
  "src": "/images/densho/001-indonesia/img-03.jpg",
  "alt": "Six men in a circle striking a disc of glowing bronze.",
  "ratio": "3x2",          // 3x2 · 4x5 · 1x1 · 16x9 · 5x4 · 2x3
  "layout": "full",        // full · wide · inset · pair
  "caption": "Forty strikes to a heat.",
  "tone": 5,               // 1–6, the placeholder's weight while the file is missing
  "note": "Brief for the picture that belongs here"
}
```

Photographs go in `/public/images/…`, matching `src`. **A missing file is not an
error**: the slot is held open at the right proportion with its brief, so the page
keeps its rhythm. Drop the file in, rebuild, and the picture appears. `npm run build`
lists every slot still waiting.

Layouts: `full` runs edge to edge, `wide` sits inside the page margins, `inset` is
small and surrounded by space (alternating side to side), and consecutive `pair`
images are set two across.

---

## Design

| | |
| --- | --- |
| Display serif | **Fraunces** — wordmark, titles, section labels, pull quotes |
| Reading serif | **Newsreader** — the writing |
| Metadata sans | **Archivo** — navigation, numbers, locations, captions |
| Paper | `#f2eee6` warm off-white |
| Ink | `#17140f` near-black, with two warm greys |

All of it is declared as custom properties at the top of `src/styles/bearings.css`.
Changing the palette or the type is a handful of lines there.

---

## A note on the writing in this repository

The DENSHŌ 001 — Indonesia text (story, moments, field notes, captions) is **sample
editorial copy**, written to show how a fully developed entry behaves. The people
in it are invented. Replace it with your own reporting before the site is published.

---

## Structure

```
build.mjs            Reads /content, writes /dist
serve.mjs            Preview server
content/             The editorial content — the only thing you normally edit
public/              Photographs, video, audio, favicon
src/
├── layout.mjs       Page shell: masthead, navigation, colophon
├── sections.mjs     The section registry — every form of documentation
├── components.mjs   Figures, rules, metadata lists
├── pages/           Home, series index, series, entry, about
├── styles/
└── scripts/
```
