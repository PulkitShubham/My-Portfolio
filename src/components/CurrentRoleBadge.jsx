import { motion } from "motion/react";
import { FiArrowDownRight } from "react-icons/fi";
import { profile } from "../data/content";
import { scrollToId } from "../lib/scroll";
import ThemedImage from "./ui/ThemedImage";

// Nielsen's brand colours, taken from the logo SVG. Used as a short beam that
// travels around the card border rather than a full rainbow ring.
const BEAM = "conic-gradient(from 0deg, transparent 0deg, transparent 250deg, #6E37FA 290deg, #F40953 320deg, #FF9408 345deg, #32BBB9 360deg)";

/**
 * Hero card for the current role.
 *   Row 1: live "now" status + company logo
 *   Row 2: short role title (e.g. "MTS-1")
 * A light beam orbits the border; the whole card scrolls to Experience.
 * `motionProps` carries the hero's staggered entrance animation.
 */
export default function CurrentRoleBadge({ motionProps }) {
  const { title, fullTitle, company, logo } = profile.current;

  return (
    <motion.div {...motionProps} className="group relative mb-8 inline-block">
      <motion.button
        onClick={() => scrollToId("experience")}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        aria-label={`Currently ${fullTitle} at ${company}. View experience`}
        className="relative block overflow-hidden rounded-2xl p-px text-left shadow-xl shadow-black/40 light:shadow-black/[0.06]"
      >
        {/* Static hairline border */}
        <span aria-hidden className="absolute inset-0 rounded-2xl bg-fg/10" />
        {/* Travelling beam: oversized conic square spinning behind a 1px gap */}
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2 animate-[spin_5s_linear_infinite] group-hover:animate-[spin_2.5s_linear_infinite]"
          style={{ background: BEAM }}
        />

        <span className="relative flex items-center gap-5 rounded-[15px] bg-surface/95 px-4 py-3 backdrop-blur-xl sm:px-5">
          {/* Faint dotted texture on the card face */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[15px] opacity-40"
            style={{
              backgroundImage: "radial-gradient(color-mix(in oklab, var(--color-fg) 12%, transparent) 1px, transparent 1px)",
              backgroundSize: "10px 10px",
              maskImage: "linear-gradient(to left, black, transparent 60%)",
              WebkitMaskImage: "linear-gradient(to left, black, transparent 60%)",
            }}
          />

          <span className="relative flex flex-col gap-2">
            {/* Row 1: status + logo */}
            <span className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-accent-fg">
                <span className="relative flex h-1.5 w-1.5" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-fg opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-fg" />
                </span>
                Now
              </span>
              <ThemedImage src={logo} alt={company} className="h-3.5 w-auto sm:h-4" />
            </span>

            {/* Row 2: role */}
            <span className="flex items-center gap-2 font-display text-base font-semibold leading-none text-fg sm:text-lg">
              {title}
            </span>
          </span>

          {/* Arrow */}
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-fg/10 text-fg/60 transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
            <FiArrowDownRight className="transition-transform duration-300 group-hover:-rotate-45" />
          </span>
        </span>
      </motion.button>
    </motion.div>
  );
}
