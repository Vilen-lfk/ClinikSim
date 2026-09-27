import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import { SkeletonRows } from "../components/Skeleton";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function HistoryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const history = useQuery({ queryKey: ["history"], queryFn: api.getHistory, staleTime: 0 });
  const stats = useQuery({ queryKey: ["stats"], queryFn: api.getStats, staleTime: 0 });

  const deleteSession = useMutation({
    mutationFn: (id: number) => api.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      showToast("Сессия удалена");
    },
    onError: (e) => showToast((e as Error).message, "error"),
  });

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Удалить незавершённую сессию «${title}»? Это действие нельзя отменить.`)) {
      deleteSession.mutate(id);
    }
  };

  const finished = (history.data ?? []).filter((s) => s.status === "finished" && s.score !== null);
  const avg = finished.length ? finished.reduce((a, s) => a + (s.score ?? 0), 0) / finished.length : 0;
  const best = finished.length ? Math.max(...finished.map((s) => s.score ?? 0)) : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium text-ink">Моя история</h1>
        <Link to="/" className="text-sm text-teal hover:text-teal-dark">
          На главную
        </Link>
      </header>

      {history.error && <ErrorBanner message={(history.error as Error).message} />}

      <p className="text-sm text-muted">Студент: {user?.full_name || user?.username}</p>

      <motion.section
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        className="grid grid-cols-3 gap-3 text-center"
      >
        {[
          ["Завершено", finished.length],
          ["Средний балл", avg.toFixed(1)],
          ["Лучший результат", best],
        ].map(([label, value]) => (
          <motion.div
            key={label}
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
            className="rounded-lg border border-line bg-card p-3"
          >
            <div className="font-mono text-2xl font-semibold text-ink">{value}</div>
            <div className="text-xs text-muted">{label}</div>
          </motion.div>
        ))}
      </motion.section>

      {history.isLoading ? (
        <SkeletonRows count={4} />
      ) : (history.data ?? []).length === 0 ? (
        <EmptyState
          icon="🩺"
          title="Попыток пока нет"
          description="Пройдите первый клинический сценарий, чтобы увидеть здесь свою историю."
          action={
            <Link to="/new-simulation">
              <Button>Начать симуляцию</Button>
            </Link>
          }
        />
      ) : (
        <section className="overflow-x-auto rounded-xl border border-line bg-card">
          <table className="w-full text-sm">
            <thead className="bg-paper text-left text-muted">
              <tr>
                <th className="p-3 font-medium">Дата</th>
                <th className="p-3 font-medium">Сценарий</th>
                <th className="p-3 font-medium">Ваш диагноз</th>
                <th className="p-3 font-medium">Балл</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {(history.data ?? []).map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="p-3 whitespace-nowrap font-mono text-xs text-muted">
                    {new Date(s.created_at).toLocaleString("ru-RU")}
                  </td>
                  <td className="p-3 text-ink">{s.scenario_title}</td>
                  <td className="p-3 text-ink">{s.final_diagnosis ?? "—"}</td>
                  <td className="p-3 font-mono font-medium text-ink">{s.score ?? "—"}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link to={s.status === "finished" ? `/results/${s.id}` : `/simulation/${s.id}`}>
                        <Button variant="ghost" className="px-0 py-0">
                          {s.status === "finished" ? "Результаты" : "Продолжить"}
                        </Button>
                      </Link>
                      {s.status === "active" && (
                        <button
                          onClick={() => handleDelete(s.id, s.scenario_title)}
                          disabled={deleteSession.isPending}
                          title="Удалить незавершённую сессию"
                          className="text-clay hover:text-clay-dark disabled:opacity-40"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="font-serif text-lg font-medium text-ink">Статистика по сценариям (все студенты)</h2>
        <div className="overflow-x-auto rounded-xl border border-line bg-card">
          <table className="w-full text-sm">
            <thead className="bg-paper text-left text-muted">
              <tr>
                <th className="p-3 font-medium">Сценарий</th>
                <th className="p-3 font-medium">Попыток</th>
                <th className="p-3 font-medium">Средний балл</th>
              </tr>
            </thead>
            <tbody>
              {(stats.data ?? []).map((s) => (
                <tr key={s.scenario_id} className="border-t border-line">
                  <td className="p-3 text-ink">{s.title}</td>
                  <td className="p-3 font-mono">{s.attempts}</td>
                  <td className="p-3 font-mono">{s.avg_score ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}