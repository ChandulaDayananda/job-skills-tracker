import { useMemo, useState } from "react";
import { Check } from "./Check";
import { ProofList } from "./ProofList";
import type { Data, Demand, ProgressMap, Skill, Proof } from "./types";

interface Props {
  data: Data;
  demand: Demand;
  progress: ProgressMap;
  onToggle: (id: string, v: boolean) => void;
  onNote: (id: string, note: string) => void;
}

type Sort = "demand" | "cat" | "az";
type Status = "all" | "todo" | "done";

export function SkillsView({ data, demand, progress, onToggle, onNote }: Props) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<Sort>("demand");
  const [status, setStatus] = useState<Status>("all");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const cats = useMemo(() => Array.from(new Set(data.skills.map((s) => s.cat))), [data.skills]);
  const isDone = (id: string) => !!progress[id]?.done;
  const score = (s: Skill) => demand[s.id].must.length * 10 + demand[s.id].nice.length;

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = data.skills.filter((s) => {
      if (cat !== "all" && s.cat !== cat) return false;
      if (status === "todo" && progress[s.id]?.done) return false;
      if (status === "done" && !progress[s.id]?.done) return false;
      if (needle && !`${s.name} ${s.desc} ${s.cat}`.toLowerCase().includes(needle)) return false;
      return true;
    });
    const byScore = (a: Skill, b: Skill) =>
      score(b) - score(a) || a.name.localeCompare(b.name);
    if (sort === "az") out.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "cat") out.sort((a, b) => a.cat.localeCompare(b.cat) || byScore(a, b));
    else out.sort(byScore);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.skills, q, cat, sort, status, progress, demand]);

  return (
    <>
      <div className="tools">
        <input
          type="search"
          placeholder="Search skills…"
          aria-label="Search skills"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">All categories</option>
          {cats.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          <option value="demand">Most needed first</option>
          <option value="cat">Group by category</option>
          <option value="az">A–Z</option>
        </select>
        <div className="seg" role="group" aria-label="Status filter">
          {(["all", "todo", "done"] as Status[]).map((v) => (
            <button key={v} aria-pressed={status === v} onClick={() => setStatus(v)}>
              {v === "all" ? "All" : v === "todo" ? "To learn" : "Done"}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty">Nothing matches these filters.</div>
      ) : (
        <ul className="list">
          {list.map((s, i) => (
            <SkillItem
              key={s.id}
              skill={s}
              showCat={sort === "cat" && (i === 0 || list[i - 1].cat !== s.cat)}
              isNew={!!s.added && s.added > data.baseline}
              done={isDone(s.id)}
              note={progress[s.id]?.note ?? ""}
              proof={progress[s.id]?.proof}
              demand={demand[s.id]}
              open={!!open[s.id]}
              onOpen={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}
              onToggle={(v) => onToggle(s.id, v)}
              onNote={(t) => onNote(s.id, t)}
            />
          ))}
        </ul>
      )}
    </>
  );
}

interface ItemProps {
  skill: Skill;
  showCat: boolean;
  isNew: boolean;
  done: boolean;
  note: string;
  proof?: Proof[];
  demand: Demand[string];
  open: boolean;
  onOpen: () => void;
  onToggle: (v: boolean) => void;
  onNote: (t: string) => void;
}

function SkillItem({ skill: s, showCat, isNew, done, note, proof, demand: dm, open, onOpen, onToggle, onNote }: ItemProps) {
  const [draft, setDraft] = useState(note);
  const mustN = dm.must.length;
  const niceN = dm.nice.length;
  return (
    <>
      {showCat && <li className="cathead">{s.cat}</li>}
      <li className={`item${done ? " done" : ""}`}>
        <Check checked={done} label={s.name} onChange={onToggle} />
        <div className="main">
          <button className="head" aria-expanded={open} onClick={onOpen}>
            <span className="name">{s.name}</span>
            {isNew && <span className="tag new">NEW</span>}
            <span className="tag">{s.cat}</span>
            <span className="need">
              {mustN > 0 && `Required by ${mustN} role${mustN > 1 ? "s" : ""}`}
              {niceN > 0 && `${mustN > 0 ? " · " : ""}bonus in ${niceN}`}
            </span>
            <span className="chev" />
          </button>
          {done && <p className="checked">✔ Checked: {s.check}</p>}
          {done && <ProofList proof={proof} />}
          <div className="detail" hidden={!open}>
            <div>
              <h4>What it is</h4>
              <p>{s.desc}</p>
            </div>
            {!done && (
              <div>
                <h4>Check it off when</h4>
                <p>{s.check}</p>
              </div>
            )}
            <div>
              <h4>Needed by</h4>
              <div className="chips">
                {dm.must.map((r) => (
                  <span className="chip" key={r.id}>
                    {r.company}
                  </span>
                ))}
                {dm.nice.map((r) => (
                  <span className="chip nice" key={r.id} title="Nice to have">
                    {r.company} (nice)
                  </span>
                ))}
                {mustN + niceN === 0 && <span className="chip nice">No current role asks for this</span>}
              </div>
            </div>
            <div>
              <h4>Your notes / resource links</h4>
              <textarea
                placeholder="Course, project or link you used…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => onNote(draft)}
              />
            </div>
          </div>
        </div>
      </li>
    </>
  );
}
