function hashHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

/** Цветной кружок-инициал пациента. Фон всегда светлый пастельный — как бейдж, вне зависимости от темы приложения. */
export default function PatientAvatar({ name, className = "" }: { name: string; className?: string }) {
  const hue = hashHue(name);
  return (
    <span
      aria-hidden="true"
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: `hsl(${hue} 45% 85%)`, color: "#16241f" }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}