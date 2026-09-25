import NextImage from "next/image";
import type { CSSProperties } from "react";
import { assetExists, type Image } from "@/lib/content";

const RATIOS: Record<string, [number, number]> = {
  "3x2": [3, 2],
  "4x5": [4, 5],
  "1x1": [1, 1],
  "16x9": [16, 9],
  "5x4": [5, 4],
  "2x3": [2, 3],
};

/* How wide each layout is actually drawn, so the browser fetches the right file. */
const SIZES: Record<string, string> = {
  bleed: "100vw",
  full: "100vw",
  wide: "(min-width: 82rem) 76rem, 92vw",
  lead: "(min-width: 62rem) 60vw, 92vw",
  row: "(min-width: 62rem) 40vw, 92vw",
  index: "(min-width: 62rem) 30vw, 92vw",
  inset: "(min-width: 48rem) 44vw, 80vw",
  pair: "(min-width: 48rem) 46vw, 92vw",
};

type Props = {
  image?: Image;
  layout?: string;
  /** Above the fold: fetched first, never lazily. */
  eager?: boolean;
};

/**
 * Photography. When the file exists in /public it is served through Vercel's image
 * optimisation (AVIF/WebP, responsive widths, lazy by default). When it does not, the
 * slot is held open at the correct ratio with its brief, so the rhythm of the page
 * survives the absence of the picture. Drop the file in and redeploy.
 */
export function Figure({ image, layout = "wide", eager = false }: Props) {
  if (!image) return null;
  const ratioKey = image.ratio && RATIOS[image.ratio] ? image.ratio : "3x2";
  const [w, h] = RATIOS[ratioKey];
  const tone = Number.isInteger(image.tone) ? image.tone : 3;
  const style = { "--ratio": `${w} / ${h}` } as CSSProperties;

  return (
    <figure className={`figure figure--${layout}`} data-ratio={ratioKey} style={style}>
      {assetExists(image.src) ? (
        <NextImage
          src={image.src!}
          alt={image.alt ?? ""}
          width={w * 800}
          height={h * 800}
          sizes={SIZES[layout] ?? SIZES.wide}
          preload={eager}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          quality={80}
        />
      ) : (
        <div className="plate" role="img" aria-label={image.alt || image.note || "Photograph"} data-tone={tone}>
          <span className="plate__meta">{image.note || image.alt || "Photograph"}</span>
        </div>
      )}
      {image.caption ? <figcaption>{image.caption}</figcaption> : null}
    </figure>
  );
}

export function Meta({ items }: { items: ({ label: string; value?: string } | false | undefined)[] }) {
  return (
    <dl className="meta">
      {items
        .filter((i): i is { label: string; value: string } => Boolean(i && i.value))
        .map((i) => (
          <div className="meta__row" key={i.label}>
            <dt>{i.label}</dt>
            <dd>{i.value}</dd>
          </div>
        ))}
    </dl>
  );
}

export function Rule({ label }: { label?: string }) {
  return label ? (
    <div className="rule rule--labelled">
      <span>{label}</span>
    </div>
  ) : (
    <div className="rule" />
  );
}
