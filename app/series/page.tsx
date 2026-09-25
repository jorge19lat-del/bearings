import type { Metadata } from "next";
import Link from "next/link";
import { Figure } from "@/components/Figure";
import { entryHref, getAllSeries, getSite, pad } from "@/lib/content";

const page = getSite().seriesIndex;

export const metadata: Metadata = {
  title: page.title,
  description: page.standfirst,
  alternates: { canonical: "/series" },
  openGraph: { title: page.title, description: page.standfirst, url: "/series" },
};

export default function SeriesIndexPage() {
  const series = getAllSeries();

  return (
    <>
      <header className="page-head">
        <h1 className="page-head__title">{page.title}</h1>
        <p className="page-head__standfirst">{page.standfirst}</p>
        <div className="page-head__intro">
          {page.introduction.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </header>

      <div className="index">
        {series.map((s, i) => (
          <article className="index__row" key={s.slug}>
            <div className="index__num" aria-hidden="true">
              {pad(i + 1)}
            </div>
            <div className="index__body">
              <h2 className="index__name">
                <Link href={`/series/${s.slug}`}>{s.name}</Link>
              </h2>
              <p className="index__subtitle">{s.subtitle}</p>
              <p className="index__standfirst">{s.standfirst}</p>
              <dl className="index__meta">
                <div>
                  <dt>Status</dt>
                  <dd>{s.status}</dd>
                </div>
                <div>
                  <dt>Begun</dt>
                  <dd>{s.began}</dd>
                </div>
                <div>
                  <dt>Entries</dt>
                  <dd>{s.entries.length ? pad(s.entries.length) : "—"}</dd>
                </div>
              </dl>
              {s.entries.length ? (
                <ul className="index__entries">
                  {s.entries.map((e) => (
                    <li key={e.slug}>
                      <Link href={entryHref(s, e)}>
                        <span>{e.number}</span> <em>—</em> {e.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="index__empty">First entries in preparation.</p>
              )}
            </div>
            <div className="index__plate">
              <Link href={`/series/${s.slug}`} tabIndex={-1} aria-hidden="true">
                <Figure image={s.cover} layout="index" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
