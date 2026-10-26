import { Activity, Brain, Dna } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Button from "../components/Button";
import DailyTipCard from "../components/DailyTipCard";
import OnboardingTour from "../components/OnboardingTour";
import PulseLine from "../components/PulseLine";
import RecommendationCard from "../components/RecommendationCard";
import StatCard from "../components/StatCard";
import StreakBar from "../components/StreakBar";
import { useAuth } from "../context/AuthContext";
import { timeGreeting } from "../utils/greeting";
import { calcStreak } from "../utils/streak";

export default function HomePage() {
  const { user } = useAuth();
  const history = useQuery({ queryKey: ["history"], queryFn: api.getHistory });

  const sessions = history.data ?? [];
  const finished = sessions.filter((s) => s.status === "finished" && s.score !== null);
  const inProgress = sessions.filter((s) => s.status === "active");
  const avg = finished.length ? finished.reduce((a, s) => a + (s.score ?? 0), 0) / finished.length : 0;
  const streak = calcStreak(sessions);

  // Специальность с самым низким средним баллом — показываем только если есть минимум 2 специальности с данными,
  // иначе "рекомендация" не несёт смысла (не с чем сравнивать).
  const bySpecialty = Object.entries(
    finished.reduce<Record<string, number[]>>((acc, s) => {
      (acc[s.scenario_specialty] ??= []).push(s.score ?? 0);
      return acc;
    }, {}),
  ).map(([key, scores]) => ({ key, avg: scores.reduce((a, b) => a + b, 0) / scores.length }));
  const weakest = bySpecialty.length >= 2 ? bySpecialty.reduce((a, b) => (b.avg < a.avg ? b : a)) : null;

  return (
    <div className="w-full space-y-8 p-6 lg:px-10">
      <OnboardingTour />

      <header className="space-y-3">
        <div>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-ink">
            {timeGreeting()}, {user?.full_name || user?.username}
          </h1>
          <p className="mt-1 max-w-md text-muted">
            Соберите анамнез у виртуального пациента, поставьте диагноз и получите оценку.
          </p>
        </div>
        <PulseLine size="hero" className="max-w-sm" />
      </header>

      <StreakBar streak={streak} />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={Activity} value={finished.length} label="Сценариев пройдено" delay={0} />
        <StatCard icon={Brain} value={avg.toFixed(1)} label="Средний балл" delay={0.06} />
        <StatCard icon={Dna} value={inProgress.length} label="В процессе" delay={0.12} />
      </section>

      {weakest && <RecommendationCard specialty={weakest.key} avgScore={weakest.avg} />}

      <DailyTipCard />

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
      <p>
        
      </p>
      <Link to="/new-simulation">
        <Button className="px-6 py-3 text-base">Начать симуляцию</Button>
      </Link>
    </div>
  );
}