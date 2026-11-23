import { useState } from "react";
import { Check } from "./Check";
import { ProofList } from "./ProofList";
import { formatYears, minYears, monthsWorked } from "./experience";
import type { Data, ProgressMap, Role } from "./types";

interface Props {
  data: Data;
  progress: ProgressMap;
  onToggle: (id: string, v: boolean) => void;
}

type Sort = "ready" | "company" | "level";
const LEVEL: Record<string, number> = { Junior: 0, Mid: 1, "Mid–Senior": 2, Senior: 3 };

export function RolesView({ data, progress, onToggle }: Props) {
  const [sort, setSort] = useState<Sort>("ready");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const skills = Object.fromEntries(data.skills.map((s) => [s.id, s]));
  const myMonths = monthsWorked(data.experience);
  const isDone = (id: string) => !!progress[id]?.done;

  const skillsPct = (r: Role) => (r.must.length ? r.must.filter(isDone).length / r.must.length : 0);
  // Years of experience: 1 when met (or none stated / no experience data), otherwise your months / months asked for.
  const expPct = (r: Role) => {
    const need = minYears(r.exp);
    if (need === null || !data.experience || need === 0) return 1;
    return Math.min(1, myMonths / (need * 12));
  };
  // A role is only as ready as its weaker side: skills or years.
  const ready = (r: Role) => Math.min(skillsPct(r), expPct(r));
  const roles = [...data.roles].sort((a, b) => {
    if (sort === "company") return a.company.localeCompare(b.company);
    if (sort === "level")
      return (LEVEL[a.level] ?? 0) - (LEVEL[b.level] ?? 0) || a.company.localeCompare(b.company);
    return ready(b) - ready(a) || a.company.localeCompare(b.company);
  });

  const row = (id: string) => {
    const s = skills[id];
    if (!s) return null;
    const d = isDone(id);
    return (
      <div className={`rsk${d ? " d" : ""}`} key={id}>
        <Check checked={d} label={s.name} onChange={(v) => onToggle(id, v)} />
        <div className="t">
          <b>{s.name}</b>
          {d && <small>✔ {s.check}</small>}
          {d && <ProofList proof={progress[id]?.proof} />}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="tools">
        <select aria-label="Sort roles" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          <option value="ready">Closest to ready first</option>
          <option value="company">Company A–Z</option>
          <option value="level">Seniority</option>
        </select>
      </div>
      <ul className="list">
        {roles.map((r) => {
          const m = r.must.filter(isDone).length;
          const n = r.nice.filter(isDone).length;
          const isReady = r.must.length > 0 && m === r.must.length && expPct(r) >= 1;
          const isOpen = !!open[r.id];
          return (
            <li className={`item${isReady ? " done" : ""}`} key={r.id}>
              <div className="main">
                <div className="rolehead">
                  <button
                    className="head"
                    aria-expanded={isOpen}
                    onClick={() => setOpen((o) => ({ ...o, [r.id]: !o[r.id] }))}
                  >
                    <span className="rtitle">
                      {r.company} — {r.title}
                    </span>
                    <span className="tag">{r.level}</span>
                    {isReady && (
                      <span className="tag" style={{ background: "var(--done-soft)", color: "var(--done)" }}>
                        Ready
                      </span>
                    )}
                    <span className="chev" style={{ marginLeft: "auto" }} />
                  </button>
                  <div className="rmeta">
                    {r.exp}
                    {(() => {
                      const need = minYears(r.exp);
                      if (need === null || !data.experience) return null;
                      const short = need * 12 - myMonths;
                      return short <= 0 ? (
                        <span style={{ color: "var(--done)" }}> (you: {formatYears(myMonths)} ✓)</span>
                      ) : (
                        <span> (you: {formatYears(myMonths)}, {formatYears(short)} short)</span>
                      );
                    })()}{" "}
                    · {r.mode} ·{" "}
                    <a className="link" href={r.url} target="_blank" rel="noopener noreferrer">
                      Open job description ↗
                    </a>
                  </div>
                  <div className="rbar">
                    <div
                      className="bar"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(ready(r) * 100)}
                    >
                      <i style={{ width: `${Math.round(ready(r) * 100)}%` }} />
                    </div>
                    <span className="pct">{Math.round(ready(r) * 100)}%</span>
                    <span className="rcount">
                      {m}/{r.must.length} must-haves
                      {expPct(r) < 1 && ` · experience ${Math.round(expPct(r) * 100)}%`}
                      {r.nice.length > 0 && ` · ${n}/${r.nice.length} bonus`}
                    </span>
                  </div>
                </div>
                <div className="detail" hidden={!isOpen}>
                  <div>
                    <div className="groupt">Requirements</div>
                    {r.must.map(row)}
                  </div>
                  {r.nice.length > 0 && (
                    <div>
                      <div className="groupt">Nice to have</div>
                      {r.nice.map(row)}
                    </div>
                  )}
                  {r.note && <div className="note">{r.note}</div>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
