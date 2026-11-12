import { motion } from "motion/react";
import { FiArrowDownRight } from "react-icons/fi";
import { profile } from "../data/content";
import { scrollToId } from "../lib/scroll";
import ThemedImage from "./ui/ThemedImage";

// Nielsen's brand colours, taken from the logo SVG.
const BRAND_GRADIENT = "conic-gradient(from 0deg, #6E37FA, #F40953, #FF9408, #32BBB9, #6E37FA)";

/**
 * Hero feature badge for the current role: rotating brand-gradient border,
 * ambient glow, shimmer sweep and a lift on hover. Scrolls to Experience.
 * `motionProps` carries the hero's staggered entrance animation.
 */
export default function CurrentRoleBadge({ motionProps }) {
  const { title, fullTitle, company, logo } = profile.current;

  return (
    <motion.div {...motionProps} className="group relative mb-10 inline-block">
      {/* Ambient glow behind the badge */}
      <div
        aria-hidden
        className="absolute -inset-3 rounded-full opacity-35 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: BRAND_GRADIENT }}
      />

      <motion.button
        onClick={() => scrollToId("experience")}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        aria-label={`Currently ${fullTitle} at ${company}. View experience`}
        className="relative block overflow-hidden rounded-full p-[1.5px] shadow-2xl shadow-black/50"
      >
        {/* Rotating gradient border: an oversized conic square spinning behind a 1.5px gap */}
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2 animate-[spin_6s_linear_infinite]"
          style={{ background: BRAND_GRADIENT }}
        />

        <span className="relative flex items-center gap-3 rounded-full bg-ink/95 py-2 pl-2 pr-3 backdrop-blur-xl sm:gap-4 sm:pr-4">
          {/* Shimmer sweep */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-fg/10 to-transparent"
            animate={{ x: ["0%", "450%"] }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
          />

          {/* Logo panel */}
          <span className="relative flex h-11 items-center rounded-full bg-fg/[0.06] px-4 ring-1 ring-fg/10 sm:h-12 sm:px-5">
            <ThemedImage src={logo} className="h-4 w-auto transition-transform duration-500 group-hover:scale-110 sm:h-5" />
          </span>

          {/* Text */}
          <span className="relative flex flex-col items-start text-left leading-tight">
            <span className="flex items-center gap-2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-fg/55">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              {/* The logo already names the company, so small screens drop the repeat */}
              Currently<span className="hidden sm:inline">&nbsp;at {company}</span>
            </span>
            <span className="mt-1 font-display text-base font-semibold text-fg sm:text-lg">
              <span className="sm:hidden">{title}</span>
              <span className="hidden sm:inline">{fullTitle}</span>
            </span>
          </span>

          {/* Arrow */}
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-fg/10 text-fg/60 transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
            <FiArrowDownRight className="transition-transform duration-300 group-hover:rotate-[-45deg]" />
          </span>
        </span>
      </motion.button>
    </motion.div>
  );
}
