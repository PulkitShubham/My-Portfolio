import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { navLinks, socials } from "../data/content";
import { lockScroll, scrollToId } from "../lib/scroll";
import { TERMINAL_OPEN, emit, toast } from "../lib/events";

const POKE_JOKES = [
  "Ouch! That's my logo 🤕",
  "Easy, that tickles 😆",
  "I'm just initials, not a stress ball 😅",
  "PS: please stop 🙃",
];
import { FiTerminal } from "react-icons/fi";
import { socialIcons } from "./ui/icons";
import ThemeToggle from "./ThemeToggle";

const ease = [0.22, 1, 0.36, 1];

/** Tracks which section is currently in the middle of the viewport. */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

const ids = navLinks.map((l) => l.id);

export default function Navbar({ ready }) {
  const active = useActiveSection(ids);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  // Logo easter egg: 5 quick clicks spin it and get a joke, a 6th gets told off.
  const [spin, setSpin] = useState(0);
  const pokes = useRef({ n: 0, timer: 0 });
  const poke = () => {
    const p = pokes.current;
    clearTimeout(p.timer);
    p.n += 1;
    p.timer = setTimeout(() => (p.n = 0), 2000);
    if (p.n === 5) {
      setSpin((s) => s + 1);
      toast(POKE_JOKES[Math.floor(Math.random() * POKE_JOKES.length)]);
    } else if (p.n === 6) {
      toast("Stop poking me 😠");
      p.n = 0;
    }
  };

  // Hide on scroll down, reveal on scroll up.
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 300 && !open);
    setScrolled(y > 40);
  });

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (id) => {
    setOpen(false);
    // Wait a tick so the scroll lock is released before scrolling.
    // "terminal" isn't a page section any more: it opens the pinned terminal modal.
    requestAnimationFrame(() => (id === "terminal" ? emit(TERMINAL_OPEN) : scrollToId(id)));
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={ready ? { y: hidden ? -100 : 0, opacity: 1 } : { y: -100, opacity: 0 }}
        transition={{ duration: 0.6, ease }}
        className="fixed inset-x-0 top-0 z-50 pt-4"
      >
        <div className="container-x">
          <nav
            aria-label="Primary"
            className={`flex items-center justify-between rounded-full px-3 py-2 transition-all duration-500 ${
              scrolled ? "glass shadow-2xl shadow-black/40" : "border border-transparent"
            }`}
          >
            <button
              onClick={() => {
                poke();
                go("home");
              }}
              data-no-rage
              className="group flex items-center gap-2 rounded-full px-3 py-1.5"
              aria-label="Back to top"
            >
              <motion.span
                animate={{ rotate: spin * 720 }}
                transition={{ duration: 1, ease }}
                className="grid h-8 w-8 place-items-center rounded-full bg-accent font-display text-sm font-bold text-on-accent transition-transform duration-500 group-hover:rotate-[360deg]"
              >
                PS
              </motion.span>
              <span className="hidden font-display text-sm font-medium sm:block">Pulkit Shubham</span>
            </button>

            <ul className="hidden items-center gap-1 lg:flex">
              {navLinks.slice(1, -1).filter((l) => l.inNav !== false).map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => go(link.id)}
                    className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                      active === link.id ? "text-ink" : "text-fg/70 hover:text-fg"
                    }`}
                    aria-current={active === link.id ? "true" : undefined}
                  >
                    {active === link.id && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-fg"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    {link.id === "terminal" ? (
                      <span className="relative grid place-items-center" title="Open terminal">
                        <FiTerminal aria-hidden className="text-base" />
                        <span className="sr-only">Open terminal</span>
                      </span>
                    ) : (
                      <span className="relative">{link.label}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => go("contact")}
                className="hidden rounded-full bg-accent px-5 py-2 text-sm font-medium text-on-accent transition-transform hover:scale-105 sm:block"
              >
                Let's talk
              </button>
              <button
                onClick={() => setOpen((o) => !o)}
                className="relative grid h-10 w-10 place-items-center rounded-full border border-line lg:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
              >
                <motion.span
                  animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
                  className="absolute h-px w-4 bg-fg"
                />
                <motion.span
                  animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
                  className="absolute h-px w-4 bg-fg"
                />
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: "circle(0% at calc(100% - 44px) 40px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 44px) 40px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 44px) 40px)" }}
            transition={{ duration: 0.7, ease }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-elevated px-6 pb-10 pt-28 lg:hidden"
          >
            <ul className="flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease }}
                >
                  <button
                    onClick={() => go(link.id)}
                    className="flex w-full items-baseline gap-4 py-1 text-left font-display text-5xl font-semibold"
                  >
                    <span className="font-mono text-xs text-accent-fg">0{i + 1}</span>
                    <span className={active === link.id ? "text-accent-fg" : ""}>{link.label}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              {socials.map((s) => {
                const Icon = socialIcons[s.icon];
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.name}
                    className="grid h-12 w-12 place-items-center rounded-full border border-line text-lg"
                  >
                    <Icon />
                  </a>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
