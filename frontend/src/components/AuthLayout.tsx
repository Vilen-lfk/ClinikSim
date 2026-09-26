import type { ReactNode } from "react";
import PulseLine from "./PulseLine";

const FEATURES = [
  "Ведите приём виртуальных пациентов в свободном диалоге",
  "Собирайте анамнез так же, как на реальном приёме",
  "Получайте разбор ошибок и рекомендации после каждого случая",
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-center bg-card px-12 md:flex">
        <PulseLine size="hero" className="mb-6 max-w-xs" />
        <h1 className="font-serif text-3xl font-medium text-ink">CLinicSim</h1>
        <p className="mt-2 max-w-sm text-muted">
          Учебная платформа для отработки сбора анамнеза и постановки диагноза.
        </p>
        <ul className="mt-8 space-y-3">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-ink">
              <span className="mt-0.5 text-teal" aria-hidden="true">
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}