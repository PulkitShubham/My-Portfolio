import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { FiArrowDownRight, FiDownload, FiMapPin } from "react-icons/fi";
import { place, profile, socials } from "../data/content";
import { scrollToId } from "../lib/scroll";
import Magnetic from "./ui/Magnetic";
import CurrentRoleBadge from "./CurrentRoleBadge";
import SplitText from "./ui/SplitText";
import TypingPrompt from "./ui/TypingPrompt";
import { socialIcons } from "./ui/icons";

const ease = [0.22, 1, 0.36, 1];

const orbitBadges = [
  { label: "Kotlin", className: "left-[-8%] top-[18%]", delay: 0 },
  { label: "TensorFlow", className: "right-[-12%] top-[30%]", delay: 1.2 },
  { label: "C++", className: "left-[2%] bottom-[14%]", delay: 0.6 },
  { label: "React", className: "right-[-2%] bottom-[6%]", delay: 1.8 },
];

/** Cycles through the role list with a vertical blur-slide. */
function RotatingRole({ ready }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => setI((n) => (n + 1) % profile.roles.length), 2400);
    return () => clearInterval(id);
  }, [ready]);

  return (
    <span className="relative inline-flex h-[1.25em] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={profile.roles[i]}
          initial={{ y: "100%", opacity: 0, filter: "blur(8px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.55, ease }}
          className="text-gradient whitespace-nowrap"
        >
          {profile.roles[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Hero({ ready }) {
  const ref = useRef(null);

  // Scroll-linked exit: content drifts up, shrinks and fades as you scroll away.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Pointer parallax for the portrait.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 120, damping: 20 });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 120, damping: 20 });

  const onMove = (e) => {
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
    const r = ref.current?.getBoundingClientRect();
    if (r) {
      ref.current.style.setProperty("--hx", `${e.clientX - r.left}px`);
      ref.current.style.setProperty("--hy", `${e.clientY - r.top}px`);
    }
  };

  const show = (delay) => ({
    initial: { opacity: 0, y: 30 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
    transition: { duration: 0.9, delay, ease },
  });

  return (
    <section
      id="home"
      ref={ref}
      onPointerMove={onMove}
      className="group/hero relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-32"
    >
      {/* Lime grid revealed around the cursor */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/hero:opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--color-accent-fg) 35%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--color-accent-fg) 35%, transparent) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(220px circle at var(--hx, 50%) var(--hy, 50%), black, transparent 70%)",
          WebkitMaskImage: "radial-gradient(220px circle at var(--hx, 50%) var(--hy, 50%), black, transparent 70%)",
        }}
      />
      <motion.div style={{ y, scale, opacity }} className="container-x relative w-full">
        <div className="grid items-center gap-14 lg:grid-cols-[1.4fr_1fr]">
          {/* ---- Copy ---- */}
          <div>
            <CurrentRoleBadge motionProps={show(0.1)} />

            <TypingPrompt
              path="~/pulkit"
              command="whoami"
              start={ready}
              delay={0.2}
              motionProps={show(0.12)}
            />

            <h1 className="font-display font-bold uppercase leading-[0.85] tracking-tighter">
              <SplitText
                text={profile.firstName}
                animate={ready}
                delay={0.15}
                className="block whitespace-nowrap text-[19vw] sm:text-[15vw] lg:text-[6.5rem] xl:text-[8rem]"
              />
              <SplitText
                text={profile.lastName}
                animate={ready}
                delay={0.35}
                className="block whitespace-nowrap text-[19vw] sm:text-[15vw] lg:text-[6.5rem] xl:text-[8rem]"
                partClassName="text-outline"
              />
            </h1>

            <motion.p {...show(0.7)} className="mt-8 font-display text-2xl font-medium md:text-4xl">
              <span className="text-fg/60">I'm a </span>
              <RotatingRole ready={ready} />
            </motion.p>

            <motion.p {...show(0.85)} className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              {profile.tagline}
            </motion.p>

            <motion.div {...show(1)} className="mt-10 flex flex-wrap items-center gap-4">
              <Magnetic>
                <a
                  href={profile.cv}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="Open"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-accent px-7 py-4 font-medium text-on-accent"
                >
                  <span className="absolute inset-0 -translate-x-full bg-white transition-transform duration-500 ease-out group-hover:translate-x-0" />
                  <span className="relative">Download CV</span>
                  <FiDownload className="relative transition-transform duration-300 group-hover:translate-y-0.5" />
                </a>
              </Magnetic>
              <Magnetic>
                <button
                  onClick={() => scrollToId("projects")}
                  className="group inline-flex items-center gap-3 rounded-full border border-line px-7 py-4 font-medium transition-colors hover:border-fg/40 hover:bg-fg/5"
                >
                  See my work
                  <FiArrowDownRight className="transition-transform duration-300 group-hover:rotate-45" />
                </button>
              </Magnetic>
              <Magnetic>
                <button
                  onClick={() => scrollToId("location")}
                  aria-label="Locate me: jump to the map section"
                  className="group inline-flex items-center gap-3 rounded-full border border-line px-6 py-4 font-mono text-sm uppercase tracking-[0.15em] transition-colors hover:border-accent hover:text-accent-fg"
                >
                  {/* Pulsing pin, echoes the map marker */}
                  <span className="relative grid h-5 w-5 place-items-center" aria-hidden>
                    <span className="absolute h-full w-full animate-ping rounded-full bg-accent/50" />
                    <FiMapPin className="relative text-accent-fg" />
                  </span>
                  Locate me
                </button>
              </Magnetic>
            </motion.div>

            <motion.ul {...show(1.15)} className="mt-10 flex gap-3">
              {socials.map((s) => {
                const Icon = socialIcons[s.icon];
                return (
                  <li key={s.name}>
                    <Magnetic strength={0.5}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={s.name}
                        className="grid h-12 w-12 place-items-center rounded-full border border-line text-lg text-fg/70 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:bg-accent hover:text-on-accent"
                      >
                        <Icon />
                      </a>
                    </Magnetic>
                  </li>
                );
              })}
            </motion.ul>
          </div>

          {/* ---- Portrait ---- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
            animate={ready ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.4, ease }}
            className="relative mx-auto hidden w-full max-w-[420px] lg:block"
            style={{ perspective: 1000 }}
          >
            {/* Viewfinder corners */}
            <div aria-hidden className="pointer-events-none absolute -inset-6">
              <span className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-accent/70" />
              <span className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-accent/70" />
              <span className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-accent/70" />
              <span className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-accent/70" />
            </div>
            <motion.div style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }} className="relative aspect-square">
              {/* Spinning conic ring */}
              <div className="absolute inset-0 animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,var(--color-accent),var(--color-cyan),var(--color-violet),transparent_70%,var(--color-accent))] p-[2px] opacity-80">
                <div className="h-full w-full rounded-full bg-ink" />
              </div>
              <div className="absolute inset-6 rounded-full bg-gradient-to-br from-violet/30 via-transparent to-accent/20 blur-2xl" />
              <motion.img
                src={profile.avatar}
                alt={`${profile.firstName} ${profile.lastName}`}
                className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] rounded-full object-cover"
                style={{ z: 40 }}
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />

              {orbitBadges.map((b) => (
                <motion.span
                  key={b.label}
                  className={`glass absolute rounded-full px-4 py-2 font-mono text-xs text-fg/90 shadow-xl ${b.className}`}
                  style={{ z: 80 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={ready ? { opacity: 1, scale: 1, y: [0, -10, 0] } : {}}
                  transition={{
                    opacity: { delay: 1.2 + b.delay * 0.2 },
                    scale: { delay: 1.2 + b.delay * 0.2, type: "spring" },
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: b.delay },
                  }}
                >
                  <span className="mr-2 text-accent-fg">◆</span>
                  {b.label}
                </motion.span>
              ))}
            </motion.div>

            {/* HUD readout */}
            <div className="absolute -bottom-16 left-1/2 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              <span className="flex items-center gap-1.5 text-accent-fg">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
                Online
              </span>
              <span aria-hidden>·</span>
              <span>
                {place.lat.toFixed(4)}° N, {place.lng.toFixed(4)}° E
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.button
        onClick={() => scrollToId("about")}
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted md:flex"
        aria-label="Scroll to about section"
      >
        Scroll
        <span className="relative h-12 w-px overflow-hidden bg-line">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-accent"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.button>
    </section>
  );
}
