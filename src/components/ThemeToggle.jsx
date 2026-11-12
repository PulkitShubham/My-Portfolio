import { AnimatePresence, motion } from "motion/react";
import { FiMoon, FiSun } from "react-icons/fi";
import { setTheme, useTheme } from "../lib/theme";

/** Sun/moon button. The icon spins out and the new one spins in on switch. */
export default function ThemeToggle({ className = "" }) {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  const onClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTheme(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-line text-fg/80 transition-colors hover:border-fg/30 hover:text-fg ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, scale: 0, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="grid place-items-center text-[17px]"
        >
          {/* Shows the current theme's icon */}
          {theme === "dark" ? <FiMoon /> : <FiSun />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
