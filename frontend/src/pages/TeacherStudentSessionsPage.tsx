import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import { SkeletonRows } from "../components/Skeleton";

export default function TeacherStudentSessionsPage() {
  const { id } = useParams();
  const userId = Number(id);

  const sessions = useQuery({
    queryKey: ["teacher-student-sessions", userId],
    queryFn: () => api.getTeacherStudentSessions(userId),
  });

  const studentName = sessions.data?.[0]?.student_full_name || sessions.data?.[0]?.student_username || "Студент";

  return (
    <div className="w-full space-y-6 p-6 lg:px-10">
      <header className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium text-ink">{studentName}</h1>
        <Link to="/teacher/dashboard" className="text-sm text-teal hover:text-teal-dark">
          К списку студентов
        </Link>
      </header>

      {sessions.error && <ErrorBanner message={(sessions.error as Error).message} />}
      {sessions.isLoading && <SkeletonRows count={4} />}

      {sessions.data && sessions.data.length === 0 && (
        <EmptyState icon="" title="У студента пока нет попыток" />
      )}

      {sessions.data && sessions.data.length > 0 && (
        <section className="overflow-x-auto rounded-xl border border-line bg-card">
          <table className="w-full text-sm">
            <thead className="bg-paper text-left text-muted">
              <tr>
                <th className="p-3 font-medium">Дата</th>
                <th className="p-3 font-medium">Сценарий</th>
                <th className="p-3 font-medium">Статус</th>
                <th className="p-3 font-medium">Диагноз</th>
                <th className="p-3 font-medium">Балл</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.data.map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="p-3 whitespace-nowrap font-mono text-xs text-muted">
                    {new Date(s.created_at).toLocaleString("ru-RU")}
                  </td>
                  <td className="p-3 text-ink">{s.scenario_title}</td>
                  <td className="p-3">
                    {s.status === "finished" ? (
                      <span className="text-teal">Завершена</span>
                    ) : (
                      <span className="text-gold">В процессе</span>
                    )}
                  </td>
                  <td className="p-3 text-ink">{s.final_diagnosis ?? "—"}</td>
                  <td className="p-3 font-mono font-medium">{s.score ?? "—"}</td>
                  <td className="p-3">
                    <Link to={`/teacher/sessions/${s.id}`} className="text-teal hover:text-teal-dark">
                      Открыть
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}