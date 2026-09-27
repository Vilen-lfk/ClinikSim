import type { ReactNode } from "react";
import PulseLine from "./PulseLine";

const FEATURES = [
  "Ведите приём виртуальных пациентов в свободном диалоге",
  "Собирайте анамнез так же, как на реальном приёме",
  "Получайте разбор ошибок и рекомендации после каждого случая",
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="grid w-full max-w-3xl overflow-hidden rounded-xl border border-line bg-card shadow-sm md:grid-cols-2">
        <div className="flex flex-col justify-center border-b border-line p-8 md:border-b-0 md:border-r">
          <PulseLine size="hero" className="mb-6 max-w-[180px]" />
          <h1 className="font-serif text-2xl font-medium text-ink">ClinicSim</h1>
          <p className="mt-2 text-sm text-muted">
            Учебная платформа для отработки сбора анамнеза и постановки диагноза.
          </p>
          <ul className="mt-6 space-y-2.5">
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
        <div className="flex flex-col justify-center p-8">{children}</div>
      </div>
    </div>
  );
}