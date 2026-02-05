export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
// Relaxed to string to support expanded list and custom entries
export type Subject = string;
export interface StudySession {
  id: string;
  date: string; // ISO Date String
  topic: string;
  isCompleted: boolean;
  durationMinutes: number;
}
export interface Test {
  id: string;
  subject: Subject;
  title: string; // Optional custom title
  date: string; // ISO Date String (Test Day)
  difficulty: DifficultyLevel;
  sessions: StudySession[];
  createdAt: number;
}
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  tests: Test[];
  createdAt: number;
}