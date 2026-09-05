import { esc, html } from "../util.mjs";

export const aboutPage = ({ site }) => {
  const about = site.about;
  const block = (b) =>
    b
      ? html`<section class="about__block">
          <div class="rule rule--labelled"><span>${esc(b.label)}</span></div>
          <div class="about__blockText prose">${b.text.map((p) => `<p>${esc(p)}</p>`)}</div>
        </section>`
      : "";

  return html`
<header class="page-head page-head--about">
  <h1 class="page-head__title">${esc(about.title)}</h1>
  <p class="page-head__standfirst">${esc(about.standfirst)}</p>
</header>

<div class="manifesto">
  ${about.manifesto.map((line) => `<p>${esc(line)}</p>`)}
</div>

${block(about.name)}
${block(about.method)}
${block(about.colophon)}`;
};
