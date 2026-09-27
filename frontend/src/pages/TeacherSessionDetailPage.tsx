import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import Stamp from "../components/Stamp";
import { DIFFICULTY_LABELS, SPECIALTY_LABELS } from "../constants/taxonomy";

export default function TeacherSessionDetailPage() {
  const { id } = useParams();
  const sessionId = Number(id);

  const { data: session, isLoading, error } = useQuery({
    queryKey: ["teacher-session", sessionId],
    queryFn: () => api.getTeacherSession(sessionId),
  });

  if (isLoading) return <p className="p-6 text-muted">Загрузка…</p>;
  if (error || !session) return <p className="p-6 text-clay">Не удалось загрузить сессию.</p>;

  const ev = session.evaluation;

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-6">
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl font-medium text-ink">{session.scenario.title}</h1>
          <Link to={`/teacher/students/${session.user_id ?? ""}`} className="text-sm text-teal hover:text-teal-dark">
            К сессиям студента
          </Link>
        </div>
        <p className="text-sm text-muted">Студент: {session.student_id}</p>
        <div className="flex flex-wrap gap-2 pt-1 text-xs">
          <span className="rounded-full bg-line px-2 py-1 text-muted">
            {SPECIALTY_LABELS[session.scenario.specialty] ?? session.scenario.specialty}
          </span>
          <span className="rounded-full bg-line px-2 py-1 text-muted">
            {DIFFICULTY_LABELS[session.scenario.difficulty] ?? session.scenario.difficulty}
          </span>
          <span className="rounded-full bg-line px-2 py-1 font-mono text-muted">
            {new Date(session.created_at).toLocaleString("ru-RU")}
          </span>
        </div>
      </header>

      {session.status !== "finished" || !ev ? (
        <div className="rounded-xl border border-gold/40 bg-card p-4 text-sm text-ink">
          Сессия ещё не завершена студентом. Ниже — переписка на данный момент.
        </div>
      ) : (
        <>
          <section className="rounded-xl border border-line bg-card p-4">
            <div className="mb-2 text-sm font-medium text-ink">Диагноз</div>
            <p className="mb-1 text-sm text-muted">Ответ студента: {session.final_diagnosis}</p>
            <p className="mb-3 text-sm text-muted">Правильный: {session.correct_diagnosis}</p>
            <Stamp correct={ev.diagnosis_correct} />
          </section>

          <section className="space-y-3 rounded-xl border border-line bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-ink">Оценка по критериям</h2>
              <span className="font-mono text-lg font-semibold text-ink">{ev.total_score} / 100</span>
            </div>
            {ev.criteria.map((c) => (
              <div key={c.key} className="flex justify-between text-sm">
                <span className="text-ink">{c.title}</span>
                <span className="font-mono">
                  {c.score} / {c.max_score}
                </span>
              </div>
            ))}
          </section>

          {ev.missed_questions.length > 0 && (
            <section className="rounded-xl border border-clay/40 bg-card p-4">
              <h2 className="mb-2 font-serif text-lg font-medium text-ink">Пропущенные вопросы</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
                {ev.missed_questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <section className="rounded-xl border border-line bg-card p-4">
        <h2 className="mb-2 font-serif text-lg font-medium text-ink">Протокол диалога</h2>
        <div className="space-y-2 text-sm">
          {session.messages.map((m) => (
            <p key={m.id}>
              <span className={`font-medium ${m.role === "student" ? "text-teal" : "text-muted"}`}>
                {m.role === "student" ? "Студент" : "Пациент"}:
              </span>{" "}
              {m.content}
            </p>
          ))}
          {session.messages.length === 0 && <p className="text-muted">Сообщений пока нет.</p>}
        </div>
      </section>
    </div>
  );
}