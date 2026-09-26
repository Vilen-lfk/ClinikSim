import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import Button from "./Button";

interface Props {
  isLoading: boolean;
  error: string | null;
  onSubmit: (diagnosis: string) => void;
  onCancel: () => void;
}

export default function DiagnosisForm({ isLoading, error, onSubmit, onCancel }: Props) {
  const [diagnosis, setDiagnosis] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (diagnosis.trim().length >= 2) onSubmit(diagnosis.trim());
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onSubmit={handleSubmit}
      className="space-y-3 overflow-hidden rounded-xl border border-line bg-card p-4"
    >
      <h3 className="font-serif text-lg font-medium text-ink">Предварительный диагноз</h3>
      <p className="text-sm text-muted">
        После отправки диалог будет завершён, и вы получите оценку. Изменить ответ будет нельзя.
      </p>
      <textarea
        value={diagnosis}
        onChange={(e) => setDiagnosis(e.target.value)}
        rows={3}
        maxLength={500}
        disabled={isLoading}
        placeholder="Например: острый коронарный синдром, нестабильная стенокардия"
        className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-teal focus:outline-none"
      />
      {error && <p className="text-sm text-clay">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading || diagnosis.trim().length < 2}>
          {isLoading ? "Идёт оценка…" : "Завершить и получить оценку"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Вернуться к беседе
        </Button>
      </div>
    </motion.form>
  );
}