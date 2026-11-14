import Lenis from "lenis";

// Single Lenis instance shared across the app.
let lenis = null;

export function initSmoothScroll() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Touch devices already scroll natively with momentum; Lenis would only add a
  // per-frame JS loop. Its smoothing targets mouse wheels.
  const touch = window.matchMedia("(pointer: coarse)").matches;
  if (reduce || touch || lenis) return () => {};

  lenis = new Lenis({ duration: 1.15, smoothWheel: true });

  let frame;
  const raf = (time) => {
    lenis?.raf(time);
    frame = requestAnimationFrame(raf);
  };
  frame = requestAnimationFrame(raf);

  return () => {
    cancelAnimationFrame(frame);
    lenis?.destroy();
    lenis = null;
  };
}

/** Smoothly scroll to a section id (falls back to native scrolling). */
export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = id === "home" ? 0 : -72;
  if (lenis) lenis.scrollTo(el, { offset });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: "smooth" });
}

/** Pause/resume page scrolling (used by modals and the mobile menu). */
export function lockScroll(locked) {
  if (lenis) locked ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
}
