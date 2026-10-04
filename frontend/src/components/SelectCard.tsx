import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  active: boolean;
  onClick: () => void;
  layoutId: string;
  children: ReactNode;
  className?: string;
}

export default function SelectCard({ active, onClick, layoutId, children, className = "" }: Props) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 480, damping: 30 }}
      className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-colors duration-150 ${
        active ? "border-teal text-ink shadow-sm" : "border-line text-ink hover:border-teal/50"
      } ${className}`}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          transition={{ type: "spring", stiffness: 480, damping: 34 }}
          className="absolute inset-0 -z-10 bg-teal-light"
        />
      )}
      {children}
    </motion.button>
  );
}