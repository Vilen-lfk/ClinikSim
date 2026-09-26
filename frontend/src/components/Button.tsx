import { motion, type HTMLMotionProps } from "framer-motion";

type Variant = "primary" | "secondary" | "ghost";

interface Props extends HTMLMotionProps<"button"> {
  variant?: Variant;
}

const STYLES: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-teal to-teal-dark text-white shadow-sm shadow-teal/20 " +
    "hover:shadow-lg hover:shadow-teal/25 " +
    "disabled:bg-none disabled:bg-line disabled:text-muted disabled:shadow-none",
  secondary:
    "border border-line bg-card text-ink hover:border-teal hover:text-teal hover:shadow-sm " +
    "disabled:opacity-50 disabled:shadow-none",
  ghost: "text-teal hover:text-teal-dark disabled:opacity-40",
};

export default function Button({ variant = "primary", className = "", disabled, children, ...rest }: Props) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.96, y: 1 }}
      whileHover={disabled ? {} : { y: -1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      disabled={disabled}
      className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-[colors,box-shadow] duration-150 ${STYLES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}