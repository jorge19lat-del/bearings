import { esc, html, slugify } from "./util.mjs";
import { figure } from "./components.mjs";

/**
 * SECTION REGISTRY
 * ----------------
 * Every section type an entry may contain is declared here: a default label and a
 * renderer. An entry displays only the sections it actually has, in the order it
 * lists them, so no two entries need the same shape. To invent a new form of
 * documentation, add one entry to this object — nothing else in the site changes.
 */

const storyBlocks = {
  lead: (b) => `<p class="story__lead">${esc(b.text)}</p>`,
  paragraph: (b) => `<p>${esc(b.text)}</p>`,
  subhead: (b) => `<h3 class="story__subhead">${esc(b.text)}</h3>`,
  break: () => `<hr class="story__break" aria-hidden="true">`,
  pullquote: (b) => html`<blockquote class="pullquote">
      <p>${esc(b.text)}</p>
      ${b.attribution ? `<cite>${esc(b.attribution)}</cite>` : ""}
    </blockquote>`,
  figure: (b, ctx) => figure(b, { ctx, layout: b.layout || "wide" }),
};

const renderStoryBlock = (block, ctx) => {
  const render = storyBlocks[block.type] || storyBlocks.paragraph;
  return render(block, ctx);
};

export const SECTION_TYPES = {
  story: {
    label: "The Story",
    render: (section, ctx) => html`<div class="story prose">
        ${(section.blocks || []).map((b) => renderStoryBlock(b, ctx))}
      </div>`,
  },

  moments: {
    label: "The Moments",
    render: (section) => html`<div class="moments">
        ${(section.items || []).map((item, i) => {
          const stamp = [item.place, item.time].filter(Boolean).join(" · ");
          const body =
            item.kind === "quote" || item.quote
              ? html`<blockquote class="moment__quote"><p>${esc(item.quote || item.text)}</p>${
                  item.attribution ? `<cite>${esc(item.attribution)}</cite>` : ""
                }</blockquote>`
              : `<p class="moment__text">${esc(item.text)}</p>`;
          return html`<article class="moment moment--${i % 2 ? "right" : "left"}${
            item.kind === "quote" || item.quote ? " moment--isQuote" : ""
          }" data-index="${String(i + 1).padStart(2, "0")}">
              ${stamp ? `<p class="moment__stamp">${esc(stamp)}</p>` : ""}
              ${body}
            </article>`;
        })}
      </div>`,
  },

  images: {
    label: "The Images",
    render: (section, ctx) => {
      const items = section.items || [];
      const out = [];
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (item.layout === "pair") {
          const group = [];
          while (i < items.length && items[i].layout === "pair") group.push(items[i++]);
          i -= 1;
          out.push(
            html`<div class="plates-pair">${group.map((g) => figure(g, { ctx, layout: "pair" }))}</div>`
          );
        } else {
          out.push(figure(item, { ctx, layout: item.layout || "wide" }));
        }
      }
      return `<div class="plates">${out.join("\n")}</div>`;
    },
  },

  "field-notes": {
    label: "Field Notes",
    render: (section) => html`<div class="notes">
        ${(section.items || []).map(
          (note) => html`<article class="note">
              <header class="note__head">
                <p class="note__date">${esc(note.date)}</p>
                ${note.place ? `<p class="note__place">${esc(note.place)}</p>` : ""}
              </header>
              <div class="note__body">${(note.lines || []).map((line) => `<p>${esc(line)}</p>`)}</div>
            </article>`
        )}
      </div>`,
  },

  videos: {
    label: "The Videos",
    render: (section, ctx) => html`<div class="videos">
        ${(section.items || []).map((item) => renderMotion(item, ctx))}
      </div>`,
  },

  films: {
    label: "The Films",
    render: (section, ctx) => html`<div class="videos videos--films">
        ${(section.items || []).map((item) => renderMotion(item, ctx, "film"))}
      </div>`,
  },

  voice: {
    label: "The Voice",
    render: (section, ctx) => html`<div class="voice">
        ${(section.items || []).map(
          (item) => html`<article class="voice__track">
              <div class="voice__head">
                <h3>${esc(item.title || "Recording")}</h3>
                ${item.duration ? `<p class="voice__duration">${esc(item.duration)}</p>` : ""}
              </div>
              ${item.src ? `<audio controls preload="none" src="${esc(ctx.asset(item.src))}"></audio>` : ""}
              ${item.note ? `<p class="voice__note">${esc(item.note)}</p>` : ""}
              ${item.transcript ? `<div class="voice__transcript prose">${item.transcript.map((p) => `<p>${esc(p)}</p>`).join("")}</div>` : ""}
            </article>`
        )}
      </div>`,
  },

  interview: {
    label: "The Interview",
    render: (section) => html`<div class="interview prose">
        ${section.preamble ? `<p class="interview__preamble">${esc(section.preamble)}</p>` : ""}
        ${(section.exchanges || []).map(
          (x) => html`<div class="exchange">
              <p class="exchange__q">${esc(x.q)}</p>
              ${(Array.isArray(x.a) ? x.a : [x.a]).map((a) => `<p class="exchange__a">${esc(a)}</p>`)}
            </div>`
        )}
      </div>`,
  },
};

/** Video, kept deliberately plain: no autoplay, no overlay, no promotional treatment. */
const renderMotion = (item, ctx, kind = "video") => {
  const caption = item.caption ? `<figcaption>${esc(item.caption)}</figcaption>` : "";
  let media = "";
  if (item.provider === "vimeo" && item.id) {
    media = `<iframe src="https://player.vimeo.com/video/${esc(item.id)}?dnt=1&title=0&byline=0&portrait=0" title="${esc(item.title || "Video")}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  } else if (item.provider === "youtube" && item.id) {
    media = `<iframe src="https://www.youtube-nocookie.com/embed/${esc(item.id)}?rel=0" title="${esc(item.title || "Video")}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  } else if (item.src) {
    media = `<video controls preload="none"${item.poster ? ` poster="${esc(ctx.asset(item.poster))}"` : ""} src="${esc(ctx.asset(item.src))}"></video>`;
  } else {
    media = `<div class="plate" role="img" aria-label="${esc(item.title || "Video")}" data-tone="6"><span class="plate__meta">${esc(item.note || item.title || "Video")}</span></div>`;
  }
  return html`<figure class="motion motion--${kind}" style="--ratio:${item.ratio === "4x3" ? "4 / 3" : "16 / 9"}">
      <div class="motion__frame">${media}</div>
      ${caption}
    </figure>`;
};

/** Sections an entry does not have are simply never rendered. */
export const renderSections = (entry, ctx) => {
  const sections = (entry.sections || []).filter((s) => SECTION_TYPES[s.type]);
  return sections
    .map((section, i) => {
      const def = SECTION_TYPES[section.type];
      const label = section.label || def.label;
      const id = section.id || slugify(label);
      return html`<section class="section section--${esc(section.type)}" id="${esc(id)}">
          <header class="section__head">
            <p class="section__index" aria-hidden="true">${String(i + 1).padStart(2, "0")}</p>
            <h2 class="section__label">${esc(label)}</h2>
            ${section.note ? `<p class="section__note">${esc(section.note)}</p>` : ""}
          </header>
          <div class="section__body">${def.render(section, ctx)}</div>
        </section>`;
    })
    .join("\n");
};

export const sectionIndex = (entry) =>
  (entry.sections || [])
    .filter((s) => SECTION_TYPES[s.type])
    .map((s) => {
      const label = s.label || SECTION_TYPES[s.type].label;
      return { id: s.id || slugify(label), label };
    });
