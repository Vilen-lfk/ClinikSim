import { motion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Logo from "./Logo";

const FEATURES = [
  "Ведите приём виртуальных пациентов в свободном диалоге",
  "Собирайте анамнез так же, как на реальном приёме",
  "Получайте разбор ошибок и рекомендации после каждого случая",
];

/**
 * Общая рамка страниц входа и регистрации (layout-маршрут).
 * Не пересоздаётся при переходе между ними: высота окна плавно подстраивается
 * под новую форму, а её содержимое проявляется.
 */
export default function AuthLayout() {
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="grid w-full max-w-3xl overflow-hidden rounded-xl border border-line bg-card shadow-sm md:grid-cols-2"
      >
        <div className="flex flex-col justify-center border-b border-line p-8 md:border-b-0 md:border-r">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <h1 className="font-serif text-2xl font-bold tracking-tight text-ink">ClinicSim</h1>
          </div>
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

        <div className="flex flex-col justify-center">
          <motion.div
            initial={false}
            animate={{ height }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div ref={contentRef} className="p-8">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
