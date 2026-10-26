import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import Button from "../components/Button";
import ErrorBanner from "../components/ErrorBanner";
import { useToast } from "../context/ToastContext";

const SPECIALTIES = [
  { key: "therapy", label: "Терапия" },
  { key: "cardiology", label: "Кардиология" },
  { key: "neurology", label: "Неврология" },
  { key: "surgery", label: "Хирургия" },
];
const DIFFICULTIES = [
  { key: "easy", label: "Лёгкая" },
  { key: "medium", label: "Средняя" },
  { key: "hard", label: "Сложная" },
];

const FACT_SECTIONS: { key: "complaints" | "hpi" | "life_history" | "risk_factors" | "negatives"; label: string; hint: string }[] = [
  { key: "complaints", label: "Жалобы", hint: "Каждый пункт — с новой строки" },
  { key: "hpi", label: "История настоящего заболевания", hint: "Каждый пункт — с новой строки" },
  { key: "life_history", label: "Анамнез жизни", hint: "Каждый пункт — с новой строки" },
  { key: "risk_factors", label: "Факторы риска", hint: "Каждый пункт — с новой строки" },
  { key: "negatives", label: "Чего у пациента нет", hint: "Каждый пункт — с новой строки" },
];

const linesToArray = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const arrayToLines = (a: string[]) => a.join("\n");

export default function ScenarioFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const scenarioId = Number(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const existing = useQuery({
    queryKey: ["scenario-admin", scenarioId],
    queryFn: () => api.getScenarioAdmin(scenarioId),
    enabled: isEdit,
  });

  const [title, setTitle] = useState("");
  const [specialty, setSpecialty] = useState("therapy");
  const [difficulty, setDifficulty] = useState("medium");
  const [hiddenDiagnosis, setHiddenDiagnosis] = useState("");

  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [patientOccupation, setPatientOccupation] = useState("");
  const [arrivalComplaint, setArrivalComplaint] = useState("");
  const [speechStyle, setSpeechStyle] = useState("");

  const [facts, setFacts] = useState<Record<string, string>>({
    complaints: "", hpi: "", life_history: "", risk_factors: "", negatives: "",
  });
  const [redFlags, setRedFlags] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!existing.data) return;
    const s = existing.data;
    setTitle(s.title);
    setSpecialty(s.specialty);
    setDifficulty(s.difficulty);
    setHiddenDiagnosis(s.hidden_diagnosis);
    setPatientName(s.patient_profile.name ?? "");
    setPatientAge(String(s.patient_profile.age ?? ""));
    setPatientGender(s.patient_profile.gender ?? "");
    setPatientOccupation(s.patient_profile.occupation ?? "");
    setArrivalComplaint(s.patient_profile.arrival_complaint ?? "");
    setSpeechStyle(s.patient_profile.speech_style ?? "");
    setFacts({
      complaints: arrayToLines(s.anamnesis_facts.complaints ?? []),
      hpi: arrayToLines(s.anamnesis_facts.hpi ?? []),
      life_history: arrayToLines(s.anamnesis_facts.life_history ?? []),
      risk_factors: arrayToLines(s.anamnesis_facts.risk_factors ?? []),
      negatives: arrayToLines(s.anamnesis_facts.negatives ?? []),
    });
    setRedFlags(arrayToLines(s.red_flags ?? []));
  }, [existing.data]);

  const buildPayload = () => ({
    title,
    specialty,
    difficulty,
    hidden_diagnosis: hiddenDiagnosis,
    patient_profile: {
      name: patientName,
      age: Number(patientAge) || 0,
      gender: patientGender,
      occupation: patientOccupation,
      arrival_complaint: arrivalComplaint,
      speech_style: speechStyle,
    },
    anamnesis_facts: {
      complaints: linesToArray(facts.complaints),
      hpi: linesToArray(facts.hpi),
      life_history: linesToArray(facts.life_history),
      risk_factors: linesToArray(facts.risk_factors),
      negatives: linesToArray(facts.negatives),
    },
    red_flags: linesToArray(redFlags),
  });

  const save = useMutation({
    mutationFn: () => (isEdit ? api.updateScenario(scenarioId, buildPayload()) : api.createScenario(buildPayload())),
    onSuccess: () => {
      showToast(isEdit ? "Сценарий обновлён" : "Сценарий создан");
      navigate("/teacher/scenarios");
    },
    onError: (e) => setError((e as Error).message),
  });

  const isValid = title.trim().length >= 2 && hiddenDiagnosis.trim().length >= 2 && patientName.trim().length > 0;

  const inputClass =
    "w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-teal focus:outline-none";

  return (
    <div className="w-full space-y-6 p-6 lg:px-10">
      <header>
        <h1 className="font-serif text-2xl font-medium text-ink">
          {isEdit ? "Редактирование сценария" : "Новый сценарий"}
        </h1>
      </header>

      <section className="space-y-3 rounded-xl border border-line bg-card p-4">
        <h2 className="font-serif text-lg font-medium text-ink">Основное</h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Название сценария</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Специальность</label>
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={inputClass}>
              {SPECIALTIES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Сложность</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={inputClass}>
              {DIFFICULTIES.map((d) => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Правильный диагноз (скрыт от студента)</label>
          <input value={hiddenDiagnosis} onChange={(e) => setHiddenDiagnosis(e.target.value)} className={inputClass} />
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-line bg-card p-4">
        <h2 className="font-serif text-lg font-medium text-ink">Профиль пациента</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Имя</label>
            <input value={patientName} onChange={(e) => setPatientName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Возраст</label>
            <input type="number" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Пол</label>
            <input value={patientGender} onChange={(e) => setPatientGender(e.target.value)} placeholder="мужской / женский" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Род занятий</label>
            <input value={patientOccupation} onChange={(e) => setPatientOccupation(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Первая реплика (с чем пришёл)</label>
          <input value={arrivalComplaint} onChange={(e) => setArrivalComplaint(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Манера речи</label>
          <input value={speechStyle} onChange={(e) => setSpeechStyle(e.target.value)} placeholder="например: встревожен, говорит отрывисто" className={inputClass} />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-line bg-card p-4">
        <h2 className="font-serif text-lg font-medium text-ink">Факты анамнеза</h2>
        {FACT_SECTIONS.map((section) => (
          <div key={section.key}>
            <label className="mb-1 block text-sm font-medium text-ink">{section.label}</label>
            <textarea
              value={facts[section.key]}
              onChange={(e) => setFacts((prev) => ({ ...prev, [section.key]: e.target.value }))}
              rows={3}
              placeholder={section.hint}
              className={inputClass}
            />
          </div>
        ))}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Красные флаги</label>
          <textarea value={redFlags} onChange={(e) => setRedFlags(e.target.value)} rows={3} placeholder="Каждый пункт — с новой строки" className={inputClass} />
        </div>
      </section>

      {error && <ErrorBanner message={error} />}

      <div className="flex gap-3">
        <Button onClick={() => { setError(null); save.mutate(); }} disabled={!isValid || save.isPending}>
          {save.isPending ? "Сохраняем…" : isEdit ? "Сохранить изменения" : "Создать сценарий"}
        </Button>
        <Button variant="secondary" onClick={() => navigate("/teacher/scenarios")}>
          Отмена
        </Button>
      </div>
    </div>
  );
}