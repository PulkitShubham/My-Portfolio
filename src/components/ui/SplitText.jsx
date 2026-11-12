import { motion } from "motion/react";

const ease = [0.22, 1, 0.36, 1];

/**
 * Reveals text letter-by-letter (or word-by-word) from behind a mask.
 * Pass `animate` to control it manually, otherwise it plays when scrolled into view.
 */
export default function SplitText({
  text,
  by = "letter",
  className = "",
  // Applied to each animated piece. Needed for effects like background-clip
  // text, which don't render through transformed child elements.
  partClassName = "",
  delay = 0,
  stagger = 0.035,
  animate,
  as: Tag = "span",
}) {
  const parts = by === "word" ? text.split(" ") : Array.from(text);
  const MotionTag = motion[Tag] ?? motion.span;

  const controlled = animate !== undefined;
  const trigger = controlled
    ? { initial: "hidden", animate: animate ? "show" : "hidden" }
    : { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.6 } };

  return (
    <MotionTag
      className={className}
      aria-label={text}
      {...trigger}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {parts.map((part, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={`inline-block will-change-transform ${partClassName}`}
            variants={{
              hidden: { y: "110%", rotate: 6 },
              show: { y: "0%", rotate: 0, transition: { duration: 0.9, ease } },
            }}
          >
            {part === " " ? "\u00A0" : part}
            {by === "word" && i < parts.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
