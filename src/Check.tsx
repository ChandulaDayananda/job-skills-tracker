interface Props {
  checked: boolean;
  label: string;
  onChange: (v: boolean) => void;
}

export function Check({ checked, label, onChange }: Props) {
  return (
    <label className="chk">
      <input
        type="checkbox"
        checked={checked}
        aria-label={`Mark ${label} as learned`}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="box" />
    </label>
  );
}
