import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { highlights, stats } from "../data/content";
import SectionHeading from "./ui/SectionHeading";
import SpotlightCard from "./ui/SpotlightCard";
import Counter from "./ui/Counter";
import { highlightIcons } from "./ui/icons";

const statement =
  "I'm a driven technophile who turns curiosity into working software. From Android apps to neural networks, I love the moment a hard problem finally clicks, and I'm looking for a challenging role where I can keep building, learning and shipping.";

/** A single word whose opacity is tied to scroll progress. */
function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const y = useTransform(progress, range, [6, 0]);
  return (
    <motion.span style={{ opacity, y }} className="mr-[0.25em] inline-block">
      {children}
    </motion.span>
  );
}

function ScrollRevealParagraph({ text }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className="font-display text-2xl font-medium leading-snug tracking-tight md:text-4xl lg:text-[2.8rem]">
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}

const card = {
  hidden: { opacity: 0, y: 40 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

export default function About() {
  return (
    <section id="about" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeading index="01" label="About" title="A little about me." />

        <ScrollRevealParagraph text={statement} />

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              variants={card}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              className="group bg-ink p-6 transition-colors duration-500 hover:bg-surface md:p-10"
            >
              <div className="font-display text-5xl font-bold tracking-tighter md:text-7xl">
                <Counter to={s.value} />
                <span className="text-accent">{s.suffix}</span>
              </div>
              <div className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-muted transition-colors group-hover:text-white">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Highlights bento */}
        <div className="mt-6 grid gap-4 md:grid-cols-6">
          {highlights.map((h, i) => {
            const Icon = highlightIcons[h.icon];
            const span = i < 2 ? "md:col-span-3" : "md:col-span-2";
            return (
              <SpotlightCard
                key={h.title}
                custom={i}
                variants={card}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                className={`group p-7 ${span}`}
              >
                <div className="mb-10 flex items-start justify-between">
                  <motion.span
                    whileHover={{ rotate: -12, scale: 1.1 }}
                    className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-xl text-accent"
                  >
                    <Icon />
                  </motion.span>
                  <span className="font-mono text-xs text-muted">0{i + 1}</span>
                </div>
                <h3 className="font-display text-xl font-semibold">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{h.text}</p>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
