import type { Proof } from "./types";

const LABEL: Record<string, string> = {
  cv: "CV",
  certificate: "Certificate",
  linkedin: "LinkedIn",
  project: "Project",
  link: "Link",
};

export const hasProof = (proof?: Proof[]) => !!proof?.length;

export function ProofList({ proof }: { proof?: Proof[] }) {
  if (!proof?.length) return <p className="proof unv">⚠ No reason recorded for this tick.</p>;
  return (
    <ul className="proofs">
      {proof.map((p, i) => (
        <li key={i}>
          <b>{LABEL[p.kind]}</b>
          {p.source && <> · {p.source}</>}
          <span> — {p.detail}</span>
        </li>
      ))}
    </ul>
  );
}
