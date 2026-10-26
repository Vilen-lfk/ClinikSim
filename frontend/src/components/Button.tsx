import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface Props extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  /** Иконка слева от текста (например, из lucide-react). */
  icon?: ReactNode;
  children?: ReactNode;
}

const STYLES: Record<Variant, string> = {
  primary:
    "relative overflow-hidden bg-gradient-to-b from-teal to-teal-dark text-white font-semibold " +
    "ring-1 ring-inset ring-white/15 shadow-btn hover:shadow-btn-hover hover:brightness-110 " +
    "disabled:bg-none disabled:bg-line disabled:text-muted disabled:shadow-none disabled:ring-0 disabled:brightness-100",
  secondary:
    "border border-line bg-card/60 text-ink backdrop-blur-sm hover:border-teal/60 hover:bg-teal/10 hover:text-teal " +
    "disabled:opacity-50",
  ghost: "text-teal hover:bg-teal/10 hover:text-teal-dark disabled:opacity-40",
};

export default function Button({ variant = "primary", className = "", disabled, icon, children, ...rest }: Props) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.97 }}
      whileHover={disabled ? {} : { y: -1 }}
      transition={{ type: "spring", stiffness: 480, damping: 28 }}
      disabled={disabled}
      className={
        "group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium " +
        "transition-[color,background-color,border-color,box-shadow,filter] duration-200 " +
        `disabled:cursor-not-allowed ${STYLES[variant]} ${className}`
      }
      {...rest}
    >
      {variant === "primary" && !disabled && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />
      )}
      {icon && <span className="relative flex shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
      <span className="relative">{children}</span>
    </motion.button>
  );
}
