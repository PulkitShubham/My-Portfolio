import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FiArrowUp } from "react-icons/fi";
import { profile } from "../data/content";
import { scrollToId } from "../lib/scroll";
import Magnetic from "./ui/Magnetic";

function LocalTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);
  return (
    <span>
      {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })} IST
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line pt-16">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            <p>
              Based in {profile.location} · <LocalTime />
            </p>
          </div>
          <Magnetic>
            <button
              onClick={() => scrollToId("home")}
              className="group flex items-center gap-3 rounded-full border border-line px-5 py-3 text-sm transition-colors hover:border-accent hover:text-accent-fg"
            >
              Back to top
              <FiArrowUp className="transition-transform duration-300 group-hover:-translate-y-1" />
            </button>
          </Magnetic>
        </div>
      </div>

      {/* Oversized name that rises in as you reach the bottom */}
      <motion.div
        aria-hidden
        initial={{ y: "40%", opacity: 0 }}
        whileInView={{ y: "0%", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10 select-none whitespace-nowrap text-center font-display text-[17vw] font-bold uppercase leading-[0.8] tracking-tighter text-fg/[0.04]"
      >
        {profile.firstName} {profile.lastName}
      </motion.div>

      <div className="container-x flex flex-col justify-between gap-2 border-t border-line py-6 text-xs text-muted md:flex-row">
        <p>© {new Date().getFullYear()} {profile.firstName} {profile.lastName}. All rights reserved.</p>
        <p>Built with React, Motion & Tailwind.</p>
      </div>
    </footer>
  );
}
