import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { token, isLoading } = useAuth();
  if (isLoading) return <p className="p-6 text-muted">Загрузка…</p>;
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}