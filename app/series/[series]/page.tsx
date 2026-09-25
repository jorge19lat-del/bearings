import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Figure, Rule } from "@/components/Figure";
import { entryHref, getAllSeries, getSeries, pad } from "@/lib/content";

type Params = { params: Promise<{ series: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSeries().map((s) => ({ series: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const series = getSeries((await params).series);
  if (!series) return {};
  const title = `${series.name} — ${series.subtitle.replace(/\.$/, "")}`;
  return {
    title,
    description: series.standfirst,
    alternates: { canonical: `/series/${series.slug}` },
    openGraph: { title, description: series.standfirst, url: `/series/${series.slug}` },
  };
}

export default async function SeriesPage({ params }: Params) {
  const series = getSeries((await params).series);
  if (!series) notFound();
  const { entries } = series;

  return (
    <>
      <header className="series-head">
        <p className="series-head__eyebrow">
          <Link href="/series">Series</Link>
        </p>
        <h1 className="series-head__title">{series.name}</h1>
        <p className="series-head__subtitle">{series.subtitle}</p>
        {series.meaning ? <p className="series-head__meaning">{series.meaning}</p> : null}
        <div className="series-head__intro prose">
          {series.introduction.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <dl className="series-head__meta">
          <div>
            <dt>Status</dt>
            <dd>{series.status}</dd>
          </div>
          <div>
            <dt>Begun</dt>
            <dd>{series.began}</dd>
          </div>
          <div>
            <dt>Entries</dt>
            <dd>{entries.length ? pad(entries.length) : "—"}</dd>
          </div>
        </dl>
      </header>

      <Rule label="Entries" />

      {entries.length ? (
        <div className="entries">
          {entries.map((entry, i) => (
            <article className={`entry-row${i === 0 ? " entry-row--lead" : ""}`} key={entry.slug}>
              <Link className="entry-row__link" href={entryHref(series, entry)}>
                <div className="entry-row__text">
                  <p className="entry-row__num">
                    {entry.number} <em aria-hidden="true">—</em>
                  </p>
                  <h2 className="entry-row__title">{entry.title}</h2>
                  <p className="entry-row__place">{entry.location}</p>
                  <p className="entry-row__standfirst">{entry.standfirst}</p>
                  <p className="entry-row__meta">
                    {entry.dateline}
                    {entry.duration ? ` · ${entry.duration}` : ""}
                  </p>
                  <span className="link link--quiet">Read the entry</span>
                </div>
                <div className="entry-row__plate">
                  <Figure image={entry.hero} layout={i === 0 ? "lead" : "row"} eager={i === 0} />
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="series-empty">
          The first entries in this series are being made. They will appear here as the work is finished.
        </p>
      )}

      {series.forthcoming?.length ? (
        <section className="forthcoming" aria-labelledby="forthcoming-title">
          <Rule label="Forthcoming" />
          <h2 className="visually-hidden" id="forthcoming-title">
            Forthcoming entries
          </h2>
          <ul className="forthcoming__list">
            {series.forthcoming.map((f) => (
              <li className="forthcoming__item" key={f.number}>
                <p className="forthcoming__num">
                  {f.number} <em aria-hidden="true">—</em> <span>{f.title}</span>
                </p>
                <p className="forthcoming__note">{f.note}</p>
                <p className="forthcoming__status">{f.status || "Planned"}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
