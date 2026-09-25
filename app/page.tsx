import Link from "next/link";
import { Figure, Rule } from "@/components/Figure";
import { entryHref, getAllSeries, getSite } from "@/lib/content";

export default function HomePage() {
  const site = getSite();
  const home = site.home;
  const series = getAllSeries();
  const featuredSeries = series.find((s) => s.slug === home.featured.series);
  const featuredEntry = featuredSeries?.entries.find((e) => e.slug === home.featured.entry);
  const href = featuredSeries && featuredEntry ? entryHref(featuredSeries, featuredEntry) : "";

  return (
    <>
      <section className="opening">
        <h1 className="wordmark wordmark--display">{site.title}</h1>
        <p className="opening__statement">{home.statement}</p>
        <div className="opening__intro">
          {home.introduction.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {featuredSeries && featuredEntry ? (
        <section className="featured" aria-labelledby="featured-title">
          <Rule label={home.featured.note || "Current"} />

          <div className="featured__head">
            <p className="featured__series">
              <Link href={`/series/${featuredSeries.slug}`}>{featuredSeries.name}</Link> <span>{featuredSeries.subtitle}</span>
            </p>
            <h2 className="featured__title" id="featured-title">
              <Link href={href}>
                <span className="featured__number">{featuredEntry.number}</span>{" "}
                <span className="featured__em" aria-hidden="true">
                  —
                </span>{" "}
                <span className="featured__name">{featuredEntry.title}</span>
              </Link>
            </h2>
          </div>

          <Link className="featured__plate" href={href} tabIndex={-1} aria-hidden="true">
            <Figure image={featuredEntry.hero} layout="bleed" eager />
          </Link>

          <div className="featured__foot">
            <p className="featured__standfirst">{featuredEntry.standfirst}</p>
            <p className="featured__meta">
              {featuredEntry.location} · {featuredEntry.dateline}
            </p>
            <p className="featured__link">
              <Link className="link" href={href}>
                Read the entry
              </Link>
            </p>
          </div>
        </section>
      ) : null}

      <section className="home-series" aria-labelledby="home-series-title">
        <Rule label="Series" />
        <h2 className="visually-hidden" id="home-series-title">
          Series
        </h2>
        <ul className="home-series__list">
          {series.map((s) => (
            <li key={s.slug}>
              <Link href={`/series/${s.slug}`}>
                <span className="home-series__name">{s.name}</span>
                <span className="home-series__subtitle">{s.subtitle}</span>
                <span className="home-series__count">
                  {s.entries.length ? `${s.entries.length} ${s.entries.length === 1 ? "entry" : "entries"}` : s.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="home-series__note">{home.closing}</p>
      </section>
    </>
  );
}
