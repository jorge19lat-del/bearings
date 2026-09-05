// Small shared helpers. No dependencies, by design.

export const esc = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Join template fragments, dropping null/undefined/false so templates can use && */
export const html = (strings, ...values) =>
  strings.reduce((out, str, i) => {
    const v = values[i - 1];
    const rendered = Array.isArray(v) ? v.filter(Boolean).join("") : v === undefined || v === null || v === false ? "" : v;
    return out + rendered + str;
  });

export const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Paragraph list helper */
export const paragraphs = (list = [], className = "") =>
  list.map((text) => `<p${className ? ` class="${className}"` : ""}>${esc(text)}</p>`).join("\n");
