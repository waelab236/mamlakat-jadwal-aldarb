'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudent } from '@/lib/student-context';
import { RefreshCw, CheckCircle, XCircle, Star } from 'lucide-react';
import { useSettings } from '@/lib/settings-context';
import { formatNum } from '@/lib/numerals';

function generateExercise() {
  const a = Math.floor(Math.random() * 9) + 2;
  const b = Math.floor(Math.random() * 9) + 2;
  return { a, b, result: a * b };
}

export default function ExercisesPage() {
  const { numberSystem } = useSettings();
  const { updateTableProgress, addStars } = useStudent();
  const [exercise, setExercise] = useState(generateExercise);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const additions = Array.from({ length: exercise.a }, () => exercise.b);
  const additionStr = additions.join(' + ');

  const handleSubmit = () => {
    if (!answer.trim() || feedback) return;
    const correct = parseInt(answer) === exercise.result;
    setFeedback(correct ? 'correct' : 'wrong');
    updateTableProgress(exercise.a, correct);
    setTotalAnswered(t => t + 1);
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      addStars(1);
    } else {
      setStreak(0);
    }
    setTimeout(() => {
      setExercise(generateExercise());
      setAnswer('');
      setFeedback(null);
      setShowHint(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">➕</motion.div>
          <h1 className="text-4xl font-black text-sky-700 mb-2">الجمع المتكرر</h1>
          <p className="text-gray-500 text-lg">افهم أن الضرب هو جمع متكرر</p>
        </div>

        {/* Score Bar */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-md border border-sky-100 mb-6">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
            <span className="font-black text-gray-700">{formatNum(score, numberSystem)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-500 font-bold">🔥 {formatNum(streak, numberSystem)}</span>
          </div>
          <div className="text-gray-500 text-sm font-semibold">{formatNum(totalAnswered, numberSystem)} سؤال</div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={exercise.a + '-' + exercise.b} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
            {/* Exercise Card */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-sky-200 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-sky-400 to-blue-500 p-6 text-white text-center">
                <div className="text-5xl font-black">{formatNum(exercise.a, numberSystem)} × {formatNum(exercise.b, numberSystem)}</div>
              </div>

              <div className="p-6">
                {/* Repeated Addition Visual */}
                <div className="bg-sky-50 rounded-2xl p-5 mb-6 border border-sky-200">
                  <p className="text-sky-700 font-bold text-center mb-4">
                    هذا يعني: {formatNum(exercise.a, numberSystem)} مجموعات من {formatNum(exercise.b, numberSystem)}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {additions.map((val, i) => (
                      <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 }}
                        className="bg-sky-400 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-md">
                        {formatNum(val, numberSystem)}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Addition String */}
                <div className="text-center mb-6">
                  <p className="text-gray-500 text-sm font-semibold mb-2">الجمع المتكرر:</p>
                  <div className="text-2xl font-black text-gray-700 bg-gray-50 rounded-xl p-3 border border-gray-200">
                    {additions.map((val, i) => (
                      <span key={i}>
                        {formatNum(val, numberSystem)}
                        {i < additions.length - 1 ? ' + ' : ''}
                      </span>
                    ))} = <span className="text-sky-600">?</span>
                  </div>
                </div>

                {/* Answer Input */}
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="الإجابة..."
                    className={`flex-1 text-center text-3xl font-black border-2 rounded-xl py-3 focus:outline-none transition-colors ${
                      feedback === 'correct' ? 'border-green-400 bg-green-50 text-green-700' :
                      feedback === 'wrong' ? 'border-red-300 bg-red-50 text-red-600' :
                      'border-sky-300 focus:border-sky-500 bg-white'
                    }`}
                  />
                  <button onClick={handleSubmit} className="bg-sky-500 text-white font-black py-3 px-6 rounded-xl hover:bg-sky-600 transition-all shadow-md flex-shrink-0 whitespace-nowrap">
                    تحقق
                  </button>
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {[1,2,3,4,5,6,7,8,9,0].map(n => (
                    <button key={n} onClick={() => setAnswer(a => a + n)} className="bg-sky-50 border border-sky-200 text-sky-700 font-black rounded-xl py-2 text-lg hover:bg-sky-100 transition-colors">
                      {formatNum(n, numberSystem)}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {feedback && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                      className={`mt-4 text-center py-3 rounded-xl font-black text-lg ${feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {feedback === 'correct' ? `✅ صحيح! ${additions.map((val, i) => (
                        <span key={i}>
                          {formatNum(val, numberSystem)}
                          {i < additions.length - 1 ? ' + ' : ''}
                        </span>
                      ))} = ${formatNum(exercise.result, numberSystem)}` : `❌ الإجابة: ${formatNum(exercise.result, numberSystem)}`}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-4 flex justify-between items-center">
                  <button onClick={() => setShowHint(!showHint)} className="text-sm text-sky-500 font-semibold hover:text-sky-700">
                    💡 {showHint ? 'إخفاء التلميح' : 'أحتاج تلميحاً'}
                  </button>
                  <button onClick={() => { setExercise(generateExercise()); setAnswer(''); setFeedback(null); setShowHint(false); }} className="text-sm text-gray-400 font-semibold hover:text-gray-600 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> سؤال آخر
                  </button>
                </div>

                <AnimatePresence>
                  {showHint && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-yellow-800 text-sm font-semibold">
                        💡 احسب: {additions.map((val, i) => (
                          <span key={i}>
                            {formatNum(val, numberSystem)}
                            {i < additions.length - 1 ? ' + ' : ''}
                          </span>
                        ))} = {formatNum(exercise.result, numberSystem)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
