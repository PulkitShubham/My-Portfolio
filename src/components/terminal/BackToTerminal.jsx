import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FiArrowUp, FiTerminal } from "react-icons/fi";
import { scrollToId } from "../../lib/scroll";
import { TERMINAL_FOCUS, TERMINAL_NAVIGATED, emit } from "../../lib/events";

/**
 * After a terminal `cd` sends the visitor elsewhere, offer a one-click way back.
 * Shows only while the terminal is off-screen; disappears once they return.
 */
export default function BackToTerminal() {
  const [armed, setArmed] = useState(false); // set by a terminal-initiated navigation
  const [from, setFrom] = useState("");
  const [terminalVisible, setTerminalVisible] = useState(true);
  const leftRef = useRef(false); // has the terminal left the screen since the last `cd`?

  useEffect(() => {
    const onNav = (e) => {
      leftRef.current = false; // a fresh trip
      setArmed(true);
      setFrom(e.detail ?? "");
    };
    window.addEventListener(TERMINAL_NAVIGATED, onNav);
    return () => window.removeEventListener(TERMINAL_NAVIGATED, onNav);
  }, []);

  useEffect(() => {
    const el = document.getElementById("terminal");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setTerminalVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // State machine, no timers: arm on `cd` -> note when the terminal actually leaves the
  // screen -> stand down once it's visible again (however the visitor got back).
  useEffect(() => {
    if (!armed) {
      leftRef.current = false;
      return;
    }
    if (!terminalVisible) leftRef.current = true;
    else if (leftRef.current) setArmed(false);
  }, [armed, terminalVisible]);

  const show = armed && !terminalVisible;

  const goBack = () => {
    scrollToId("terminal");
    setArmed(false);
    setTimeout(() => emit(TERMINAL_FOCUS), 900);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={goBack}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          aria-label="Back to terminal"
          className="group fixed bottom-5 right-5 z-[66] flex items-center gap-3 rounded-full border border-white/10 bg-[#0b0b10] py-2 pl-2 pr-4 font-mono text-xs text-[#d7d7de] shadow-2xl shadow-black/50 sm:bottom-6 sm:right-6"
        >
          <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[#c8ff3d] text-[#07070a]">
            <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}>
              <FiArrowUp />
            </motion.span>
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="flex items-center gap-1.5 text-white">
              <FiTerminal className="text-[#c8ff3d]" /> Back to terminal
            </span>
            {from && <span className="text-[10px] text-[#7c7c8a]">cd ~/terminal · from /{from}</span>}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
