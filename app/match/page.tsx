'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudent } from '@/lib/student-context';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { useSettings } from '@/lib/settings-context';
import { formatNum } from '@/lib/numerals';

type Equation = { a: number; b: number; result: number };

function generateTarget(): { target: number; equations: Equation[] } {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  const target = a * b;

  const equations: Equation[] = [{ a, b, result: target }];
  const factPairs = findFactorPairs(target);
  factPairs.slice(0, 3).forEach(([x, y]) => {
    if (x !== a || y !== b) equations.push({ a: x, b: y, result: target });
  });
  while (equations.length < 4) {
    const x = Math.floor(Math.random() * 9) + 2;
    const y = Math.floor(Math.random() * 9) + 2;
    if (x * y !== target) equations.push({ a: x, b: y, result: x * y });
  }
  return { target, equations: equations.sort(() => Math.random() - 0.5) };
}

function findFactorPairs(n: number): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 1; i <= Math.sqrt(n); i++) {
    if (n % i === 0) pairs.push([i, n / i]);
  }
  return pairs.filter(([a, b]) => a >= 2 && b >= 2 && a <= 12 && b <= 12);
}

export default function MatchPage() {
  const { numberSystem } = useSettings();
  const { addStars } = useStudent();
  const [{ target, equations }, setData] = useState(generateTarget);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState(false);

  const toggle = (idx: number) => {
    if (checked) return;
    setSelected(s => {
      const next = new Set(s);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleCheck = () => {
    const correctIndices = equations.reduce((acc, eq, i) => {
      if (eq.result === target) acc.push(i);
      return acc;
    }, [] as number[]);
    const allCorrect = correctIndices.every(i => selected.has(i)) && Array.from(selected).every(i => correctIndices.includes(i));
    setChecked(true);
    if (allCorrect) { addStars(3); setScore(s => s + 3); }
    else if (Array.from(selected).some(i => correctIndices.includes(i))) { addStars(1); setScore(s => s + 1); }
  };

  const next = () => {
    setData(generateTarget());
    setSelected(new Set());
    setChecked(false);
  };

  const correctIndices = equations.reduce((acc, eq, i) => {
    if (eq.result === target) acc.push(i);
    return acc;
  }, [] as number[]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">🎯</motion.div>
          <h1 className="text-4xl font-black text-sky-700 mb-2">مطابقة النتائج</h1>
          <p className="text-gray-500 text-lg">اختر جميع المسائل التي تعطي نفس الناتج</p>
          <div className="mt-2 bg-sky-50 border border-sky-200 rounded-full px-4 py-1 inline-block text-sky-600 font-bold text-sm">
            النقاط: {formatNum(score, numberSystem)}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={target} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            {/* Target */}
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-3xl p-8 text-center mb-6 shadow-xl">
              <p className="text-yellow-100 font-bold mb-2">ابحث عن جميع المسائل التي ناتجها:</p>
              <div className="text-7xl font-black">{formatNum(target, numberSystem)}</div>
            </div>

            {/* Instructions */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 mb-4 text-center text-sky-700 font-semibold text-sm">
              🖱️ اضغط على المسائل التي تساوي {formatNum(target, numberSystem)} (قد يكون هناك أكثر من مسألة)
            </div>

            {/* Equations Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {equations.map((eq, i) => {
                const isSelected = selected.has(i);
                const isCorrect = eq.result === target;
                let borderClass = 'border-sky-200';
                let bgClass = 'bg-white';
                let textClass = 'text-sky-700';

                if (checked) {
                  if (isCorrect && isSelected) { borderClass = 'border-green-400'; bgClass = 'bg-green-50'; textClass = 'text-green-700'; }
                  else if (isCorrect && !isSelected) { borderClass = 'border-yellow-400 border-dashed'; bgClass = 'bg-yellow-50'; textClass = 'text-yellow-700'; }
                  else if (!isCorrect && isSelected) { borderClass = 'border-red-300'; bgClass = 'bg-red-50'; textClass = 'text-red-600'; }
                  else { borderClass = 'border-gray-200'; bgClass = 'bg-gray-50'; textClass = 'text-gray-500'; }
                } else if (isSelected) {
                  borderClass = 'border-sky-500'; bgClass = 'bg-sky-100'; textClass = 'text-sky-700';
                }

                return (
                  <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => toggle(i)}
                    className={`${bgClass} ${borderClass} border-2 rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-all ${isSelected && !checked ? 'scale-105 shadow-md' : ''}`}>
                    <div className={`text-2xl font-black ${textClass}`}>{formatNum(eq.a, numberSystem)} × {formatNum(eq.b, numberSystem)}</div>
                    <div className={`text-sm font-bold ${textClass} opacity-70`}>= ?</div>
                    {checked && (
                      <div className={`text-sm font-black mt-1 ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                        = {formatNum(eq.result, numberSystem)} {isCorrect ? '✓' : '✗'}
                      </div>
                    )}
                    {isSelected && !checked && (
                      <div className="mt-1 text-sky-500 text-sm">✓ محدد</div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {checked && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-4 text-center">
                  <p className="text-green-700 font-black text-lg">المسائل التي تساوي {formatNum(target, numberSystem)}:</p>
                  {correctIndices.map(i => (
                    <p key={i} className="text-green-600 font-bold">{formatNum(equations[i].a, numberSystem)} × {formatNum(equations[i].b, numberSystem)} = {formatNum(target, numberSystem)}</p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {!checked ? (
              <button onClick={handleCheck} disabled={selected.size === 0} className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black py-4 rounded-2xl text-xl shadow-md hover:opacity-90 disabled:opacity-50">
                تحقق من اختياراتك
              </button>
            ) : (
              <button onClick={next} className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black py-4 rounded-2xl text-xl shadow-md hover:opacity-90 flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5" /> هدف جديد
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
