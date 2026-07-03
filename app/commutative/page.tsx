'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudent } from '@/lib/student-context';
import { RefreshCw, ArrowLeftRight } from 'lucide-react';
import { useSettings } from '@/lib/settings-context';
import { formatNum } from '@/lib/numerals';

function generatePair() {
  const a = Math.floor(Math.random() * 9) + 2;
  const b = Math.floor(Math.random() * 9) + 2;
  return { a, b };
}

export default function CommutativePage() {
  const { numberSystem } = useSettings();
  const { addStars } = useStudent();
  const [pair, setPair] = useState(generatePair);
  const [flipped, setFlipped] = useState(false);
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const result = pair.a * pair.b;
  const a1 = flipped ? pair.b : pair.a;
  const b1 = flipped ? pair.a : pair.b;

  const handleCheck = () => {
    const c1 = parseInt(answer1) === result;
    const c2 = parseInt(answer2) === result;
    setChecked(true);
    if (c1 && c2) {
      setScore(s => s + 2);
      addStars(2);
    } else if (c1 || c2) {
      setScore(s => s + 1);
      addStars(1);
    }
  };

  const next = () => {
    setPair(generatePair());
    setFlipped(false);
    setAnswer1('');
    setAnswer2('');
    setChecked(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">🔄</motion.div>
          <h1 className="text-4xl font-black text-sky-700 mb-2">خاصية الإبدال</h1>
          <p className="text-gray-500 text-lg">ترتيب الأرقام في الضرب لا يغير الناتج!</p>
          <div className="mt-2 bg-sky-50 border border-sky-200 rounded-full px-4 py-1 inline-block text-sky-600 font-bold text-sm">
            النقاط: {formatNum(score, numberSystem)}
          </div>
        </div>

        {/* Concept Banner */}
        <div className="bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-2xl p-5 mb-6 text-center">
          <div className="text-4xl mb-2">🔀</div>
          <p className="font-black text-xl">أ × ب = ب × أ</p>
          <p className="text-blue-100 text-sm mt-1">الناتج واحد بغض النظر عن الترتيب!</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={`${pair.a}-${pair.b}-${flipped}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* First Order */}
              <div className={`bg-white rounded-3xl p-6 shadow-lg border-2 ${checked && parseInt(answer1) === result ? 'border-green-400' : checked ? 'border-red-300' : 'border-sky-200'}`}>
                <div className="text-center mb-4">
                  <div className="text-sky-500 font-bold mb-2">الترتيب الأول</div>
                  <div className="text-4xl font-black text-sky-700">{formatNum(a1, numberSystem)} × {formatNum(b1, numberSystem)} =</div>
                </div>
                <div className="flex flex-col gap-3">
                  {/* Visual */}
                  <div className="flex flex-wrap gap-1 justify-center min-h-12">
                    {Array.from({ length: Math.min(a1, 5) }, (_, r) => (
                      <div key={r} className="flex gap-1">
                        {Array.from({ length: Math.min(b1, 5) }, (_, c) => (
                          <div key={c} className="w-5 h-5 bg-sky-300 rounded-md" />
                        ))}
                      </div>
                    ))}
                    {(a1 > 5 || b1 > 5) && <div className="text-gray-400 text-xs self-center">...</div>}
                  </div>
                  <input
                    type="text"
                    value={answer1}
                    onChange={e => setAnswer1(e.target.value)}
                    placeholder="؟"
                    disabled={checked}
                    className={`w-full text-center text-3xl font-black border-2 rounded-xl py-3 focus:outline-none transition-colors ${
                      checked && parseInt(answer1) === result ? 'border-green-400 bg-green-50 text-green-700' :
                      checked ? 'border-red-300 bg-red-50 text-red-600' :
                      'border-sky-300 focus:border-sky-500'
                    }`}
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* Second Order */}
              <div className={`bg-white rounded-3xl p-6 shadow-lg border-2 ${checked && parseInt(answer2) === result ? 'border-green-400' : checked ? 'border-red-300' : 'border-pink-200'}`}>
                <div className="text-center mb-4">
                  <div className="text-pink-500 font-bold mb-2">الترتيب الثاني</div>
                  <div className="text-4xl font-black text-pink-600">{formatNum(b1, numberSystem)} × {formatNum(a1, numberSystem)} =</div>
                </div>
                <div className="flex flex-col gap-3">
                  {/* Visual - rotated */}
                  <div className="flex flex-wrap gap-1 justify-center min-h-12">
                    {Array.from({ length: Math.min(b1, 5) }, (_, r) => (
                      <div key={r} className="flex gap-1">
                        {Array.from({ length: Math.min(a1, 5) }, (_, c) => (
                          <div key={c} className="w-5 h-5 bg-pink-300 rounded-md" />
                        ))}
                      </div>
                    ))}
                    {(a1 > 5 || b1 > 5) && <div className="text-gray-400 text-xs self-center">...</div>}
                  </div>
                  <input
                    type="text"
                    value={answer2}
                    onChange={e => setAnswer2(e.target.value)}
                    placeholder="؟"
                    disabled={checked}
                    className={`w-full text-center text-3xl font-black border-2 rounded-xl py-3 focus:outline-none transition-colors ${
                      checked && parseInt(answer2) === result ? 'border-green-400 bg-green-50 text-green-700' :
                      checked ? 'border-red-300 bg-red-50 text-red-600' :
                      'border-pink-300 focus:border-pink-500'
                    }`}
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="text-center mb-4">
              <button onClick={() => setFlipped(f => !f)} className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-100 to-pink-100 border-2 border-sky-200 text-sky-700 font-bold py-2 px-6 rounded-full hover:scale-105 transition-all">
                <ArrowLeftRight className="w-4 h-4" />
                قلّب الأرقام
              </button>
            </div>

            {!checked ? (
              <button onClick={handleCheck} disabled={!answer1 || !answer2} className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black py-4 rounded-2xl text-xl shadow-md hover:opacity-90 disabled:opacity-50 transition-all">
                تحقق من الإجابتين
              </button>
            ) : (
              <div className="space-y-3">
                <div className={`text-center py-3 rounded-xl font-black text-lg ${parseInt(answer1) === result && parseInt(answer2) === result ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {parseInt(answer1) === result && parseInt(answer2) === result
                    ? `✅ رائع! كلاهما = ${formatNum(result, numberSystem)} - الناتج واحد!`
                    : `الإجابة الصحيحة: ${formatNum(result, numberSystem)}`}
                </div>
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-center">
                  <p className="text-sky-700 font-black text-xl">{formatNum(a1, numberSystem)} × {formatNum(b1, numberSystem)} = {formatNum(b1, numberSystem)} × {formatNum(a1, numberSystem)} = <span className="text-green-600">{formatNum(result, numberSystem)}</span></p>
                </div>
                <button onClick={next} className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black py-3 rounded-2xl shadow-md hover:opacity-90 flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5" /> مثال جديد
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
