'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Printer, CheckCircle } from 'lucide-react';
import { useSettings } from '@/lib/settings-context';
import { formatNum } from '@/lib/numerals';

const LINES_COUNT = 5;

function PracticeSheet({ tableNum }: { tableNum: number }) {
  const { numberSystem } = useSettings();
  const [written, setWritten] = useState<Record<string, string>>({});
  const [facts] = useState(() => {
    const arr = Array.from({ length: 12 }, (_, i) => ({ b: i + 1, result: tableNum * (i + 1) }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  const check = (key: string, expected: string) => written[key]?.trim() === expected.toString();

  return (
    <div className="bg-white rounded-3xl shadow-lg border-2 border-blue-200 overflow-hidden">
      {/* Notebook Header */}
      <div className="bg-gradient-to-r from-sky-400 to-blue-500 p-4 text-white text-center">
        <h3 className="text-xl font-black">ورقة تدريب - جدول {formatNum(tableNum, numberSystem)}</h3>
        <p className="text-blue-100 text-sm mt-1">اكتب الإجابة في كل مربع</p>
      </div>

      <div className="p-6 notebook-lines min-h-64">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {facts.map(fact => {
            const key = `${tableNum}-${fact.b}`;
            const isCorrect = check(key, fact.result.toString());
            return (
              <div key={key} className="flex items-center gap-2 bg-white/80 rounded-xl px-3 py-2 border border-blue-100">
                <span className="text-lg font-black text-sky-700 min-w-[80px]">
                  {formatNum(tableNum, numberSystem)} × {formatNum(fact.b, numberSystem)} =
                </span>
                <input
                  value={written[key] || ''}
                  onChange={e => setWritten(w => ({ ...w, [key]: e.target.value }))}
                  className={`w-16 text-center text-xl font-black border-2 rounded-lg py-1 focus:outline-none transition-colors ${
                    written[key] ? (isCorrect ? 'border-green-400 bg-green-50 text-green-700' : 'border-red-300 bg-red-50 text-red-600') : 'border-blue-200 focus:border-blue-400'
                  }`}
                  maxLength={3}
                  inputMode="numeric"
                />
                {written[key] && (
                  <span className="text-lg">{isCorrect ? '✅' : '❌'}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Score */}
      {Object.keys(written).length > 0 && (
        <div className="bg-sky-50 border-t border-sky-200 px-6 py-3 flex items-center justify-between">
          <span className="text-sky-700 font-bold">
            الإجابات الصحيحة: {formatNum(Object.keys(written).filter(k => check(k, (tableNum * parseInt(k.split('-')[1])).toString())).length, numberSystem)} / {formatNum(facts.length, numberSystem)}
          </span>
          <button onClick={() => setWritten({})} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> إعادة
          </button>
        </div>
      )}
    </div>
  );
}

export default function PracticePage() {
  const { numberSystem } = useSettings();
  const [selectedTable, setSelectedTable] = useState(2);
  const [practiceCount, setPracticeCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">✏️</motion.div>
          <h1 className="text-4xl font-black text-sky-700 mb-2">تدريب الكتابة</h1>
          <p className="text-gray-500 text-lg">اكتب جدول الضرب بيدك لتحفظه بشكل أفضل</p>
        </div>

        {/* Table Selector */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-sky-100 mb-6">
          <h3 className="font-black text-gray-700 mb-4 text-center">اختر الجدول للتدريب</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setSelectedTable(num)}
                className={`w-12 h-12 rounded-xl font-black text-lg transition-all ${selectedTable === num ? 'bg-sky-500 text-white shadow-md scale-110' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'}`}
              >
                {formatNum(num, numberSystem)}
              </button>
            ))}
          </div>
        </div>

        {/* Writing Tips */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-black text-yellow-800 mb-1">نصيحة للحفظ</h4>
              <p className="text-yellow-700 text-sm">اكتب الجدول 3 مرات يومياً. الكتابة تساعد الدماغ على الحفظ أسرع من القراءة فقط!</p>
            </div>
          </div>
        </div>

        {/* Practice Sheet */}
        <motion.div key={selectedTable} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <PracticeSheet tableNum={selectedTable} />
        </motion.div>

        {/* Repeat Instructions */}
        <div className="mt-8 bg-white rounded-3xl p-6 shadow-md border border-sky-100">
          <h3 className="text-xl font-black text-sky-700 mb-4">📋 جدول الضرب كاملاً</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => ({
              b: i + 1,
              result: selectedTable * (i + 1),
            })).map(fact => (
              <div key={fact.b} className="bg-sky-50 border border-sky-200 rounded-xl p-2 text-center">
                <span className="text-sky-600 font-black">{formatNum(selectedTable, numberSystem)} × {formatNum(fact.b, numberSystem)} = </span>
                <span className="text-sky-800 font-black">{formatNum(fact.result, numberSystem)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
