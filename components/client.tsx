"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const isCurrent = (href: string, path: string) => (href === "/" ? path === "/" : path.startsWith(href));

export function Nav({ items }: { items: { label: string; href: string }[] }) {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="Main">
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} aria-current={isCurrent(item.href, path) ? "page" : undefined}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The small amount of behaviour the site needs, re-applied on each page:
 * the masthead wordmark waits until the home opening has passed; photographs
 * arrive rather than appear; the margin index follows the section being read.
 * Writing is never hidden, and all of it respects reduced motion.
 */
export function Behaviour() {
  const path = usePathname();

  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const opening = document.querySelector<HTMLElement>(".opening");
    if (opening) {
      const onScroll = () => document.body.classList.toggle("is-scrolled", window.scrollY > opening.offsetHeight * 0.5);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => {
        window.removeEventListener("scroll", onScroll);
        document.body.classList.remove("is-scrolled");
      });
    }

    if ("IntersectionObserver" in window && !reduced) {
      const show = (el: Element) => el.classList.add("is-visible");
      const revealer = new IntersectionObserver(
        (items) =>
          items.forEach((item) => {
            if (item.isIntersecting) {
              show(item.target);
              revealer.unobserve(item.target);
            }
          }),
        { rootMargin: "240px 0px 0px 0px" }
      );
      document.querySelectorAll(".figure:not(.reveal)").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 1.25) return;
        el.classList.add("reveal");
        revealer.observe(el);
      });
      const showAll = () => document.querySelectorAll(".figure.reveal").forEach(show);
      const failsafe = window.setTimeout(showAll, 2500);
      window.addEventListener("beforeprint", showAll);
      cleanups.push(() => {
        revealer.disconnect();
        window.clearTimeout(failsafe);
        window.removeEventListener("beforeprint", showAll);
      });
    }

    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".margin-index a[data-target]"));
    if (links.length && "IntersectionObserver" in window) {
      const pairs = links
        .map((link) => ({ link, section: document.getElementById(link.dataset.target!) }))
        .filter((p): p is { link: HTMLAnchorElement; section: HTMLElement } => Boolean(p.section));
      const spy = new IntersectionObserver(
        (items) =>
          items.forEach((item) => {
            if (item.isIntersecting)
              pairs.forEach((p) => p.link.classList.toggle("is-current", p.section === item.target));
          }),
        { rootMargin: "-45% 0px -45% 0px" }
      );
      pairs.forEach((p) => spy.observe(p.section));
      cleanups.push(() => spy.disconnect());
    }

    return () => cleanups.forEach((fn) => fn());
  }, [path]);

  return null;
}
