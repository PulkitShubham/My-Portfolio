import { motion } from "motion/react";

/**
 * Card with a pointer-tracking glow border. Updates CSS vars directly
 * so moving the mouse never triggers a React re-render.
 */
export default function SpotlightCard({ children, className = "", ...rest }) {
  const onMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  return (
    <motion.div
      onPointerMove={onMove}
      className={`spotlight rounded-3xl border border-line bg-surface/70 backdrop-blur-sm ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
