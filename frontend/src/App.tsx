import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import LoginPage from "./pages/LoginPage";
import NewSimulationPage from "./pages/NewSimulationPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import ResultsPage from "./pages/ResultsPage";
import ReviewPage from "./pages/ReviewPage";
import SimulationPage from "./pages/SimulationPage";
import ScenarioFormPage from "./pages/ScenarioFormPage";
import ScenarioManagerPage from "./pages/ScenarioManagerPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import TeacherRoute from "./components/TeacherRoute";
import TeacherSessionDetailPage from "./pages/TeacherSessionDetailPage";
import TeacherStudentSessionsPage from "./pages/TeacherStudentSessionsPage";

// Только короткая анимация появления: новая страница монтируется сразу,
// без ожидания исчезновения старой, а Layout с меню не пересоздаётся.
function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/new-simulation" element={<PageTransition><NewSimulationPage /></PageTransition>} />
          <Route path="/simulation/:id" element={<PageTransition><SimulationPage /></PageTransition>} />
          <Route path="/results/:id" element={<PageTransition><ResultsPage /></PageTransition>} />
          <Route path="/review/:id" element={<PageTransition><ReviewPage /></PageTransition>} />
          <Route path="/history" element={<PageTransition><HistoryPage /></PageTransition>} />
          <Route path="/knowledge" element={<PageTransition><KnowledgeBasePage /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
          <Route element={<TeacherRoute />}>
            <Route path="/teacher/dashboard" element={<PageTransition><TeacherDashboardPage /></PageTransition>} />
            <Route path="/teacher/students/:id" element={<PageTransition><TeacherStudentSessionsPage /></PageTransition>} />
            <Route path="/teacher/sessions/:id" element={<PageTransition><TeacherSessionDetailPage /></PageTransition>} />
            <Route path="/teacher/scenarios" element={<PageTransition><ScenarioManagerPage /></PageTransition>} />
            <Route path="/teacher/scenarios/new" element={<PageTransition><ScenarioFormPage /></PageTransition>} />
            <Route path="/teacher/scenarios/:id/edit" element={<PageTransition><ScenarioFormPage /></PageTransition>} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}