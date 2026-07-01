'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, Student, TableProgress } from './supabase';

type StudentContextType = {
  student: Student | null;
  tableProgress: TableProgress[];
  isLoading: boolean;
  setStudent: (s: Student | null) => void;
  refreshProgress: () => void;
  addStars: (count: number) => void;
  updateTableProgress: (tableNum: number, correct: boolean) => void;
};

const StudentContext = createContext<StudentContextType>({
  student: null,
  tableProgress: [],
  isLoading: true,
  setStudent: () => {},
  refreshProgress: () => {},
  addStars: () => {},
  updateTableProgress: () => {},
});

export function StudentProvider({ children }: { children: ReactNode }) {
  const [student, setStudentState] = useState<Student | null>(null);
  const [tableProgress, setTableProgress] = useState<TableProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('mk_student_id');
    if (stored) {
      loadStudent(stored);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadStudent = async (id: string) => {
    const { data } = await supabase.from('students').select('*').eq('id', id).maybeSingle();
    if (data) {
      setStudentState(data);
      loadProgress(id);
    }
    setIsLoading(false);
  };

  const loadProgress = async (id: string) => {
    const { data } = await supabase.from('table_progress').select('*').eq('student_id', id);
    if (data) setTableProgress(data);
  };

  const setStudent = (s: Student | null) => {
    setStudentState(s);
    if (s) {
      localStorage.setItem('mk_student_id', s.id);
      loadProgress(s.id);
    } else {
      localStorage.removeItem('mk_student_id');
      setTableProgress([]);
    }
  };

  const refreshProgress = () => {
    if (student) loadProgress(student.id);
  };

  const addStars = async (count: number) => {
    if (!student) return;
    const newTotal = student.total_stars + count;
    await supabase.from('students').update({ total_stars: newTotal, updated_at: new Date().toISOString() }).eq('id', student.id);
    setStudentState({ ...student, total_stars: newTotal });
  };

  const updateTableProgress = async (tableNum: number, correct: boolean) => {
    if (!student) return;
    const existing = tableProgress.find(p => p.table_number === tableNum);
    if (existing) {
      const newCorrect = existing.correct + (correct ? 1 : 0);
      const newAttempts = existing.attempts + 1;
      const mastery = Math.min(100, Math.round((newCorrect / newAttempts) * 100));
      await supabase.from('table_progress').update({
        correct: newCorrect,
        attempts: newAttempts,
        mastery_percent: mastery,
        last_practiced: new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      await supabase.from('table_progress').insert({
        student_id: student.id,
        table_number: tableNum,
        correct: correct ? 1 : 0,
        attempts: 1,
        mastery_percent: correct ? 100 : 0,
      });
    }
    loadProgress(student.id);
  };

  return (
    <StudentContext.Provider value={{ student, tableProgress, isLoading, setStudent, refreshProgress, addStars, updateTableProgress }}>
      {children}
    </StudentContext.Provider>
  );
}

export const useStudent = () => useContext(StudentContext);
