import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import {
  FiActivity,
  FiArrowUpRight,
  FiBell,
  FiHome,
  FiLayers,
  FiShield,
  FiSmartphone,
  FiTrendingUp,
} from "react-icons/fi";
import { experience } from "../data/content";
import SectionHeading from "./ui/SectionHeading";
import { formatDuration, formatMonthYear as fmt, monthsBetween } from "../lib/dates";
import SpotlightCard from "./ui/SpotlightCard";
import ThemedImage from "./ui/ThemedImage";

const ease = [0.22, 1, 0.36, 1];

function RoleCard({ role, index }) {
  const current = role.end === null;
  return (
    <SpotlightCard
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease }}
      className="p-6 md:p-8"
    >
      <div className="flex flex-wrap items-center gap-3">
        {current && (
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-on-accent">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-on-accent opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-on-accent" />
            </span>
            Current
          </span>
        )}
        <span className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-fg/70">
          {role.type}
        </span>
      </div>

      <h3 className="mt-5 font-display text-2xl font-semibold leading-tight md:text-3xl">{role.title}</h3>
      <p className="mt-2 font-mono text-sm text-muted">
        {fmt(role.start)} — {current ? "Present" : fmt(role.end)}
        <span className="mx-2 text-fg/20">·</span>
        {formatDuration(monthsBetween(role.start, role.end))}
      </p>

      {role.points.length > 0 && (
        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.08, delayChildren: 0.2 }}
          className="mt-6 space-y-3"
        >
          {role.points.map((p) => (
            <motion.li
              key={p}
              variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease } } }}
              className="flex gap-3 text-sm leading-relaxed text-fg/75"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {p}
            </motion.li>
          ))}
        </motion.ul>
      )}

      {role.tags.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {role.tags.map((t) => (
            <li key={t} className="rounded-full border border-line bg-fg/[0.03] px-3 py-1 font-mono text-xs text-fg/80">
              {t}
            </li>
          ))}
        </ul>
      )}
    </SpotlightCard>
  );
}

const contributionIcons = {
  layers: FiLayers,
  home: FiHome,
  shield: FiShield,
  bell: FiBell,
  activity: FiActivity,
  phone: FiSmartphone,
};

/** Grid of contribution cards that stagger in, each with an icon that spins up on hover. */
function Contributions({ items }) {
  if (!items?.length) return null;
  return (
    <div className="mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease }}
        className="mb-8 flex items-end justify-between gap-6"
      >
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent-fg">Impact</p>
          <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">Key contributions</h3>
        </div>
        <span className="hidden font-mono text-sm text-muted sm:block">{String(items.length).padStart(2, "0")} highlights</span>
      </motion.div>

      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((c, i) => {
          const Icon = contributionIcons[c.icon] ?? FiLayers;
          return (
            <li key={c.title} className="h-full">
              <SpotlightCard
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease }}
                whileHover={{ y: -6 }}
                className="group flex h-full flex-col p-7"
              >
                <div className="mb-8 flex items-start justify-between">
                  <span className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-accent/10 text-xl text-accent-fg transition-colors duration-500 group-hover:bg-accent group-hover:text-on-accent">
                    <Icon className="transition-transform duration-500 group-hover:rotate-[-12deg] group-hover:scale-110" />
                  </span>
                  <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h4 className="font-display text-xl font-semibold leading-snug">{c.title}</h4>
                <p className="mt-3 text-sm leading-relaxed text-muted">{c.text}</p>
                {c.tags.length > 0 && (
                  <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
                    {c.tags.map((t) => (
                      <li key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-fg/70">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </SpotlightCard>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CompanyBlock({ company }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.6"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });

  const last = company.roles[company.roles.length - 1];
  const tenure = formatDuration(monthsBetween(last.start, company.roles[0].end));

  return (
    <div>
    <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
      {/* Company panel (sticky on desktop) */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease }}
        className="self-start lg:sticky lg:top-28"
      >
        {company.logo ? (
          <motion.h3
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative inline-flex overflow-hidden rounded-3xl border border-line bg-fg/[0.03] px-7 py-6 shadow-[0_20px_60px_-20px_rgba(110,55,250,0.55)]"
          >
            {/* Soft glow in the logo's own brand colours */}
            <span
              aria-hidden
              className="absolute -inset-10 bg-[radial-gradient(circle_at_20%_50%,rgba(110,55,250,0.25),transparent_55%),radial-gradient(circle_at_80%_50%,rgba(50,187,185,0.18),transparent_55%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
            />
            <ThemedImage src={company.logo} alt={company.company} className="relative h-9 w-auto md:h-10" />
          </motion.h3>
        ) : (
          <h3 className="font-display text-4xl font-semibold tracking-tight">{company.company}</h3>
        )}
        <p className="mt-6 font-mono text-sm text-muted">
          {fmt(last.start)} — {company.roles[0].end ? fmt(company.roles[0].end) : "Present"}
        </p>
        <p className="mt-1 font-mono text-sm text-accent-fg">{tenure}</p>
        {company.stack?.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Stack</p>
            <motion.ul
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.06, delayChildren: 0.3 }}
              className="flex max-w-xs flex-wrap gap-2"
            >
              {company.stack.map((s) => (
                <motion.li
                  key={s}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8, y: 8 },
                    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } },
                  }}
                  className="rounded-full border border-line bg-fg/[0.03] px-3 py-1 font-mono text-xs text-fg/80"
                >
                  {s}
                </motion.li>
              ))}
            </motion.ul>
          </div>
        )}
        {company.url && (
          <a
            href={company.url}
            target="_blank"
            rel="noreferrer"
            className="group mt-6 inline-flex items-center gap-2 text-sm text-fg/70 transition-colors hover:text-accent-fg"
          >
            Visit {company.company}
            <FiArrowUpRight className="transition-transform duration-300 group-hover:rotate-45" />
          </a>
        )}
      </motion.div>

      {/* Role stepper */}
      <div ref={ref} className="relative pl-10 md:pl-14">
        <div className="absolute left-3 top-2 h-[calc(100%-1rem)] w-px bg-line md:left-5" />
        <motion.div
          style={{ scaleY }}
          className="absolute left-3 top-2 h-[calc(100%-1rem)] w-px origin-top bg-gradient-to-b from-accent via-cyan to-violet md:left-5"
        />

        <ol className="space-y-6">
          {company.roles.map((role, i) => (
            <li key={role.title} className="relative">
              <motion.span
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, amount: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                // Line sits at left-3/md:left-5 of the wrapper; li is inset by pl-10/md:pl-14.
                className="absolute -left-7 top-8 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full border border-accent bg-ink md:-left-9"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    role.end === null ? "bg-accent shadow-[0_0_20px_4px_rgba(200,255,61,0.6)]" : "bg-fg/40"
                  }`}
                />
              </motion.span>

              <RoleCard role={role} index={i} />

              {/* Promotion marker between consecutive roles at the same company */}
              {i < company.roles.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent-fg"
                >
                  <motion.span
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    className="grid h-7 w-7 place-items-center rounded-full bg-accent/10"
                  >
                    <FiTrendingUp />
                  </motion.span>
                  Promoted
                </motion.div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
    <Contributions items={company.contributions} />
    </div>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeading
          index="02"
          label="Experience"
          title="Where I've worked."
          desc="From intern to full-time engineer: the teams and roles that shaped how I build software."
        />
        <div className="space-y-24">
          {experience.map((c) => (
            <CompanyBlock key={c.company} company={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
