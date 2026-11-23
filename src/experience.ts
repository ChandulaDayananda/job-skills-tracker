import type { Job } from "./types";

const idx = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return y * 12 + (m - 1);
};

/** Whole months worked, counting both the first and last month and never double-counting overlaps. */
export function monthsWorked(jobs: Job[] = [], now = new Date()): number {
  const nowIdx = now.getFullYear() * 12 + now.getMonth();
  const seen = new Set<number>();
  for (const j of jobs) {
    if (!j.counts) continue;
    const end = j.end ? idx(j.end) : nowIdx;
    for (let i = idx(j.start); i <= end; i++) seen.add(i);
  }
  return seen.size;
}

export function formatYears(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (!y) return `${m} mo`;
  return m ? `${y} yr ${m} mo` : `${y} yr`;
}

/** Lowest number of years a role asks for ("3–5 yrs" -> 3), or null if none is stated. */
export function minYears(exp: string): number | null {
  const m = exp.match(/\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}
