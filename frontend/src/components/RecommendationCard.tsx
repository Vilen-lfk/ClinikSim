import { Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { SPECIALTY_LABELS } from "../constants/taxonomy";

interface Props {
  specialty: string;
  avgScore: number;
}

export default function RecommendationCard({ specialty, avgScore }: Props) {
  const label = SPECIALTY_LABELS[specialty] ?? specialty;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-card p-5 shadow-glow-ring">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-gold">
          <Compass size={16} strokeWidth={2.2} />
        </span>
        <span className="font-serif text-sm font-bold text-ink">Рекомендация</span>
      </div>
      <p className="text-sm leading-relaxed text-muted">
        Вы слабее всего в разделе «{label}» (средний балл {avgScore.toFixed(0)}). Попробуйте пройти ещё один
        сценарий этой специальности, чтобы закрепить материал.
      </p>
      <Link to="/new-simulation" className="mt-3 inline-block text-sm font-medium text-teal hover:text-teal-dark">
        Выбрать сценарий →
      </Link>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gold/10 blur-2xl"
      />
    </div>
  );
}