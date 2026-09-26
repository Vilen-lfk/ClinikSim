import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PulseLine from "./PulseLine";

const NAV = [
  { to: "/", label: "Главная", icon: "" },
  { to: "/new-simulation", label: "Новая симуляция", icon: "" },
  { to: "/history", label: "История", icon: "" },
  { to: "/knowledge", label: "База знаний", icon: "" },
  { to: "/profile", label: "Мой профиль", icon: "" },
];

export default function Layout() {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
      isActive
        ? "bg-teal-light text-teal-dark font-medium"
        : "text-muted hover:bg-paper hover:text-ink"
    }`;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="flex min-h-screen">
        
        {/* Боковое меню */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-card p-4 md:flex">
          <div className="mb-6 px-1 font-serif text-lg font-medium text-ink">
            ClinicSim
          </div>

          <nav className="flex-1 space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={linkClass}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-line pt-3">
            <PulseLine
              size="hero"
              className="mb-3 max-w-[140px] opacity-70"
            />

            <div className="mb-2 truncate text-sm text-muted">
              {user?.full_name || user?.username}
            </div>

            <button
              onClick={logout}
              className="text-sm text-clay hover:text-clay-dark"
            >
              Выйти
            </button>
          </div>
        </aside>

        {/* Основной контент */}
        <main className="min-w-0 flex-1 pb-16 md:pb-0 bg-transparent">
          <Outlet />
        </main>

        {/* Мобильная навигация */}
        <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-between border-t border-line bg-card px-2 py-1.5 md:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[11px] ${
                  isActive ? "text-teal" : "text-muted"
                }`
              }
            >
              <span aria-hidden="true" className="text-base">
                {item.icon}
              </span>

              {item.label.split(" ")[0]}
            </NavLink>
          ))}
        </nav>

      </div>
    </div>
  );
}