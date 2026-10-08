import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface Props {
  streak: number;
}

function dayWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "дня";
  return "дней";
}

export default function StreakBar({ streak }: Props) {
  if (streak < 2) return null; // одна отдельная сессия — не серия, показывать нечего

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3 shadow-glow-ring"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-light text-teal-dark">
        <Flame size={18} strokeWidth={2.2} />
      </span>
      <div>
        <div className="text-sm font-semibold text-ink">
          Вы занимались {streak} {dayWord(streak)} подряд
        </div>
        <div className="text-xs text-muted">Не прерывайте серию — пройдите сценарий сегодня</div>
      </div>
    </motion.div>
  );
}