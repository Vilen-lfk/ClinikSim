import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { api } from "../api/client";
import Button from "../components/Button";
import Stamp from "../components/Stamp";
import { useToast } from "../context/ToastContext";

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function scoreColor(pct: number) {
  if (pct >= 80) return "bg-teal";
  if (pct >= 50) return "bg-gold";
  return "bg-clay";
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function ResultsPage() {
  
  const { id } = useParams();
  const sessionId = Number(id);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data: session, isLoading, error } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => api.getSession(sessionId),
  });
  const { showToast } = useToast();
  const ev = session?.evaluation;
  const displayedScore = useCountUp(ev?.total_score ?? 0);

  const handleDownloadPdf = async () => {
    if (!contentRef.current || !session) return;
    setIsExporting(true);
    try {
      const safeTitle = session.scenario.title.replace(/[^a-zA-Zа-яА-Я0-9]+/g, "_");
      await html2pdf()
        .set({
          margin: 10,
          filename: `результат_${safeTitle}_сессия_${session.id}.pdf`,
          html2canvas: { scale: 2, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(contentRef.current)
        .save();
      showToast("PDF сохранён");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return <p className="p-6 text-muted">Загрузка…</p>;
  if (error || !session) return <p className="p-6 text-clay">Не удалось загрузить результаты.</p>;

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

  return (
    
    <div className="mx-auto max-w-3xl space-y-5 p-6">
      
      {/* Всё внутри этого блока попадает в PDF; кнопки ниже — нет */}
      <motion.div ref={contentRef} variants={listVariants} initial="hidden" animate="show" className="space-y-5">
        <motion.header variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-medium text-ink">Результаты</h1>
            <p className="text-sm text-muted">{session.scenario.title}</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-4xl font-semibold text-ink">{displayedScore}</div>
            <div className="text-xs text-muted">из 100</div>
          </div>
        </motion.header>

        <motion.section variants={itemVariants} className="grid gap-3 sm:grid-cols-2" break-inside-avoid>
          <div
            className={`rounded-xl border p-4 ${
              ev.diagnosis_correct ? "border-teal bg-teal-light" : "border-clay bg-clay-light"
            }`}
          >
            <div className="font-mono text-xs uppercase text-muted">Ваш диагноз</div>
            <div className="font-medium text-ink">{session.final_diagnosis}</div>
            <div className="mt-2">
              <Stamp correct={ev.diagnosis_correct} />
            </div>
          </div>
          <div className="rounded-xl border border-line bg-card p-4">
            <div className="font-mono text-xs uppercase text-muted">Правильный диагноз</div>
            <div className="font-medium text-ink">{session.correct_diagnosis}</div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="space-y-3 rounded-xl border border-line bg-card p-4" break-inside-avoid>
          <h2 className="font-serif text-lg font-medium text-ink">Оценка по критериям</h2>
          {ev.criteria.map((c) => {
            const pct = Math.round((c.score / c.max_score) * 100);
            return (
              <div key={c.key}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-ink">{c.title}</span>
                  <span className="font-mono">
                    {c.score} / {c.max_score}
                  </span>
                </div>
                <div className="my-1 h-2 overflow-hidden rounded-full bg-line">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full ${scoreColor(pct)}`}
                  />
                </div>
                <p className="text-sm text-muted">{c.comment}</p>
              </div>
            );
          })}
        </motion.section>

        {ev.missed_questions.length > 0 && (
          <motion.section variants={itemVariants} className="rounded-xl border border-gold/40 bg-card p-4 break-inside-avoid">
            <h2 className="mb-2 font-serif text-lg font-medium text-ink">Пропущенные вопросы</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
              {ev.missed_questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </motion.section>
        )}

        {ev.strengths.length > 0 && (
          <motion.section variants={itemVariants} className="rounded-xl border border-teal/30 bg-teal-light p-4" break-inside-avoid>
            <h2 className="mb-2 font-serif text-lg font-medium text-ink">Сильные стороны</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
              {ev.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </motion.section>
        )}

        <motion.section variants={itemVariants} className="rounded-xl border border-line bg-card p-4" break-inside-avoid>
          <h2 className="mb-2 font-serif text-lg font-medium text-ink">Обратная связь преподавателя</h2>
          <p className="max-w-[70ch] whitespace-pre-wrap text-sm text-ink">{ev.feedback}</p>
        </motion.section>

        <motion.details variants={itemVariants} open className="rounded-xl border border-line bg-card p-4" break-inside-avoid>
          <summary className="cursor-pointer font-serif text-lg font-medium text-ink">
            Протокол диалога ({session.messages.length})
          </summary>
          <div className="mt-3 space-y-2 text-sm">
            {session.messages.map((m) => (
              <p key={m.id}>
                <span className={`font-medium ${m.role === "student" ? "text-teal" : "text-muted"}`}>
                  {m.role === "student" ? "Студент" : "Пациент"}:
                </span>{" "}
                {m.content}
              </p>
            ))}
          </div>
        </motion.details>
      </motion.div>

      <div className="flex flex-wrap gap-3 print:hidden">
        <Link to="/">
          <Button>Пройти другой сценарий</Button>
        </Link>
        <Link to="/history">
          <Button variant="secondary">Моя история</Button>
        </Link>
        <Button variant="secondary" onClick={handleDownloadPdf} disabled={isExporting}>
          {isExporting ? "Готовим файл…" : "Скачать PDF"}
        </Button>
        <Button variant="secondary" onClick={() => window.print()}>
          Печать
        </Button>
      </div>
    </div>
  );
}