import { motion, useScroll, useTransform } from "motion/react";
import { skills } from "../data/content";

const rowA = ["Android", "Machine Learning", "Data Science", "C++", "Kotlin", "Python", "React"];
// Unique skill names for the second row.
const rowB = [...new Set(skills.flatMap((g) => g.skills.map((s) => s.name.trim())))].slice(0, 14);

function Row({ items, reverse, outlined }) {
  return (
    <div className="group flex overflow-hidden">
      <div
        className={`flex shrink-0 items-center gap-10 pr-10 group-hover:[animation-play-state:paused] ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            <span
              className={`font-display text-4xl font-semibold uppercase tracking-tight md:text-6xl ${
                outlined ? "text-outline" : "text-white"
              }`}
            >
              {item}
            </span>
            <span className="text-2xl text-accent md:text-4xl">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Two counter-scrolling tickers, slightly skewed by scroll position. */
export default function Marquee() {
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 0.3], [-3, 0]);

  return (
    <motion.section aria-label="Focus areas" style={{ rotate }} className="relative -mx-4 space-y-4 border-y border-line bg-surface/60 py-8 backdrop-blur-sm">
      <Row items={rowA} />
      <Row items={rowB} reverse outlined />
    </motion.section>
  );
}
