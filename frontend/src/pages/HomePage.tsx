import { Activity, Brain, Dna } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Button from "../components/Button";
import OnboardingTour from "../components/OnboardingTour";
import PulseLine from "../components/PulseLine";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  const history = useQuery({ queryKey: ["history"], queryFn: api.getHistory });

  const sessions = history.data ?? [];
  const finished = sessions.filter((s) => s.status === "finished" && s.score !== null);
  const inProgress = sessions.filter((s) => s.status === "active");
  const avg = finished.length ? finished.reduce((a, s) => a + (s.score ?? 0), 0) / finished.length : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <OnboardingTour />

      <header className="space-y-3">
        <div>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-ink">
            Здравствуйте, {user?.full_name || user?.username}
          </h1>
          <p className="mt-1 max-w-md text-muted">
            Соберите анамнез у виртуального пациента, поставьте диагноз и получите оценку.
          </p>
        </div>
        <PulseLine size="hero" className="max-w-sm" />
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={Activity} value={finished.length} label="Сценариев пройдено" delay={0} />
        <StatCard icon={Brain} value={avg.toFixed(1)} label="Средний балл" delay={0.06} />
        <StatCard icon={Dna} value={inProgress.length} label="В процессе" delay={0.12} />
      </section>

      {inProgress.length > 0 && (
        <section className="rounded-2xl border border-gold/40 bg-card p-4 shadow-glow-ring">
          <h2 className="mb-2 font-serif text-lg font-bold text-ink">Незавершённые сессии</h2>
          <ul className="space-y-2 text-sm">
            {inProgress.map((s) => (
              <li key={s.id} className="flex items-center justify-between">
                <span className="text-ink">{s.scenario_title}</span>
                <Link to={`/simulation/${s.id}`} className="text-teal hover:text-teal-dark">
                  Продолжить
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link to="/new-simulation">
        <Button className="px-6 py-3 text-base">Начать симуляцию</Button>
      </Link>
    </div>
  );
}