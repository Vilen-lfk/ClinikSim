interface Props {
  size?: "hero" | "inline";
  active?: boolean;
  className?: string;
}

/**
 * Линия кардиомонитора — единственный анимационный акцент бренда.
 * hero: рисуется один раз при загрузке страницы.
 * inline + active: непрерывно "бежит", показывая, что пациент отвечает.
 */
export default function PulseLine({ size = "hero", active = false, className = "" }: Props) {
  const isHero = size === "hero";
  const viewBox = isHero ? "0 0 400 60" : "0 0 60 20";
  const path = isHero
    ? "M0 30 H130 L145 8 L160 52 L175 6 L190 30 H400"
    : "M0 10 H18 L21 3 L25 17 L29 1 H60";

  return (
    <svg
      viewBox={viewBox}
      className={`h-auto w-full text-teal ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <path
        d={path}
        stroke="currentColor"
        strokeWidth={isHero ? 2.5 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={isHero ? 900 : 120}
        className={isHero ? "animate-draw" : active ? "animate-draw-loop opacity-90" : "opacity-30"}
      />
    </svg>
  );
}