import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Off the map",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <header className="page-head">
        <h1 className="page-head__title">Off the map</h1>
        <p className="page-head__standfirst">
          This page is not here — it may have been moved, or it may never have existed.
        </p>
      </header>
      <div className="notfound">
        <Link className="link" href="/series">
          Go to the series
        </Link>
      </div>
    </>
  );
}
