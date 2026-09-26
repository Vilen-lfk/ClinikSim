export interface ScenarioListItem {
  id: number;
  title: string;
  specialty: string;
  difficulty: string;
}

export interface PatientProfile {
  name: string;
  age: number;
  gender: string;
  occupation: string;
  arrival_complaint: string;
  speech_style?: string;
}

export interface Scenario extends ScenarioListItem {
  patient_profile: PatientProfile;
}

export interface Message {
  id: number; // временные (локальные) сообщения имеют отрицательный id
  role: "student" | "patient";
  content: string;
  created_at?: string;
}

export interface CriterionResult {
  key: string;
  title: string;
  score: number;
  max_score: number;
  comment: string;
}

export interface Evaluation {
  total_score: number;
  diagnosis_correct: boolean;
  criteria: CriterionResult[];
  missed_questions: string[];
  strengths: string[];
  feedback: string;
}

export interface Session {
  id: number;
  student_id: string;
  status: "active" | "finished";
  final_diagnosis: string | null;
  score: number | null;
  created_at: string;
  scenario: Scenario;
  messages: Message[];
  evaluation: Evaluation | null;
  correct_diagnosis: string | null;
}

export interface SessionListItem {
  id: number;
  scenario_title: string;
  status: "active" | "finished";
  score: number | null;
  final_diagnosis: string | null;
  created_at: string;
}

export interface ScenarioStats {
  scenario_id: number;
  title: string;
  attempts: number;
  avg_score: number | null;
}

export interface AuthUser {
  username: string;
  full_name: string | null;
  specialty?: string | null;
  course?: string | null;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  username: string;
  full_name: string | null;
}

export interface SessionListItem {
  id: number;
  scenario_title: string;
  scenario_specialty: string;
  status: "active" | "finished";
  score: number | null;
  final_diagnosis: string | null;
  created_at: string;
}