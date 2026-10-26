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
      className={`glass-card relative overflow-hidden rounded-2xl p-4 text-left text-ink transition-colors duration-200 ${
        active ? "glass-card--active" : ""
      } ${className}`}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          transition={{ type: "spring", stiffness: 480, damping: 34 }}
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-teal/18 via-transparent to-transparent"
        />
      )}
      {children}
    </motion.button>
  );
}