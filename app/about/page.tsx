import type { Metadata } from "next";
import { Rule } from "@/components/Figure";
import { getSite } from "@/lib/content";

const about = getSite().about;

export const metadata: Metadata = {
  title: about.title,
  description: about.standfirst,
  alternates: { canonical: "/about" },
  openGraph: { title: about.title, description: about.standfirst, url: "/about" },
};

function Block({ block }: { block?: { label: string; text: string[] } }) {
  if (!block) return null;
  return (
    <section className="about__block">
      <Rule label={block.label} />
      <h2 className="visually-hidden">{block.label}</h2>
      <div className="about__blockText prose">
        {block.text.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <header className="page-head page-head--about">
        <h1 className="page-head__title">{about.title}</h1>
        <p className="page-head__standfirst">{about.standfirst}</p>
      </header>

      <div className="manifesto">
        {about.manifesto.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      <Block block={about.name} />
      <Block block={about.method} />
      <Block block={about.colophon} />
    </>
  );
}
