import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Figure, Meta, Rule } from "@/components/Figure";
import { Sections, sectionIndex } from "@/components/sections";
import { assetExists, entryHref, getAllSeries, getEntry, pad } from "@/lib/content";

type Params = { params: Promise<{ series: string; entry: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSeries().flatMap((s) => s.entries.map((e) => ({ series: s.slug, entry: e.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await params;
  const found = getEntry(p.series, p.entry);
  if (!found) return {};
  const { series, entry } = found;
  const title = `${series.name} ${entry.number} — ${entry.title}`;
  const url = entryHref(series, entry);
  const hero = entry.hero && assetExists(entry.hero.src) ? entry.hero : undefined;
  return {
    title,
    description: entry.standfirst,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description: entry.standfirst,
      url,
      // A photograph, once there is one; until then the generated card is used.
      ...(hero ? { images: [{ url: hero.src!, alt: hero.alt }] } : {}),
    },
  };
}

export default async function EntryPage({ params }: Params) {
  const p = await params;
  const found = getEntry(p.series, p.entry);
  if (!found) notFound();
  const { series, entry, next } = found;
  const index = sectionIndex(entry);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${series.name} ${entry.number} — ${entry.title}`,
    description: entry.standfirst,
    isPartOf: { "@type": "CreativeWorkSeries", name: series.name },
    contentLocation: { "@type": "Place", name: entry.location },
    author: { "@type": "Organization", name: "BEARINGS" },
  };

  return (
    <article className="entry">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="entry-head">
        <p className="entry-head__series">
          <Link href={`/series/${series.slug}`}>{series.name}</Link>
        </p>
        <p className="entry-head__num">{entry.number}</p>
        <h1 className="entry-head__title">{entry.title}</h1>
        <p className="entry-head__place">
          {entry.location} <em aria-hidden="true">·</em> {entry.dateline}
        </p>
        <p className="entry-head__standfirst">{entry.standfirst}</p>
      </header>

      <Figure image={entry.hero} layout="bleed" eager />

      <div className="entry-intro">
        <div className="entry-intro__text prose">
          {(entry.introduction ?? []).map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>
        <aside className="entry-intro__meta" aria-label="About this entry">
          <Meta
            items={[
              { label: "Series", value: `${series.name} · ${entry.number}` },
              { label: "Location", value: entry.location },
              { label: "Dates", value: entry.dateline },
              { label: "Time on the ground", value: entry.duration },
              { label: "Subjects", value: entry.subjects },
              ...(entry.credits ?? []),
            ]}
          />
        </aside>
      </div>

      {index.length ? (
        <>
          <nav className="contents" aria-label="Sections of this entry">
            <Rule label="In this entry" />
            <ol className="contents__list">
              {index.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>
                    <span className="contents__num">{pad(i + 1)}</span>
                    <span className="contents__label">{s.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <nav className="margin-index" aria-hidden="true">
            <ol>
              {index.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} data-target={s.id} tabIndex={-1}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </>
      ) : null}

      <div className="entry-body">
        <Sections entry={entry} />
      </div>

      <footer className="entry-foot">
        <Rule />
        <div className="entry-foot__inner">
          <p className="entry-foot__back">
            <Link className="link" href={`/series/${series.slug}`}>
              Back to {series.name}
            </Link>
          </p>
          <p className="entry-foot__next">
            <span>Next in this series</span>
            {next ? (
              <Link className="link" href={entryHref(series, next)}>
                {next.number} — {next.title}
              </Link>
            ) : (
              <em>In preparation</em>
            )}
          </p>
        </div>
      </footer>
    </article>
  );
}
