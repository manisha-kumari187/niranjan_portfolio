"use client";

import { useLayoutEffect } from "react";

/**
 * Typewriter animation measured from the reference recording:
 *  - one character at a time, ~15 ms per character (about 2 characters per
 *    frame of a 30 fps recording)
 *  - a thin vertical cursor sits right after the last typed character and
 *    disappears when the line is finished (it does not blink while typing)
 *  - the hero lines type one after another; the second call-to-action starts
 *    after the first has finished
 *  - page text types in sequence as it scrolls into view
 *
 * Every timing lives in TYPEWRITER so it is easy to fine-tune.
 */
export const TYPEWRITER = {
  charMs: 15, // delay per character
  heroStartMs: 250, // pause after the arrow intro before the hero starts
  stepGapMs: 120, // pause between consecutive hero lines
  statsStaggerMs: 90, // offset between the three hero stats
  scrollGapMs: 220, // pause between consecutive scroll-triggered lines
  viewThreshold: 0.12, // visible portion required before a text group starts
};

// Hero lines, typed in this order.
const HERO_STEPS = [
  ".hero-pretitle",
  ".hero-content h1",
  ".role-tag",
  ".hero-description",
  ".primary-link",
  ".secondary-link",
];
// Hero stats, typed together with a small stagger after the hero lines.
const HERO_STATS = ".hero-stats > div";
// Remaining text groups typed when they scroll into view.
const SCROLL_TARGETS = [
  ".navbar a",
  ".hero-wordmark",
  ".eyebrow",
  ".portrait-topline",
  ".portrait-caption",
  ".portrait-status",
  ".portrait-index",
  ".featured-heading",
  ".featured-card",
  ".tech-tags",
  ".hero-index",
  ".scroll-cue",
  ".section-label",
  ".about-content h2",
  ".about-copy p",
  ".about-copy a",
  ".interest-card",
  ".projects-heading h2",
  ".projects-heading p",
  ".venture-card",
  ".clarification-note",
  ".project-row",
  ".contact-kicker",
  ".contact-section h2",
  ".contact-actions a",
  ".social-links a",
  "footer .brand",
  "footer p",
  "footer > a:last-child",
];

type Prepared = {
  el: HTMLElement;
  chars: HTMLElement[];
  restore: () => void;
};

/**
 * Splits every text node inside `el` into one <tw-c> element per character,
 * all hidden. The text keeps its exact layout (nothing moves while typing).
 * Custom tag names are used on purpose so that existing `span` CSS rules
 * cannot change how the text looks.
 */
function prepare(el: HTMLElement): Prepared {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  const chars: HTMLElement[] = [];
  const swaps: Array<[HTMLElement, Text]> = [];

  for (const node of nodes) {
    if (!node.data.trim()) continue; // keep whitespace-only nodes untouched
    const run = document.createElement("tw-run");
    for (const ch of Array.from(node.data.replace(/[ \t\n\r\f]+/g, " "))) {
      const c = document.createElement("tw-c");
      c.textContent = ch;
      run.appendChild(c);
      chars.push(c);
    }
    node.replaceWith(run);
    swaps.push([run, node]);
  }

  el.classList.add("tw-ready");
  return {
    el,
    chars,
    restore: () => swaps.forEach(([run, node]) => run.replaceWith(node)),
  };
}

export function useTypewriter() {
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    const timers = new Set<number>();
    const rafs = new Set<number>();
    const prepared = new Map<HTMLElement, Prepared>();
    const finished = new Set<HTMLElement>();

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(() => {
          timers.delete(id);
          resolve();
        }, ms);
        timers.add(id);
      });

    const get = (el: HTMLElement | null) => {
      if (!el) return null;
      let p = prepared.get(el);
      if (!p) {
        p = prepare(el);
        prepared.set(el, p);
      }
      return p;
    };

    // Types one prepared element, one character per TYPEWRITER.charMs.
    const type = (p: Prepared | null) =>
      new Promise<void>((resolve) => {
        if (!p || cancelled) return resolve();
        const { chars } = p;
        let shown = 0;
        let cursor: HTMLElement | null = null;
        let start = 0;

        const done = () => {
          cursor?.classList.remove("tw-cur");
          p.restore();
          finished.add(p.el);
          resolve();
        };

        const tick = (now: number) => {
          if (cancelled) return resolve();
          if (!start) start = now;
          const target = Math.min(
            chars.length,
            Math.floor((now - start) / TYPEWRITER.charMs) + 1
          );
          while (shown < target) {
            cursor?.classList.remove("tw-cur");
            cursor = chars[shown];
            cursor.classList.add("tw-on", "tw-cur");
            shown += 1;
          }
          if (shown >= chars.length) return done();
          rafs.add(requestAnimationFrame(tick));
        };

        if (!chars.length) return done();
        rafs.add(requestAnimationFrame(tick));
      });

    // Hide every line right away (before first paint) so nothing flashes.
    const hero = HERO_STEPS.map((s) => get(document.querySelector<HTMLElement>(s)));
    const stats = Array.from(
      document.querySelectorAll<HTMLElement>(HERO_STATS)
    ).map((el) => get(el));
    const scrollEls = SCROLL_TARGETS.flatMap((s) =>
      Array.from(document.querySelectorAll<HTMLElement>(s))
    ).map((el) => get(el)!);

    let started = false;
    let observer: IntersectionObserver | null = null;
    let fallbackTimer = 0;

    const startAnimations = () => {
      if (cancelled || started) return;
      started = true;
      window.clearTimeout(fallbackTimer);
      timers.delete(fallbackTimer);

      // Hero: lines type one after another, then the stats.
      void (async () => {
        await sleep(TYPEWRITER.heroStartMs);
        for (const p of hero) {
          await type(p);
          if (p?.el.matches(".role-tag")) {
            p.el.dispatchEvent(new Event("role-typewriter:start"));
          }
          await sleep(TYPEWRITER.stepGapMs);
        }
        await Promise.all(
          stats.map((p, i) =>
            sleep(i * TYPEWRITER.statsStaggerMs).then(() => type(p))
          )
        );
      })();

      // Reveal other copy only as its section enters the viewport.
      const byEl = new Map(scrollEls.map((p) => [p.el, p]));
      observer = new IntersectionObserver(
        (entries) => {
          entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
            .forEach((e, index) => {
              observer?.unobserve(e.target);
              const p = byEl.get(e.target as HTMLElement) ?? null;
              const id = window.setTimeout(() => {
                timers.delete(id);
                void type(p);
              }, index * TYPEWRITER.scrollGapMs);
              timers.add(id);
            });
        },
        { threshold: TYPEWRITER.viewThreshold, rootMargin: "0px 0px -8% 0px" }
      );
      scrollEls.forEach((p) => observer?.observe(p.el));
    };

    document.addEventListener("portfolio-intro:ready", startAnimations);
    fallbackTimer = window.setTimeout(startAnimations, 6000);
    timers.add(fallbackTimer);

    return () => {
      cancelled = true;
      document.removeEventListener("portfolio-intro:ready", startAnimations);
      observer?.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
      rafs.forEach((id) => cancelAnimationFrame(id));
      // Leave any line that did not finish fully visible.
      prepared.forEach((p) => {
        if (!finished.has(p.el)) p.restore();
      });
    };
  }, []);
}
