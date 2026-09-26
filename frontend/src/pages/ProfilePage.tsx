import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import Button from "../components/Button";
import DonutChart from "../components/DonutChart";
import ErrorBanner from "../components/ErrorBanner";
import SelectCard from "../components/SelectCard";
import Sparkline from "../components/Sparkline";
import { ACCENT_PRESETS, accentSwatch } from "../constants/accents";
import { SPECIALTY_LABELS } from "../constants/taxonomy";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { useState } from "react";

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const { theme, setTheme, accent, setAccent, resolvedDark } = useTheme();
  const { showToast } = useToast();
  const history = useQuery({ queryKey: ["history"], queryFn: api.getHistory });

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [specialty, setSpecialty] = useState(user?.specialty ?? "");
  const [course, setCourse] = useState(user?.course ?? "");
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [notifyNew, setNotifyNew] = useState(() => localStorage.getItem("notify_new") !== "0");
  const [notifyResults, setNotifyResults] = useState(() => localStorage.getItem("notify_results") !== "0");
  const [notifyReminders, setNotifyReminders] = useState(() => localStorage.getItem("notify_reminders") === "1");

  const saveProfile = useMutation({
    mutationFn: () => updateProfile({ full_name: fullName, specialty, course }),
    onSuccess: () => showToast("Профиль сохранён"),
    onError: (e) => setProfileError((e as Error).message),
  });

  const savePassword = useMutation({
    mutationFn: () => api.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Пароль обновлён");
    },
    onError: (e) => setPasswordError((e as Error).message),
  });

  const saveNotifications = () => {
    localStorage.setItem("notify_new", notifyNew ? "1" : "0");
    localStorage.setItem("notify_results", notifyResults ? "1" : "0");
    localStorage.setItem("notify_reminders", notifyReminders ? "1" : "0");
    showToast("Настройки уведомлений сохранены");
  };

  const sessions = history.data ?? [];
  const finished = sessions.filter((s) => s.status === "finished" && s.score !== null);
  const chronological = [...finished].reverse(); // история приходит новыми сверху, для графика нужен хронологический порядок
  const avg = finished.length ? finished.reduce((a, s) => a + (s.score ?? 0), 0) / finished.length : 0;
  const best = finished.length ? Math.max(...finished.map((s) => s.score ?? 0)) : 0;
  const successRate = finished.length
    ? Math.round((finished.filter((s) => (s.score ?? 0) >= 60).length / finished.length) * 100)
    : 0;

  const bySpecialty = Object.entries(
    finished.reduce<Record<string, number[]>>((acc, s) => {
      (acc[s.scenario_specialty] ??= []).push(s.score ?? 0);
      return acc;
    }, {}),
  ).map(([key, scores]) => ({
    key,
    label: SPECIALTY_LABELS[key] ?? key,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <header className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-light font-serif text-2xl font-medium text-teal-dark">
          {(user?.full_name || user?.username || "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="font-serif text-2xl font-medium text-ink">{user?.full_name || user?.username}</h1>
          <p className="text-sm text-muted">
            {user?.specialty || "Специальность не указана"}
            {user?.course ? ` · ${user.course}` : ""}
          </p>
          {user?.created_at && (
            <p className="text-xs text-muted">На платформе с {new Date(user.created_at).toLocaleDateString("ru-RU")}</p>
          )}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          ["Сценариев пройдено", finished.length],
          ["Всего попыток", sessions.length],
          ["Средний балл", avg.toFixed(1)],
          ["Лучший результат", best],
          ["Успешных, %", `${successRate}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-line bg-card p-3 text-center">
            <div className="font-mono text-lg font-semibold text-ink">{value}</div>
            <div className="text-xs text-muted">{label}</div>
          </div>
        ))}
      </section>

      {finished.length > 0 && (
        <section className="grid gap-4 rounded-xl border border-line bg-card p-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <DonutChart value={avg} label="Средний балл" />
          <div>
            <div className="mb-2 text-sm font-medium text-ink">Динамика результатов</div>
            <Sparkline values={chronological.map((s) => s.score ?? 0)} />
          </div>
        </section>
      )}

      {bySpecialty.length > 0 && (
        <section className="space-y-3 rounded-xl border border-line bg-card p-4">
          <h2 className="font-serif text-lg font-medium text-ink">Мой прогресс по специальностям</h2>
          {bySpecialty.map((s) => (
            <div key={s.key}>
              <div className="flex justify-between text-sm">
                <span className="text-ink">{s.label}</span>
                <span className="font-mono">{s.avg} / 100</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-line">
                <div className="h-full bg-teal" style={{ width: `${s.avg}%` }} />
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="space-y-4 rounded-xl border border-line bg-card p-4">
        <h2 className="font-serif text-lg font-medium text-ink">Настройки · Аккаунт</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">ФИО</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Специальность</label>
            <input
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Например: Терапия"
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Курс / год обучения</label>
            <input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Например: 2 год ординатуры"
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-teal focus:outline-none"
            />
          </div>
        </div>
        {profileError && <ErrorBanner message={profileError} />}
        <Button
          onClick={() => {
            setProfileError(null);
            saveProfile.mutate();
          }}
          disabled={saveProfile.isPending}
        >
          {saveProfile.isPending ? "Сохраняем…" : "Сохранить изменения"}
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-line bg-card p-4">
        <h2 className="font-serif text-lg font-medium text-ink">Настройки · Безопасность</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Текущий пароль</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Новый пароль</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Подтверждение пароля</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-teal focus:outline-none"
            />
          </div>
        </div>
        {passwordError && <ErrorBanner message={passwordError} />}
        <Button
          onClick={() => {
            setPasswordError(null);
            if (newPassword.length < 6) return setPasswordError("Новый пароль должен быть не короче 6 символов");
            if (newPassword !== confirmPassword) return setPasswordError("Пароли не совпадают");
            savePassword.mutate();
          }}
          disabled={savePassword.isPending || !currentPassword || !newPassword}
        >
          {savePassword.isPending ? "Обновляем…" : "Изменить пароль"}
        </Button>
      </section>

      <section className="space-y-3 rounded-xl border border-line bg-card p-4">
        <h2 className="font-serif text-lg font-medium text-ink">Настройки · Уведомления</h2>
        <p className="text-xs text-muted">Эти настройки сохраняются только в этом браузере.</p>
        <label className="flex items-center justify-between gap-3 text-sm text-ink">
          Уведомления о новых сценариях
          <input type="checkbox" checked={notifyNew} onChange={(e) => setNotifyNew(e.target.checked)} className="h-4 w-4 accent-teal" />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm text-ink">
          Уведомления о результатах
          <input type="checkbox" checked={notifyResults} onChange={(e) => setNotifyResults(e.target.checked)} className="h-4 w-4 accent-teal" />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm text-ink">
          Учебные напоминания
          <input type="checkbox" checked={notifyReminders} onChange={(e) => setNotifyReminders(e.target.checked)} className="h-4 w-4 accent-teal" />
        </label>
        <Button variant="secondary" onClick={saveNotifications}>
          Сохранить изменения
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-line bg-card p-4">
        <h2 className="font-serif text-lg font-medium text-ink">Настройки · Внешний вид</h2>

        <div>
          <div className="mb-2 text-sm font-medium text-ink">Тема</div>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((key) => (
              <SelectCard key={key} active={theme === key} onClick={() => setTheme(key)} layoutId="theme-highlight" className="px-3 py-1.5 text-sm">
                {key === "light" ? "Светлая" : key === "dark" ? "Тёмная" : "Системная"}
              </SelectCard>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-medium text-ink">Цвет акцента</div>
          <p className="mb-3 text-xs text-muted">Влияет на кнопки, фон, карточки и активный пункт меню.</p>
          <div className="flex flex-wrap gap-4">
            {ACCENT_PRESETS.map((preset) => {
              const active = accent === preset.key;
              return (
                <button key={preset.key} onClick={() => setAccent(preset.key)} title={preset.label} className="flex flex-col items-center gap-1.5">
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full">
                    {active && (
                      <motion.span
                        layoutId="accent-ring"
                        transition={{ type: "spring", stiffness: 500, damping: 32 }}
                        className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-offset-card"
                        style={{ ["--tw-ring-color" as string]: accentSwatch(preset, resolvedDark) }}
                      />
                    )}
                    <span className="h-7 w-7 rounded-full border border-line" style={{ backgroundColor: accentSwatch(preset, resolvedDark) }} />
                  </span>
                  <span className={`text-[11px] ${active ? "text-ink" : "text-muted"}`}>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <Button variant="secondary" onClick={logout} className="text-clay">
        Выйти из аккаунта
      </Button>
    </div>
  );
}