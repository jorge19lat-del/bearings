import { ImageResponse } from "next/og";
import { getSite } from "@/lib/content";

export const alt = "BEARINGS — Stories about people who have found their own way of being in the world.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The share card: the wordmark and the statement, on paper. Generated at build time. */
export default function OpengraphImage() {
  const site = getSite();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          background: "#f2eee6",
          color: "#17140f",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 20, letterSpacing: 6, textTransform: "uppercase", color: "#6d655a" }}>
          An independent editorial project
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 168, letterSpacing: 4, lineHeight: 1 }}>{site.title}</div>
          <div style={{ marginTop: 36, fontSize: 38, maxWidth: 900, lineHeight: 1.3, color: "#3a342b" }}>
            {site.tagline}
          </div>
        </div>
        <div style={{ display: "flex", height: 1, background: "#c9c0b1" }} />
      </div>
    ),
    size
  );
}
