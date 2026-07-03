'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudent } from '@/lib/student-context';
import { RefreshCw } from 'lucide-react';
import { useSettings } from '@/lib/settings-context';
import { formatNum } from '@/lib/numerals';

function generateFact() {
  const a = Math.floor(Math.random() * 9) + 2;
  const b = Math.floor(Math.random() * 9) + 2;
  return { a, b, result: a * b };
}

type Mode = 'fill-division' | 'choose-missing';

export default function DivisionPage() {
  const { numberSystem } = useSettings();
  const { addStars, updateTableProgress } = useStudent();
  const [fact, setFact] = useState(generateFact);
  const [answers, setAnswers] = useState({ div1: '', div2: '' });
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<Mode>('fill-division');

  const next = () => {
    setFact(generateFact());
    setAnswers({ div1: '', div2: '' });
    setChecked(false);
  };

  const handleCheck = () => {
    const c1 = parseInt(answers.div1) === fact.a;
    const c2 = parseInt(answers.div2) === fact.b;
    setChecked(true);
    const stars = (c1 ? 1 : 0) + (c2 ? 1 : 0);
    if (stars > 0) { addStars(stars); setScore(s => s + stars); }
    updateTableProgress(fact.a, c1 && c2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">➗</motion.div>
          <h1 className="text-4xl font-black text-sky-700 mb-2">الضرب والقسمة</h1>
          <p className="text-gray-500 text-lg">الضرب والقسمة وجهان لعملة واحدة!</p>
          <div className="mt-2 bg-sky-50 border border-sky-200 rounded-full px-4 py-1 inline-block text-sky-600 font-bold text-sm">
            النقاط: {formatNum(score, numberSystem)}
          </div>
        </div>

        {/* Concept */}
        <div className="bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-2xl p-6 mb-6">
          <h3 className="font-black text-xl mb-3 text-center">🔑 المفهوم الأساسي</h3>
          <div className="grid grid-cols-1 gap-2 text-center">
            <div className="bg-white/20 rounded-xl p-3">
              <p className="font-black text-xl">{formatNum(fact.a, numberSystem)} × {formatNum(fact.b, numberSystem)} = {formatNum(fact.result, numberSystem)}</p>
            </div>
            <div className="text-blue-100 font-bold">يعني أيضاً:</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/20 rounded-xl p-3">
                <p className="font-black">{formatNum(fact.result, numberSystem)} ÷ {formatNum(fact.b, numberSystem)} = {formatNum(fact.a, numberSystem)}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <p className="font-black">{formatNum(fact.result, numberSystem)} ÷ {formatNum(fact.a, numberSystem)} = {formatNum(fact.b, numberSystem)}</p>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={fact.a + '-' + fact.b} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Exercise */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-sky-200 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-4 text-white text-center">
                <div className="text-2xl font-black mb-1">{formatNum(fact.a, numberSystem)} × {formatNum(fact.b, numberSystem)} = {formatNum(fact.result, numberSystem)}</div>
                <p className="text-green-100 text-sm">اكتب مسألتي القسمة الناتجتين</p>
              </div>
              <div className="p-6 space-y-4">
                {/* Division 1 */}
                <div className="flex items-center gap-3">
                  <div className={`flex-1 flex items-center gap-2 bg-sky-50 border-2 rounded-xl p-4 ${checked ? parseInt(answers.div1) === fact.a ? 'border-green-400' : 'border-red-300' : 'border-sky-200'}`}>
                    <span className="text-xl font-black text-sky-700 flex-1 text-center">{formatNum(fact.result, numberSystem)} ÷ {formatNum(fact.b, numberSystem)} =</span>
                    <input
                      type="text"
                      value={answers.div1}
                      onChange={e => setAnswers(a => ({ ...a, div1: e.target.value }))}
                      disabled={checked}
                      placeholder="؟"
                      className="w-16 text-center text-2xl font-black border-2 border-sky-300 rounded-lg py-2 focus:outline-none focus:border-sky-500 bg-white"
                      inputMode="numeric"
                    />
                  </div>
                  {checked && <span className="text-2xl">{parseInt(answers.div1) === fact.a ? '✅' : '❌'}</span>}
                </div>

                {/* Division 2 */}
                <div className="flex items-center gap-3">
                  <div className={`flex-1 flex items-center gap-2 bg-pink-50 border-2 rounded-xl p-4 ${checked ? parseInt(answers.div2) === fact.b ? 'border-green-400' : 'border-red-300' : 'border-pink-200'}`}>
                    <span className="text-xl font-black text-pink-700 flex-1 text-center">{formatNum(fact.result, numberSystem)} ÷ {formatNum(fact.a, numberSystem)} =</span>
                    <input
                      type="text"
                      value={answers.div2}
                      onChange={e => setAnswers(a => ({ ...a, div2: e.target.value }))}
                      disabled={checked}
                      placeholder="؟"
                      className="w-16 text-center text-2xl font-black border-2 border-pink-300 rounded-lg py-2 focus:outline-none focus:border-pink-500 bg-white"
                      inputMode="numeric"
                    />
                  </div>
                  {checked && <span className="text-2xl">{parseInt(answers.div2) === fact.b ? '✅' : '❌'}</span>}
                </div>

                <AnimatePresence>
                  {checked && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <p className="text-green-700 font-black text-lg">✅ الإجابات الصحيحة:</p>
                      <p className="text-green-600 font-bold">{formatNum(fact.result, numberSystem)} ÷ {formatNum(fact.b, numberSystem)} = <strong>{formatNum(fact.a, numberSystem)}</strong></p>
                      <p className="text-green-600 font-bold">{formatNum(fact.result, numberSystem)} ÷ {formatNum(fact.a, numberSystem)} = <strong>{formatNum(fact.b, numberSystem)}</strong></p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!checked ? (
                  <button onClick={handleCheck} disabled={!answers.div1 || !answers.div2} className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black py-4 rounded-2xl text-xl shadow-md hover:opacity-90 disabled:opacity-50 transition-all">
                    تحقق
                  </button>
                ) : (
                  <button onClick={next} className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black py-4 rounded-2xl text-xl shadow-md hover:opacity-90 flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5" /> مثال جديد
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Fact Family Visual */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl p-6 border-2 border-yellow-200">
          <h3 className="font-black text-yellow-800 text-xl mb-4 text-center">👨‍👩‍👧 عائلة الحقائق الرياضية</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { eq: `${formatNum(fact.a, numberSystem)} × ${formatNum(fact.b, numberSystem)} = ${formatNum(fact.result, numberSystem)}`, color: 'bg-sky-100 text-sky-700 border-sky-300' },
              { eq: `${formatNum(fact.b, numberSystem)} × ${formatNum(fact.a, numberSystem)} = ${formatNum(fact.result, numberSystem)}`, color: 'bg-pink-100 text-pink-700 border-pink-300' },
              { eq: `${formatNum(fact.result, numberSystem)} ÷ ${formatNum(fact.b, numberSystem)} = ${formatNum(fact.a, numberSystem)}`, color: 'bg-green-100 text-green-700 border-green-300' },
              { eq: `${formatNum(fact.result, numberSystem)} ÷ ${formatNum(fact.a, numberSystem)} = ${formatNum(fact.b, numberSystem)}`, color: 'bg-orange-100 text-orange-700 border-orange-300' },
            ].map((item, i) => (
              <div key={i} className={`${item.color} border-2 rounded-xl p-3 text-center font-black text-lg`}>
                {item.eq}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
