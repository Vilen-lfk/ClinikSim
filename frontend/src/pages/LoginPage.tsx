import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/Button";
import ErrorBanner from "../components/ErrorBanner";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(username.trim(), password);
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
        <h2 className="font-serif text-2xl font-medium text-ink">Вход</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Логин</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-teal focus:outline-none"
            />
          </div>
          {error && <ErrorBanner message={error} />}
          <Button type="submit" disabled={isLoading || !username || !password} className="w-full">
            {isLoading ? "Входим…" : "Войти"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted">
          Нет аккаунта?{" "}
          <Link to="/register" className="text-teal hover:text-teal-dark">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}