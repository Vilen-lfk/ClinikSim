import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import Button from "../components/Button";
import Stamp from "../components/Stamp";
import { DIFFICULTY_LABELS, SPECIALTY_LABELS } from "../constants/taxonomy";

export default function ReviewPage() {
  const { id } = useParams();
  const sessionId = Number(id);
  const navigate = useNavigate();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => api.getSession(sessionId),
  });

  const retry = useMutation({
    mutationFn: () => api.createSession(session!.scenario.id),
    onSuccess: (s) => navigate(`/simulation/${s.id}`),
  });

  if (isLoading) return <p className="p-6 text-muted">Загрузка…</p>;
  if (error || !session) return <p className="p-6 text-clay">Не удалось загрузить разбор.</p>;

  const ev = session.evaluation;
  if (session.status !== "finished" || !ev) {
    return (
      <div className="p-6">
        <p className="mb-3">Сессия ещё не завершена.</p>
        <Link className="text-teal underline" to={`/simulation/${sessionId}`}>
          Вернуться к симуляции
        </Link>
      </div>
    );
  }

  const weakCriteria = ev.criteria.filter((c) => c.score / c.max_score < 0.7);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="font-serif text-2xl font-medium text-ink">Разбор ошибок</h1>
        <p className="text-muted">{session.scenario.title}</p>
        <div className="flex flex-wrap gap-2 pt-1 text-xs">
          <span className="rounded-full bg-line px-2 py-1 text-muted">
            {SPECIALTY_LABELS[session.scenario.specialty] ?? session.scenario.specialty}
          </span>
          <span className="rounded-full bg-line px-2 py-1 text-muted">
            {DIFFICULTY_LABELS[session.scenario.difficulty] ?? session.scenario.difficulty}
          </span>
          <span className="rounded-full bg-line px-2 py-1 font-mono text-muted">
            {new Date(session.created_at).toLocaleDateString("ru-RU")}
          </span>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Итоговый балл", `${ev.total_score} / 100`],
          ["Верных пунктов", `${ev.strengths.length}`],
          ["Ошибок", `${ev.missed_questions.length}`],
          ["Диагноз", ev.diagnosis_correct ? "Верный" : "Неверный"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-line bg-card p-3 text-center">
            <div className="font-mono text-lg font-semibold text-ink">{value}</div>
            <div className="text-xs text-muted">{label}</div>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-line bg-card p-4">
        <div className="mb-2 text-sm font-medium text-ink">Диагноз</div>
        <p className="mb-1 text-sm text-muted">Ваш вариант: {session.final_diagnosis}</p>
        <p className="mb-3 text-sm text-muted">Правильный: {session.correct_diagnosis}</p>
        <Stamp correct={ev.diagnosis_correct} />
      </section>

      {ev.strengths.length > 0 && (
        <section className="rounded-xl border border-teal/30 bg-teal-light p-4">
          <h2 className="mb-2 font-serif text-lg font-medium text-ink">Правильные действия</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
            {ev.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      {ev.missed_questions.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-medium text-ink">Пропущенные вопросы</h2>
          {ev.missed_questions.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-clay/40 bg-card p-4"
            >
              <div className="mb-1 font-mono text-xs uppercase text-muted">Ошибка №{i + 1}</div>
              <p className="text-sm text-ink">{q}</p>
              <p className="mt-2 text-sm text-muted">
                Рекомендация: уточните это в начале приёма — это один из ключевых пунктов сбора анамнеза для
                данного сценария.
              </p>
            </motion.div>
          ))}
        </section>
      )}

      {weakCriteria.length > 0 && (
        <section className="rounded-xl border border-gold/40 bg-card p-4">
          <h2 className="mb-2 font-serif text-lg font-medium text-ink">Предупреждения</h2>
          <ul className="space-y-2 text-sm text-ink">
            {weakCriteria.map((c) => (
              <li key={c.key}>
                <span className="font-medium">{c.title}:</span> {c.comment}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-line bg-card p-4">
        <h2 className="mb-2 font-serif text-lg font-medium text-ink">Общая рекомендация</h2>
        <p className="max-w-[70ch] text-sm text-ink">{ev.feedback}</p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => retry.mutate()} disabled={retry.isPending}>
          {retry.isPending ? "Запуск…" : "Повторить сценарий"}
        </Button>
        <Link to={`/results/${sessionId}`}>
          <Button variant="secondary">Вернуться к результатам</Button>
        </Link>
      </div>
    </div>
  );
}