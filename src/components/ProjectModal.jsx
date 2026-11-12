import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { FiGithub, FiX, FiExternalLink } from "react-icons/fi";
import { lockScroll } from "../lib/scroll";

const ease = [0.22, 1, 0.36, 1];

/** Expands out of the clicked card via shared layoutId. */
export default function ProjectModal({ project, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    lockScroll(true);
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const isRepo = project.github?.includes("github.com");

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8" role="dialog" aria-modal="true" aria-labelledby="project-title">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/80 backdrop-blur-md"
      />

      <motion.article
        layoutId={`project-${project.id}`}
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-line bg-surface"
        transition={{ duration: 0.6, ease }}
      >
        <div className="relative aspect-[16/8] shrink-0 overflow-hidden">
          <motion.img layoutId={`project-img-${project.id}`} src={project.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close project details"
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-ink/70 text-xl backdrop-blur transition-transform hover:rotate-90"
          >
            <FiX />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.5, ease } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="overflow-y-auto p-6 md:p-10"
          data-lenis-prevent
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            {project.category} · {project.date}
          </p>
          <h3 id="project-title" className="mt-3 font-display text-3xl font-semibold md:text-4xl">
            {project.title}
          </h3>
          <p className="mt-5 leading-relaxed text-white/75">{project.description}</p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((t, i) => (
              <motion.li
                key={t}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.35 + i * 0.04 } }}
                className="rounded-full border border-line bg-white/[0.03] px-3 py-1 font-mono text-xs text-white/80"
              >
                {t}
              </motion.li>
            ))}
          </ul>

          <div className="mt-8">
            {project.github ? (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-ink transition-transform hover:scale-105"
              >
                {isRepo ? <FiGithub /> : <FiExternalLink />}
                {isRepo ? "View source" : "Open project"}
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm text-muted">
                Source coming soon
              </span>
            )}
          </div>
        </motion.div>
      </motion.article>
    </div>
  );
}
