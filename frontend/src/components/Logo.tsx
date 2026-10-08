interface Props {
  size?: number;
  className?: string;
}

/**
 * Однотонная иконка-кардиограмма — тот же знак, что и в favicon.
 * Красится через currentColor/фон на CSS-переменных темы, поэтому
 * автоматически меняет цвет при смене светлой/тёмной темы и акцента.
 */
export default function Logo({ size = 28, className = "" }: Props) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-lg border border-teal/25 bg-teal-light text-teal ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" width={size * 0.62} height={size * 0.62} fill="none">
        <path
          d="M2 16h6l2.5-7 4 14 3.5-11 2 4h10"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}