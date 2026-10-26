import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Button from "../components/Button";
import ErrorBanner from "../components/ErrorBanner";
import { SkeletonRows } from "../components/Skeleton";
import { DIFFICULTY_LABELS, SPECIALTY_LABELS } from "../constants/taxonomy";
import { useToast } from "../context/ToastContext";

export default function ScenarioManagerPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const scenarios = useQuery({ queryKey: ["scenarios-admin"], queryFn: api.getScenariosAdmin });

  const deleteScenario = useMutation({
    mutationFn: (id: number) => api.deleteScenario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenarios-admin"] });
      queryClient.invalidateQueries({ queryKey: ["scenarios"] });
      showToast("Сценарий удалён");
    },
    onError: (e) => showToast((e as Error).message, "error"),
  });

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Удалить сценарий «${title}»?`)) deleteScenario.mutate(id);
  };

  return (
    <div className="w-full space-y-6 p-6 lg:px-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">Управление сценариями</h1>
          <p className="mt-1 text-muted">Клинические сценарии, доступные студентам</p>
        </div>
        <Link to="/teacher/scenarios/new">
          <Button>Создать сценарий</Button>
        </Link>
      </header>

      {scenarios.error && <ErrorBanner message={(scenarios.error as Error).message} />}
      {scenarios.isLoading && <SkeletonRows count={4} />}

      {scenarios.data && (
        <section className="overflow-x-auto rounded-xl border border-line bg-card">
          <table className="w-full text-sm">
            <thead className="bg-paper text-left text-muted">
              <tr>
                <th className="p-3 font-medium">Название</th>
                <th className="p-3 font-medium">Специальность</th>
                <th className="p-3 font-medium">Сложность</th>
                <th className="p-3 font-medium">Диагноз</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {scenarios.data.map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="p-3 text-ink">{s.title}</td>
                  <td className="p-3 text-muted">{SPECIALTY_LABELS[s.specialty] ?? s.specialty}</td>
                  <td className="p-3 text-muted">{DIFFICULTY_LABELS[s.difficulty] ?? s.difficulty}</td>
                  <td className="p-3 text-muted">{s.hidden_diagnosis}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-3">
                      <Link to={`/teacher/scenarios/${s.id}/edit`} className="text-teal hover:text-teal-dark">
                        Изменить
                      </Link>
                      <button
                        onClick={() => handleDelete(s.id, s.title)}
                        disabled={deleteScenario.isPending}
                        className="text-clay hover:text-clay-dark disabled:opacity-40"
                      >
                        Удалить
                      </button>
                    </div>
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