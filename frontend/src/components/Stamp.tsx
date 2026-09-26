import { motion } from "framer-motion";

interface Props {
  correct: boolean;
}

/** Оттиск-«печать» вердикта по диагнозу — как в бумажной медкарте. */
export default function Stamp({ correct }: Props) {
  return (
    <motion.div
      initial={{ scale: 2.2, opacity: 0, rotate: correct ? -14 : -6 }}
      animate={{ scale: 1, opacity: 1, rotate: correct ? -8 : -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.3 }}
      style={{ borderStyle: "double" }}
      className={`inline-block rounded-sm border-[3px] px-3 py-1 font-serif text-sm font-semibold uppercase tracking-wide ${
        correct ? "border-teal text-teal" : "border-clay text-clay"
      }`}
    >
      {correct ? "Диагноз верный" : "Диагноз не совпал"}
    </motion.div>
  );
}