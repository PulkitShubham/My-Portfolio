import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { projectFilters, projects } from "../data/content";
import SectionHeading from "./ui/SectionHeading";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";

export default function Projects() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const visible = useMemo(
    () => projects.filter((p) => filter === "all" || p.category === filter),
    [filter]
  );
  const close = useCallback(() => setSelected(null), []);

  return (
    <section id="projects" className="relative py-28 md:py-40">
      <div className="container-x">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            index="05"
            label="Selected work"
            title="Things I've built."
            desc="From web apps to Android apps and machine learning models. Click any card to dive in."
          />

          {/* Filter tabs with a sliding pill */}
          <div role="tablist" aria-label="Filter projects" className="mb-14 flex w-fit max-w-full shrink-0 gap-1 overflow-x-auto whitespace-nowrap rounded-full border border-line bg-surface/70 p-1 [scrollbar-width:none] md:mb-20">
            {projectFilters.map((f) => {
              const active = filter === f.id;
              const count = f.id === "all" ? projects.length : projects.filter((p) => p.category === f.id).length;
              return (
                <button
                  key={f.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f.id)}
                  className={`relative shrink-0 rounded-full px-3 py-2 text-sm transition-colors sm:px-4 ${active ? "text-ink" : "text-white/70 hover:text-white"}`}
                >
                  {active && (
                    <motion.span
                      layoutId="filter-pill"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">
                    {f.label}
                    <sup className="ml-1 font-mono text-[10px] opacity-60">{count}</sup>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <LayoutGroup>
          <motion.ul layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visible.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} onOpen={() => setSelected(p)} />
              ))}
            </AnimatePresence>
          </motion.ul>

          <AnimatePresence>{selected && <ProjectModal key={selected.id} project={selected} onClose={close} />}</AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  );
}
