'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Student, TableProgress, QuizSession } from './supabase';

// ── localStorage keys ────────────────────────────────────────────────────────
const KEY_STUDENT   = 'mk_student';
const KEY_PROGRESS  = 'mk_progress';
const KEY_SESSIONS  = 'mk_sessions';

// ── helpers ──────────────────────────────────────────────────────────────────
function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── context type ─────────────────────────────────────────────────────────────
type StudentContextType = {
  student: Student | null;
  tableProgress: TableProgress[];
  quizSessions: QuizSession[];
  isLoading: boolean;
  setStudent: (s: Student | null) => void;
  refreshProgress: () => void;
  addStars: (count: number) => void;
  updateTableProgress: (tableNum: number, correct: boolean) => void;
  saveQuizSession: (session: Omit<QuizSession, 'id' | 'student_id' | 'completed_at'>) => void;
};

const StudentContext = createContext<StudentContextType>({
  student: null,
  tableProgress: [],
  quizSessions: [],
  isLoading: true,
  setStudent: () => {},
  refreshProgress: () => {},
  addStars: () => {},
  updateTableProgress: () => {},
  saveQuizSession: () => {},
});

// ── provider ─────────────────────────────────────────────────────────────────
export function StudentProvider({ children }: { children: ReactNode }) {
  const [student, setStudentState] = useState<Student | null>(null);
  const [tableProgress, setTableProgress] = useState<TableProgress[]>([]);
  const [quizSessions, setQuizSessions] = useState<QuizSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = loadJSON<Student | null>(KEY_STUDENT, null);
    if (saved) {
      setStudentState(saved);
      setTableProgress(loadJSON<TableProgress[]>(KEY_PROGRESS, []));
      setQuizSessions(loadJSON<QuizSession[]>(KEY_SESSIONS, []));
    }
    setIsLoading(false);
  }, []);

  const persistStudent = (s: Student | null) => {
    setStudentState(s);
    if (s) saveJSON(KEY_STUDENT, s);
    else localStorage.removeItem(KEY_STUDENT);
  };

  const setStudent = (s: Student | null) => {
    persistStudent(s);
    if (!s) {
      setTableProgress([]);
      setQuizSessions([]);
    }
  };

  const refreshProgress = () => {
    setTableProgress(loadJSON<TableProgress[]>(KEY_PROGRESS, []));
  };

  const addStars = (count: number) => {
    if (!student) return;
    const updated: Student = { ...student, total_stars: student.total_stars + count };
    persistStudent(updated);
  };

  const updateTableProgress = (tableNum: number, correct: boolean) => {
    if (!student) return;
    const current = loadJSON<TableProgress[]>(KEY_PROGRESS, []);
    const existing = current.find(p => p.table_number === tableNum);
    let updated: TableProgress[];
    if (existing) {
      const newCorrect  = existing.correct + (correct ? 1 : 0);
      const newAttempts = existing.attempts + 1;
      const mastery     = Math.min(100, Math.round((newCorrect / newAttempts) * 100));
      updated = current.map(p =>
        p.table_number === tableNum
          ? { ...p, correct: newCorrect, attempts: newAttempts, mastery_percent: mastery, last_practiced: new Date().toISOString() }
          : p
      );
    } else {
      updated = [
        ...current,
        {
          id: uuid(),
          student_id: student.id,
          table_number: tableNum,
          correct: correct ? 1 : 0,
          attempts: 1,
          mastery_percent: correct ? 100 : 0,
          last_practiced: new Date().toISOString(),
        },
      ];
    }
    saveJSON(KEY_PROGRESS, updated);
    setTableProgress(updated);
  };

  const saveQuizSession = (session: Omit<QuizSession, 'id' | 'student_id' | 'completed_at'>) => {
    if (!student) return;
    const full: QuizSession = {
      ...session,
      id: uuid(),
      student_id: student.id,
      completed_at: new Date().toISOString(),
    };
    const current = loadJSON<QuizSession[]>(KEY_SESSIONS, []);
    const updated  = [full, ...current].slice(0, 50); // keep last 50
    saveJSON(KEY_SESSIONS, updated);
    setQuizSessions(updated);
  };

  return (
    <StudentContext.Provider value={{
      student, tableProgress, quizSessions, isLoading,
      setStudent, refreshProgress, addStars, updateTableProgress, saveQuizSession,
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export const useStudent = () => useContext(StudentContext);
