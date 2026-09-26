interface Props {
  value: number; // 0–100
  size?: number;
  label?: string;
}

export default function DonutChart({ value, size = 96, label }: Props) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--color-line))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--color-teal))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-ink font-mono text-lg font-semibold">
          {Math.round(value)}
        </text>
      </svg>
      {label && <span className="mt-1 text-xs text-muted">{label}</span>}
    </div>
  );
}