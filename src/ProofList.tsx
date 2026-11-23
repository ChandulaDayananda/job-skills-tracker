import type { Proof } from "./types";

const LABEL: Record<string, string> = {
  cv: "CV",
  certificate: "Certificate",
  linkedin: "LinkedIn",
  project: "Project",
  link: "Link",
  self: "Self-declared",
};

export const isVerified = (proof?: Proof[]) => !!proof?.some((p) => p.kind !== "self");

export function ProofList({ proof }: { proof?: Proof[] }) {
  if (!proof?.length) return <p className="proof unv">⚠ No reason recorded for this tick.</p>;
  return (
    <ul className="proofs">
      {proof.map((p, i) => (
        <li key={i} className={p.kind === "self" ? "unv" : ""}>
          <b>{LABEL[p.kind]}</b>
          {p.source && <> · {p.source}</>}
          <span> — {p.detail}</span>
          {p.kind === "self" && <em> (unverified)</em>}
        </li>
      ))}
    </ul>
  );
}
