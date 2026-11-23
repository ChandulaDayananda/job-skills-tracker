import { useCallback, useEffect, useState } from "react";
import type { ProgressMap } from "./types";

const KEY = "job-skills-tracker-v1";

function load(): ProgressMap {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") || {};
  } catch {
    return {};
  }
}

/** Merge two maps, keeping whichever entry for each skill was changed most recently. */
function merge(a: ProgressMap, b: ProgressMap): ProgressMap {
  const out: ProgressMap = { ...a };
  for (const [id, p] of Object.entries(b)) {
    if (!out[id] || (p.at ?? 0) >= (out[id].at ?? 0)) out[id] = p;
  }
  return out;
}

/**
 * Progress comes from two places: public/progress.json (committed to the repo, the shared baseline)
 * and localStorage (this browser's edits). The newer entry per skill wins.
 * To commit your progress: Export progress, then replace public/progress.json with the file.
 */
export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>(load);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}progress.json`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((repo: ProgressMap) => setProgress((local) => merge(repo, local)))
      .catch(() => {
        /* no committed progress: use local only */
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
    } catch {
      /* storage unavailable: keep working in memory */
    }
  }, [progress]);

  const setDone = useCallback((id: string, done: boolean) => {
    setProgress((m) => ({ ...m, [id]: { done, note: m[id]?.note ?? "", at: Date.now() } }));
  }, []);

  const setNote = useCallback((id: string, note: string) => {
    setProgress((m) => {
      if ((m[id]?.note ?? "") === note) return m;
      return { ...m, [id]: { done: m[id]?.done ?? false, note, at: Date.now() } };
    });
  }, []);

  const replaceAll = useCallback((next: ProgressMap) => setProgress(next), []);

  return { progress, setDone, setNote, replaceAll };
}
