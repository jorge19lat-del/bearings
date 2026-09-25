import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Behaviour, Nav } from "@/components/client";
import { getSite, siteUrl } from "@/lib/content";
import "./styles/fonts.css";
import "./styles/bearings.css";

const site = getSite();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.title} — ${site.tagline}`,
    template: `%s — ${site.title}`,
  },
  description: site.description,
  applicationName: site.title,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.title,
    locale: "en_GB",
    title: `${site.title} — ${site.tagline}`,
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#f2eee6",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Lets styles that depend on scripting apply before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {/* The two typefaces seen first: the wordmark and titles, and the writing. */}
        <link rel="preload" href="/fonts/fraunces-normal-300-700-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/newsreader-normal-300-600-text-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to the writing
        </a>

        <header className="masthead">
          <div className="masthead__inner">
            <Link className="wordmark wordmark--masthead" href="/" aria-label={`${site.title} — home`}>
              {site.title}
            </Link>
            <Nav items={site.navigation} />
          </div>
        </header>

        <main id="main">{children}</main>

        <footer className="colophon">
          <div className="colophon__inner">
            <div className="colophon__mark">
              <span className="wordmark wordmark--footer">{site.title}</span>
              <p className="colophon__note">{site.footer.note}</p>
            </div>
            <nav className="colophon__nav" aria-label="Footer">
              <ul>
                {site.navigation.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <p className="colophon__legal">{site.footer.copyright}</p>
          </div>
        </footer>

        <Behaviour />
      </body>
    </html>
  );
}
