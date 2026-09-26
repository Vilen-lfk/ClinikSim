import { AnimatePresence, motion } from "framer-motion";
import type { ScenarioListItem } from "../types";
import SelectCard from "./SelectCard";

interface Props {
  scenarios: ScenarioListItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const DIFFICULTY: Record<string, { label: string; bar: string }> = {
  easy: { label: "Лёгкий", bar: "bg-teal" },
  medium: { label: "Средний", bar: "bg-gold" },
  hard: { label: "Сложный", bar: "bg-clay" },
};

export default function ScenarioSelector({ scenarios, selectedId, onSelect }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {scenarios.map((s) => {
        const d = DIFFICULTY[s.difficulty] ?? { label: s.difficulty, bar: "bg-muted" };
        const active = s.id === selectedId;
        return (
          <SelectCard
            key={s.id}
            active={active}
            onClick={() => onSelect(s.id)}
            layoutId="scenario-highlight"
            className="pt-5 card-texture"
          >
            <span className={`absolute inset-x-0 top-0 h-1.5 ${d.bar}`} />
            <span className="mb-2 inline-block font-mono text-xs text-muted">{d.label}</span>
            <div className="font-serif text-base font-medium text-ink">{s.title}</div>
            <AnimatePresence>
              {active && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-teal text-xs text-white"
                >
                  ✓
                </motion.span>
              )}
            </AnimatePresence>
          </SelectCard>
        );
      })}
    </div>
  );
}