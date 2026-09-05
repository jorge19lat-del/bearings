import { esc, html } from "../util.mjs";
import { figure } from "../components.mjs";

export const homePage = ({ site, series, entries, ctx }) => {
  const home = site.home;
  const featuredSeries = series.find((s) => s.slug === home.featured.series);
  const featuredEntry = entries.find(
    (e) => e.series === home.featured.series && e.slug === home.featured.entry
  );
  const path = ctx.path;

  return html`
<section class="opening">
  <h1 class="wordmark wordmark--display">${esc(site.title)}</h1>
  <p class="opening__statement">${esc(home.statement)}</p>
  <div class="opening__intro">
    ${home.introduction.map((p) => `<p>${esc(p)}</p>`)}
  </div>
</section>

${featuredSeries && featuredEntry
  ? html`
<section class="featured" aria-labelledby="featured-title">
  <div class="rule rule--labelled"><span>${esc(home.featured.note || "Current")}</span></div>

  <div class="featured__head">
    <p class="featured__series"><a href="${path(`/series/${featuredSeries.slug}/`)}">${esc(featuredSeries.name)}</a> <span>${esc(featuredSeries.subtitle)}</span></p>
    <h2 class="featured__title" id="featured-title">
      <a href="${path(`/series/${featuredSeries.slug}/${featuredEntry.slug}/`)}">
        <span class="featured__number">${esc(featuredEntry.number)}</span>
        <span class="featured__em" aria-hidden="true">—</span>
        <span class="featured__name">${esc(featuredEntry.title)}</span>
      </a>
    </h2>
  </div>

  <a class="featured__plate" href="${path(`/series/${featuredSeries.slug}/${featuredEntry.slug}/`)}" tabindex="-1" aria-hidden="true">
    ${figure(featuredEntry.hero, { ctx, layout: "bleed", eager: true })}
  </a>

  <div class="featured__foot">
    <p class="featured__standfirst">${esc(featuredEntry.standfirst)}</p>
    <p class="featured__meta">${esc(featuredEntry.location)} · ${esc(featuredEntry.dateline)}</p>
    <p class="featured__link"><a class="link" href="${path(`/series/${featuredSeries.slug}/${featuredEntry.slug}/`)}">Read the entry</a></p>
  </div>
</section>`
  : ""}

<section class="home-series" aria-labelledby="home-series-title">
  <div class="rule rule--labelled"><span>Series</span></div>
  <h2 class="visually-hidden" id="home-series-title">Series</h2>
  <ul class="home-series__list">
    ${series.map(
      (s) => html`<li>
        <a href="${path(`/series/${s.slug}/`)}">
          <span class="home-series__name">${esc(s.name)}</span>
          <span class="home-series__subtitle">${esc(s.subtitle)}</span>
          <span class="home-series__count">${
            s.entries.length ? `${s.entries.length} ${s.entries.length === 1 ? "entry" : "entries"}` : esc(s.status)
          }</span>
        </a>
      </li>`
    )}
  </ul>
  <p class="home-series__note">${esc(home.closing)}</p>
</section>`;
};
