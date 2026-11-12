// Output primitives for the terminal. The terminal is always dark, so colours are fixed.
/* ---------- output primitives (terminal is always dark, so colours are fixed) ---------- */
export const Accent = ({ children }) => <span className="text-[#c8ff3d]">{children}</span>;
export const Cyan = ({ children }) => <span className="text-[#22d3ee]">{children}</span>;
export const Violet = ({ children }) => <span className="text-[#a78bfa]">{children}</span>;
export const Muted = ({ children }) => <span className="text-[#7c7c8a]">{children}</span>;
export const Err = ({ children }) => <span className="text-[#f87171]">{children}</span>;
export const Warn = ({ children }) => <span className="text-[#facc15]">{children}</span>;
export const B = ({ children }) => <span className="font-semibold text-white">{children}</span>;
export const Cmd = ({ children }) => <span className="rounded bg-white/10 px-1 text-[#c8ff3d]">{children}</span>;
export const L = ({ href, children }) => (
  <a href={href} target="_blank" rel="noreferrer" className="text-[#22d3ee] underline decoration-[#22d3ee]/40 underline-offset-2 hover:decoration-[#22d3ee]">
    {children}
  </a>
);
export const Block = ({ children }) => <div className="space-y-0.5">{children}</div>;
export const Gap = () => <div className="h-2" />;
/** Two-column rows that stay aligned, e.g. "whoami   who is Pulkit?" */
// Stacks on phones; two aligned columns from `sm` up.
export const Rows = ({ rows, w = "9rem" }) => (
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
