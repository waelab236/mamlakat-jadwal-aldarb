import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Student = {
  id: string;
  name: string;
  avatar: string;
  level: number;
  total_stars: number;
  streak_days: number;
  last_active: string;
  created_at: string;
};

export type TableProgress = {
  id: string;
  student_id: string;
  table_number: number;
  mastery_percent: number;
  attempts: number;
  correct: number;
  last_practiced: string;
};

export type Achievement = {
  key: string;
  title_ar: string;
  description_ar: string;
  icon: string;
  color: string;
  requirement_type: string;
  requirement_value: number;
};

export type StudentAchievement = {
  id: string;
  student_id: string;
  achievement_key: string;
  earned_at: string;
};

export type QuizSession = {
  id: string;
  student_id: string;
  session_type: string;
  table_numbers: number[];
  score: number;
  accuracy: number;
  duration_seconds: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string;
};
