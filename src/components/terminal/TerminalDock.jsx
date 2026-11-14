import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FiArrowRight, FiTerminal } from "react-icons/fi";
import { lockScroll, scrollToId } from "../../lib/scroll";
import { TERMINAL_FOCUS, TERMINAL_NAVIGATED, TERMINAL_OPEN, TERMINAL_TRY, emit } from "../../lib/events";
import Terminal from "./Terminal";

const STORAGE_KEY = "terminal-promo";
const SHOW_AFTER_MS = 3500; // after the intro, the button grows into the nudge
const AUTO_MINIMIZE_MS = 10000; // ignored nudge shrinks back to the button
const IDLE_MS = 60000; // quiet this long and the button asks "Still there?"
const QUIPS = [
  "I won't go! 😤",
  "Nope. This is my corner.",
  "Not today 🙅",
  "Put me down!",
  "I live here now 🏠",
  "Whoa, easy! 🥴",
];
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
    <div className="flex items-center rounded-lg bg-white/[0.06] px-3 py-2 font-mono text-xs text-[#d7d7de]" aria-hidden>
      <span className="text-[#c8ff3d]">~$</span>
      <span className="ml-2 whitespace-pre">{text}</span>
      <span className="ml-px inline-block h-3.5 w-[7px] animate-pulse bg-[#c8ff3d]" />
    </div>
  );
}

/**
 * Terminal pinned to the bottom-right corner. The button opens it as a modal.
 * A few seconds after the intro the button grows into a "give it a try" nudge;
 * "Maybe later" shrinks it for good, and ignoring it shrinks it after a while.
 * The Terminal stays mounted while closed, so history and output are kept.
 */
export default function TerminalDock({ ready }) {
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [hover, setHover] = useState(false);
  const [quip, setQuip] = useState(""); // speech bubble shown while the button is dragged
  const buttonRef = useRef(null);
  const draggedRef = useRef(false);
  const quipTimer = useRef(0);
  const [wiggle, setWiggle] = useState(false); // bounce while the idle nudge is showing
  const wasOpen = useRef(false);
  const settled = useRef(dismissedBefore()); // true once the visitor has acted: no more nudging

  const close = useCallback(() => setOpen(false), []);
  const openTerminal = useCallback(() => {
    settled.current = true;
    setNudge(false);
    setOpen(true);
  }, []);

  // Open requests from the nav and anything else.
  useEffect(() => {
    window.addEventListener(TERMINAL_OPEN, openTerminal);
    return () => window.removeEventListener(TERMINAL_OPEN, openTerminal);
  }, [openTerminal]);

  // Idle visitor: after a quiet minute the button bounces and asks if anyone is there.
  // Activity only stamps a timestamp; a slow interval checks it, so this costs almost nothing.
  const busyRef = useRef(false);
  busyRef.current = open || nudge;
  useEffect(() => {
    if (!ready) return;
    let last = Date.now();
    let fired = false;
    let hideTimer = 0;
    const onActivity = () => {
      last = Date.now();
      fired = false;
    };
    const events = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((n) => window.addEventListener(n, onActivity, { passive: true }));
    const check = setInterval(() => {
      if (fired || busyRef.current || document.hidden || Date.now() - last < IDLE_MS) return;
      fired = true;
      setQuip("Still there? 👀");
      setWiggle(true);
      clearTimeout(quipTimer.current);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        setQuip("");
        setWiggle(false);
      }, 5000);
    }, 5000);
    return () => {
      events.forEach((n) => window.removeEventListener(n, onActivity));
      clearInterval(check);
      clearTimeout(hideTimer);
    };
  }, [ready]);

  // Grow into the nudge once the intro is over.
  useEffect(() => {
    if (!ready || settled.current) return;
    const t = setTimeout(() => !settled.current && setNudge(true), SHOW_AFTER_MS);
    return () => clearTimeout(t);
  }, [ready]);

  // Ignored nudge shrinks back to the button (paused while the pointer is on it).
  useEffect(() => {
    if (!nudge || hover) return;
    const t = setTimeout(() => setNudge(false), AUTO_MINIMIZE_MS);
    return () => clearTimeout(t);
  }, [nudge, hover]);

  useEffect(() => {
    if (!nudge) return;
    const onKey = (e) => e.key === "Escape" && setNudge(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nudge]);

  const tryIt = () => {
    openTerminal();
    // Let the modal finish opening before focusing and auto-typing.
    setTimeout(() => emit(TERMINAL_TRY), 450);
  };
  const later = () => {
    settled.current = true;
    rememberDismissed();
    setNudge(false);
  };

  // `cd <section>` in the shell: close the modal, release the scroll lock, then scroll the page.
  useEffect(() => {
    const onNavigate = (e) => {
      setOpen(false);
      setTimeout(() => scrollToId(e.detail), 320);
    };
    window.addEventListener(TERMINAL_NAVIGATED, onNavigate);
    return () => window.removeEventListener(TERMINAL_NAVIGATED, onNavigate);
  }, []);

  // While open: freeze the page, close on Escape (except inside the game), focus the prompt.
  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (e) => {
      if (e.key === "Escape" && !e.target.closest?.("canvas")) close();
    };
    window.addEventListener("keydown", onKey);
    const raf = requestAnimationFrame(() => emit(TERMINAL_FOCUS));
    return () => {
      lockScroll(false);
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Hand focus back to the button when the modal closes.
  useEffect(() => {
    if (wasOpen.current && !open) buttonRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {ready && !open && (
          // Outer wrapper: pinned position, entrance/exit and the drag-and-snap-back gag.
          <motion.div
            key="terminal-dock"
            drag
            dragSnapToOrigin
            dragMomentum={false}
            dragElastic={0.9}
            whileDrag={{ scale: 1.06, rotate: -3 }}
            onDragStart={() => {
              draggedRef.current = true;
              setHover(true); // keep the nudge from auto-minimizing mid-drag
              setQuip(QUIPS[Math.floor(Math.random() * QUIPS.length)]);
            }}
            onDragEnd={() => {
              setHover(false);
              clearTimeout(quipTimer.current);
              quipTimer.current = setTimeout(() => setQuip(""), 1600);
              setTimeout(() => (draggedRef.current = false), 80); // swallow the click that follows a drag
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-5 right-5 z-[66] touch-none sm:bottom-6 sm:right-6"
          >
          <AnimatePresence>
            {quip && (
              <motion.p
                key={quip}
                role="status"
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-xl border border-white/10 bg-[#c8ff3d] px-3 py-1.5 font-sans text-sm font-semibold text-[#07070a] shadow-xl"
              >
                {quip}
              </motion.p>
            )}
          </AnimatePresence>
          {/* Inner card: grows between the pill and the nudge. */}
          <motion.div
            layout
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{ borderRadius: 28 }}
            className={`overflow-hidden border bg-[#0b0b10] font-mono text-xs text-[#d7d7de] shadow-2xl shadow-black/50 ${
              nudge ? "w-[min(21rem,calc(100vw-2.5rem))] border-[#c8ff3d]/40" : "border-white/10"
            }`}
          >
            {nudge ? (
              <motion.div
                role="region"
                aria-label="Terminal suggestion"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12, duration: 0.25 }}
                className="p-5"
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    animate={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.8, delay: 0.5, repeat: Infinity, repeatDelay: 3 }}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#c8ff3d] text-lg text-[#07070a]"
                  >
                    <FiTerminal />
                  </motion.span>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#c8ff3d]">New feature</p>
                    <h2 className="font-display text-base font-semibold leading-tight text-white">
                      Wanna give it a try?
                    </h2>
                  </div>
                </div>
                <p className="mt-3 font-sans text-sm leading-relaxed text-[#9a9aa8]">
                  This portfolio has a working shell. Explore my experience, skills and projects with real commands.
                </p>
                <div className="mt-4">
                  <TypingDemo />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={tryIt}
                    className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#c8ff3d] px-4 py-2.5 font-sans text-sm font-medium text-[#07070a] transition-transform hover:scale-[1.02]"
                  >
                    Try it now
                    <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                  <button
                    type="button"
                    onClick={later}
                    className="rounded-full px-4 py-2.5 font-sans text-sm text-[#9a9aa8] transition-colors hover:text-white"
                  >
                    Maybe later
                  </button>
                </div>
              </motion.div>
            ) : (
              <button
                ref={buttonRef}
                type="button"
                onClick={() => !draggedRef.current && openTerminal()}
                aria-label="Open terminal"
                aria-haspopup="dialog"
                className={`group flex items-center gap-2.5 py-2 pl-2 pr-4 transition-transform hover:-translate-y-0.5 active:scale-95 ${
                  wiggle ? "animate-bounce" : ""
                }`}
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#c8ff3d] text-base text-[#07070a]">
                  <FiTerminal />
                </span>
                <span className="flex items-center text-white">
                  <span className="text-[#c8ff3d]">~$</span>
                  <span className="ml-1.5">terminal</span>
                  <span className="ml-1 inline-block h-3.5 w-[6px] animate-pulse bg-[#c8ff3d]" aria-hidden />
                </span>
              </button>
            )}
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always mounted (hidden when closed) so the session survives closing. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Terminal"
        hidden={!open}
        className={open ? "fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6" : undefined}
      >
        <div aria-hidden className="absolute inset-0 bg-black/70" onClick={close} />
        <div className="terminal-pop relative w-full max-w-3xl">
          <Terminal active={open} onClose={close} />
        </div>
      </div>
    </>
  );
}
