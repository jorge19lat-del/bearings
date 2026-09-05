import { esc, html } from "../util.mjs";
import { figure } from "../components.mjs";

export const seriesPage = ({ series, ctx }) => {
  const path = ctx.path;
  const entries = series.entries;

  return html`
<header class="series-head">
  <p class="series-head__eyebrow"><a href="${path("/series/")}">Series</a></p>
  <h1 class="series-head__title">${esc(series.name)}</h1>
  <p class="series-head__subtitle">${esc(series.subtitle)}</p>
  ${series.meaning ? `<p class="series-head__meaning">${esc(series.meaning)}</p>` : ""}
  <div class="series-head__intro prose">${series.introduction.map((p) => `<p>${esc(p)}</p>`)}</div>
  <dl class="series-head__meta">
    <div><dt>Status</dt><dd>${esc(series.status)}</dd></div>
    <div><dt>Begun</dt><dd>${esc(series.began)}</dd></div>
    <div><dt>Entries</dt><dd>${entries.length ? String(entries.length).padStart(2, "0") : "—"}</dd></div>
  </dl>
</header>

<div class="rule rule--labelled"><span>Entries</span></div>

${entries.length
  ? html`<div class="entries">
      ${entries.map(
        (entry, i) => html`
      <article class="entry-row${i === 0 ? " entry-row--lead" : ""}">
        <a class="entry-row__link" href="${path(`/series/${series.slug}/${entry.slug}/`)}">
          <div class="entry-row__text">
            <p class="entry-row__num">${esc(entry.number)} <em aria-hidden="true">—</em></p>
            <h2 class="entry-row__title">${esc(entry.title)}</h2>
            <p class="entry-row__place">${esc(entry.location)}</p>
            <p class="entry-row__standfirst">${esc(entry.standfirst)}</p>
            <p class="entry-row__meta">${esc(entry.dateline)}${entry.duration ? ` · ${esc(entry.duration)}` : ""}</p>
            <span class="link link--quiet">Read the entry</span>
          </div>
          <div class="entry-row__plate">
            ${figure(entry.hero, { ctx, layout: i === 0 ? "lead" : "row", eager: i === 0 })}
          </div>
        </a>
      </article>`
      )}
    </div>`
  : `<p class="series-empty">The first entries in this series are being made. They will appear here as the work is finished.</p>`}

${series.forthcoming && series.forthcoming.length
  ? html`
<section class="forthcoming" aria-labelledby="forthcoming-title">
  <div class="rule rule--labelled"><span>Forthcoming</span></div>
  <h2 class="visually-hidden" id="forthcoming-title">Forthcoming entries</h2>
  <ul class="forthcoming__list">
    ${series.forthcoming.map(
      (f) => html`<li class="forthcoming__item">
        <p class="forthcoming__num">${esc(f.number)} <em aria-hidden="true">—</em> <span>${esc(f.title)}</span></p>
        <p class="forthcoming__note">${esc(f.note)}</p>
        <p class="forthcoming__status">${esc(f.status || "Planned")}</p>
      </li>`
    )}
  </ul>
</section>`
  : ""}`;
};
