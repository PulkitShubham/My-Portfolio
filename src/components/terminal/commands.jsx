/**
 * Terminal command engine. Every answer is generated from src/data/content.js,
 * so the terminal never drifts out of sync with the rest of the site.
 *
 * A command receives (args, ctx) and returns React output (or null).
 * ctx: { history, scrollTo(id), setTheme(t), getTheme(), copy(text), clear() }
 *
 * User input is only ever rendered as text (never HTML), so it can't inject markup.
 */
import { useEffect, useState } from "react";
import {
  achievements,
  education,
  experience,
  navLinks,
  profile,
  projectFilters,
  projects,
  skills,
  socials,
} from "../../data/content";
import { formatDuration, formatMonthYear, monthsBetween } from "../../lib/dates";

/* ---------- output primitives (terminal is always dark, so colours are fixed) ---------- */
export const Accent = ({ children }) => <span className="text-[#c8ff3d]">{children}</span>;
export const Cyan = ({ children }) => <span className="text-[#22d3ee]">{children}</span>;
export const Violet = ({ children }) => <span className="text-[#a78bfa]">{children}</span>;
export const Muted = ({ children }) => <span className="text-[#7c7c8a]">{children}</span>;
export const Err = ({ children }) => <span className="text-[#f87171]">{children}</span>;
export const Warn = ({ children }) => <span className="text-[#facc15]">{children}</span>;
const B = ({ children }) => <span className="font-semibold text-white">{children}</span>;
const Cmd = ({ children }) => <span className="rounded bg-white/10 px-1 text-[#c8ff3d]">{children}</span>;
const L = ({ href, children }) => (
  <a href={href} target="_blank" rel="noreferrer" className="text-[#22d3ee] underline decoration-[#22d3ee]/40 underline-offset-2 hover:decoration-[#22d3ee]">
    {children}
  </a>
);
const Block = ({ children }) => <div className="space-y-0.5">{children}</div>;
const Gap = () => <div className="h-2" />;
/** Two-column rows that stay aligned, e.g. "whoami   who is Pulkit?" */
// Stacks on phones; two aligned columns from `sm` up.
const Rows = ({ rows, w = "9rem" }) => (
  <div
    className="grid gap-x-4 gap-y-0.5 sm:[grid-template-columns:minmax(0,var(--k))_minmax(0,1fr)]"
    style={{ "--k": w }}
  >
    {rows.map(([k, v], i) => (
      <div key={i} className="contents">
        <div className="mt-1.5 first:mt-0 sm:mt-0 sm:truncate">{k}</div>
        <div className="min-w-0 pl-3 sm:pl-0">{v}</div>
      </div>
    ))}
  </div>
);

/* ---------- helpers ---------- */
const nielsen = experience[0];
const currentRole = nielsen.roles.find((r) => r.end === null) ?? nielsen.roles[0];
const filterAlias = { web: "web app", android: "android app", ml: "machine learning", data: "machine learning" };
const categoryShort = { "web app": "WEB", "android app": "ANDROID", "machine learning": "ML" };

const sectionAliases = Object.fromEntries([
  ...navLinks.map((l) => [l.id, l.id]),
  ...navLinks.map((l) => [l.label.toLowerCase(), l.id]),
  ["terminal", "terminal"],
  ["~", "home"],
  ["..", "home"],
  ["/", "home"],
]);

const openTargets = {
  cv: profile.cv,
  resume: profile.cv,
  ...Object.fromEntries(socials.map((s) => [s.name.toLowerCase(), s.href])),
  nielsen: nielsen.url,
};

const skillGroupKey = (title) =>
  title.toLowerCase().split(/[\s&]+/).filter(Boolean)[0]; // "Programming Languages" -> "programming"
const skillAliases = {
  languages: "Programming Languages",
  lang: "Programming Languages",
  frameworks: "Frameworks & Libraries",
  libs: "Frameworks & Libraries",
  mobile: "Mobile Development",
  android: "Mobile Development",
  ml: "Machine Learning",
  ai: "Machine Learning",
  data: "Data Analysis & Visualization",
  db: "Databases",
  databases: "Databases",
  testing: "Testing",
  cloud: "Cloud & DevOps",
  devops: "Cloud & DevOps",
  tools: "Tools",
};

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

/* ---------- animated output for `sudo hire pulkit` ---------- */
function HireSequence({ scrollTo }) {
  const steps = [
    <><Muted>[sudo] password for recruiter:</Muted> ********</>,
    <><Accent>✓</Accent> Access granted. Welcome, decision-maker.</>,
    <>Running background check… <Accent>clean</Accent></>,
    <>Verifying skills… <Accent>{skills.reduce((n, g) => n + g.skills.length, 0)} found</Accent></>,
    <>Checking GSSoC rank… <Accent>#{achievements.gssoc.rank}</Accent> <Muted>(top 0.5%)</Muted></>,
    <>Compiling offer letter… <Accent>done</Accent></>,
  ];
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [n, setN] = useState(reduce ? steps.length : 1);
  const [pct, setPct] = useState(reduce ? 100 : 0);

  useEffect(() => {
    if (n >= steps.length) return;
    const t = setTimeout(() => setN((x) => x + 1), 420);
    return () => clearTimeout(t);
  }, [n, steps.length]);
  useEffect(() => {
    if (n < steps.length || pct >= 100) return;
    const t = setTimeout(() => setPct((p) => Math.min(100, p + 5)), 35);
    return () => clearTimeout(t);
  }, [n, pct, steps.length]);

  const filled = Math.round(pct / 5);
  return (
    <Block>
      {steps.slice(0, n).map((s, i) => <div key={i}>{s}</div>)}
      {n >= steps.length && (
        <>
          <div>
            <Accent>[{"█".repeat(filled)}</Accent>
            <Muted>{"░".repeat(20 - filled)}]</Muted> {pct}%
          </div>
          {pct >= 100 && (
            <>
              <Gap />
              <div className="font-semibold text-[#c8ff3d]">🎉 Hire sequence complete. Excellent choice.</div>
              <div>
                Final step needs a human:{" "}
                <button type="button" onClick={() => scrollTo("contact")} className="rounded bg-[#c8ff3d] px-2 py-0.5 font-semibold text-[#07070a] hover:brightness-110">
                  open contact form ↓
                </button>{" "}
                <Muted>or run</Muted> <Cmd>email</Cmd>
              </div>
            </>
          )}
        </>
      )}
    </Block>
  );
}

/* ---------- commands ---------- */
// `hidden: true` keeps a command out of `help` (easter eggs).
export const commands = {
  help: {
    desc: "list available commands",
    run: () => {
      const visible = Object.entries(commands).filter(([, c]) => !c.hidden);
      return (
        <Block>
          <div><B>Available commands</B> <Muted>(Tab completes, ↑/↓ for history)</Muted></div>
          <Gap />
          <Rows rows={visible.map(([name, c]) => [<Accent key={name}>{name}{c.usage ? ` ${c.usage}` : ""}</Accent>, <Muted key="d">{c.desc}</Muted>])} w="17rem" />
          <Gap />
          <div><Muted>psst… a few commands aren't listed here. Curious minds might try</Muted> <Cmd>sudo</Cmd><Muted>.</Muted></div>
        </Block>
      );
    },
  },

  whoami: {
    desc: "who is Pulkit?",
    run: () => (
      <Block>
        <div><B>{profile.firstName} {profile.lastName}</B></div>
        <div>{currentRole.title} <Muted>@</Muted> <Violet>{nielsen.company}</Violet></div>
        <Gap />
        <div className="max-w-2xl text-[#b9b9c4]">{profile.tagline}</div>
        <Gap />
        <div><Muted>location:</Muted> {profile.location}  <Muted>· roles:</Muted> {profile.roles.join(", ")}</div>
      </Block>
    ),
  },

  neofetch: {
    desc: "system info, portfolio edition",
    run: () => {
      const skillCount = skills.reduce((n, g) => n + g.skills.length, 0);
      const art = [
        "  ██████╗ ███████╗",
        "  ██╔══██╗██╔════╝",
        "  ██████╔╝███████╗",
        "  ██╔═══╝ ╚════██║",
        "  ██║     ███████║",
        "  ╚═╝     ╚══════╝",
      ];
      const info = [
        ["", <><Accent>pulkit</Accent>@<Accent>portfolio</Accent></>],
        ["", <Muted>{"─".repeat(18)}</Muted>],
        ["Role", `${currentRole.title} @ ${nielsen.company}`],
        ["Uptime", `${formatDuration(monthsBetween(nielsen.roles.at(-1).start, null))} in industry`],
        ["Shell", "React 19 + Motion"],
        ["Stack", "Vite · Tailwind v4 · Lenis"],
        ["Skills", `${skillCount} across ${skills.length} groups`],
        ["Projects", `${projects.length} shipped`],
        ["GSSoC", `#${achievements.gssoc.rank} of ${achievements.gssoc.participants.toLocaleString("en-US")}+`],
        ["CGPA", education[0].grade],
      ];
      return (
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <pre className="m-0 font-mono leading-tight text-[#c8ff3d]" aria-hidden>{art.join("\n")}</pre>
          <div className="space-y-0.5">
            {info.map(([k, v], i) => (
              <div key={i}>{k && <Cyan>{k}: </Cyan>}{v}</div>
            ))}
            <div className="flex gap-1 pt-2" aria-hidden>
              {["#c8ff3d", "#22d3ee", "#a78bfa", "#f87171", "#facc15", "#ffffff"].map((c) => (
                <span key={c} className="h-3 w-6 rounded-sm" style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
      );
    },
  },

  experience: {
    desc: "where I've worked",
    run: () => (
      <Block>
        {experience.map((c) => (
          <div key={c.company}>
            <div><B>{c.company}</B> <Muted>· {formatDuration(monthsBetween(c.roles.at(-1).start, c.roles[0].end))}</Muted></div>
            {c.roles.map((r) => (
              <div key={r.title} className="pl-3">
                <Accent>{r.end === null ? "●" : "○"}</Accent> {r.title}{" "}
                <Muted>
                  {formatMonthYear(r.start)} – {r.end ? formatMonthYear(r.end) : "Present"} · {r.type}
                </Muted>
              </div>
            ))}
            <Gap />
            <div className="pl-3"><Muted>key contributions:</Muted></div>
            {c.contributions?.map((k) => (
              <div key={k.title} className="pl-3"><Cyan>›</Cyan> {k.title}</div>
            ))}
          </div>
        ))}
      </Block>
    ),
  },

  skills: {
    desc: "tech I work with",
    usage: "[group]",
    complete: () => Object.keys(skillAliases),
    run: (args) => {
      const q = args[0]?.toLowerCase();
      const wanted = q ? skillAliases[q] ?? skills.find((g) => skillGroupKey(g.title) === q)?.title : null;
      if (q && !wanted)
        return <div><Err>skills: unknown group '{args[0]}'.</Err> <Muted>Try:</Muted> {Object.keys(skillAliases).slice(0, 8).join(", ")}…</div>;
      const groups = wanted ? skills.filter((g) => g.title === wanted) : skills;
      return (
        <Block>
          <Rows
            w="14rem"
            rows={groups.map((g) => [
              <Cyan key={g.title}>{g.title}</Cyan>,
              <span key="v">{[...new Set(g.skills.map((s) => s.name.trim()))].join(", ")}</span>,
            ])}
          />
          {!wanted && <><Gap /><Muted>tip: filter with</Muted> <Cmd>skills ml</Cmd> <Muted>or</Muted> <Cmd>skills cloud</Cmd></>}
        </Block>
      );
    },
  },

  projects: {
    desc: "things I've built",
    usage: "[--web|--android|--ml]",
    complete: () => ["--all", "--web", "--android", "--ml"],
    run: (args) => {
      const flag = args.find((a) => a.startsWith("--"))?.slice(2);
      const cat = flag && flag !== "all" ? filterAlias[flag] : null;
      if (flag && flag !== "all" && !cat)
        return <div><Err>projects: unknown flag '--{flag}'.</Err> <Muted>Use --web, --android or --ml.</Muted></div>;
      const list = projects.map((p, i) => ({ p, n: i + 1 })).filter(({ p }) => !cat || p.category === cat);
      const label = cat ? projectFilters.find((f) => f.id === cat)?.label : "All";
      return (
        <Block>
          <div><Muted>{label} · {list.length} project{list.length === 1 ? "" : "s"}</Muted></div>
          <Gap />
          {list.map(({ p, n }) => (
            <div key={p.id} className="pb-1">
              <div>
                <Accent>[{n}]</Accent> <B>{p.title}</B> <Violet>{categoryShort[p.category]}</Violet> <Muted>· {p.date}</Muted>
              </div>
              <div className="pl-6 text-[#9a9aa8]">{p.tags.slice(0, 6).join(" · ")}</div>
            </div>
          ))}
          <Gap />
          <div><Muted>open one with</Muted> <Cmd>open {list[0]?.n ?? 1}</Cmd><Muted>, or</Muted> <Cmd>cd projects</Cmd> <Muted>to see them on the page.</Muted></div>
        </Block>
      );
    },
  },

  education: {
    desc: "where I've studied",
    run: () => (
      <Block>
        {education.map((e) => (
          <div key={e.id} className="pb-1">
            <div><B>{e.school}</B> <Muted>· {e.date}</Muted></div>
            <div className="pl-3">{e.degree.replace(/\*$/, "").trim()} <Accent>{e.grade}</Accent></div>
          </div>
        ))}
      </Block>
    ),
  },

  achievements: {
    desc: "awards & certifications",
    run: () => {
      const { gssoc, hackathon, certifications } = achievements;
      return (
        <Block>
          <div>🏆 <B>{gssoc.title}</B> <Muted>({gssoc.subtitle})</Muted></div>
          <div className="pl-6">Rank <Accent>#{gssoc.rank}</Accent> of {gssoc.participants.toLocaleString("en-US")}+ · <Accent>{gssoc.mergedPRs}+</Accent> merged PRs</div>
          <div>⚡ <B>{hackathon.title}</B> <Muted>·</Muted> <Accent>{hackathon.badge}</Accent></div>
          <Gap />
          <div><Muted>certifications:</Muted></div>
          {certifications.map((c) => (
            <div key={c.course} className="pl-3"><Accent>✓</Accent> {c.course} <Muted>— {c.provider}</Muted></div>
          ))}
        </Block>
      );
    },
  },

  contact: {
    desc: "how to reach me",
    run: (_args, ctx) => (
      <Block>
        <Rows
          w="7rem"
          rows={socials.map((s) => [<Cyan key={s.name}>{s.name.toLowerCase()}</Cyan>, <L key="l" href={s.href}>{s.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</L>])}
        />
        <Gap />
        <div>
          <Muted>or</Muted>{" "}
          <button type="button" onClick={() => ctx.scrollTo("contact")} className="text-[#c8ff3d] underline underline-offset-2">
            jump to the contact form ↓
          </button>
        </div>
      </Block>
    ),
  },

  email: {
    desc: "copy my email to clipboard",
    run: async (_args, ctx) => {
      const addr = profile.email;
      const ok = await ctx.copy(addr);
      return ok ? (
        <div><Accent>✓</Accent> Copied <B>{addr}</B> to your clipboard.</div>
      ) : (
        <div>My email: <L href={`mailto:${addr}`}>{addr}</L></div>
      );
    },
  },

  open: {
    desc: "open cv, github, linkedin… or a project number",
    usage: "<target>",
    complete: () => [...Object.keys(openTargets), ...projects.map((_, i) => String(i + 1))],
    run: (args) => {
      const t = args[0]?.toLowerCase();
      if (!t) return <div><Muted>usage:</Muted> open &lt;{Object.keys(openTargets).join("|")}|1-{projects.length}&gt;</div>;
      const n = Number(t);
      const project = Number.isInteger(n) ? projects[n - 1] : null;
      const url = project ? project.github : openTargets[t];
      if (project && !url) return <div><Warn>{project.title}</Warn> <Muted>doesn't have a public link yet.</Muted></div>;
      if (!url) return <div><Err>open: '{args[0]}' not found.</Err> <Muted>Try</Muted> <Cmd>open cv</Cmd> <Muted>or</Muted> <Cmd>open 1</Cmd></div>;
      window.open(url, "_blank", "noopener,noreferrer");
      return <div><Accent>→</Accent> Opening <L href={url}>{project ? project.title : t}</L> in a new tab…</div>;
    },
  },

  theme: {
    desc: "switch site theme",
    usage: "[light|dark]",
    complete: () => ["light", "dark", "toggle"],
    run: (args, ctx) => {
      const cur = ctx.getTheme();
      const want = args[0]?.toLowerCase();
      if (want && !["light", "dark", "toggle"].includes(want)) return <div><Err>theme: use light, dark or toggle.</Err></div>;
      const next = !want || want === "toggle" ? (cur === "dark" ? "light" : "dark") : want;
      if (next === cur) return <div><Muted>Already in {cur} mode.</Muted></div>;
      ctx.setTheme(next);
      return <div><Accent>✓</Accent> Switched to <B>{next}</B> mode. <Muted>(the terminal stays dark, as all good terminals do)</Muted></div>;
    },
  },

  ls: {
    desc: "list sections",
    run: () => (
      <div className="flex flex-wrap gap-x-5 gap-y-0.5">
        {navLinks.filter((l) => l.id !== "home").map((l) => <Cyan key={l.id}>{l.id}/</Cyan>)}
        <span>resume.pdf</span>
      </div>
    ),
  },

  cd: {
    desc: "scroll to a section",
    usage: "<section>",
    complete: () => navLinks.map((l) => l.id),
    run: (args, ctx) => {
      const t = args[0]?.toLowerCase();
      if (!t) return <div><Muted>usage: cd &lt;section&gt; · run</Muted> <Cmd>ls</Cmd> <Muted>to see them</Muted></div>;
      const id = sectionAliases[t.replace(/\/$/, "")];
      if (!id) return <div><Err>cd: no such section: {args[0]}</Err></div>;
      ctx.scrollTo(id);
      return <div><Muted>→ /{id === "home" ? "" : id}</Muted></div>;
    },
  },

  cv: { desc: "open my resume", run: () => commands.open.run(["cv"]) },
  history: {
    desc: "show command history",
    run: (_a, ctx) =>
      ctx.history.length ? (
        <Block>{ctx.history.map((h, i) => <div key={i}><Muted>{String(i + 1).padStart(3, " ")}</Muted>  {h}</div>)}</Block>
      ) : (
        <Muted>No history yet.</Muted>
      ),
  },
  clear: { desc: "clear the screen (Ctrl+L)", run: (_a, ctx) => (ctx.clear(), null) },

  /* ----- utilities kept out of help to keep it short ----- */
  pwd: { hidden: true, run: () => <div>/home/pulkit/portfolio</div> },
  date: { hidden: true, run: () => <div>{new Date().toString()}</div> },
  echo: { hidden: true, run: (args) => <div>{args.join(" ")}</div> },
  cat: { hidden: true, run: (args) => (args[0] === "resume.pdf" ? <div><Muted>That's a binary file. Try</Muted> <Cmd>open cv</Cmd></div> : <div><Muted>cat: try</Muted> <Cmd>whoami</Cmd> <Muted>instead 🐈</Muted></div>) },

  /* ----- easter eggs ----- */
  sudo: {
    hidden: true,
    run: (args, ctx) => {
      const rest = args.join(" ").toLowerCase();
      if (rest === "hire pulkit" || rest === "hire pulkit shubham" || rest === "hire me")
        return <HireSequence scrollTo={ctx.scrollTo} />;
      if (rest.startsWith("rm")) return commands.rm.run(args.slice(1));
      if (!rest) return <div><Muted>usage: sudo &lt;command&gt; · I hear</Muted> <Cmd>sudo hire pulkit</Cmd> <Muted>works wonders.</Muted></div>;
      return <div><Err>recruiter is not in the sudoers file.</Err> <Muted>This incident will be reported… unless you try</Muted> <Cmd>sudo hire pulkit</Cmd></div>;
    },
  },
  rm: { hidden: true, run: () => <div><Warn>Nice try.</Warn> <Muted>This portfolio is protected by a highly motivated engineer.</Muted></div> },
  exit: { hidden: true, run: () => <div><Muted>There is no escape. But there is</Muted> <Cmd>contact</Cmd><Muted>.</Muted></div> },
  vim: { hidden: true, run: () => <div><Muted>You're now trapped in vim. Just kidding — type</Muted> <Cmd>:q</Cmd> <Muted>(or anything else).</Muted></div> },
  ":q": { hidden: true, run: () => <div><Accent>✓</Accent> <Muted>Escaped vim. Few have done it. Hire them.</Muted></div> },
  hello: { hidden: true, run: () => <div>👋 Hey there! Run <Cmd>whoami</Cmd> to get to know me.</div> },
  coffee: { hidden: true, run: () => <div>☕ Brewing… <Muted>Error 418: I'm a teapot. Let's grab a real one —</Muted> <Cmd>contact</Cmd></div> },
};

// Aliases resolve to the canonical command.
export const aliases = {
  exp: "experience",
  jobs: "experience",
  edu: "education",
  awards: "achievements",
  resume: "cv",
  hi: "hello",
  hey: "hello",
  vi: "vim",
  nano: "vim",
  about: "whoami",
  man: "help",
  "?": "help",
};
// Note: `github`, `linkedin`, `leetcode`, `twitter` also work bare, as shortcuts for `open <name>`.

const visibleNames = () => Object.keys(commands).filter((n) => !commands[n].hidden);

/** Split a line into [command, ...args], lower-casing the command only. */
export function parse(line) {
  const parts = line.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { name: "", args: [] };
  return { name: parts[0].toLowerCase(), args: parts.slice(1) };
}

/** Run a line. Returns { output, name } where output is React content or null. */
export async function execute(line, ctx) {
  const { name, args } = parse(line);
  if (!name) return { output: null, name };
  // Shortcuts: `github`, `linkedin`, `leetcode`, `twitter` -> open <x>
  if (openTargets[name] && !commands[name]) return { output: commands.open.run([name], ctx), name: "open" };
  const resolved = commands[name] ? name : aliases[name];
  const cmd = resolved && commands[resolved];
  if (!cmd) {
    const pool = [...visibleNames(), ...Object.keys(aliases).filter((a) => aliases[a])];
    const best = pool.map((c) => [c, levenshtein(name, c)]).sort((a, b) => a[1] - b[1])[0];
    return {
      name,
      output: (
        <div>
          <Err>command not found: {name}</Err>
          {best && best[1] <= 2 ? <> <Muted>· did you mean</Muted> <Cmd>{best[0]}</Cmd><Muted>?</Muted></> : <> <Muted>· type</Muted> <Cmd>help</Cmd></>}
        </div>
      ),
    };
  }
  return { output: await cmd.run(args, ctx), name: resolved };
}

/**
 * Tab completion. Returns the new input value and, when ambiguous, the options to show.
 * Completes command names first, then the command's arguments.
 */
export function complete(input) {
  const endsWithSpace = /\s$/.test(input);
  const parts = input.trimStart().split(/\s+/);

  // Completing the command name itself: nothing precedes the word.
  if (parts.length <= 1 && !endsWithSpace) {
    const pool = [...new Set([...visibleNames(), ...Object.keys(openTargets)])];
    return completeWord(input, "", parts[0] ?? "", pool);
  }

  // Completing an argument: keep everything before the current word as `head`.
  const name = parts[0].toLowerCase();
  const cmd = commands[name] ?? commands[aliases[name]];
  if (!cmd?.complete) return { value: input, options: [] };
  const current = endsWithSpace ? "" : parts.at(-1);
  const head = input.slice(0, input.length - current.length);
  return completeWord(input, head, current, cmd.complete());
}

/** bash-style: unique match completes fully, several matches extend to the shared prefix and list. */
function completeWord(input, head, prefix, pool) {
  const matches = pool.filter((c) => c.startsWith(prefix.toLowerCase()));
  if (matches.length === 1) return { value: `${head}${matches[0]} `, options: [] };
  if (matches.length === 0) return { value: input, options: [] };
  let common = matches[0];
  for (const m of matches) while (!m.startsWith(common)) common = common.slice(0, -1);
  return { value: common.length > prefix.length ? head + common : input, options: matches };
}

/** Suggested commands shown as tappable chips (great on mobile). */
export const quickCommands = ["help", "whoami", "neofetch", "experience", "skills", "projects --ml", "achievements", "contact"];
