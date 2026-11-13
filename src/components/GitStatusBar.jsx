import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FiGitBranch, FiGitCommit, FiCheck, FiChevronUp } from "react-icons/fi";
import git from "virtual:git-info";

function timeAgo(iso) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const units = [
    ["y", 31536000],
    ["mo", 2592000],
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
  ];
  for (const [label, size] of units) {
    if (s >= size) return `${Math.floor(s / size)}${label} ago`;
  }
  return `${s}s ago`;
}

export default function GitStatusBar({ ready }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const latest = git.commits[0];

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!ready || !latest) return null;

  return (
    <div ref={wrapRef} className="relative z-10 w-full font-mono text-[11px]">
      <AnimatePresence>
        {open && (
          <motion.div
            id="git-history"
            role="dialog"
            aria-label="Recent commits"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="glass absolute bottom-full left-2 mb-2 w-[min(92vw,420px)] overflow-hidden rounded-xl shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-muted">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 truncate">git log --oneline -n {git.commits.length}</span>
            </div>
            <ul className="max-h-[50vh] overflow-y-auto py-2">
              {git.commits.map((c, i) => (
                <li key={c.hash} className="flex gap-3 px-4 py-2 hover:bg-fg/[0.04]">
                  <div className="flex flex-col items-center pt-1">
                    <span
                      className={`h-2 w-2 rounded-full ${i === 0 ? "bg-accent shadow-[0_0_10px_var(--color-accent)]" : "bg-muted/60"}`}
                    />
                    {i < git.commits.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-fg">{c.message}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-muted">
                      <span className="text-cyan">{c.short}</span>
                      <span>{c.author}</span>
                      <span>· {timeAgo(c.date)}</span>
                      {i === 0 && (
                        <span className="rounded border border-accent-fg/40 px-1 text-accent-fg">HEAD → {git.branch}</span>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VS Code style status bar */}
      <div className="flex h-6 items-stretch bg-accent text-on-accent">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="git-history"
          aria-label={`Branch ${git.branch}. Show recent commits`}
          className="flex items-center gap-1.5 px-3 font-medium transition-colors hover:bg-black/15"
        >
          <FiGitBranch aria-hidden />
          <span>{git.branch}</span>
          {git.dirty ? <span aria-label="uncommitted changes">*</span> : <FiCheck aria-hidden className="opacity-70" />}
          <FiChevronUp aria-hidden className={`transition-transform ${open ? "" : "rotate-180"}`} />
        </button>
        <span className="hidden items-center gap-1.5 px-3 sm:flex">
          <FiGitCommit aria-hidden />
          <span className="font-semibold">{latest.short}</span>
          <span className="max-w-[40vw] truncate opacity-80">{latest.message}</span>
          <span className="opacity-60">· {timeAgo(latest.date)}</span>
        </span>
      </div>
    </div>
  );
}
