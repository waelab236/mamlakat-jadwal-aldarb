'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudent } from '@/lib/student-context';
import { useSettings } from '@/lib/settings-context';
import { formatNum } from '@/lib/numerals';
import { supabase } from '@/lib/supabase';
import { Star, Timer, RefreshCw, CheckCircle, XCircle, Zap } from 'lucide-react';

type QuizType = 'multiple' | 'truefalse' | 'fill' | 'timed';

function generateQuestion(tables: number[], type: QuizType) {
  const tableNum = tables[Math.floor(Math.random() * tables.length)];
  const b = Math.floor(Math.random() * 12) + 1;
  const result = tableNum * b;

  if (type === 'truefalse') {
    const isCorrect = Math.random() > 0.4;
    const shownResult = isCorrect ? result : result + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
    return {
      type,
      question: `${tableNum} × ${b} = ${shownResult}`,
      answer: isCorrect ? 'true' : 'false',
      tableNum, b, result,
      choices: ['صواب', 'خطأ'],
    };
  }

  if (type === 'multiple' || type === 'timed') {
    const wrong = new Set<number>();
    while (wrong.size < 3) {
      const v = result + (Math.floor(Math.random() * 10) - 4);
      if (v > 0 && v !== result) wrong.add(v);
    }
    const choices = Array.from(wrong).concat([result]).sort(() => Math.random() - 0.5);
    return { type, question: `${tableNum} × ${b} = ?`, answer: result.toString(), choices: choices.map(String), tableNum, b, result };
  }

  // fill
  return { type, question: `${tableNum} × ${b} = ?`, answer: result.toString(), choices: [], tableNum, b, result };
}

const QUIZ_TYPES = [
  { id: 'multiple' as QuizType, label: 'اختيار من متعدد', icon: '🔤', color: 'from-sky-400 to-blue-500' },
  { id: 'truefalse' as QuizType, label: 'صواب أم خطأ', icon: '✅', color: 'from-green-400 to-emerald-500' },
  { id: 'fill' as QuizType, label: 'أكمل الفراغ', icon: '✏️', color: 'from-yellow-400 to-amber-500' },
  { id: 'timed' as QuizType, label: 'تحدي الوقت', icon: '⚡', color: 'from-orange-400 to-red-500' },
];

function QuizGame({ quizType, tables, onEnd }: { quizType: QuizType; tables: number[]; onEnd: (score: number, total: number) => void }) {
  const { updateTableProgress, addStars } = useStudent();
  const { numberSystem } = useSettings();
  const TOTAL = quizType === 'timed' ? 15 : 10;
  const TIME_LIMIT = quizType === 'timed' ? 5 : 30;

  const [questions] = useState(() => Array.from({ length: TOTAL }, () => generateQuestion(tables, quizType)));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [done, setDone] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const q = questions[idx];

  useEffect(() => {
    setTimeLeft(TIME_LIMIT);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleAnswer('__timeout__', false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [idx]);

  const handleAnswer = (ans: string, fromUser = true) => {
    clearInterval(timerRef.current!);
    if (feedback) return;
    const correct = fromUser && ans === q.answer;
    setSelected(ans);
    setFeedback(correct ? 'correct' : 'wrong');
    updateTableProgress(q.tableNum, correct);
    if (correct) { setScore(s => s + 1); addStars(1); }
    setTimeout(() => {
      if (idx < TOTAL - 1) {
        setIdx(i => i + 1);
        setSelected(null);
        setFillAnswer('');
        setFeedback(null);
      } else {
        setDone(true);
        onEnd(correct ? score + 1 : score, TOTAL);
      }
    }, 1200);
  };

  if (done) {
    return (
      <div className="text-center py-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
          {score >= TOTAL * 0.8 ? '🏆' : score >= TOTAL * 0.5 ? '⭐' : '💪'}
        </motion.div>
        <h2 className="text-3xl font-black text-sky-700 mb-2">انتهى الاختبار!</h2>
        <div className="text-5xl font-black text-sky-600 my-4">{formatNum(score, numberSystem)} / {formatNum(TOTAL, numberSystem)}</div>
        <div className="flex gap-3 justify-center mt-6 flex-wrap">
          <button onClick={() => onEnd(score, TOTAL)} className="bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-200">العودة</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-500">{formatNum(idx + 1, numberSystem)} / {formatNum(TOTAL, numberSystem)}</span>
        <div className="flex items-center gap-2">
          <Timer className={`w-4 h-4 ${timeLeft <= 5 ? 'text-red-500' : 'text-sky-500'}`} />
          <span className={`font-black text-lg ${timeLeft <= 5 ? 'text-red-500' : 'text-sky-600'}`}>{formatNum(timeLeft, numberSystem)}s</span>
        </div>
        <span className="flex items-center gap-1 text-yellow-600 font-bold"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{formatNum(score, numberSystem)}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
        <motion.div className="h-full bg-sky-400 rounded-full" style={{ width: `${((idx) / TOTAL) * 100}%` }} />
      </div>
      {/* Timer bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6 overflow-hidden">
        <motion.div className={`h-full rounded-full ${timeLeft <= 5 ? 'bg-red-400' : 'bg-green-400'}`} style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }} transition={{ duration: 1 }} />
      </div>

      <motion.div key={idx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
        <div className="bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-2xl p-6 mb-6 text-center shadow-md">
          <div className="text-4xl md:text-5xl font-black">{q.question}</div>
        </div>

        {(q.type === 'multiple' || q.type === 'timed') && (
          <div className="grid grid-cols-2 gap-3">
            {q.choices.map(choice => (
              <motion.button key={choice} whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(choice)}
                className={`py-5 text-2xl font-black rounded-2xl border-2 transition-all ${
                  feedback === null ? 'bg-white border-sky-200 text-sky-700 hover:bg-sky-50 hover:border-sky-400 hover:scale-105' :
                  choice === q.answer ? 'bg-green-100 border-green-400 text-green-700' :
                  selected === choice ? 'bg-red-50 border-red-300 text-red-400' :
                  'bg-gray-50 border-gray-200 text-gray-400'
                }`}>
                {choice}
              </motion.button>
            ))}
          </div>
        )}

        {q.type === 'truefalse' && (
          <div className="grid grid-cols-2 gap-4">
            {[{ v: 'true', label: '✅ صواب', bg: 'from-green-400 to-green-500' }, { v: 'false', label: '❌ خطأ', bg: 'from-red-400 to-red-500' }].map(opt => (
              <motion.button key={opt.v} whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(opt.v)}
                className={`py-8 text-2xl font-black rounded-2xl border-2 transition-all ${
                  feedback === null ? `bg-gradient-to-br ${opt.bg} text-white shadow-md hover:scale-105` :
                  opt.v === q.answer ? 'bg-green-100 border-green-400 text-green-700' :
                  selected === opt.v ? 'bg-red-50 border-red-300 text-red-400' :
                  'bg-gray-50 border-gray-200 text-gray-400'
                }`}>
                {opt.label}
              </motion.button>
            ))}
          </div>
        )}

        {q.type === 'fill' && (
          <div>
            <div className="flex gap-3">
              <input type="number" value={fillAnswer} onChange={e => setFillAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && fillAnswer && handleAnswer(fillAnswer)}
                placeholder="اكتب الإجابة..."
                className={`flex-1 text-center text-3xl font-black border-2 rounded-xl py-4 focus:outline-none transition-colors ${
                  feedback === 'correct' ? 'border-green-400 bg-green-50 text-green-700' :
                  feedback === 'wrong' ? 'border-red-300 bg-red-50 text-red-600' :
                  'border-sky-300 focus:border-sky-500'
                }`}
                inputMode="numeric" disabled={!!feedback} />
              <button onClick={() => fillAnswer && handleAnswer(fillAnswer)} disabled={!fillAnswer || !!feedback}
                className="bg-sky-500 text-white font-black py-4 px-6 rounded-xl hover:bg-sky-600 disabled:opacity-50 shadow-md">
                تحقق
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-3">
              {[1,2,3,4,5,6,7,8,9,0].map(n => (
                <button key={n} onClick={() => setFillAnswer(a => a + n)} className="bg-sky-50 border border-sky-200 text-sky-700 font-black rounded-lg py-2 text-lg hover:bg-sky-100">
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className={`mt-4 text-center py-3 rounded-xl font-black text-lg ${feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {feedback === 'correct' ? '✅ ممتاز! إجابة صحيحة!' : `❌ الإجابة الصحيحة: ${q.answer}`}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function QuizzesPage() {
  const { student, addStars } = useStudent();
  const { numberSystem } = useSettings();
  const [quizType, setQuizType] = useState<QuizType | null>(null);
  const [tables, setTables] = useState<number[]>([2, 3, 4, 5]);
  const [gameKey, setGameKey] = useState(0);

  const handleEnd = async (score: number, total: number) => {
    if (student) {
      await supabase.from('quiz_sessions').insert({
        student_id: student.id,
        session_type: 'quiz',
        table_numbers: tables,
        score,
        accuracy: Math.round((score / total) * 100),
        duration_seconds: 0,
        total_questions: total,
        correct_answers: score,
      });
    }
    setQuizType(null);
    setGameKey(k => k + 1);
  };

  if (quizType) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setQuizType(null)} className="text-sky-600 font-bold hover:text-sky-800 flex items-center gap-1 bg-white border border-sky-200 rounded-xl px-3 py-2">
              ← العودة
            </button>
            <h2 className="font-black text-sky-700 text-xl">{QUIZ_TYPES.find(t => t.id === quizType)?.label}</h2>
          </div>
          <QuizGame key={gameKey} quizType={quizType} tables={tables} onEnd={handleEnd} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">📝</motion.div>
          <h1 className="text-4xl font-black text-sky-700 mb-2">الاختبارات</h1>
          <p className="text-gray-500 text-lg">اختبر معلوماتك في جداول الضرب</p>
        </div>

        {/* Table Selection */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-sky-100 mb-6">
          <h3 className="font-black text-gray-700 mb-4">اختر الجداول للاختبار</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
              <button key={num} onClick={() => setTables(t => t.includes(num) ? t.filter(x => x !== num) : [...t, num])}
                className={`w-12 h-12 rounded-xl font-black text-lg transition-all ${tables.includes(num) ? 'bg-sky-500 text-white shadow-md' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'}`}>
                {formatNum(num, numberSystem)}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setTables(Array.from({ length: 12 }, (_, i) => i + 1))} className="text-xs text-sky-600 font-semibold hover:text-sky-800">تحديد الكل</button>
            <button onClick={() => setTables([1])} className="text-xs text-gray-400 font-semibold hover:text-gray-600">إلغاء التحديد</button>
          </div>
        </div>

        {/* Quiz Types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUIZ_TYPES.map(type => (
            <motion.button key={type.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => tables.length > 0 && setQuizType(type.id)}
              disabled={tables.length === 0}
              className={`bg-gradient-to-br ${type.color} text-white rounded-2xl p-6 text-right shadow-md hover:shadow-xl transition-all disabled:opacity-50`}>
              <div className="text-4xl mb-3">{type.icon}</div>
              <div className="text-xl font-black">{type.label}</div>
              {type.id === 'timed' && <div className="text-white/80 text-sm mt-1">⚡ {formatNum(15, numberSystem)} سؤال × {formatNum(5, numberSystem)} ثواني</div>}
              {type.id === 'multiple' && <div className="text-white/80 text-sm mt-1">{formatNum(10, numberSystem)} أسئلة بخيارات متعددة</div>}
              {type.id === 'truefalse' && <div className="text-white/80 text-sm mt-1">{formatNum(10, numberSystem)} أسئلة صواب/خطأ</div>}
              {type.id === 'fill' && <div className="text-white/80 text-sm mt-1">{formatNum(10, numberSystem)} أسئلة أكمل الفراغ</div>}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
