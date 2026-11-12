import { useEffect, useRef } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { FiAward, FiCheck, FiGitPullRequest, FiZap } from "react-icons/fi";
import { achievements } from "../data/content";
import SectionHeading from "./ui/SectionHeading";
import SpotlightCard from "./ui/SpotlightCard";
import Counter from "./ui/Counter";

const ease = [0.22, 1, 0.36, 1];

/** Rank that counts *down* from the field size to the final position, e.g. #50,000 → #237. */
function RankCountdown({ from, to }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || !ref.current) return;
    if (reduce) {
      ref.current.textContent = to.toLocaleString("en-US");
      return;
    }
    const controls = animate(from, to, {
      duration: 2.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString("en-US");
      },
    });
    return () => controls.stop();
  }, [inView, from, to, reduce]);

  // Final value is the server/no-JS fallback and what screen readers get.
  return <span ref={ref}>{to.toLocaleString("en-US")}</span>;
}

/**
 * Contribution-graph style grid: one square per merged PR, lighting up in a wave.
 * Intensity varies deterministically so it looks organic but never changes between renders.
 */
function PRGraph({ count }) {
  const levels = ["bg-accent/30", "bg-accent/55", "bg-accent/80", "bg-accent"];
  return (
    <motion.div
      aria-hidden
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ staggerChildren: 0.012, delayChildren: 0.4 }}
      className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1 sm:gap-1.5"
    >
      {Array.from({ length: count }, (_, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, scale: 0.4 },
            show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 20 } },
          }}
          // Knuth multiplicative hash -> 0..3: scattered, but identical on every render
          className={`aspect-square rounded-[3px] ${levels[(Math.imul(i + 1, 2654435761) >>> 30) & 3]}`}
        />
      ))}
    </motion.div>
  );
}

function GssocCard({ data }) {
  const topPercent = (data.rank / data.participants) * 100; // 0.47
  return (
    <SpotlightCard
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, ease }}
      className="relative flex flex-col overflow-hidden p-7 md:p-10 lg:row-span-2"
    >
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.span
            whileHover={{ rotate: -12, scale: 1.08 }}
            className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent via-cyan to-violet text-2xl text-on-accent shadow-[0_20px_50px_-15px_rgba(200,255,61,0.6)]"
          >
            <FiAward />
          </motion.span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-fg">{data.label}</p>
            <h3 className="font-display text-2xl font-semibold md:text-3xl">{data.title}</h3>
            <p className="text-sm text-muted">{data.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Rank */}
      <div className="relative mt-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Global rank</p>
        <p className="mt-1 font-display text-7xl font-bold leading-none tracking-tighter md:text-8xl" aria-label={`Rank ${data.rank}`}>
          <span className="text-accent-fg">#</span>
          <RankCountdown from={data.participants} to={data.rank} />
        </p>
        <p className="mt-3 text-muted">
          of <span className="font-medium text-fg">{data.participants.toLocaleString("en-US")}+</span> participants worldwide
        </p>

        {/* Percentile bar */}
        <div className="mt-6">
          <div className="mb-2 flex justify-between font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            <span>Field</span>
            <span className="text-accent-fg">Top {topPercent.toFixed(1)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-fg/[0.06]">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 - topPercent / 100 }}
              viewport={{ once: true }}
              transition={{ duration: 2.2, delay: 0.3, ease }}
              className="h-full origin-left rounded-full bg-gradient-to-r from-violet via-cyan to-accent"
            />
          </div>
        </div>
      </div>

      {/* Merged PRs */}
      <div className="relative mt-10 border-t border-line pt-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Merged pull requests</p>
            <p className="mt-1 flex items-center gap-3 font-display text-5xl font-bold tracking-tighter">
              <FiGitPullRequest className="text-3xl text-accent-fg" />
              <span>
                <Counter to={data.mergedPRs} />
                <span className="text-accent-fg">+</span>
              </span>
            </p>
          </div>
        </div>
        <PRGraph count={data.mergedPRs} />
      </div>

      <p className="relative mt-8 text-sm leading-relaxed text-muted">{data.text}</p>
    </SpotlightCard>
  );
}

function HackathonCard({ data }) {
  return (
    <SpotlightCard
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: 0.1, ease }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden p-7 md:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-xl text-accent-fg transition-colors duration-500 group-hover:bg-accent group-hover:text-on-accent">
          <FiZap className="transition-transform duration-500 group-hover:scale-110" />
        </span>

        {/* Animated gradient badge */}
        <span className="relative overflow-hidden rounded-full p-[1.5px]">
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 aspect-square w-[180%] -translate-x-1/2 -translate-y-1/2 animate-[spin_5s_linear_infinite] bg-[conic-gradient(var(--color-accent),var(--color-cyan),var(--color-violet),var(--color-accent))]"
          />
          <span className="relative flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.15em]">
            <FiAward className="text-accent-fg" />
            {data.badge}
          </span>
        </span>
      </div>

      <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.22em] text-accent-fg">{data.label}</p>
      <h3 className="mt-1 font-display text-2xl font-semibold">{data.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{data.text}</p>
    </SpotlightCard>
  );
}

function CertificationsCard({ items }) {
  return (
    <SpotlightCard
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: 0.2, ease }}
      className="p-7 md:p-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold">Certifications</h3>
        <span className="font-mono text-xs text-muted">{String(items.length).padStart(2, "0")}</span>
      </div>
      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
        className="space-y-1"
      >
        {items.map((c) => (
          <motion.li
            key={c.course}
            variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease } } }}
            className="group flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-fg/[0.04]"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-sm text-accent-fg transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
              <FiCheck />
            </span>
            <span className="min-w-0">
              <span className="block font-medium leading-snug">{c.course}</span>
              <span className="block font-mono text-xs text-muted">{c.provider}</span>
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </SpotlightCard>
  );
}

export default function Achievements() {
  const { gssoc, hackathon, certifications } = achievements;
  return (
    <section id="achievements" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeading
          index="06"
          label="Achievements"
          title="Recognition along the way."
          desc="Open-source milestones, hackathon wins and the courses that sharpened my craft."
        />
        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <GssocCard data={gssoc} />
          <HackathonCard data={hackathon} />
          <CertificationsCard items={certifications} />
        </div>
      </div>
    </section>
  );
}
