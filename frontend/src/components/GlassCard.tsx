import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function GlassCard({ children, className = "", delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2, ease: "easeOut" }}
      className={`glass-card rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
}