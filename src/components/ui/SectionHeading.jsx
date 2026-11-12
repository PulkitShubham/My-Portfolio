import { motion } from "motion/react";
import SplitText from "./SplitText";

/** Numbered section label + big animated title + optional description. */
export default function SectionHeading({ index, label, title, desc, align = "left" }) {
  const center = align === "center";
  return (
    <div className={`mb-14 md:mb-20 ${center ? "text-center mx-auto" : ""} max-w-3xl`}>
      <motion.div
        initial={{ opacity: 0, x: center ? 0 : -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-accent-fg ${center ? "justify-center" : ""}`}
      >
        <span>{index}</span>
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-px w-10 origin-left bg-accent/60"
        />
        <span>{label}</span>
      </motion.div>

      <SplitText
        as="h2"
        by="word"
        text={title}
        stagger={0.08}
        className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
      />

      {desc && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-6 text-base leading-relaxed text-muted md:text-lg"
        >
          {desc}
        </motion.p>
      )}
    </div>
  );
}
