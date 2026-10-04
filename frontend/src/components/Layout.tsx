import { motion } from "framer-motion";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PulseLine from "./PulseLine";

const BASE_NAV = [
  { to: "/", label: "Главная", icon: "" },
  { to: "/new-simulation", label: "Новая симуляция", icon: "" },
  { to: "/history", label: "История", icon: "" },
  { to: "/knowledge", label: "База знаний", icon: "" },
  { to: "/profile", label: "Мой профиль", icon: "" },
];

const TEACHER_NAV_ITEM = { to: "/teacher/dashboard", label: "Панель куратора", icon: "" };

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const NAV = user?.role === "teacher" ? [...BASE_NAV, TEACHER_NAV_ITEM] : BASE_NAV;

  return (
    <div className="flex min-h-screen">
      <aside className="glass-panel sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line/60 p-4 md:flex print:hidden">
        <div className="mb-6 flex items-center gap-2 px-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal to-teal-dark text-xs font-bold text-white shadow-glow">
            C
          </span>
          <span className="font-serif text-lg font-bold tracking-tight text-ink">ClinicSim</span>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.map((item) => {
            const active = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150 ${
                  active ? "font-semibold text-teal-dark" : "text-muted hover:text-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-highlight-desktop"
                    transition={{ type: "spring", stiffness: 480, damping: 34 }}
                    className="absolute inset-0 -z-10 rounded-xl bg-teal-light shadow-glow-ring"
                  >
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-teal shadow-glow" />
                  </motion.span>
                )}
                <span aria-hidden="true" className="text-base">{item.icon}</span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-line/60 pt-3">
          <PulseLine size="hero" className="mb-3 max-w-[140px] opacity-80" />
          <div className="mb-2 truncate text-sm font-medium text-ink">{user?.full_name || user?.username}</div>
          <button onClick={logout} className="text-sm text-clay hover:text-clay-dark">
            Выйти
          </button>
        </div>
      </aside>

      <div className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </div>

      <nav className="glass-panel fixed inset-x-0 bottom-0 z-10 flex justify-between border-t border-line/60 px-2 py-1.5 md:hidden print:hidden">
        {NAV.map((item) => {
          const active = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[11px]"
            >
              {active && (
                <motion.span
                  layoutId="nav-highlight-mobile"
                  transition={{ type: "spring", stiffness: 480, damping: 34 }}
                  className="absolute inset-0 -z-10 rounded-lg bg-teal-light"
                />
              )}
              <span aria-hidden="true" className={`text-base ${active ? "" : "opacity-80"}`}>
                {item.icon}
              </span>
              <span className={active ? "font-semibold text-teal-dark" : "text-muted"}>{item.label.split(" ")[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}