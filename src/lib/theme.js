import { useEffect, useState } from "react";

// Keep in sync with the inline boot script in index.html.
const STORAGE_KEY = "theme";
const EVENT = "themechange";
const THEME_COLOR = { dark: "#07070a", light: "#f6f5f1" };

const root = () => document.documentElement;

export const getTheme = () => (root().dataset.theme === "light" ? "light" : "dark");

const systemTheme = () => (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

// localStorage can throw (e.g. Safari private mode, blocked storage): fail soft.
function readStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}
function writeStored(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

function apply(theme) {
  root().dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: theme }));
}

/** Plain colour cross-fade, used when View Transitions aren't available. */
function crossFade(theme) {
  root().classList.add("theme-transition");
  apply(theme);
  window.setTimeout(() => root().classList.remove("theme-transition"), 600);
}

/**
 * Switch theme and remember the choice. `origin` ({x, y} in viewport px) is
 * where the circular reveal starts, typically the toggle button's centre.
 */
export function setTheme(theme, origin) {
  writeStored(theme);
  if (theme === getTheme()) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return apply(theme);
  if (!document.startViewTransition || !origin) return crossFade(theme);

  const { x, y } = origin;
  // Radius that reaches the farthest corner from the origin.
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  const transition = document.startViewTransition(() => apply(theme));
  transition.ready
    .then(() =>
      root().animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
      )
    )
    .catch(() => {
      /* transition skipped (e.g. tab hidden): the theme is already applied */
    });
}

/** Current theme, kept in sync across components and with the OS setting. */
export function useTheme() {
  const [theme, setState] = useState(getTheme);

  useEffect(() => {
    const onChange = () => setState(getTheme());
    window.addEventListener(EVENT, onChange);

    // Follow the OS live, but only until the visitor makes an explicit choice.
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onSystem = () => {
      if (!readStored()) apply(systemTheme());
    };
    mq.addEventListener("change", onSystem);

    return () => {
      window.removeEventListener(EVENT, onChange);
      mq.removeEventListener("change", onSystem);
    };
  }, []);

  return theme;
}
