/*
  # Multiplication Kingdom - Database Schema

  ## Overview
  Full schema for an Arabic educational multiplication tables web app for children ages 6-12.

  ## New Tables

  ### 1. students
  - Tracks student profiles with avatars, names, and gamification data
  - `id` - UUID primary key
  - `name` - Student display name
  - `avatar` - Avatar identifier (emoji/image key)
  - `level` - Current level (1-12 based on tables mastered)
  - `total_stars` - Accumulated star count
  - `streak_days` - Learning streak
  - `created_at`, `updated_at`

  ### 2. table_progress
  - Tracks progress per multiplication table (1-12) per student
  - `student_id` - FK to students
  - `table_number` - Which table (1-12)
  - `mastery_percent` - 0-100 mastery level
  - `attempts` - Total attempts
  - `correct` - Correct answers
  - `last_practiced` - Timestamp of last practice

  ### 3. quiz_sessions
  - Records each quiz/practice session
  - `student_id` - FK to students
  - `session_type` - Type: 'quiz', 'game', 'practice', 'exercise'
  - `table_numbers` - Which tables were covered (array)
  - `score` - Points earned
  - `accuracy` - Percentage correct
  - `duration_seconds` - Time taken
  - `completed_at`

  ### 4. achievements
  - Achievement/badge definitions
  - `key` - Unique achievement identifier
  - `title_ar` - Arabic title
  - `description_ar` - Arabic description
  - `icon` - Icon identifier
  - `requirement_type` - What triggers it
  - `requirement_value` - Threshold value

  ### 5. student_achievements
  - Junction table for earned achievements
  - `student_id` - FK to students
  - `achievement_key` - FK to achievements
  - `earned_at` - When earned

  ### 6. worksheets
  - Saved/generated worksheets
  - `created_by` - Teacher identifier (name/string, no auth required)
  - `title` - Worksheet title
  - `table_numbers` - Which tables
  - `difficulty` - easy/medium/hard
  - `student_name` - Optional target student
  - `school_name` - Optional school
  - `teacher_name` - Creator name
  - `questions` - JSONB array of questions
  - `created_at`

  ## Security
  - RLS enabled on all tables
  - Public read/write allowed for students (no auth required for children's app)
  - Worksheets publicly accessible

  ## Notes
  - No authentication required (children's app with local profiles)
  - Using public policies for ease of use in educational context
  - JSONB for flexible question storage
*/

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'طالب',
  avatar text NOT NULL DEFAULT 'lion',
  level integer NOT NULL DEFAULT 1,
  total_stars integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  last_active date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read students"
  ON students FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert students"
  ON students FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update students"
  ON students FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Table progress
CREATE TABLE IF NOT EXISTS table_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  table_number integer NOT NULL CHECK (table_number BETWEEN 1 AND 12),
  mastery_percent integer NOT NULL DEFAULT 0 CHECK (mastery_percent BETWEEN 0 AND 100),
  attempts integer NOT NULL DEFAULT 0,
  correct integer NOT NULL DEFAULT 0,
  last_practiced timestamptz DEFAULT now(),
  UNIQUE(student_id, table_number)
);

ALTER TABLE table_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read table_progress"
  ON table_progress FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert table_progress"
  ON table_progress FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update table_progress"
  ON table_progress FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Quiz sessions
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  session_type text NOT NULL DEFAULT 'quiz',
  table_numbers integer[] NOT NULL DEFAULT '{}',
  score integer NOT NULL DEFAULT 0,
  accuracy integer NOT NULL DEFAULT 0 CHECK (accuracy BETWEEN 0 AND 100),
  duration_seconds integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  correct_answers integer NOT NULL DEFAULT 0,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read quiz_sessions"
  ON quiz_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert quiz_sessions"
  ON quiz_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Achievements definitions
CREATE TABLE IF NOT EXISTS achievements (
  key text PRIMARY KEY,
  title_ar text NOT NULL,
  description_ar text NOT NULL,
  icon text NOT NULL DEFAULT 'star',
  color text NOT NULL DEFAULT 'yellow',
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL DEFAULT 1
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read achievements"
  ON achievements FOR SELECT
  TO anon, authenticated
  USING (true);

-- Student achievements junction
CREATE TABLE IF NOT EXISTS student_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  achievement_key text NOT NULL REFERENCES achievements(key) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(student_id, achievement_key)
);

ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read student_achievements"
  ON student_achievements FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert student_achievements"
  ON student_achievements FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Worksheets
CREATE TABLE IF NOT EXISTS worksheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'ورقة عمل',
  created_by text NOT NULL DEFAULT 'معلم',
  table_numbers integer[] NOT NULL DEFAULT '{}',
  difficulty text NOT NULL DEFAULT 'medium',
  student_name text DEFAULT '',
  school_name text DEFAULT '',
  teacher_name text DEFAULT '',
  questions jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE worksheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read worksheets"
  ON worksheets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert worksheets"
  ON worksheets FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update worksheets"
  ON worksheets FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete worksheets"
  ON worksheets FOR DELETE
  TO anon, authenticated
  USING (true);

-- Seed achievements
INSERT INTO achievements (key, title_ar, description_ar, icon, color, requirement_type, requirement_value) VALUES
  ('first_star', 'النجمة الأولى', 'أجبت على أول سؤال صحيح!', 'star', 'yellow', 'correct_answers', 1),
  ('table_1_master', 'بطل جدول 1', 'أتقنت جدول الضرب في 1', 'crown', 'yellow', 'table_mastery', 1),
  ('table_2_master', 'بطل جدول 2', 'أتقنت جدول الضرب في 2', 'crown', 'blue', 'table_mastery', 2),
  ('table_5_master', 'بطل جدول 5', 'أتقنت جدول الضرب في 5', 'crown', 'green', 'table_mastery', 5),
  ('table_10_master', 'بطل جدول 10', 'أتقنت جدول الضرب في 10', 'crown', 'pink', 'table_mastery', 10),
  ('all_tables_master', 'ملك الضرب', 'أتقنت جميع جداول الضرب!', 'trophy', 'gold', 'tables_mastered', 12),
  ('streak_3', 'متعلم مواظب', 'تعلمت 3 أيام متتالية', 'fire', 'orange', 'streak_days', 3),
  ('streak_7', 'أسبوع ممتاز', 'تعلمت أسبوعاً كاملاً متتالياً', 'fire', 'red', 'streak_days', 7),
  ('100_stars', 'جامع النجوم', 'جمعت 100 نجمة', 'star', 'gold', 'total_stars', 100),
  ('perfect_quiz', 'إجابات مثالية', 'أجبت على اختبار كامل بدون أخطاء', 'medal', 'gold', 'perfect_quiz', 1),
  ('speed_demon', 'البرق السريع', 'أجبت على 10 أسئلة في أقل من 60 ثانية', 'zap', 'yellow', 'speed_challenge', 10),
  ('curious_learner', 'المتعلم الفضولي', 'زرت جميع أقسام التطبيق', 'book', 'blue', 'sections_visited', 10)
ON CONFLICT (key) DO NOTHING;
