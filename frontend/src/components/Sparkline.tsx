interface Props {
  values: number[];
  width?: number;
  height?: number;
}

/** Простая мини-линия динамики баллов по сессиям (в хронологическом порядке). */
export default function Sparkline({ values, width = 220, height = 48 }: Props) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 100);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = width / Math.max(values.length - 1, 1);
  const points = values.map((v, i) => [i * step, height - ((v - min) / range) * height] as const);
  const path = points.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline points={path} fill="none" stroke="rgb(var(--color-teal))" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.5} fill="rgb(var(--color-teal))" />
      ))}
    </svg>
  );
}