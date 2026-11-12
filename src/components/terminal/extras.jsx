/**
 * Daily-life, system and fun commands. All `hidden` from `help`; they're listed in
 * the unlockable `guide` instead (grouped by `group`).
 */
import { useEffect, useRef, useState } from "react";
import { achievements, education, experience, place, projects, skills } from "../../data/content";
import { formatDuration, monthsBetween } from "../../lib/dates";
import { bengaluruTime, getWeather } from "../../lib/weather";
import { Accent, B, Block, Cmd, Cyan, Err, Gap, Muted, Violet, Warn } from "./ui";

const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const PAGE_LOADED = typeof performance !== "undefined" ? performance.timeOrigin : Date.now();

/** Reveals children one at a time (or all at once under reduced motion). */
function Stagger({ items, every = 350, done }) {
  const [n, setN] = useState(reduce() ? items.length : 1);
  useEffect(() => {
    if (n >= items.length) return;
    const t = setTimeout(() => setN((x) => x + 1), every);
    return () => clearTimeout(t);
  }, [n, items.length, every]);
  return (
    <Block>
      {items.slice(0, n).map((it, i) => <div key={i}>{it}</div>)}
      {n >= items.length && done}
    </Block>
  );
}

/* ---------- safe calculator (no eval): shunting-yard over + - * / % ^ ( ) ---------- */
function calculate(src) {
  if (src.length > 120) throw new Error("expression too long");
  const tokens = src.replace(/\s+/g, "").match(/\d*\.?\d+(?:e[+-]?\d+)?|[-+*/%^()]/gi);
  if (!tokens || tokens.join("") !== src.replace(/\s+/g, "")) throw new Error("only numbers and + - * / % ^ ( ) please");
  // Unary minus binds looser than ^ (so -2^2 = -4) but tighter than * and /.
  const prec = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "u-": 2.5, "^": 3 };
  const right = { "^": true, "u-": true };
  const out = [];
  const ops = [];
  let prev = null;
  for (const t of tokens) {
    if (/^[\d.]/.test(t)) out.push(parseFloat(t));
    else if (t === "(") ops.push(t);
    else if (t === ")") {
      while (ops.length && ops.at(-1) !== "(") out.push(ops.pop());
      if (!ops.length) throw new Error("mismatched parentheses");
      ops.pop();
    } else {
      const op = t === "-" && (prev === null || /[-+*/%^(]/.test(prev)) ? "u-" : t;
      // A prefix operator has no left operand yet, so it never pops anything (keeps 2^-1 working).
      if (op !== "u-")
        while (ops.length && ops.at(-1) !== "(" && (prec[ops.at(-1)] > prec[op] || (prec[ops.at(-1)] === prec[op] && !right[op])))
          out.push(ops.pop());
      ops.push(op);
    }
    prev = t;
  }
  while (ops.length) {
    const op = ops.pop();
    if (op === "(") throw new Error("mismatched parentheses");
    out.push(op);
  }
  const st = [];
  for (const t of out) {
    if (typeof t === "number") st.push(t);
    else if (t === "u-") st.push(-st.pop());
    else {
      const b = st.pop();
      const a = st.pop();
      if (a === undefined || b === undefined) throw new Error("incomplete expression");
      st.push({ "+": a + b, "-": a - b, "*": a * b, "/": a / b, "%": a % b, "^": a ** b }[t]);
    }
  }
  if (st.length !== 1 || !Number.isFinite(st[0])) throw new Error(st.length === 1 ? "Infinity? Not on my watch." : "incomplete expression");
  return Math.round(st[0] * 1e10) / 1e10;
}

/* ---------- todo list (stored in this browser only) ---------- */
const TODO_KEY = "terminal-todos";
const loadTodos = () => {
  try {
    const v = JSON.parse(localStorage.getItem(TODO_KEY) || "[]");
    return Array.isArray(v) ? v.slice(0, 20) : [];
  } catch {
    return [];
  }
};
const saveTodos = (t) => {
  try {
    localStorage.setItem(TODO_KEY, JSON.stringify(t));
  } catch {
    /* ignore */
  }
};

/* ---------- content ---------- */
const jokes = [
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "There are 10 kinds of people: those who understand binary and those who don't.",
  "I'd tell you a UDP joke, but you might not get it.",
  "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'",
  "Debugging: being the detective in a crime movie where you're also the murderer.",
  "It works on my machine. Then we'll ship your machine.",
  "Why did the developer go broke? Because he used up all his cache.",
  "!false — it's funny because it's true.",
];
const quotes = [
  ["Talk is cheap. Show me the code.", "Linus Torvalds"],
  ["First, solve the problem. Then, write the code.", "John Johnson"],
  ["Simplicity is prerequisite for reliability.", "Edsger W. Dijkstra"],
  ["Programs must be written for people to read.", "Harold Abelson"],
  ["Make it work, make it right, make it fast.", "Kent Beck"],
  ["The best error message is the one that never shows up.", "Thomas Fuchs"],
];
const fortunes = [
  "A merged PR is in your near future.",
  "Your next build will pass on the first try. Probably.",
  "You will find the missing semicolon.",
  "An unexpected recruiter will run `sudo hire pulkit`.",
  "Today is a good day to write tests. Tomorrow too.",
];

/** Short deterministic "commit hash" from a string. */
const hash = (s) => {
  let h = 5381;
  for (const c of s) h = (h * 33) ^ c.charCodeAt(0);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
};

/* ---------- animated outputs ---------- */
function Ping({ host }) {
  const special = /^(pulkit|pulkit\.?shubham|me)$/i.test(host);
  const ip = special ? "127.0.0.1" : `10.0.${(host.length * 7) % 255}.${(host.length * 13) % 255}`;
  const rows = Array.from({ length: 4 }, (_, i) => (
    <span key={i}>
      64 bytes from <Cyan>{special ? "pulkit.local" : host}</Cyan> ({ip}): icmp_seq={i} ttl=64 time=
      <Accent>{(special ? 0.04 + i * 0.01 : 12 + Math.random() * 30).toFixed(special ? 2 : 1)} ms</Accent>
    </span>
  ));
  return (
    <Stagger
      items={[<Muted key="h">PING {host} ({ip}): 56 data bytes</Muted>, ...rows]}
      every={450}
      done={
        <div className="pt-1">
          {special ? <><Accent>●</Accent> Pulkit is online, responsive and replying in under a millisecond. Try <Cmd>contact</Cmd>.</> : <Muted>--- {host} ping statistics: 4 packets transmitted, 4 received, 0% loss ---</Muted>}
        </div>
      }
    />
  );
}

function NpmInstall({ pkg }) {
  if (!/^pulkit(@.*)?$/i.test(pkg))
    return (
      <div>
        <Err>npm ERR! 404 Not Found: {pkg}</Err> <Muted>· the only package published here is</Muted> <Cmd>pulkit</Cmd>
      </div>
    );
  const deps = ["react@19", "typescript", "kotlin", "apollo-graphql", "fastapi", "tensorflow", "curiosity", "chai"];
  return (
    <Stagger
      every={260}
      items={[
        <Muted key="a">resolving dependencies…</Muted>,
        ...deps.map((d) => <span key={d}><Accent>+</Accent> {d}</span>),
      ]}
      done={
        <div className="pt-1">
          added <Accent>1 engineer</Accent> and {skills.reduce((n, g) => n + g.skills.length, 0)} skills in 0.42s · <Accent>0 vulnerabilities</Accent>
          <div><Muted>next step:</Muted> <Cmd>sudo hire pulkit</Cmd></div>
        </div>
      }
    />
  );
}

function Sleeper({ secs }) {
  const [left, setLeft] = useState(secs);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), reduce() ? 0 : 1000);
    return () => clearTimeout(t);
  }, [left]);
  return left > 0 ? <Muted>💤 zzz… {left}s</Muted> : <div>⏰ Woke up after {secs}s. <Muted>Sleep is for production servers anyway.</Muted></div>;
}

function Flip() {
  const result = Math.random() < 0.5 ? "HEADS" : "TAILS";
  const [spin, setSpin] = useState(!reduce());
  useEffect(() => {
    const t = setTimeout(() => setSpin(false), 900);
    return () => clearTimeout(t);
  }, []);
  return spin ? <span className="animate-pulse text-[#7c7c8a]">🪙 flipping…</span> : <div>🪙 <Accent>{result}</Accent> <Muted>{result === "HEADS" ? "· ship it" : "· write one more test"}</Muted></div>;
}

function Matrix() {
  const ref = useRef(null);
  const [done, setDone] = useState(reduce());
  useEffect(() => {
    if (done) return;
    const c = ref.current;
    const ctx = c.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = c.parentElement.clientWidth;
    const H = 150;
    c.width = W * dpr;
    c.height = H * dpr;
    c.style.width = `${W}px`;
    c.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const size = 14;
    const cols = Math.ceil(W / size);
    const drops = Array.from({ length: cols }, () => Math.random() * -20);
    const glyphs = "アイウエオカキクケコサシスセソ01PULKITナニヌネノ<>{}";
    let raf;
    let last = 0;
    const start = performance.now();
    const frame = (now) => {
      if (now - last > 50) {
        last = now;
        ctx.fillStyle = "rgba(11,11,16,0.18)";
        ctx.fillRect(0, 0, W, H);
        ctx.font = `${size}px "JetBrains Mono", monospace`;
        drops.forEach((y, i) => {
          ctx.fillStyle = Math.random() < 0.05 ? "#ffffff" : "#c8ff3d";
          ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * size, y * size);
          drops[i] = y * size > H && Math.random() > 0.95 ? 0 : y + 1;
        });
      }
      if (now - start > 4500) return setDone(true);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [done]);
  return done ? (
    <Block>
      <div><Accent>Wake up, recruiter…</Accent></div>
      <div><Muted>The Matrix has you. Follow the white rabbit:</Muted> <Cmd>play</Cmd></div>
    </Block>
  ) : (
    <div className="overflow-hidden rounded-lg"><canvas ref={ref} aria-label="Matrix digital rain animation" /></div>
  );
}

function WeatherOut({ arg }) {
  const [s, setS] = useState({ status: "loading" });
  useEffect(() => {
    let ok = true;
    getWeather().then((w) => ok && setS({ status: "ok", w })).catch(() => ok && setS({ status: "error" }));
    return () => {
      ok = false;
    };
  }, []);
  const other = arg && !/^(bengaluru|bangalore|blr|namma)/i.test(arg);
  if (s.status === "loading") return <Muted>📡 contacting satellites over {place.city}…</Muted>;
  if (s.status === "error") return <div><Warn>Weather service unreachable.</Warn> <Muted>Safe bet: pleasant, with a chance of traffic.</Muted></div>;
  const { w } = s;
  return (
    <Block>
      {other && <div><Muted>I only forecast {place.nickname}, but here you go:</Muted></div>}
      <div className="text-lg">{w.emoji} <B>{w.temp}°C</B> <Muted>in {place.city} · {w.label}</Muted></div>
      <div><Muted>feels like</Muted> {w.feels}°C <Muted>· humidity</Muted> {w.humidity}% <Muted>· wind</Muted> {w.wind} km/h</div>
      <div><Muted>live from Open-Meteo · {bengaluruTime()} IST</Muted></div>
    </Block>
  );
}

function Cow({ text }) {
  const msg = (text || "Moo. Hire Pulkit.").slice(0, 60);
  const bar = "_".repeat(msg.length + 2);
  const dash = "-".repeat(msg.length + 2);
  return (
    <pre className="m-0 font-mono leading-tight">{` ${bar}\n< ${msg} >\n ${dash}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`}</pre>
  );
}

/* ---------- commands ---------- */
export const extraCommands = {
  /* daily life */
  weather: { hidden: true, group: "daily", desc: `live weather in ${place.city}`, run: (a) => <WeatherOut arg={a.join(" ")} /> },
  time: {
    hidden: true,
    group: "daily",
    desc: "time in Bengaluru vs yours",
    run: () => (
      <div>
        🕒 <B>{bengaluruTime({ second: "2-digit" })}</B> <Muted>IST in {place.city} · your time</Muted> {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    ),
  },
  chai: {
    hidden: true,
    group: "daily",
    desc: "brew some chai",
    run: () => (
      <Stagger
        every={500}
        items={[<span key="1">🫖 boiling water…</span>, <span key="2">🌿 adding elaichi + ginger…</span>, <span key="3">🥛 milk in…</span>]}
        done={<div>☕ <Accent>Cutting chai ready.</Accent> <Muted>Productivity +20%.</Muted></div>}
      />
    ),
  },
  coffee: {
    hidden: true,
    group: "daily",
    desc: "filter coffee, Bengaluru style",
    run: () => <div>☕ Pouring <B>filter kaapi</B> between davara and tumbler… <Accent>perfect froth.</Accent> <Muted>Want a real one? Run</Muted> <Cmd>contact</Cmd></div>,
  },
  traffic: {
    hidden: true,
    group: "daily",
    desc: "live-ish Bengaluru traffic",
    run: () => (
      <Block>
        <div>🚦 <B>Silk Board Junction</B> <Err>● heavy</Err></div>
        <div className="pl-6"><Muted>ETA for 2 km:</Muted> {35 + Math.floor(Math.random() * 30)} min</div>
        <div className="pl-6"><Muted>recommendation:</Muted> work from terminal</div>
      </Block>
    ),
  },
  lunch: {
    hidden: true,
    group: "daily",
    desc: "today's lunch pick",
    run: () => <div>🍽️ <B>{pick(["Masala dosa", "Idli vada", "Bisi bele bath", "Ghee roast dosa", "Rava idli", "Akki roti"])}</B> <Muted>from the nearest darshini. 10/10.</Muted></div>,
  },
  water: { hidden: true, group: "daily", desc: "hydration reminder", run: () => <div>💧 Drink some water. <Muted>Your brain is ~75% water and 100% responsible for your code.</Muted></div> },
  joke: { hidden: true, group: "daily", desc: "a programmer joke", run: () => <div>😄 {pick(jokes)}</div> },
  quote: {
    hidden: true,
    group: "daily",
    desc: "words to code by",
    run: () => {
      const [q, who] = pick(quotes);
      return <div>“{q}” <Muted>— {who}</Muted></div>;
    },
  },
  fortune: { hidden: true, group: "daily", desc: "open a fortune cookie", run: () => <div>🥠 {pick(fortunes)}</div> },
  cowsay: { hidden: true, group: "daily", usage: "<text>", desc: "a cow says your text", run: (a) => <Cow text={a.join(" ")} /> },
  flip: { hidden: true, group: "daily", desc: "flip a coin", run: () => <Flip /> },
  roll: {
    hidden: true,
    group: "daily",
    usage: "[NdM]",
    desc: "roll dice, e.g. roll 2d6",
    run: (a) => {
      const m = (a[0] || "1d6").match(/^(\d{1,2})d(\d{1,3})$/i);
      if (!m) return <div><Err>roll: use NdM, e.g. 2d6</Err></div>;
      const n = Math.min(10, Number(m[1]) || 1);
      const sides = Math.max(2, Math.min(100, Number(m[2])));
      const rolls = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * sides));
      return <div>🎲 {rolls.map((r, i) => <Accent key={i}>[{r}]</Accent>)} <Muted>= {rolls.reduce((x, y) => x + y, 0)}</Muted></div>;
    },
  },
  calc: {
    hidden: true,
    group: "daily",
    usage: "<expr>",
    desc: "calculator, e.g. calc (2+3)*4^2",
    run: (a) => {
      const expr = a.join(" ");
      if (!expr) return <div><Muted>usage: calc 2*(3+4)</Muted></div>;
      try {
        return <div>{expr} <Muted>=</Muted> <Accent>{calculate(expr)}</Accent></div>;
      } catch (e) {
        return <div><Err>calc: {e.message}</Err></div>;
      }
    },
  },
  todo: {
    hidden: true,
    group: "daily",
    usage: "[add|done|rm|clear]",
    desc: "a tiny todo list (saved in your browser)",
    complete: () => ["add", "done", "rm", "clear"],
    run: (a) => {
      const [sub, ...rest] = a;
      const todos = loadTodos();
      const list = (t) =>
        t.length ? (
          <Block>
            {t.map((x, i) => (
              <div key={i}>
                <Muted>{i + 1}.</Muted> {x.done ? <Accent>[x]</Accent> : <Muted>[ ]</Muted>} <span className={x.done ? "text-[#7c7c8a] line-through" : ""}>{x.text}</span>
              </div>
            ))}
          </Block>
        ) : (
          <Muted>Nothing to do. Suspicious. Try <span className="text-[#c8ff3d]">todo add hire pulkit</span></Muted>
        );
      if (!sub || sub === "list") return list(todos);
      if (sub === "add") {
        const text = rest.join(" ").slice(0, 80);
        if (!text) return <Err>todo: add what?</Err>;
        if (todos.length >= 20) return <Err>todo: list full (20). Finish something first 😉</Err>;
        const next = [...todos, { text, done: false }];
        saveTodos(next);
        return list(next);
      }
      const n = Number(rest[0]) - 1;
      if ((sub === "done" || sub === "rm") && !(n >= 0 && n < todos.length)) return <Err>todo: no item #{rest[0] ?? "?"}</Err>;
      if (sub === "done") {
        todos[n].done = true;
        saveTodos(todos);
        return list(todos);
      }
      if (sub === "rm") {
        todos.splice(n, 1);
        saveTodos(todos);
        return list(todos);
      }
      if (sub === "clear") {
        saveTodos([]);
        return <Muted>Cleared. Inbox zero energy.</Muted>;
      }
      return <Err>todo: unknown subcommand '{sub}'</Err>;
    },
  },
  sleep: {
    hidden: true,
    group: "daily",
    usage: "[seconds]",
    desc: "take a short nap (max 5s)",
    run: (a) => <Sleeper secs={Math.max(1, Math.min(5, Number(a[0]) || 3))} />,
  },

  /* system */
  uptime: {
    hidden: true,
    group: "system",
    desc: "page + career uptime",
    run: () => {
      const s = Math.round((Date.now() - PAGE_LOADED) / 1000);
      const career = formatDuration(monthsBetween(experience[0].roles.at(-1).start, null));
      return <div>⏱️ page up <B>{Math.floor(s / 60)}m {s % 60}s</B> <Muted>· career up</Muted> <B>{career}</B> <Muted>· load average: chai, code, repeat</Muted></div>;
    },
  },
  uname: { hidden: true, group: "system", usage: "[-a]", desc: "system name", run: (a) => <div>{a.includes("-a") ? "pulkit-os 2.0.0 bengaluru-1 react19-motion x86_64 GNU/Portfolio" : "pulkit-os"}</div> },
  hostname: { hidden: true, group: "system", desc: "machine name", run: () => <div>pulkit-portfolio.{place.city.toLowerCase()}.in</div> },
  ping: { hidden: true, group: "system", usage: "[host]", desc: "ping a host (try: ping pulkit)", run: (a) => <Ping host={(a[0] || "pulkit").slice(0, 40)} /> },
  top: {
    hidden: true,
    group: "system",
    desc: "what's using my CPU",
    run: () => {
      const procs = [
        ["coding", 38], ["learning", 22], ["open-source", 14], ["chai", 9], ["debugging", 8], ["sleep", 6], ["gssoc-flashbacks", 3],
      ].map(([n, c]) => [n, c + Math.round(Math.random() * 4 - 2)]);
      return (
        <Block>
          <div><Muted>  PID  COMMAND            CPU%</Muted></div>
          {procs.map(([n, c], i) => (
            <div key={n} className="whitespace-pre">
              <Muted>{String(1000 + i * 37).padStart(5, " ")}</Muted>  <Cyan>{n.padEnd(18, " ")}</Cyan> <Accent>{String(c).padStart(3, " ")}%</Accent> <span className="text-[#c8ff3d]/60">{"▇".repeat(Math.max(1, Math.round(c / 3)))}</span>
            </div>
          ))}
        </Block>
      );
    },
  },
  git: {
    hidden: true,
    group: "system",
    usage: "log",
    desc: "my career as a commit history",
    complete: () => ["log", "status", "blame"],
    run: (a) => {
      const sub = a[0];
      if (sub === "status") return <div>On branch <Accent>main</Accent> · <Muted>your branch is ahead by 1 great hire. Run</Muted> <Cmd>sudo hire pulkit</Cmd></div>;
      if (sub === "blame") return <div><Muted>Every line here:</Muted> Pulkit Shubham <Muted>(and a lot of chai)</Muted></div>;
      if (sub !== "log") return <div><Muted>usage: git log · git status · git blame</Muted></div>;
      const n = experience[0];
      const commits = [
        ...n.roles.map((r) => [r.start, `feat(career): ${r.end === null ? "promoted to" : "join Nielsen as"} ${r.title}`]),
        ["2025", `feat(oss): GSSoC 2025 rank #${achievements.gssoc.rank}, ${achievements.gssoc.mergedPRs}+ PRs merged`],
        ...projects.slice(0, 4).map((p) => [p.date, `feat(projects): ship ${p.title}`]),
        ...education.map((e) => [e.date.split(" - ")[0], `chore(edu): ${e.school} · ${e.grade}`]),
        ["2017", "init: hello world 👋"],
      ];
      return (
        <Block>
          {commits.map(([date, msg], i) => (
            <div key={i}>
              <Warn>{hash(msg)}</Warn> {i === 0 && <><Muted>(</Muted><Cyan>HEAD -&gt; main</Cyan><Muted>)</Muted> </>}{msg} <Muted>· {date}</Muted>
            </div>
          ))}
        </Block>
      );
    },
  },
  npm: {
    hidden: true,
    group: "system",
    usage: "install pulkit",
    desc: "install a new engineer",
    complete: () => ["install"],
    run: (a) => {
      if (!["install", "i", "add"].includes(a[0])) return <div><Muted>usage: npm install pulkit</Muted></div>;
      return <NpmInstall pkg={(a[1] || "").slice(0, 40)} />;
    },
  },
  matrix: { hidden: true, group: "fun", desc: "enter the matrix", run: () => <Matrix /> },
};

export const extraAliases = { coin: "flip", dice: "roll", math: "calc", htop: "top", tasks: "todo", tea: "chai", kaapi: "coffee" };
