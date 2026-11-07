interface Props {
  /** Высота знака в пикселях (ширина пропорциональна). */
  size?: number;
  className?: string;
}

/**
 * Логотип «CS»: тёмная «C», бирюзовая «S» и линия ЭКГ поверх.
 * Цвета берутся из CSS-переменных темы, поэтому знак сам подстраивается под светлую/тёмную тему.
 */
export default function Logo({ size = 32, className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 64 48"
      height={size}
      width={(size * 64) / 48}
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {/* C */}
      <path
        d="M29.5 13.5 A14.5 14.5 0 1 0 29.5 34.5"
        stroke="rgb(var(--color-teal-dark))"
        strokeWidth="8.5"
      />
      {/* S */}
      <path
        d="M51 13.5 A7 7 0 1 0 44 24 A7 7 0 1 1 37 34.5"
        stroke="rgb(var(--color-teal))"
        strokeWidth="7.5"
      />
      {/* Линия ЭКГ: подложка цвета фона отделяет её от букв */}
      <path
        d="M4 24 H25 L27.5 19 L30.5 29 L33.5 12 L36.5 33 L39 24 H62"
        stroke="rgb(var(--color-card))"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 24 H25 L27.5 19 L30.5 29 L33.5 12 L36.5 33 L39 24 H62"
        stroke="rgb(var(--color-teal))"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}
