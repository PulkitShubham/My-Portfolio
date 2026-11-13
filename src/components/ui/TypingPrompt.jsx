import { useEffect, useState } from "react";
import { motion } from "motion/react";

/**
 * Terminal-style prompt that types out a command, e.g. "~/pulkit $ whoami".
 * Starts once `start` is true. Screen readers get the full text immediately.
 */
export default function TypingPrompt({ path = "~", command, start, delay = 0, speed = 70, motionProps }) {
  const [count, setCount] = useState(0);
  const reduce =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!start) return;
    if (reduce) {
      setCount(command.length);
      return;
    }
    let i = 0;
    let interval;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= command.length) clearInterval(interval);
      }, speed);
    }, delay * 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [start, command, delay, speed, reduce]);

  return (
    <motion.p {...motionProps} className="mb-4 font-mono text-xs text-muted sm:text-sm" aria-label={`${path} $ ${command}`}>
      <span aria-hidden>
        <span className="text-cyan">{path}</span>
        <span className="mx-2 text-accent-fg">$</span>
        <span className="text-fg/80">{command.slice(0, count)}</span>
        <span className="ml-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] animate-[caret_1s_steps(1)_infinite] bg-accent" />
      </span>
    </motion.p>
  );
}
