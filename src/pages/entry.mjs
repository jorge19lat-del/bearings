import { esc, html } from "../util.mjs";
import { figure, meta } from "../components.mjs";
import { renderSections, sectionIndex } from "../sections.mjs";

export const entryPage = ({ site, series, entry, neighbours, ctx }) => {
  const path = ctx.path;
  const index = sectionIndex(entry);

  return html`
<article class="entry">
  <header class="entry-head">
    <p class="entry-head__series"><a href="${path(`/series/${series.slug}/`)}">${esc(series.name)}</a></p>
    <p class="entry-head__num">${esc(entry.number)}</p>
    <h1 class="entry-head__title">${esc(entry.title)}</h1>
    <p class="entry-head__place">${esc(entry.location)} <em aria-hidden="true">·</em> ${esc(entry.dateline)}</p>
    <p class="entry-head__standfirst">${esc(entry.standfirst)}</p>
  </header>

  ${figure(entry.hero, { ctx, layout: "bleed", eager: true })}

  <div class="entry-intro">
    <div class="entry-intro__text prose">${(entry.introduction || []).map((p) => `<p>${esc(p)}</p>`)}</div>
    <aside class="entry-intro__meta">
      ${meta([
        { label: "Series", value: `${series.name} · ${entry.number}` },
        { label: "Location", value: entry.location },
        { label: "Dates", value: entry.dateline },
        { label: "Time on the ground", value: entry.duration },
        { label: "Subjects", value: entry.subjects },
        ...(entry.credits || []),
      ])}
    </aside>
  </div>

  ${index.length
    ? html`<nav class="contents" aria-label="Sections of this entry">
        <div class="rule rule--labelled"><span>In this entry</span></div>
        <ol class="contents__list">
          ${index.map(
            (s, i) =>
              `<li><a href="#${esc(s.id)}"><span class="contents__num">${String(i + 1).padStart(2, "0")}</span><span class="contents__label">${esc(s.label)}</span></a></li>`
          )}
        </ol>
      </nav>
      <nav class="margin-index" aria-hidden="true">
        <ol>
          ${index.map((s) => `<li><a href="#${esc(s.id)}" data-target="${esc(s.id)}">${esc(s.label)}</a></li>`)}
        </ol>
      </nav>`
    : ""}

  <div class="entry-body">
    ${renderSections(entry, ctx)}
  </div>

  <footer class="entry-foot">
    <div class="rule"></div>
    <div class="entry-foot__inner">
      <p class="entry-foot__back"><a class="link" href="${path(`/series/${series.slug}/`)}">Back to ${esc(series.name)}</a></p>
      ${neighbours.next
        ? html`<p class="entry-foot__next">
            <span>Next in this series</span>
            <a class="link" href="${path(`/series/${series.slug}/${neighbours.next.slug}/`)}">${esc(neighbours.next.number)} — ${esc(neighbours.next.title)}</a>
          </p>`
        : `<p class="entry-foot__next"><span>Next in this series</span><em>In preparation</em></p>`}
    </div>
  </footer>
</article>`;
};
