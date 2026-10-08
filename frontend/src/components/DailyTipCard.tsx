import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";
import { DAILY_TIPS } from "../constants/tips";

const ROTATE_MS = 12000; // смена совета каждые 12 секунд

export default function DailyTipCard() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * DAILY_TIPS.length));

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % DAILY_TIPS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-card p-5 shadow-glow-ring">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-light text-teal-dark">
          <Lightbulb size={16} strokeWidth={2.2} />
        </span>
        <span className="font-serif text-sm font-bold text-ink">Совет дня</span>
      </div>

      <div className="relative min-h-[4.5rem]">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="text-sm leading-relaxed text-muted"
          >
            {DAILY_TIPS[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex gap-1.5">
        {DAILY_TIPS.map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
              i === index ? "bg-teal" : "bg-line"
            }`}
          />
        ))}
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-teal/10 blur-2xl"
      />
    </div>
  );
}