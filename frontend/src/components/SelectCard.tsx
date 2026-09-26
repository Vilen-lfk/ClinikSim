import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  active: boolean;
  onClick: () => void;
  layoutId: string;
  children: ReactNode;
  className?: string;
}

/**
 * Карточка выбора с "плавающей" подсветкой: при переключении между карточками
 * одной группы (общий layoutId) подсветка плавно перелетает, а не дёргается.
 */
export default function SelectCard({ active, onClick, layoutId, children, className = "" }: Props) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 500, damping: 32 }}
      className={`relative overflow-hidden rounded-lg border p-4 text-left transition-colors duration-150 ${
        active ? "border-teal text-ink" : "border-line text-ink hover:border-teal/50"
      } ${className}`}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          className="absolute inset-0 -z-10 bg-teal-light"
        />
      )}
      {children}
    </motion.button>
  );
}