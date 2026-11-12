import { useState } from "react";
import { motion } from "motion/react";
import { skills } from "../data/content";
import SectionHeading from "./ui/SectionHeading";
import SpotlightCard from "./ui/SpotlightCard";

const ease = [0.22, 1, 0.36, 1];

/** Logo bubble; falls back to the skill's initial if the remote image fails. */
function SkillIcon({ src, name }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="grid h-7 w-7 place-items-center rounded-full bg-white/90 p-1 transition-transform duration-500 group-hover:rotate-[360deg]">
      {failed ? (
        <span className="font-display text-xs font-bold text-ink">{name[0]}</span>
      ) : (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-contain" />
      )}
    </span>
  );
}

// Column spans that tile 7 cards as 2+1+1 / 1+1+2 / 4 on large screens.
const spans = ["lg:col-span-2", "", "", "", "", "lg:col-span-2", "md:col-span-2 lg:col-span-4"];

export default function Skills() {
  return (
    <section id="skills" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeading
          index="02"
          label="Skills"
          title="Tools I think with."
          desc="The languages, frameworks and platforms I've been sharpening over the past two years."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {skills.map((group, gi) => (
            <SpotlightCard
              key={group.title}
              initial={{ opacity: 0, y: 50, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, delay: (gi % 4) * 0.08, ease }}
              className={`p-7 ${spans[gi] ?? ""}`}
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">{group.title}</h3>
                <span className="font-mono text-xs text-muted">
                  {String(group.skills.length).padStart(2, "0")}
                </span>
              </div>

              <motion.ul
                className="flex flex-wrap gap-2"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ staggerChildren: 0.05, delayChildren: 0.2 }}
              >
                {group.skills.map((s) => (
                  <motion.li
                    key={s.name}
                    variants={{
                      hidden: { opacity: 0, y: 12, scale: 0.9 },
                      show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
                    }}
                    whileHover={{ y: -4 }}
                    className="group flex items-center gap-2 rounded-full border border-line bg-white/[0.03] py-1.5 pl-1.5 pr-4 text-sm text-white/80 transition-colors hover:border-accent/50 hover:text-white"
                  >
                    <SkillIcon src={s.image} name={s.name.trim()} />
                    {s.name.trim()}
                  </motion.li>
                ))}
              </motion.ul>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
