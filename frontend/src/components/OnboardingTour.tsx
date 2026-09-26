import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Button from "./Button";
import PulseLine from "./PulseLine";

const STEPS = [
  {
    icon: "",
    title: "Добро пожаловать в симулятор пациента",
    text: "Здесь вы будете вести приём виртуальных пациентов, собирать анамнез и ставить предварительный диагноз.",
  },
  {
    icon: "",
    title: "Задавайте вопросы, как настоящему пациенту",
    text: "Пациент отвечает кратко и только на то, о чём вы спросили — так же, как на реальном приёме.",
  },
  {
    icon: "",
    title: "Получайте разбор ошибок",
    text: "После постановки диагноза система оценит полноту анамнеза и покажет, какие вопросы вы упустили.",
  },
];

const KEY = "onboarding_done";

export default function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);

  const finish = () => {
    localStorage.setItem(KEY, "1");
    setOpen(false);
  };

  if (!open) return null;
  const s = STEPS[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="w-full max-w-sm rounded-xl border border-line bg-card p-6 text-center"
        >
          <PulseLine size="hero" className="mx-auto mb-4 max-w-[160px]" />
          <div className="mb-2 text-3xl">{s.icon}</div>
          <h2 className="font-serif text-lg font-medium text-ink">{s.title}</h2>
          <p className="mt-2 text-sm text-muted">{s.text}</p>

          <div className="my-4 flex justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-teal" : "w-1.5 bg-line"}`} />
            ))}
          </div>

          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={finish}>
              Пропустить
            </Button>
            <Button onClick={() => (step < STEPS.length - 1 ? setStep(step + 1) : finish())}>
              {step < STEPS.length - 1 ? "Далее" : "Начать"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}