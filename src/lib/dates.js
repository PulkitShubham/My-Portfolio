// Shared date helpers for experience timelines (used by Experience and the terminal).

/** Parse YYYY-MM-DD as a local date (avoids UTC off-by-one-day shifts). */
export const parseISODate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** "Mar 2025" */
export const formatMonthYear = (iso) =>
  parseISODate(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });

/** Inclusive month count, LinkedIn-style (Mar 2025 – Aug 2026 = 18). `end: null` means today. */
export function monthsBetween(start, end) {
  const a = parseISODate(start);
  const b = end ? parseISODate(end) : new Date();
  return Math.max(1, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + 1);
}

/** 18 -> "1 yr 6 mos" */
export function formatDuration(months) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y} yr${y > 1 ? "s" : ""}`, m && `${m} mo${m > 1 ? "s" : ""}`].filter(Boolean).join(" ");
}
