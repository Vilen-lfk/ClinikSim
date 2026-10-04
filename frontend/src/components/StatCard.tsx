import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  value: string | number;
  label: string;
  delay?: number;
}

export default function StatCard({ icon: Icon, value, label, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-line bg-card p-5 shadow-glow-ring"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-light text-teal-dark">
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div className="font-mono text-3xl font-bold tracking-tight text-ink">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-teal/10 blur-2xl"
      />
    </motion.div>
  );
}