import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FiArrowRight, FiTerminal, FiX } from "react-icons/fi";
import { scrollToId } from "../../lib/scroll";
import { TERMINAL_TRY_EVENT } from "./Terminal";

const STORAGE_KEY = "terminal-promo";
const SHOW_AFTER_MS = 6000;
const demo = ["whoami", "projects --ml", "neofetch", "sudo hire pulkit"];

const dismissedBefore = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "dismissed";
  } catch {
    return false;
  }
};
const rememberDismissed = () => {
  try {
    localStorage.setItem(STORAGE_KEY, "dismissed");
  } catch {
    /* storage blocked: it'll just show again next visit */
  }
};

/** Cycles through demo commands with a typing effect. */
function TypingDemo() {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  useEffect(() => {
    const word = demo[i];
    if (text.length < word.length) {
      const t = setTimeout(() => setText(word.slice(0, text.length + 1)), 70);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setText("");
      setI((n) => (n + 1) % demo.length);
    }, 1400);
    return () => clearTimeout(t);
  }, [text, i]);

  return (
    <div className="flex items-center rounded-lg bg-[#0b0b10] px-3 py-2 font-mono text-xs text-[#d7d7de]" aria-hidden>
      <span className="text-[#c8ff3d]">~$</span>
      <span className="ml-2 whitespace-pre">{text}</span>
      <span className="ml-px inline-block h-3.5 w-[7px] animate-pulse bg-[#c8ff3d]" />
    </div>
  );
}

/**
 * "Give this a try" nudge for the terminal. Appears a few seconds after the intro,
 * never if the visitor already reached the terminal, and never again once dismissed.
 */
export default function TerminalPromo({ ready }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready || dismissedBefore()) return;
    let seen = false;
    const target = document.getElementById("terminal");
    const io = target
      ? new IntersectionObserver(([e]) => {
          if (e.isIntersecting) {
            seen = true;
            setOpen(false); // they found it on their own
          }
        }, { threshold: 0.2 })
      : null;
    if (target) io.observe(target);
    const t = setTimeout(() => !seen && setOpen(true), SHOW_AFTER_MS);
    return () => {
      clearTimeout(t);
      io?.disconnect();
    };
  }, [ready]);

  const dismiss = () => {
    rememberDismissed();
    setOpen(false);
  };

  const tryIt = () => {
    dismiss();
    scrollToId("terminal");
    // Let the smooth scroll land before focusing and auto-typing.
    setTimeout(() => window.dispatchEvent(new Event(TERMINAL_TRY_EVENT)), 1100);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          role="dialog"
          aria-labelledby="terminal-promo-title"
          aria-describedby="terminal-promo-desc"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97, transition: { duration: 0.2 } }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed inset-x-4 bottom-4 z-[65] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[22rem]"
        >
          {/* Animated gradient border */}
          <div className="relative overflow-hidden rounded-2xl p-[1.5px] shadow-2xl shadow-black/40">
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2 animate-[spin_6s_linear_infinite] bg-[conic-gradient(var(--color-accent),var(--color-cyan),var(--color-violet),var(--color-accent))]"
            />
            <div className="relative rounded-[calc(1rem-1.5px)] bg-surface p-5">
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss"
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-fg/5 hover:text-fg"
              >
                <FiX />
              </button>

              <div className="flex items-center gap-3 pr-8">
                <motion.span
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.8, delay: 0.6, repeat: Infinity, repeatDelay: 4 }}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-lg text-on-accent"
                >
                  <FiTerminal />
                </motion.span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-fg">New feature</p>
                  <h2 id="terminal-promo-title" className="font-display text-base font-semibold leading-tight">
                    Give the terminal a try
                  </h2>
                </div>
              </div>

              <p id="terminal-promo-desc" className="mt-3 text-sm leading-relaxed text-muted">
                This portfolio has a working shell. Explore my experience, skills and projects with real commands.
              </p>

              <div className="mt-4">
                <TypingDemo />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={tryIt}
                  className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-on-accent transition-transform hover:scale-[1.02]"
                >
                  Try it now
                  <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="rounded-full px-4 py-2.5 text-sm text-muted transition-colors hover:text-fg"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
