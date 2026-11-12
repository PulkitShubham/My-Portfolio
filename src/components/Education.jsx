import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { education } from "../data/content";
import SectionHeading from "./ui/SectionHeading";
import SpotlightCard from "./ui/SpotlightCard";

const ease = [0.22, 1, 0.36, 1];

export default function Education() {
  const ref = useRef(null);
  // The timeline line "draws" itself as the section scrolls through the viewport.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });

  return (
    <section id="education" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeading
          index="04"
          label="Journey"
          title="Where I've learned."
          desc="My education has been a journey of self-discovery and growth."
        />

        <div ref={ref} className="relative">
          {/* Track + animated fill */}
          <div className="absolute left-4 top-0 h-full w-px bg-line md:left-1/2" />
          <motion.div
            style={{ scaleY }}
            className="absolute left-4 top-0 h-full w-px origin-top bg-gradient-to-b from-accent via-cyan to-violet md:left-1/2"
          />

          <ol className="space-y-16">
            {education.map((item, i) => {
              const right = i % 2 === 1;
              return (
                <li key={item.id} className="relative grid md:grid-cols-2 md:gap-16">
                  {/* Node */}
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, amount: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="absolute left-4 top-8 z-10 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full border border-accent bg-ink md:left-1/2"
                  >
                    <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_20px_4px_rgba(200,255,61,0.6)]" />
                  </motion.span>

                  {/* Date on the opposite side (desktop) */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`hidden pt-7 font-mono text-sm uppercase tracking-[0.2em] text-muted md:block ${
                      right ? "md:order-1 md:text-right" : "md:order-2"
                    }`}
                  >
                    {item.date}
                  </motion.div>

                  <SpotlightCard
                    initial={{ opacity: 0, x: right ? 60 : -60, rotate: right ? 2 : -2 }}
                    whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.9, ease }}
                    className={`ml-12 p-6 md:ml-0 md:p-8 ${right ? "md:order-2" : "md:order-1"}`}
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={item.img}
                        alt=""
                        loading="lazy"
                        className="h-14 w-14 shrink-0 rounded-2xl border border-line bg-white object-cover"
                      />
                      <div className="min-w-0">
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted md:hidden">{item.date}</p>
                        <h3 className="font-display text-xl font-semibold leading-tight">{item.school}</h3>
                        <p className="mt-1 text-sm text-fg/70">{item.degree.replace(/\*$/, "").trim()}</p>
                      </div>
                    </div>
                    <p className="mt-5 text-sm leading-relaxed text-muted">{item.desc}</p>
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 font-mono text-xs text-accent-fg">
                      Grade · {item.grade}
                    </div>
                  </SpotlightCard>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
