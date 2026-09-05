import { html } from "../util.mjs";

export const notFoundPage = ({ ctx }) => html`
<header class="page-head">
  <h1 class="page-head__title">Off the map</h1>
  <p class="page-head__standfirst">This page is not here — it may have been moved, or it may never have existed.</p>
</header>

<div class="notfound">
  <a class="link" href="${ctx.path("/series/")}">Go to the series</a>
</div>`;
