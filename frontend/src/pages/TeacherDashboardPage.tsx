import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import { SkeletonRows } from "../components/Skeleton";

export default function TeacherDashboardPage() {
  const students = useQuery({ queryKey: ["teacher-students"], queryFn: api.getTeacherStudents });

  return (
    <div className="w-full space-y-6 p-6 lg:px-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">Панель куратора</h1>
          <p className="mt-1 text-muted">Успеваемость студентов по клиническим сценариям</p>
        </div>
        <Link to="/teacher/scenarios">
          <Button variant="secondary">Управление сценариями</Button>
        </Link>
      </header>

      {students.error && <ErrorBanner message={(students.error as Error).message} />}
      {students.isLoading && <SkeletonRows count={4} />}

      {students.data && students.data.length === 0 && (
        <EmptyState icon="🎓" title="Пока нет студентов" description="Здесь появятся студенты после первой регистрации." />
      )}

      {students.data && students.data.length > 0 && (
        <section className="overflow-x-auto rounded-xl border border-line bg-card">
          <table className="w-full text-sm">
            <thead className="bg-paper text-left text-muted">
              <tr>
                <th className="p-3 font-medium">Студент</th>
                <th className="p-3 font-medium">Специальность</th>
                <th className="p-3 font-medium">Попыток</th>
                <th className="p-3 font-medium">Завершено</th>
                <th className="p-3 font-medium">Средний балл</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {students.data.map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="p-3 text-ink">
                    <div>{s.full_name || s.username}</div>
                    <div className="font-mono text-xs text-muted">{s.username}</div>
                  </td>
                  <td className="p-3 text-muted">
                    {s.specialty || "—"}
                    {s.course ? `, ${s.course}` : ""}
                  </td>
                  <td className="p-3 font-mono">{s.attempts}</td>
                  <td className="p-3 font-mono">{s.finished}</td>
                  <td className="p-3 font-mono font-medium">{s.avg_score ?? "—"}</td>
                  <td className="p-3">
                    <Link to={`/teacher/students/${s.id}`} className="text-teal hover:text-teal-dark">
                      Просмотр
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