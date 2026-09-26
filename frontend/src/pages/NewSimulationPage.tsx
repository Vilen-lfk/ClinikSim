import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import Button from "../components/Button";
import ErrorBanner from "../components/ErrorBanner";
import { SkeletonScenarios } from "../components/Skeleton";
import SelectCard from "../components/SelectCard";

const SPECIALTIES = [
  { key: "therapy", label: "Терапия", icon: "🩺" },
  { key: "cardiology", label: "Кардиология", icon: "❤️" },
  { key: "neurology", label: "Неврология", icon: "🧠" },
  { key: "surgery", label: "Хирургия", icon: "🔬" },
];

const DIFFICULTIES = [
  { key: "easy", label: "Лёгкая", minutes: "10–15 минут" },
  { key: "medium", label: "Средняя", minutes: "15–20 минут" },
  { key: "hard", label: "Сложная", minutes: "20–30 минут" },
];

const MODES = [
  { key: "training", label: "Обучение", description: "Система может давать подсказки и объяснения" },
  { key: "exam", label: "Экзамен", description: "Подсказки отключены, оценивается самостоятельное прохождение" },
] as const;

export default function NewSimulationPage() {
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [mode, setMode] = useState<"training" | "exam">("training");

  const scenarios = useQuery({ queryKey: ["scenarios"], queryFn: api.getScenarios });

  const match = useMemo(() => {
    if (!scenarios.data || !specialty || !difficulty) return null;
    return scenarios.data.find((s) => s.specialty === specialty && s.difficulty === difficulty) ?? null;
  }, [scenarios.data, specialty, difficulty]);

  const start = useMutation({
    mutationFn: () => api.createSession(match!.id),
    onSuccess: (session) => {
      // Режим пока хранится только на клиенте и не влияет на подсказки в чате
      localStorage.setItem(`session_mode_${session.id}`, mode);
      navigate(`/simulation/${session.id}`);
    },
  });

  const selectedDifficulty = DIFFICULTIES.find((d) => d.key === difficulty);

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <header>
        <h1 className="font-serif text-3xl font-medium text-ink">Новая симуляция</h1>
        <p className="mt-1 text-muted">Настройте параметры клинического сценария перед началом</p>
      </header>

      {scenarios.isLoading && <SkeletonScenarios />}
      {scenarios.error && <ErrorBanner message={(scenarios.error as Error).message} />}

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-medium text-ink">Специальность</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SPECIALTIES.map((s) => (
            <SelectCard
              key={s.key}
              active={specialty === s.key}
              onClick={() => setSpecialty(s.key)}
              layoutId="specialty-highlight"
              className="text-center"
            >
              <div className="mb-1 text-2xl">{s.icon}</div>
              <div className="text-sm font-medium">{s.label}</div>
            </SelectCard>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-medium text-ink">Сложность</h2>
        <div className="grid grid-cols-3 gap-3">
          {DIFFICULTIES.map((d) => (
            <SelectCard
              key={d.key}
              active={difficulty === d.key}
              onClick={() => setDifficulty(d.key)}
              layoutId="difficulty-highlight"
              className="text-center"
            >
              <div className="text-sm font-medium">{d.label}</div>
            </SelectCard>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-medium text-ink">Режим</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {MODES.map((m) => (
            <SelectCard
              key={m.key}
              active={mode === m.key}
              onClick={() => setMode(m.key)}
              layoutId="mode-highlight"
            >
              <div className="text-sm font-medium">{m.label}</div>
              <p className="mt-1 text-xs text-muted">{m.description}</p>
            </SelectCard>
          ))}
        </div>
      </section>

      {specialty && difficulty && (
        <div className="rounded-lg border border-line bg-card p-4 text-sm text-muted">
          {match
            ? `Предполагаемая продолжительность: ${selectedDifficulty?.minutes}`
            : "Сценариев с такими параметрами пока нет. Попробуйте другое сочетание специальности и сложности."}
        </div>
      )}

      {start.error && <ErrorBanner message={(start.error as Error).message} />}

      <Button onClick={() => start.mutate()} disabled={!match || start.isPending} className="px-6 py-3">
        {start.isPending ? "Запуск…" : "Начать симуляцию"}
      </Button>
    </div>
  );
}