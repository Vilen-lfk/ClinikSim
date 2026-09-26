import { motion, type HTMLMotionProps } from "framer-motion";

type Variant = "primary" | "secondary" | "ghost";

interface Props extends HTMLMotionProps<"button"> {
  variant?: Variant;
}

const STYLES: Record<Variant, string> = {
  primary: "bg-teal text-white hover:bg-teal-dark hover:shadow-md disabled:bg-line disabled:text-muted disabled:shadow-none",
  secondary: "border border-line bg-card text-ink hover:border-teal hover:text-teal disabled:opacity-50",
  ghost: "text-teal hover:text-teal-dark disabled:opacity-40",
};

export default function Button({ variant = "primary", className = "", disabled, children, ...rest }: Props) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.97 }}
      whileHover={disabled ? {} : { y: -1 }}
      transition={{ duration: 0.15 }}
      disabled={disabled}
      className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${STYLES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}