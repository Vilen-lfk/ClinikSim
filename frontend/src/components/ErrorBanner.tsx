import { motion } from "framer-motion";

export default function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2 rounded-lg border border-clay/40 bg-clay-light px-3 py-2 text-sm text-clay-dark"
    >
      <span aria-hidden="true" className="mt-0.5">⚠</span>
      <span>{message}</span>
    </motion.div>
  );
}