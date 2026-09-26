import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Button from "../components/Button";
import PulseLine from "../components/PulseLine";
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
      <header className="space-y-3">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">
            Здравствуйте, {user?.full_name || user?.username}
          </h1>
          <p className="mt-1 max-w-md text-muted">
            Соберите анамнез у виртуального пациента, поставьте диагноз и получите оценку.
          </p>
        </div>
        <PulseLine size="hero" className="max-w-sm" />
      </header>

      <section className="grid grid-cols-3 gap-3">
        {[
          ["Пройдено сценариев", finished.length],
          ["Средний балл", avg.toFixed(1)],
          ["В процессе", inProgress.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-line bg-card p-3 text-center">
            <div className="font-mono text-2xl font-semibold text-ink">{value}</div>
            <div className="text-xs text-muted">{label}</div>
          </div>
        ))}
      </section>

      {inProgress.length > 0 && (
        <section className="rounded-xl border border-gold/40 bg-card p-4">
          <h2 className="mb-2 font-serif text-lg font-medium text-ink">Незавершённые сессии</h2>
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

        <Button className="px-6 py-3">Начать симуляцию</Button>
      </Link>
    </div>
  );
}