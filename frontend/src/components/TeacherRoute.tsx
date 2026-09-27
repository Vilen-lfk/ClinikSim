import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TeacherRoute() {
  const { user } = useAuth();
  if (user && user.role !== "teacher") return <Navigate to="/" replace />;
  return <Outlet />;
}