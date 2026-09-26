import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import PulseLine from "../components/PulseLine";
import { useAuth } from "../context/AuthContext";
import ErrorBanner from "../components/ErrorBanner";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register(username.trim(), password, fullName.trim() || undefined);
      navigate("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-6 p-6 pt-16">
      <div>
        <h1 className="font-serif text-2xl font-medium text-ink">Регистрация</h1>
        <PulseLine size="hero" className="mt-2 max-w-[200px]" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-line bg-card p-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Логин</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            placeholder="латиница, цифры, от 3 символов"
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-teal focus:outline-none"
          />
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
        {error && <ErrorBanner message={error} />}
        <Button type="submit" disabled={isLoading || !username || password.length < 6} className="w-full">
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
  );
}