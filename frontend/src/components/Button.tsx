import { motion, type HTMLMotionProps } from "framer-motion";

type Variant = "primary" | "secondary" | "ghost";

interface Props extends HTMLMotionProps<"button"> {
  variant?: Variant;
}

const STYLES: Record<Variant, string> = {
  primary:
    "relative overflow-hidden rounded-xl bg-gradient-to-br from-teal to-teal-dark text-white shadow-glow " +
    "hover:shadow-glow-lg disabled:bg-none disabled:bg-line disabled:text-muted disabled:shadow-none",
  secondary:
    "border border-line bg-card text-ink hover:border-teal hover:text-teal hover:shadow-sm " +
    "disabled:opacity-50 disabled:shadow-none",
  ghost: "text-teal hover:text-teal-dark disabled:opacity-40",
};

export default function Button({ variant = "primary", className = "", disabled, children, ...rest }: Props) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.96, y: 1 }}
      whileHover={disabled ? {} : { y: -2 }}
      transition={{ type: "spring", stiffness: 480, damping: 28 }}
      disabled={disabled}
      className={`group rounded-xl px-4 py-2.5 text-sm font-medium transition-[colors,box-shadow] duration-200 ${STYLES[variant]} ${className}`}
      {...rest}
    >
      {variant === "primary" && !disabled && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />
      )}
      <span className="relative">{children}</span>
    </motion.button>
  );
}