import { useCallback, useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { getTheme, setTheme } from "../../lib/theme";
import { getGreeting } from "../../lib/greeting";
import { TERMINAL_FOCUS, TERMINAL_NAVIGATED, TERMINAL_TRY, emit } from "../../lib/events";
import { Accent, Cyan, Muted, Violet, complete, execute, quickCommands } from "./commands";

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

/**
 * The shell itself. Rendered inside TerminalDock's modal and kept mounted while
 * the modal is closed so history and output survive. `active` is true while the
 * modal is open; the boot sequence plays the first time it becomes true.
 */
export default function Terminal({ active, onClose }) {
  const [entries, setEntries] = useState([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState([]);
  const [hIndex, setHIndex] = useState(null); // position while browsing history with ↑/↓
  const [busy, setBusy] = useState(false);

  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const draftRef = useRef(""); // what was typed before browsing history
  const bootedRef = useRef(false);
  const historyRef = useRef(history);
  historyRef.current = history;

  const push = useCallback((...items) => setEntries((e) => [...e, ...items]), []);

  /* ----- boot sequence: plays once, the first time the modal opens ----- */
  useEffect(() => {
    if (!active || bootedRef.current) return;
    bootedRef.current = true;
    const greeting = getGreeting();
    const lines = [
      <span key="g">
        <Accent>{greeting.hello}</Accent> {greeting.emoji} <Muted>{greeting.line}</Muted>
      </span>,
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
  }, [active, push]);

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
        // The dock closes the modal, then scrolls the page behind it.
        scrollTo: (id) => (id === "terminal" ? focusInput() : emit(TERMINAL_NAVIGATED, id)),
        print: (node) => push(entry(null, node)),
        focus: () => focusInput(),
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
    [push, focusInput]
  );

  // Focus requests from the "back to terminal" button.
  useEffect(() => {
    window.addEventListener(TERMINAL_FOCUS, focusInput);
    return () => window.removeEventListener(TERMINAL_FOCUS, focusInput);
  }, [focusInput]);

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
    window.addEventListener(TERMINAL_TRY, onTry);
    return () => window.removeEventListener(TERMINAL_TRY, onTry);
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
    if (e.target.closest("a, button, canvas")) return; // canvas = the game; keep its focus
    if (window.getSelection()?.toString()) return;
    focusInput();
  };

  return (
    <div
      onMouseUp={onWindowMouseUp}
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10] text-[#d7d7de] shadow-2xl shadow-black/60"
    >
          {/* Title bar */}
          <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close terminal"
                className="h-3 w-3 rounded-full bg-[#ff5f57] transition-transform hover:scale-125"
              />
              <span aria-hidden className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span aria-hidden className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <p className="flex-1 truncate text-center font-mono text-xs text-[#7c7c8a]">pulkit@portfolio — zsh — 80×24</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close terminal"
              className="grid h-7 w-7 place-items-center rounded-full text-[#7c7c8a] transition-colors hover:bg-white/10 hover:text-white"
            >
              <FiX />
            </button>
          </div>

          {/* Output + prompt */}
          <div
            ref={bodyRef}
            data-lenis-prevent
            role="log"
            aria-live="polite"
            aria-label="Terminal output"
            className="h-[min(52dvh,24rem)] overflow-y-auto overscroll-contain px-4 py-4 font-mono text-[12.5px] leading-relaxed sm:h-[min(58dvh,28rem)] sm:px-6 sm:text-[13.5px] [scrollbar-color:rgba(255,255,255,0.15)_transparent] [scrollbar-width:thin]"
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

      {/* Quick commands (also the main way in on phones) */}
      <div className="flex items-center gap-2 overflow-x-auto border-t border-white/10 bg-white/[0.03] px-4 py-3 [scrollbar-width:none]">
        <span id="terminal-hint" className="mr-1 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-[#7c7c8a]">
          Try
        </span>
        {quickCommands.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => !busy && run(c)}
            className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 font-mono text-xs text-[#d7d7de] transition-colors hover:border-[#c8ff3d] hover:text-[#c8ff3d]"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
