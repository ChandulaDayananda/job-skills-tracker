import { useEffect, useRef, useState } from "react";
import type { Proof, ProofKind } from "./types";

const KINDS: { value: ProofKind; label: string; hint: string }[] = [
  { value: "cv", label: "My CV", hint: "Which job or project in your CV shows it" },
  { value: "certificate", label: "Certificate / course", hint: "Certificate name and the module" },
  { value: "linkedin", label: "LinkedIn profile", hint: "Which role or skill entry" },
  { value: "project", label: "Project / repo", hint: "Repo or project name and what you built" },
  { value: "link", label: "Link (article, course page)", hint: "URL and what it proves" },
];

interface Props {
  skillName: string;
  onCancel: () => void;
  onSave: (p: Proof) => void;
}

export function ProofDialog({ skillName, onCancel, onSave }: Props) {
  const [kind, setKind] = useState<ProofKind>("cv");
  const [source, setSource] = useState("");
  const [detail, setDetail] = useState("");
  const first = useRef<HTMLSelectElement>(null);
  useEffect(() => first.current?.focus(), []);

  const ok = detail.trim().length >= 15 && source.trim().length >= 3;
  const hint = KINDS.find((k) => k.value === kind)?.hint;

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={`Proof for ${skillName}`}>
      <form
        className="modal-box"
        onSubmit={(e) => {
          e.preventDefault();
          if (ok) onSave({ kind, source: source.trim(), detail: detail.trim() });
        }}
      >
        <h3>How do you know {skillName}?</h3>
        <p className="sub">A skill can only be checked with a reason. Say what shows it.</p>
        <label>
          Proof type
          <select ref={first} value={kind} onChange={(e) => setKind(e.target.value as ProofKind)}>
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Source
          <input value={source} onChange={(e) => setSource(e.target.value)} placeholder={hint} />
        </label>
        <label>
          What shows it (at least a sentence)
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="e.g. “Built X with Y at Z”"
          />
        </label>
        <div className="modal-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={!ok}>
            Check it off
          </button>
        </div>
      </form>
    </div>
  );
}
