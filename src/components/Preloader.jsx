import { useEffect, useRef, useState } from "react";
import { animate, motion } from "motion/react";

const words = ["Code", "Create", "Analyse", "Build", "Ship"];
const ease = [0.76, 0, 0.24, 1];

/** Full-screen intro: percentage counter + cycling words, then wipes upward. */
export default function Preloader({ onDone }) {
  const [count, setCount] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    let timer;
    const controls = animate(0, 100, {
      duration: 2,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => {
        timer = setTimeout(() => doneRef.current(), 250);
      },
    });
    return () => {
      controls.stop();
      clearTimeout(timer);
    };
  }, []);

  const word = words[Math.min(words.length - 1, Math.floor((count / 100) * words.length))];

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-ink p-6 md:p-10"
      exit={{ clipPath: "inset(0 0 100% 0)" }}
      initial={{ clipPath: "inset(0 0 0% 0)" }}
      transition={{ duration: 0.9, ease }}
      role="status"
      aria-label="Loading portfolio"
    >
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.25em] text-muted">
        <span>Pulkit Shubham</span>
        <span>Portfolio ©{new Date().getFullYear()}</span>
      </div>

      <div className="flex items-end justify-between gap-6">
        <div className="h-[1.2em] overflow-hidden font-display text-3xl text-white/80 md:text-5xl">
          <motion.span
            key={word}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.4, ease }}
            className="inline-block"
          >
            <span className="mr-3 inline-block h-2.5 w-2.5 rounded-full bg-accent align-middle" />
            {word}
          </motion.span>
        </div>
        <span className="font-display text-[22vw] font-bold leading-[0.8] tracking-tighter tabular-nums md:text-[14vw]">
          {count}
          <span className="text-accent">%</span>
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1 bg-line">
        <div className="h-full bg-accent transition-[width] duration-75" style={{ width: `${count}%` }} />
      </div>
    </motion.div>
  );
}
