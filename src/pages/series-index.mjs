import { esc, html } from "../util.mjs";
import { figure } from "../components.mjs";

export const seriesIndexPage = ({ site, series, ctx }) => {
  const page = site.seriesIndex;
  const path = ctx.path;

  return html`
<header class="page-head">
  <h1 class="page-head__title">${esc(page.title)}</h1>
  <p class="page-head__standfirst">${esc(page.standfirst)}</p>
  <div class="page-head__intro">${page.introduction.map((p) => `<p>${esc(p)}</p>`)}</div>
</header>

<div class="index">
  ${series.map(
    (s, i) => html`
  <article class="index__row">
    <div class="index__num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</div>
    <div class="index__body">
      <h2 class="index__name"><a href="${path(`/series/${s.slug}/`)}">${esc(s.name)}</a></h2>
      <p class="index__subtitle">${esc(s.subtitle)}</p>
      <p class="index__standfirst">${esc(s.standfirst)}</p>
      <dl class="index__meta">
        <div><dt>Status</dt><dd>${esc(s.status)}</dd></div>
        <div><dt>Begun</dt><dd>${esc(s.began)}</dd></div>
        <div><dt>Entries</dt><dd>${s.entries.length ? String(s.entries.length).padStart(2, "0") : "—"}</dd></div>
      </dl>
      ${s.entries.length
        ? html`<ul class="index__entries">
            ${s.entries.map(
              (e) =>
                `<li><a href="${path(`/series/${s.slug}/${e.slug}/`)}"><span>${esc(e.number)}</span> <em>—</em> ${esc(e.title)}</a></li>`
            )}
          </ul>`
        : `<p class="index__empty">First entries in preparation.</p>`}
    </div>
    <div class="index__plate">
      <a href="${path(`/series/${s.slug}/`)}" tabindex="-1" aria-hidden="true">
        ${figure(s.cover, { assetExists: ctx.assetExists, layout: "index" })}
      </a>
    </div>
  </article>`
  )}
</div>`;
};
