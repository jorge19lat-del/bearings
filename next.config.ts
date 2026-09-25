import type { NextConfig } from "next";

/*
 * Security headers, applied to every response.
 *
 * The site is fully pre-rendered and served from Vercel's edge cache, so the
 * Content-Security-Policy is static rather than nonce-based (a nonce would force
 * every page to render per request). Scripts are limited to this origin; the
 * inline allowance covers only the framework's own bootstrap and the JSON-LD
 * block. Everything else — plugins, framing, foreign forms — is refused.
 */
const isPreview = process.env.VERCEL_ENV === "preview";
const isDev = process.env.NODE_ENV === "development";

// The Vercel toolbar is injected on preview deployments only.
const toolbar = isPreview ? " https://vercel.live https://*.vercel.live" : "";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${toolbar}`,
  `style-src 'self' 'unsafe-inline'${toolbar}`,
  `img-src 'self' data: blob:${toolbar} https://vercel.com`,
  `font-src 'self'${toolbar} https://assets.vercel.com`,
  "media-src 'self'",
  `connect-src 'self'${toolbar}${isPreview ? " wss://ws-us3.pusher.com" : ""}`,
  `frame-src https://player.vimeo.com https://www.youtube-nocookie.com${toolbar}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), autoplay=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: false,
  experimental: {
    // Styles are small; inlining them removes render-blocking requests on first visit.
    inlineCss: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1280, 1600, 2048, 2560],
    imageSizes: [320, 480],
    qualities: [75, 80],
    // Optimised photographs are cached at the edge for a month.
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Typefaces never change under the same name.
        source: "/fonts/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Photographs, film and sound in /public change rarely; revalidate daily.
        source: "/:dir(images|video|audio)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
  async redirects() {
    // Addresses from the earlier static edition of the site.
    return [{ source: "/index.html", destination: "/", permanent: true }];
  },
};

export default nextConfig;
