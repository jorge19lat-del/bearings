import { esc, html } from "./util.mjs";

const isCurrent = (href, url) => (href === "/" ? url === "/" : url.startsWith(href));

export const layout = ({ site, ctx, url, title, description, bodyClass = "", head = "", content }) => {
  const path = ctx.path;
  const pageTitle = title ? `${title} — ${site.title}` : `${site.title} — ${site.tagline}`;

  return html`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(description || site.description)}">
<meta property="og:title" content="${esc(pageTitle)}">
<meta property="og:description" content="${esc(description || site.description)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#f2eee6">
<link rel="icon" href="${path("/favicon.svg")}" type="image/svg+xml">
<link rel="preload" href="${path("/fonts/fraunces-normal-300-700-latin.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${path("/fonts/newsreader-normal-300-600-latin.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${path("/styles/fonts.css")}">
<link rel="stylesheet" href="${path("/styles/bearings.css")}">
${head}
</head>
<body class="${esc(bodyClass)}">
<a class="skip" href="#main">Skip to the writing</a>

<header class="masthead">
  <div class="masthead__inner">
    <a class="wordmark wordmark--masthead" href="${path("/")}" aria-label="${esc(site.title)} — home">${esc(site.title)}</a>
    <nav class="nav" aria-label="Main">
      <ul>
        ${site.navigation.map(
          (item) =>
            `<li><a href="${path(item.href)}"${isCurrent(item.href, url) ? ' aria-current="page"' : ""}>${esc(item.label)}</a></li>`
        )}
      </ul>
    </nav>
  </div>
</header>

<main id="main">
${content}
</main>

<footer class="colophon">
  <div class="colophon__inner">
    <div class="colophon__mark">
      <span class="wordmark wordmark--footer">${esc(site.title)}</span>
      <p class="colophon__note">${esc(site.footer.note)}</p>
    </div>
    <nav class="colophon__nav" aria-label="Footer">
      <ul>
        ${site.navigation.map((item) => `<li><a href="${path(item.href)}">${esc(item.label)}</a></li>`)}
      </ul>
    </nav>
    <p class="colophon__legal">${esc(site.footer.copyright)}</p>
  </div>
</footer>

<script src="${path("/scripts/bearings.js")}" defer></script>
</body>
</html>`;
};
