import { esc, html } from "./util.mjs";

const RATIOS = { "3x2": "3 / 2", "4x5": "4 / 5", "1x1": "1 / 1", "16x9": "16 / 9", "5x4": "5 / 4", "2x3": "2 / 3" };

/**
 * Photography. If the file exists in /public it is used; if it does not, the slot is
 * held open at the correct ratio with its brief, so layout and rhythm survive the
 * absence of the picture. Replace the file, and the picture simply appears.
 */
export const figure = (image, { assetExists, layout = "wide", eager = false, sizes } = {}) => {
  if (!image) return "";
  const cls = ["figure", `figure--${layout}`].join(" ");
  const ratio = RATIOS[image.ratio] || RATIOS["3x2"];
  const tone = Number.isInteger(image.tone) ? image.tone : 3;
  const present = image.src && assetExists && assetExists(image.src);
  const media = present
    ? `<img src="${esc(image.src)}" alt="${esc(image.alt || "")}" loading="${eager ? "eager" : "lazy"}" decoding="async"${sizes ? ` sizes="${esc(sizes)}"` : ""}>`
    : html`<div class="plate" role="img" aria-label="${esc(image.alt || image.note || "Photograph")}" data-tone="${tone}">
        <span class="plate__meta">${esc(image.note || image.alt || "Photograph")}</span>
      </div>`;

  return html`<figure class="${cls}" data-ratio="${esc(image.ratio || "3x2")}" style="--ratio:${ratio}">
    ${media}
    ${image.caption ? `<figcaption>${esc(image.caption)}</figcaption>` : ""}
  </figure>`;
};

export const rule = (label) =>
  label ? `<div class="rule rule--labelled"><span>${esc(label)}</span></div>` : `<div class="rule"></div>`;

export const meta = (items = []) =>
  html`<dl class="meta">
    ${items
      .filter((i) => i && i.value)
      .map((i) => `<div class="meta__row"><dt>${esc(i.label)}</dt><dd>${esc(i.value)}</dd></div>`)}
  </dl>`;
