import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { FiArrowUpRight } from "react-icons/fi";

const ease = [0.22, 1, 0.36, 1];

/** 3D-tilting project card with a glare that follows the pointer. */
export default function ProjectCard({ project, index, onOpen }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 200, damping: 20 });
  const glareX = useTransform(mx, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(my, [0, 1], ["0%", "100%"]);
  const glare = useMotionTemplate`radial-gradient(500px circle at ${glareX} ${glareY}, rgba(255,255,255,0.12), transparent 40%)`;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
      transition={{ duration: 0.6, delay: index * 0.06, ease }}
      style={{ perspective: 1000 }}
    >
      <motion.button
        layoutId={`project-${project.id}`}
        onClick={onOpen}
        onPointerMove={onMove}
        onPointerLeave={reset}
        data-cursor="View"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-line bg-surface text-left"
        aria-label={`Open details for ${project.title}`}
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <motion.img
            layoutId={`project-img-${project.id}`}
            src={project.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/80 backdrop-blur">
            {project.category}
          </span>
          <span className="absolute right-4 top-4 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-accent text-ink opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <FiArrowUpRight className="transition-transform duration-500 group-hover:rotate-45" />
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <p className="font-mono text-xs text-muted">{project.date}</p>
          <h3 className="mt-2 font-display text-2xl font-semibold leading-tight transition-colors group-hover:text-accent">
            {project.title}
          </h3>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">{project.description}</p>
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
            {project.tags.slice(0, 4).map((t) => (
              <li key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-white/70">
                {t}
              </li>
            ))}
            {project.tags.length > 4 && (
              <li className="rounded-full px-2 py-1 font-mono text-[11px] text-muted">+{project.tags.length - 4}</li>
            )}
          </ul>
        </div>

        <motion.div aria-hidden style={{ background: glare }} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </motion.button>
    </motion.li>
  );
}
