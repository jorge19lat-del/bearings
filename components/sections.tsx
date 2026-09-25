import type { CSSProperties, ReactNode } from "react";
import { Figure } from "@/components/Figure";
import { assetExists, pad, slugify, type Entry, type Image, type Motion, type Section, type StoryBlock } from "@/lib/content";

/**
 * SECTION REGISTRY
 * ----------------
 * Every form of documentation an entry may contain is declared here: a default label
 * and a renderer. An entry shows only the sections it actually has, in the order it
 * lists them, so no two entries need the same shape. To invent a new form — sound,
 * letters, maps — add one key to this object. Nothing else in the site changes.
 */

type Renderer<T extends Section["type"]> = (section: Extract<Section, { type: T }>) => ReactNode;

function StoryBlockView({ block }: { block: StoryBlock }) {
  switch (block.type) {
    case "lead":
      return <p className="story__lead">{block.text}</p>;
    case "subhead":
      return <h3 className="story__subhead">{block.text}</h3>;
    case "break":
      return <hr className="story__break" aria-hidden="true" />;
    case "pullquote":
      return (
        <blockquote className="pullquote">
          <p>{block.text}</p>
          {block.attribution ? <cite>{block.attribution}</cite> : null}
        </blockquote>
      );
    case "figure":
      return <Figure image={block} layout={block.layout || "wide"} />;
    default:
      return <p>{"text" in block ? block.text : null}</p>;
  }
}

function MotionView({ item, kind = "video" }: { item: Motion; kind?: "video" | "film" }) {
  let media: ReactNode;
  const title = item.title || "Video";
  if (item.provider === "vimeo" && item.id) {
    media = (
      <iframe
        src={`https://player.vimeo.com/video/${encodeURIComponent(item.id)}?dnt=1&title=0&byline=0&portrait=0`}
        title={title}
        loading="lazy"
        allow="fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  } else if (item.provider === "youtube" && item.id) {
    media = (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.id)}?rel=0`}
        title={title}
        loading="lazy"
        allow="fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  } else if (item.src && assetExists(item.src)) {
    media = <video controls preload="none" poster={item.poster} src={item.src} />;
  } else {
    media = (
      <div className="plate" role="img" aria-label={title} data-tone={6}>
        <span className="plate__meta">{item.note || title}</span>
      </div>
    );
  }
  return (
    <figure className={`motion motion--${kind}`} style={{ "--ratio": item.ratio === "4x3" ? "4 / 3" : "16 / 9" } as CSSProperties}>
      <div className="motion__frame">{media}</div>
      {item.caption ? <figcaption>{item.caption}</figcaption> : null}
    </figure>
  );
}

/** Consecutive `pair` images are set two across; everything else takes its own line. */
function groupPlates(items: Image[]) {
  const groups: (Image | Image[])[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (item.layout === "pair" && Array.isArray(last)) last.push(item);
    else groups.push(item.layout === "pair" ? [item] : item);
  }
  return groups;
}

export const SECTION_TYPES: { [T in Section["type"]]: { label: string; render: Renderer<T> } } = {
  story: {
    label: "The Story",
    render: (section) => (
      <div className="story prose">
        {section.blocks.map((b, i) => (
          <StoryBlockView block={b} key={i} />
        ))}
      </div>
    ),
  },

  moments: {
    label: "The Moments",
    render: (section) => (
      <div className="moments">
        {section.items.map((item, i) => {
          const stamp = [item.place, item.time].filter(Boolean).join(" · ");
          const isQuote = item.kind === "quote" || Boolean(item.quote);
          return (
            <article
              key={i}
              className={`moment moment--${i % 2 ? "right" : "left"}${isQuote ? " moment--isQuote" : ""}`}
              data-index={pad(i + 1)}
            >
              {stamp ? <p className="moment__stamp">{stamp}</p> : null}
              {isQuote ? (
                <blockquote className="moment__quote">
                  <p>{item.quote || item.text}</p>
                  {item.attribution ? <cite>{item.attribution}</cite> : null}
                </blockquote>
              ) : (
                <p className="moment__text">{item.text}</p>
              )}
            </article>
          );
        })}
      </div>
    ),
  },

  images: {
    label: "The Images",
    render: (section) => (
      <div className="plates">
        {groupPlates(section.items).map((g, i) =>
          Array.isArray(g) ? (
            <div className="plates-pair" key={i}>
              {g.map((img, j) => (
                <Figure image={img} layout="pair" key={j} />
              ))}
            </div>
          ) : (
            <Figure image={g} layout={g.layout || "wide"} key={i} />
          )
        )}
      </div>
    ),
  },

  "field-notes": {
    label: "Field Notes",
    render: (section) => (
      <div className="notes">
        {section.items.map((note, i) => (
          <article className="note" key={i}>
            <header className="note__head">
              <p className="note__date">{note.date}</p>
              {note.place ? <p className="note__place">{note.place}</p> : null}
            </header>
            <div className="note__body">
              {note.lines.map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    ),
  },

  videos: {
    label: "The Videos",
    render: (section) => (
      <div className="videos">
        {section.items.map((item, i) => (
          <MotionView item={item} key={i} />
        ))}
      </div>
    ),
  },

  films: {
    label: "The Films",
    render: (section) => (
      <div className="videos videos--films">
        {section.items.map((item, i) => (
          <MotionView item={item} kind="film" key={i} />
        ))}
      </div>
    ),
  },

  voice: {
    label: "The Voice",
    render: (section) => (
      <div className="voice">
        {section.items.map((item, i) => (
          <article className="voice__track" key={i}>
            <div className="voice__head">
              <h3>{item.title || "Recording"}</h3>
              {item.duration ? <p className="voice__duration">{item.duration}</p> : null}
            </div>
            {item.src && assetExists(item.src) ? <audio controls preload="none" src={item.src} /> : null}
            {item.note ? <p className="voice__note">{item.note}</p> : null}
            {item.transcript ? (
              <div className="voice__transcript prose">
                {item.transcript.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    ),
  },

  interview: {
    label: "The Interview",
    render: (section) => (
      <div className="interview prose">
        {section.preamble ? <p className="interview__preamble">{section.preamble}</p> : null}
        {section.exchanges.map((x, i) => (
          <div className="exchange" key={i}>
            <p className="exchange__q">{x.q}</p>
            {(Array.isArray(x.a) ? x.a : [x.a]).map((a, j) => (
              <p className="exchange__a" key={j}>
                {a}
              </p>
            ))}
          </div>
        ))}
      </div>
    ),
  },
};

const known = (s: Section) => s.type in SECTION_TYPES;

/** The sections an entry actually has, with the label and anchor each will use. */
export const sectionIndex = (entry: Entry) =>
  (entry.sections ?? []).filter(known).map((s) => {
    const label = s.label || SECTION_TYPES[s.type as Section["type"]].label;
    return { section: s, label, id: s.id || slugify(label) };
  });

export function Sections({ entry }: { entry: Entry }) {
  return sectionIndex(entry).map(({ section, label, id }, i) => {
    const render = SECTION_TYPES[section.type as Section["type"]].render as (s: Section) => ReactNode;
    return (
      <section className={`section section--${section.type}`} id={id} key={id} aria-labelledby={`${id}-label`}>
        <header className="section__head">
          <p className="section__index" aria-hidden="true">
            {pad(i + 1)}
          </p>
          <h2 className="section__label" id={`${id}-label`}>
            {label}
          </h2>
          {section.note ? <p className="section__note">{section.note}</p> : null}
        </header>
        <div className="section__body">{render(section)}</div>
      </section>
    );
  });
}
