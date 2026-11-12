import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { scrollToId } from "../../lib/scroll";
import { getTheme, setTheme } from "../../lib/theme";
import { Accent, Cyan, Muted, Violet, complete, execute, quickCommands } from "./commands";

export const TERMINAL_TRY_EVENT = "terminal:try";

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// mr-2 (not a trailing space) so the gap survives flex layout.
const Prompt = () => (
  <span className="mr-2 shrink-0 select-none">
    <Accent>pulkit</Accent>
    <Muted>@</Muted>
    <Cyan>portfolio</Cyan>
    <Muted>:</Muted>
    <Violet>~</Violet>
    <Muted>$</Muted>
  </span>
);

let nextId = 0;
const entry = (input, output) => ({ id: nextId++, input, output });

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function Terminal() {
  const [entries, setEntries] = useState([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState([]);
  const [hIndex, setHIndex] = useState(null); // position while browsing history with ↑/↓
  const [busy, setBusy] = useState(false);

  const windowRef = useRef(null);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const draftRef = useRef(""); // what was typed before browsing history
  const bootedRef = useRef(false);
  const historyRef = useRef(history);
  historyRef.current = history;

  const inView = useInView(windowRef, { once: true, amount: 0.35 });

  const push = useCallback((...items) => setEntries((e) => [...e, ...items]), []);

  /* ----- boot sequence: plays once, the first time the window scrolls into view ----- */
  useEffect(() => {
    if (!inView || bootedRef.current) return;
    bootedRef.current = true;
    const lines = [
      <Muted key="a">Last login: {new Date().toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} on ttys001</Muted>,
      <span key="b">
        Welcome to <Accent>pulkit-os</Accent> <Muted>v2.0 · everything on this site, one command away.</Muted>
      </span>,
      <span key="c">
        Type <span className="rounded bg-white/10 px-1 text-[#c8ff3d]">help</span> to get started, or tap a command below.
      </span>,
    ];
    if (reduceMotion()) return push(...lines.map((l) => entry(null, l)));
    let cancelled = false;
    (async () => {
      for (const l of lines) {
        await wait(260);
        if (cancelled) return;
        push(entry(null, l));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inView, push]);

  /* ----- keep the newest output in view (scrolls the terminal only, never the page) ----- */
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const focusInput = useCallback(() => inputRef.current?.focus({ preventScroll: true }), []);

  const run = useCallback(
    async (line) => {
      const trimmed = line.trim();
      setValue("");
      setHIndex(null);
      if (!trimmed) return push(entry("", null));
      setHistory((h) => (h.at(-1) === trimmed ? h : [...h, trimmed].slice(-50)));
      setBusy(true);
      const ctx = {
        history: [...historyRef.current, trimmed],
        scrollTo: (id) => scrollToId(id),
        setTheme: (t) => setTheme(t),
        getTheme,
        copy: copyText,
        clear: () => setEntries([]),
      };
      const { output, name } = await execute(trimmed, ctx);
      setBusy(false);
      if (name === "clear") return; // clear already wiped the screen
      push(entry(trimmed, output));
    },
    [push]
  );

  /* ----- "Give it a try" from the promo popup: focus and type `help` for the visitor ----- */
  const historyEmptyRef = useRef(true);
  historyEmptyRef.current = history.length === 0;
  useEffect(() => {
    const onTry = async () => {
      focusInput();
      if (!historyEmptyRef.current) return;
      if (reduceMotion()) return run("help");
      await wait(500);
      for (const ch of "help") {
        setValue((v) => v + ch);
        await wait(110);
      }
      await wait(250);
      run("help");
    };
    window.addEventListener(TERMINAL_TRY_EVENT, onTry);
    return () => window.removeEventListener(TERMINAL_TRY_EVENT, onTry);
  }, [focusInput, run]);

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!busy) run(value);
      return;
    }
    // Only take over Tab when there's something to complete, so keyboard users can still Tab out.
    if (e.key === "Tab" && value.trim() && !e.shiftKey) {
      e.preventDefault();
      const { value: next, options } = complete(value);
      setValue(next);
      if (options.length > 1)
        push(
          entry(
            value,
            <div className="flex flex-wrap gap-x-4">
              {options.map((o) => <Cyan key={o}>{o}</Cyan>)}
            </div>
          )
        );
      return;
    }
    if (e.key === "ArrowUp") {
      if (!history.length) return;
      e.preventDefault();
      if (hIndex === null) draftRef.current = value;
      const i = hIndex === null ? history.length - 1 : Math.max(0, hIndex - 1);
      setHIndex(i);
      setValue(history[i]);
      return;
    }
    if (e.key === "ArrowDown") {
      if (hIndex === null) return;
      e.preventDefault();
      const i = hIndex + 1;
      if (i >= history.length) {
        setHIndex(null);
        setValue(draftRef.current);
      } else {
        setHIndex(i);
        setValue(history[i]);
      }
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setEntries([]);
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      // Only act as "cancel" when nothing is selected, so normal copy still works.
      if (window.getSelection()?.toString()) return;
      e.preventDefault();
      push(entry(`${value}^C`, null));
      setValue("");
      setHIndex(null);
      return;
    }
    if (e.key === "Escape") {
      setValue("");
      setHIndex(null);
    }
  };

  // Click anywhere in the window to focus the prompt (but don't break text selection or links).
  const onWindowMouseUp = (e) => {
    if (e.target.closest("a, button")) return;
    if (window.getSelection()?.toString()) return;
    focusInput();
  };

  return (
    <div>
      <motion.div
        ref={windowRef}
        initial={{ opacity: 0, y: 50, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* Glow behind the window */}
        <div aria-hidden className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-r from-violet/25 via-cyan/15 to-accent/25 opacity-70 blur-3xl" />

        <div
          onMouseUp={onWindowMouseUp}
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10] text-[#d7d7de] shadow-2xl shadow-black/50"
        >
          {/* Title bar */}
          <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex gap-2" aria-hidden>
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <p className="flex-1 truncate text-center font-mono text-xs text-[#7c7c8a]">pulkit@portfolio — zsh — 80×24</p>
            <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#7c7c8a] sm:flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#28c840] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#28c840]" />
              </span>
              live
            </span>
          </div>

          {/* Output + prompt */}
          <div
            ref={bodyRef}
            data-lenis-prevent
            role="log"
            aria-live="polite"
            aria-label="Terminal output"
            className="h-[24rem] overflow-y-auto overscroll-contain px-4 py-4 font-mono text-[12.5px] leading-relaxed sm:h-[28rem] sm:px-6 sm:text-[13.5px] [scrollbar-color:rgba(255,255,255,0.15)_transparent] [scrollbar-width:thin]"
          >
            {entries.map((e) => (
              <div key={e.id} className="mb-2 break-words">
                {e.input !== null && (
                  <div className="flex">
                    <Prompt />
                    <span className="min-w-0 whitespace-pre-wrap">{e.input}</span>
                  </div>
                )}
                {e.output && <div className="mt-0.5">{e.output}</div>}
              </div>
            ))}

            {/* Live prompt */}
            <label className="flex items-center">
              <Prompt />
              <span className="sr-only">Terminal command</span>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setHIndex(null);
                }}
                onKeyDown={onKeyDown}
                aria-busy={busy}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="send"
                aria-describedby="terminal-hint"
                className="min-w-0 flex-1 bg-transparent text-white caret-[#c8ff3d] outline-none placeholder:text-[#4b4b57]"
                placeholder={entries.length <= 3 ? "type a command…" : ""}
              />
            </label>
          </div>
        </div>
      </motion.div>

      {/* Quick commands (also the main way in on phones) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-6 flex flex-wrap items-center gap-2"
      >
        <span id="terminal-hint" className="mr-1 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Try
        </span>
        {quickCommands.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => !busy && run(c)}
            className="rounded-full border border-line bg-surface/70 px-3 py-1.5 font-mono text-xs text-fg/80 transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent-fg"
          >
            {c}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
