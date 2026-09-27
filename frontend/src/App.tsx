import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
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

function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />

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
    </AnimatePresence>
  );
}