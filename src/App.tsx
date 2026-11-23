import { useEffect, useMemo, useState } from "react";
import { RolesView } from "./RolesView";
import { SkillsView } from "./SkillsView";
import { formatYears, monthsWorked } from "./experience";
import type { Data, Demand } from "./types";
import { useProgress } from "./useProgress";

type Tab = "skills" | "roles";
const initialTab = (): Tab => (location.hash === "#roles" ? "roles" : "skills");

export default function App() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>(initialTab);
  const { progress, setDone, setNote } = useProgress();

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data.json`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<Data>;
      })
      .then(setData)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    history.replaceState(null, "", `#${tab}`);
  }, [tab]);

  const demand = useMemo<Demand>(() => {
    const d: Demand = {};
    if (!data) return d;
    data.skills.forEach((s) => (d[s.id] = { must: [], nice: [] }));
    data.roles.forEach((r) => {
      r.must.forEach((id) => d[id]?.must.push(r));
      r.nice.forEach((id) => d[id]?.nice.push(r));
    });
    return d;
  }, [data]);

  if (error)
    return (
      <div className="wrap">
        <div className="err">Couldn’t load public/data.json. Check the file exists and reload.</div>
      </div>
    );
  if (!data)
    return (
      <div className="wrap">
        <p className="sub">Loading…</p>
      </div>
    );

  const total = data.skills.length;
  const done = data.skills.filter((s) => progress[s.id]?.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const months = monthsWorked(data.experience);
  const unread = data.sources.filter((s) => s.status === "unreadable");

  return (
    <div className="wrap">
      <h1>Job Skills Tracker</h1>
      <p className="sub">
        Built from {data.roles.length} job descriptions · last checked {data.lastChecked}
      </p>

      <section className="hero" aria-label="Overall progress">
        <div className="hero-top">
          <div className="big">
            {done} / {total}
            <small>skills checked</small>
          </div>
          <span className="pill" title="Counted from the experience list in data.json">
            Experience: {formatYears(months)}
          </span>
          <span className="pill">Saved in this browser</span>
        </div>
        <div className="rbar hero-bar">
          <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
            <i style={{ width: `${pct}%` }} />
          </div>
          <span className="pct">{pct}%</span>
        </div>
      </section>

      <div className="tabs" role="tablist">
        <button className="tab" role="tab" aria-selected={tab === "skills"} onClick={() => setTab("skills")}>
          Skills to learn
        </button>
        <button className="tab" role="tab" aria-selected={tab === "roles"} onClick={() => setTab("roles")}>
          By role
        </button>
      </div>

      <div hidden={tab !== "skills"}>
        <SkillsView data={data} demand={demand} progress={progress} onToggle={setDone} onNote={setNote} />
      </div>
      <div hidden={tab !== "roles"}>
        <RolesView data={data} progress={progress} onToggle={setDone} />
      </div>

      {unread.length > 0 && (
        <div className="panel">
          <h3>Files that couldn’t be read</h3>
          <ul>
            {unread.map((s) => (
              <li key={s.id}>
                <b>{s.title}</b> — {s.note || "unreadable"}
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.changelog.length > 0 && (
        <div className="panel">
          <h3>Update log</h3>
          <ul>
            {[...data.changelog].reverse().map((c, i) => (
              <li key={i}>
                <b>{c.date}</b> — {c.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
