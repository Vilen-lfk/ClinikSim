import { FormEvent, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
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
  const isTeacher = role === "teacher";

  // Высота блока полей фиксируется по режиму «Преподаватель», чтобы окно не меняло размер:
  // у студента под полями остаётся свободное место над кнопкой, а при выборе
  // преподавателя поле ключа плавно раскрывается в этом месте.
  const fieldsRef = useRef<HTMLDivElement>(null);
  const inviteRef = useRef<HTMLDivElement>(null);
  const usernameHintRef = useRef<HTMLParagraphElement>(null);
  const [fieldsMinHeight, setFieldsMinHeight] = useState<number>();

  useLayoutEffect(() => {
    const container = fieldsRef.current;
    const invite = inviteRef.current;
    if (!container || !invite) return;
    const measure = () => {
      const fields = Array.from(container.children).slice(0, 3) as HTMLElement[];
      let total = fields.reduce((sum, el) => sum + el.offsetHeight, 0);
      // Подсказку под логином не учитываем — это временное сообщение.
      if (usernameHintRef.current) total -= usernameHintRef.current.offsetHeight + 4;
      const gap = parseFloat(getComputedStyle(container).rowGap) || 0;
      setFieldsMinHeight(total + gap * 3 + invite.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(invite);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, []);

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
    <div className="space-y-4">
      <h2 className="font-serif text-xl font-semibold text-ink">Регистрация</h2>

      <div>
        <label className="mb-2 block text-sm font-medium text-ink">Роль</label>
        <div className="grid grid-cols-2 gap-2">
          <SelectCard active={role === "student"} onClick={() => setRole("student")} layoutId="role-highlight" className="rounded-xl px-2 py-2.5 text-center">
            <div className="whitespace-nowrap text-[13px] font-medium">Студент-ординатор</div>
          </SelectCard>
          <SelectCard active={role === "teacher"} onClick={() => setRole("teacher")} layoutId="role-highlight" className="rounded-xl px-2 py-2.5 text-center">
            <div className="whitespace-nowrap text-[13px] font-medium">Преподаватель</div>
          </SelectCard>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div ref={fieldsRef} className="flex flex-col gap-3" style={{ minHeight: fieldsMinHeight }}>
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
            <p ref={usernameHintRef} className="mt-1 text-xs text-clay">Только латиница, цифры, «.», «-», «_» — без кириллицы и пробелов</p>
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

        <motion.div
          initial={false}
          animate={{ height: isTeacher ? "auto" : 0, opacity: isTeacher ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
          aria-hidden={!isTeacher}
        >
          <div ref={inviteRef}>
            <label className="mb-1 block text-sm font-medium text-ink">Ключ авторизации преподавателя</label>
            <input
              type="password"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              tabIndex={isTeacher ? 0 : -1}
              placeholder="Выдаётся администратором платформы"
              title="Без правильного ключа аккаунт будет создан со статусом «студент»"
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-teal focus:outline-none"
            />
          </div>
        </motion.div>
        </div>

        {error && <ErrorBanner message={error} />}
        <Button
          type="submit"
          disabled={isLoading || !usernameValid || password.length < 6 || (isTeacher && !inviteCode.trim())}
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
  );
}