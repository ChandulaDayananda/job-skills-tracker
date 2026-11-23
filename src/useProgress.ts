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

/** Progress lives in localStorage (per browser). Use Export/Import to move it between devices. */
export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>(load);

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
