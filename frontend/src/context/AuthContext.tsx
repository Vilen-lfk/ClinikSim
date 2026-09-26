import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../api/client";
import type { AuthUser } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<{ full_name: string; specialty: string; course: string }>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  // При наличии токена подтягиваем полный профиль (специальность, курс, дата регистрации)
  useEffect(() => {
    (async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        setUser(await api.getMe());
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.login(username, password);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    setAuthToken(res.access_token);
    setToken(res.access_token);
    setUser(await api.getMe());
  };

  const register = async (username: string, password: string, fullName?: string) => {
    const res = await api.register(username, password, fullName);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    setAuthToken(res.access_token);
    setToken(res.access_token);
    setUser(await api.getMe());
  };

  const updateProfile = async (data: Partial<{ full_name: string; specialty: string; course: string }>) => {
    setUser(await api.updateProfile(data));
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth должен использоваться внутри AuthProvider");
  return ctx;
}