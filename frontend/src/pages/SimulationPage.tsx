import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { api, streamPatientReply } from "../api/client";
import Button from "../components/Button";
import ChatWindow from "../components/ChatWindow";
import DiagnosisForm from "../components/DiagnosisForm";
import PulseLine from "../components/PulseLine";
import type { Message } from "../types";
import ErrorBanner from "../components/ErrorBanner";

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

  const handleSend = async (text: string): Promise<boolean> => {
    setChatError(null);
    const t = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: -t, role: "student", content: text },
      { id: -t - 1, role: "patient", content: "" },
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

  return (
    <div className="flex h-screen w-full flex-col gap-3 p-4 lg:px-10">
      <header className="flex items-start justify-between gap-4 rounded-xl border border-line bg-card p-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-lg font-medium text-ink">
              {p.name}, {p.age} лет
            </h1>
            {streaming && <PulseLine size="inline" active className="w-8" />}
          </div>
          <p className="text-sm text-muted">
            {p.gender}, {p.occupation}
          </p>
          <p className="mt-1 text-sm italic text-ink">«{p.arrival_complaint}»</p>
        </div>
        {!showDiagnosis && (
          <Button
            onClick={() => setShowDiagnosis(true)}
            disabled={streaming || !messages.some((m) => m.role === "student")}
            className="shrink-0"
          >
            Поставить диагноз
          </Button>
        )}
      </header>

      <AnimatePresence>
        {showDiagnosis && (
          <DiagnosisForm
            isLoading={finish.isPending}
            error={finish.error ? (finish.error as Error).message : null}
            onSubmit={(d) => finish.mutate(d)}
            onCancel={() => setShowDiagnosis(false)}
          />
        )}
      </AnimatePresence>

      {chatError && <ErrorBanner message={chatError} />}
      <div className="min-h-0 flex-1">
        <ChatWindow
          messages={messages}
          isStreaming={streaming}
          disabled={showDiagnosis || finish.isPending}
          patientName={p.name}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}