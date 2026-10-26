import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/Button";
import ErrorBanner from "../components/ErrorBanner";
import SelectCard from "../components/SelectCard";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const usernameValid = /^[a-zA-Z0-9_.-]+$/.test(username);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!usernameValid) {
      setError("Логин может содержать только латинские буквы, цифры, точку, дефис и подчёркивание");
      return;
    }
    if (role === "teacher" && !inviteCode.trim()) {
      setError("Введите ключ авторизации преподавателя");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await register(username.trim(), password, role, fullName.trim() || undefined, inviteCode.trim() || undefined);
      navigate("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-5">
        <h2 className="font-serif text-2xl font-medium text-ink">Регистрация</h2>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink">Роль</label>
          <div className="grid grid-cols-2 gap-3">
            <SelectCard active={role === "student"} onClick={() => setRole("student")} layoutId="role-highlight" className="text-center">
              <div className="text-sm font-medium">Студент-ординатор</div>
            </SelectCard>
            <SelectCard active={role === "teacher"} onClick={() => setRole("teacher")} layoutId="role-highlight" className="text-center">
              <div className="text-sm font-medium">Преподаватель</div>
            </SelectCard>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Логин</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              placeholder="латиница, цифры, от 3 символов"
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-teal focus:outline-none"
            />
            {username.length > 0 && !usernameValid && (
              <p className="mt-1 text-xs text-clay">Только латиница, цифры, «.», «-», «_» — без кириллицы и пробелов</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">ФИО (необязательно)</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Иванов Иван Иванович"
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="не менее 6 символов"
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-teal focus:outline-none"
            />
          </div>

          {role === "teacher" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Ключ авторизации преподавателя</label>
              <input
                type="password"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Выдаётся администратором платформы"
                className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-teal focus:outline-none"
              />
              <p className="mt-1 text-xs text-muted">Без правильного ключа аккаунт будет создан со статусом «студент».</p>
            </div>
          )}

          {error && <ErrorBanner message={error} />}
          <Button
            type="submit"
            disabled={isLoading || !usernameValid || password.length < 6 || (role === "teacher" && !inviteCode.trim())}
            className="w-full"
          >
            {isLoading ? "Создаём аккаунт…" : "Зарегистрироваться"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-teal hover:text-teal-dark">
            Войти
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}