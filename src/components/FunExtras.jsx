import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FUN_TOAST, SITE_GLITCH, toast } from "../lib/events";

const AWAY_TITLES = [
  "Come back, I have cookies 🍪",
  "404: visitor not found",
  "Psst… your tab is lonely 👀",
  "I'll just sit here, compiling… 😔",
];
const RAGE_LINES = [
  "Okay okay, I'm loading… ⏳",
  "Clicking harder doesn't make me faster 😅",
  "I felt that. Calm down 🫠",
  "Patience, young padawan 🧘",
];
const RAGE_CLICKS = 5; // this many clicks…
const RAGE_WINDOW_MS = 1500; // …within this time…
const RAGE_RADIUS = 60; // …and this many pixels counts as rage
const TOAST_MS = 2800;

const pick = (list) => list[Math.floor(Math.random() * list.length)];

/**
 * Small, self-contained gags that live outside any one section:
 *  - tab title changes while the visitor is on another tab
 *  - rage-clicking the same spot gets a toast
 *  - a toast host (also used by the logo easter egg)
 *  - a short page glitch (used by the fake `rm -rf /`)
 */
export default function FunExtras() {
  const [message, setMessage] = useState("");
  const toastTimer = useRef(0);

  /* ----- toast host ----- */
  useEffect(() => {
    const onToast = (e) => {
      clearTimeout(toastTimer.current);
      setMessage(String(e.detail));
      toastTimer.current = setTimeout(() => setMessage(""), TOAST_MS);
    };
    window.addEventListener(FUN_TOAST, onToast);
    return () => {
      window.removeEventListener(FUN_TOAST, onToast);
      clearTimeout(toastTimer.current);
    };
  }, []);

  /* ----- tab title mood ----- */
  useEffect(() => {
    let original = document.title;
    let flip = 0;
    let welcomeTimer = 0;
    const onChange = () => {
      clearInterval(flip);
      clearTimeout(welcomeTimer);
      if (document.hidden) {
        original = document.title;
        let i = Math.floor(Math.random() * AWAY_TITLES.length);
        document.title = AWAY_TITLES[i];
        // Rotate the line so a glimpse of the tab bar always shows something new.
        flip = setInterval(() => {
          i = (i + 1) % AWAY_TITLES.length;
          document.title = AWAY_TITLES[i];
        }, 3000);
      } else {
        document.title = "Welcome back 👋";
        welcomeTimer = setTimeout(() => (document.title = original), 2000);
      }
    };
    document.addEventListener("visibilitychange", onChange);
    return () => {
      document.removeEventListener("visibilitychange", onChange);
      clearInterval(flip);
      clearTimeout(welcomeTimer);
    };
  }, []);

  /* ----- rage-click detector ----- */
  useEffect(() => {
    let clicks = []; // recent { t, x, y }
    let cooldownUntil = 0;
    const onClick = (e) => {
      // Keep out of the terminal, the game, form fields and anything with its own click gag.
      if (e.target.closest?.("canvas, input, textarea, [role='dialog'], [data-no-rage]")) return;
      const now = performance.now();
      if (now < cooldownUntil) return;
      clicks = clicks.filter((c) => now - c.t < RAGE_WINDOW_MS);
      clicks.push({ t: now, x: e.clientX, y: e.clientY });
      if (clicks.length < RAGE_CLICKS) return;
      const first = clicks[0];
      if (clicks.every((c) => Math.hypot(c.x - first.x, c.y - first.y) < RAGE_RADIUS)) {
        toast(pick(RAGE_LINES));
        cooldownUntil = now + 5000;
      }
      clicks = [];
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, []);

  /* ----- page glitch (fake rm -rf /) ----- */
  useEffect(() => {
    let timer = 0;
    const onGlitch = () => {
      const root = document.documentElement;
      root.classList.add("site-glitch");
      clearTimeout(timer);
      timer = setTimeout(() => root.classList.remove("site-glitch"), 1500);
    };
    window.addEventListener(SITE_GLITCH, onGlitch);
    return () => {
      window.removeEventListener(SITE_GLITCH, onGlitch);
      clearTimeout(timer);
      document.documentElement.classList.remove("site-glitch");
    };
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[95] flex justify-center px-4">
      <AnimatePresence>
        {message && (
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="rounded-full border border-white/10 bg-[#0b0b10] px-5 py-2.5 font-mono text-sm text-white shadow-2xl shadow-black/50"
          >
            <span className="mr-2 text-[#c8ff3d]">~$</span>
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
