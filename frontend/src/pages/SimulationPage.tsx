import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ClipboardCheck, LogOut } from "lucide-react";
import { api, streamPatientReply } from "../api/client";
import Button from "../components/Button";
import ChatWindow from "../components/ChatWindow";
import DiagnosisForm from "../components/DiagnosisForm";
import ErrorBanner from "../components/ErrorBanner";
import { DIFFICULTY_LABELS, SPECIALTY_LABELS } from "../constants/taxonomy";
import type { Message } from "../types";
import { parseServerDate } from "../utils/time";

/** Темы сбора анамнеза: если студент ещё не касался темы — показываем подсказку и примеры вопросов. */
const TOPICS: { keywords: string[]; hint: string; examples: string[] }[] = [
  {
    keywords: ["лекарств", "препарат", "принима", "терапи", "лечит", "таблет", "болеете", "хронич", "заболеван"],
    hint: "Вы ещё не спросили о текущей терапии и сопутствующих заболеваниях.",
    examples: ["Какие лекарства вы принимаете?", "Есть ли у вас хронические заболевания?"],
  },
  {
    keywords: ["семь", "родител", "родствен", "наследств", "мать", "отец", "мама", "папа"],
    hint: "Уточните семейный анамнез — болезни у близких родственников.",
    examples: ["Кто-то в семье болел сердцем?", "Чем болеют ваши родители?"],
  },
  {
    keywords: ["кури", "сигарет", "алкогол", "пьёте", "пьете", "выпива"],
    hint: "Не забудьте про вредные привычки: курение, алкоголь.",
    examples: ["Вы курите?", "Как часто употребляете алкоголь?"],
  },
  {
    keywords: ["аллерг", "непереносим"],
    hint: "Спросите об аллергических реакциях и непереносимости препаратов.",
    examples: ["Есть ли у вас аллергия на лекарства?"],
  },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function useElapsed(startIso?: string): string {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!startIso) return "00:00";
  const sec = Math.max(0, Math.floor((now - (parseServerDate(startIso)?.getTime() ?? now)) / 1000));
  const mm = Math.floor(sec / 60);
  const ss = sec % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export default function SimulationPage() {
  const { id } = useParams();
  const sessionId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => api.getSession(sessionId),
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const elapsed = useElapsed(session?.created_at);

  useEffect(() => {
    if (!session) return;
    if (session.status === "finished") {
      navigate(`/results/${sessionId}`, { replace: true });
      return;
    }
    setMessages(session.messages);
  }, [session, sessionId, navigate]);

  const finish = useMutation({
    mutationFn: (diagnosis: string) => api.finishSession(sessionId, diagnosis),
    onSuccess: (result) => {
      queryClient.setQueryData(["session", sessionId], result);
      navigate(`/results/${sessionId}`);
    },
  });

  const questionsCount = messages.filter((m) => m.role === "student").length;

  // Первая тема, о которой студент ещё не спрашивал
  const pendingTopic = useMemo(() => {
    if (questionsCount === 0) return null;
    const asked = messages
      .filter((m) => m.role === "student")
      .map((m) => m.content.toLowerCase())
      .join(" ");
    return TOPICS.find((t) => !t.keywords.some((k) => asked.includes(k))) ?? null;
  }, [messages, questionsCount]);

  const suggestions = useMemo(() => {
    if (pendingTopic) return pendingTopic.examples;
    return ["Как давно это началось?", "Что облегчает состояние?"];
  }, [pendingTopic]);

  const handleSend = async (text: string): Promise<boolean> => {
    setChatError(null);
    const t = Date.now();
    const iso = new Date(t).toISOString();
    setMessages((prev) => [
      ...prev,
      { id: -t, role: "student", content: text, created_at: iso },
      { id: -t - 1, role: "patient", content: "", created_at: iso },
    ]);
    setStreaming(true);
    try {
      await streamPatientReply(sessionId, text, (chunk) =>
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + chunk };
          return copy;
        }),
      );
      return true;
    } catch (e) {
      setChatError((e as Error).message);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        return last && last.role === "patient" && last.content === "" ? prev.slice(0, -2) : prev;
      });
      return false;
    } finally {
      setStreaming(false);
    }
  };

  if (isLoading) return <p className="p-6 text-muted">Загрузка сессии…</p>;
  if (error || !session) return <p className="p-6 text-clay">Не удалось загрузить сессию.</p>;

  const p = session.scenario.patient_profile;
  const pi = initials(p.name);
  const specialty = SPECIALTY_LABELS[session.scenario.specialty] ?? session.scenario.specialty;
  const difficulty = DIFFICULTY_LABELS[session.scenario.difficulty] ?? session.scenario.difficulty;

  return (
    <div className="flex h-screen w-full flex-col md:flex-row">
      {/* Карточка пациента */}
      <aside className="flex shrink-0 flex-col border-b border-line bg-card md:w-72 md:border-b-0 md:border-r">
        <div className="p-5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Карточка пациента</div>

          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-light text-sm font-semibold text-teal-dark">
              {pi}
            </span>
            <div>
              <div className="font-serif text-base font-bold text-ink">{p.name}</div>
              <div className="text-xs text-muted">{p.age} лет</div>
            </div>
          </div>

          <dl className="mt-5 text-sm">
            <div className="flex justify-between border-b border-line py-2.5">
              <dt className="text-muted">Возраст</dt>
              <dd className="font-medium text-ink">{p.age} лет</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-line py-2.5">
              <dt className="text-muted">Пол</dt>
              <dd className="text-right font-medium text-ink">{p.gender}</dd>
            </div>
            <div className="flex justify-between gap-3 py-2.5">
              <dt className="text-muted">Профессия</dt>
              <dd className="text-right font-medium text-ink">{p.occupation}</dd>
            </div>
          </dl>

          <div className="mt-4 text-xs text-muted">Первая жалоба</div>
          <blockquote className="mt-2 rounded-xl bg-paper p-3 text-sm italic leading-relaxed text-ink">
            «{p.arrival_complaint}»
          </blockquote>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-line px-3 py-2 text-sm text-muted transition hover:border-clay/50 hover:bg-clay-light hover:text-clay-dark"
          >
            <LogOut className="h-4 w-4" />
            Выйти из симуляции
          </button>
        </div>

        <div className="mt-auto hidden p-5 md:block">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-md bg-clay-light px-2 py-0.5 text-[11px] font-medium text-clay-dark">{specialty}</span>
            <span className="rounded-md bg-gold/15 px-2 py-0.5 text-[11px] font-medium text-gold">{difficulty}</span>
            <span className="rounded-md bg-teal-light px-2 py-0.5 text-[11px] font-medium text-teal-dark">Обучение</span>
          </div>
          <div className="mt-3 font-mono text-[11px] text-muted">
            Вопросов задано: {questionsCount} · {elapsed}
          </div>
        </div>
      </aside>

      {/* Чат */}
      <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-paper">
        <header className="flex items-center justify-between gap-4 border-b border-line bg-card px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <span className="h-2 w-2 rounded-full bg-teal" aria-hidden="true" />
            {streaming ? "Пациент отвечает…" : "Пациент на связи"}
          </div>
          <div className="flex items-center gap-3">
            {!showDiagnosis && (
              <Button
                onClick={() => setShowDiagnosis(true)}
                disabled={streaming || questionsCount === 0}
                icon={<ClipboardCheck className="h-4 w-4" />}
                className="shrink-0"
              >
                Поставить диагноз
              </Button>
            )}
          </div>
        </header>

        <AnimatePresence>
          {showDiagnosis && (
            <div className="px-6 pt-4 lg:px-14">
              <DiagnosisForm
                isLoading={finish.isPending}
                error={finish.error ? (finish.error as Error).message : null}
                onSubmit={(d) => finish.mutate(d)}
                onCancel={() => setShowDiagnosis(false)}
              />
            </div>
          )}
        </AnimatePresence>

        {chatError && (
          <div className="px-6 pt-4 lg:px-14">
            <ErrorBanner message={chatError} />
          </div>
        )}

        <div className="min-h-0 flex-1">
          <ChatWindow
            messages={messages}
            isStreaming={streaming}
            disabled={showDiagnosis || finish.isPending}
            patientInitials={pi}
            sessionStartedAt={session.created_at}
            hint={pendingTopic?.hint}
            suggestions={suggestions}
            onSend={handleSend}
          />
        </div>
      </section>
    </div>
  );
}
