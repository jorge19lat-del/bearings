# BEARINGS

An independent editorial project. Stories about people who have found their own way
of being in the world.

The site is a Next.js (App Router) project deployed on Vercel. Every page is
pre-rendered at build time from the editorial content in `/content` and served
from Vercel's edge cache; the only JavaScript on the page is the framework and a
few lines of behaviour.

```
BEARINGS
└── SERIES
    └── ENTRY (numbered within its series)
        └── CONTENT SECTIONS
```

---

## Running it

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build — every route is static
npm run start     # serve the production build
npm run lint      # type check
```

---

## Publishing (Vercel)

The project is linked to this repository on Vercel. Every push builds a preview
deployment; the production branch deploys to production. Nothing needs to be
configured for the build — Vercel detects Next.js.

**Environment variables** are managed in Vercel (Project → Settings → Environment
Variables), never in the repository. See `.env.example` for the list:

| Variable               | Purpose                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Canonical address, e.g. `https://bearings.example`. Optional: without it the site uses Vercel's production domain. |

**Adding a domain later:** Vercel → Project → Settings → Domains → add the domain
and follow the DNS instructions. HTTPS certificates are issued automatically.
Then set `NEXT_PUBLIC_SITE_URL` to the new address and redeploy, so canonical
URLs, Open Graph tags, `sitemap.xml` and `robots.txt` all point at it.

### What the platform and the config provide

- **Performance** — static pre-rendering, edge CDN caching, automatic code
  splitting, inlined critical CSS, preloaded self-hosted fonts, and Vercel image
  optimisation (AVIF/WebP, responsive sizes, lazy loading) for every photograph.
- **Security** — automatic HTTPS; `next.config.ts` sets Content-Security-Policy,
  HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy and COOP on every response. There are no forms and no user
  input. Preview deployments are excluded from search engines.
- **SEO** — per-page titles, descriptions and canonical URLs, Open Graph and
  Twitter cards (a generated share image), JSON-LD on entries, `sitemap.xml`,
  `robots.txt`, clean URLs and one `h1` per page with an ordered heading hierarchy.

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
`components/sections.tsx` — a label and a render function — and its shape to the
`Section` type in `lib/content.ts`. Nothing else in the site needs
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
keeps its rhythm. Drop the file in, push, and the picture appears — served through
Vercel's image optimisation in AVIF or WebP at the size each screen needs. Upload
large originals (2400–3000 px on the long side); resizing is automatic.

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

All of it is declared as custom properties at the top of `app/styles/bearings.css`.
Changing the palette or the type is a handful of lines there.

---

## A note on the writing in this repository

The DENSHŌ 001 — Indonesia text (story, moments, field notes, captions) is **sample
editorial copy**, written to show how a fully developed entry behaves. The people
in it are invented. Replace it with your own reporting before the site is published.

---

## Structure

```
content/             The editorial content — the only thing you normally edit
public/              Photographs, video, audio, typefaces
app/
├── layout.tsx       Page shell: masthead, navigation, colophon, metadata
├── page.tsx         Home
├── series/          Series index, each series, each entry
├── about/           About
├── sitemap.ts       sitemap.xml
├── robots.ts        robots.txt
├── opengraph-image.tsx  Share card
└── styles/          Typefaces and the stylesheet
components/
├── sections.tsx     The section registry — every form of documentation
├── Figure.tsx       Photographs, rules, metadata lists
└── client.tsx       Navigation state and the small amount of behaviour
lib/content.ts       Reads /content and relates entries to their series
next.config.ts       Security headers, caching, image settings
```
