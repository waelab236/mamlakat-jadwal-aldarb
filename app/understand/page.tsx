'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useSettings } from '@/lib/settings-context';
import { formatNum } from '@/lib/numerals';

const VISUAL_ITEMS = [
  { emoji: '🍎', name: 'تفاحات' },
  { emoji: '🍊', name: 'برتقال' },
  { emoji: '🍋', name: 'ليمون' },
  { emoji: '🍇', name: 'عنب' },
  { emoji: '🌟', name: 'نجوم' },
  { emoji: '🎈', name: 'بالونات' },
  { emoji: '🐱', name: 'قطط' },
  { emoji: '🦋', name: 'فراشات' },
  { emoji: '🌸', name: 'زهور' },
  { emoji: '⭐', name: 'نجوم' },
];

function VisualMultiplication({ rows, cols, item }: { rows: number; cols: number; item: { emoji: string; name: string } }) {
  const [revealed, setRevealed] = useState(false);
  const { numberSystem } = useSettings();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-sky-200">
      <div className="text-center mb-4">
        <div className="text-4xl font-black text-sky-700 mb-1">
          {formatNum(rows, numberSystem)} × {formatNum(cols, numberSystem)} = <span className={`text-green-600 transition-all ${revealed ? 'opacity-100' : 'opacity-0'}`}>{formatNum(rows * cols, numberSystem)}</span>
        </div>
        <p className="text-gray-500 text-sm">{formatNum(rows, numberSystem)} مجموعات من {formatNum(cols, numberSystem)} {item.name}</p>
      </div>

      <div className="my-6 overflow-hidden">
        {Array.from({ length: rows }, (_, r) => (
          <motion.div key={r} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: r * 0.15 }}
            className="flex flex-wrap justify-center gap-0.5 mb-1 mx-auto w-full">
            {Array.from({ length: cols }, (_, c) => (
              <motion.span key={c}
                className="text-center leading-none flex-shrink-0"
                style={{ fontSize: `clamp(0.6rem, ${Math.floor(100 / cols)}vw, ${cols <= 3 ? '2rem' : cols <= 5 ? '1.5rem' : cols <= 7 ? '1.25rem' : cols <= 9 ? '1rem' : '0.75rem'})` }}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: r * 0.15 + c * 0.05 }}>
                {item.emoji}
              </motion.span>
            ))}
          </motion.div>
        ))}
      </div>

      <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200 overflow-hidden">
        <p className="text-center text-sky-700 font-bold text-lg mb-2">الجمع المتكرر:</p>
        <p className="text-center text-gray-700 font-black text-base sm:text-xl break-all">
          {Array.from({ length: rows }, () => formatNum(cols, numberSystem)).join(' + ')} = {formatNum(rows * cols, numberSystem)}
        </p>
      </div>

      <button onClick={() => setRevealed(!revealed)} className="w-full mt-4 bg-gradient-to-r from-sky-400 to-blue-500 text-white py-3 rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-md">
        {revealed ? '👀 إخفاء الإجابة' : '🔍 أظهر الإجابة'}
      </button>
    </div>
  );
}

const EXAMPLES = [
  { rows: 2, cols: 3 },
  { rows: 3, cols: 4 },
  { rows: 2, cols: 5 },
  { rows: 4, cols: 3 },
  { rows: 3, cols: 6 },
  { rows: 5, cols: 2 },
];

export default function UnderstandPage() {
  const { numberSystem } = useSettings();
  const [exampleIdx, setExampleIdx] = useState(0);
  const [itemIdx, setItemIdx] = useState(0);
  const [customRows, setCustomRows] = useState(3);
  const [customCols, setCustomCols] = useState(4);
  const [tab, setTab] = useState<'visual' | 'custom' | 'concept'>('visual');

  const example = EXAMPLES[exampleIdx];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">🍎</motion.div>
          <h1 className="text-4xl font-black text-sky-700 mb-2">فهم الضرب</h1>
          <p className="text-gray-500 text-lg">تعلم معنى الضرب من خلال الصور والأشكال المرئية</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-sky-100 rounded-2xl p-1 mb-8">
          {[
            { id: 'visual', label: '🎨 أمثلة مرئية' },
            { id: 'custom', label: '🔧 جرب بنفسك' },
            { id: 'concept', label: '💡 المفهوم' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)} className={`flex-1 py-2 px-3 rounded-xl font-bold text-sm transition-all ${tab === t.id ? 'bg-white shadow-md text-sky-700' : 'text-gray-600 hover:text-sky-600'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'visual' && (
            <motion.div key="visual" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <VisualMultiplication rows={example.rows} cols={example.cols} item={VISUAL_ITEMS[itemIdx]} />

              <div className="flex items-center justify-between mt-6">
                <button onClick={() => setExampleIdx(i => (i - 1 + EXAMPLES.length) % EXAMPLES.length)} className="flex items-center gap-2 bg-white border-2 border-sky-200 text-sky-600 font-bold py-2 px-4 rounded-xl hover:bg-sky-50 transition-all">
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </button>
                <div className="flex gap-2">
                  {EXAMPLES.map((_, i) => (
                    <button key={i} onClick={() => setExampleIdx(i)} className={`w-3 h-3 rounded-full transition-all ${i === exampleIdx ? 'bg-sky-500 w-6' : 'bg-sky-200'}`} />
                  ))}
                </div>
                <button onClick={() => setExampleIdx(i => (i + 1) % EXAMPLES.length)} className="flex items-center gap-2 bg-white border-2 border-sky-200 text-sky-600 font-bold py-2 px-4 rounded-xl hover:bg-sky-50 transition-all">
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4">
                <p className="text-center text-gray-600 font-semibold mb-3">غيّر نوع العناصر:</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {VISUAL_ITEMS.map((item, i) => (
                    <button key={i} onClick={() => setItemIdx(i)} className={`text-2xl p-2 rounded-xl border-2 transition-all ${i === itemIdx ? 'border-sky-400 bg-sky-100' : 'border-gray-200 hover:border-sky-200'}`}>
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'custom' && (
            <motion.div key="custom" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-sky-200 mb-6">
                <h3 className="text-xl font-black text-sky-700 mb-6 text-center">اصنع مسألتك</h3>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block font-bold text-gray-700 mb-2 text-center">عدد المجموعات</label>
                    <div className="flex items-center gap-3 justify-center">
                      <button onClick={() => setCustomRows(r => Math.max(1, r - 1))} className="w-10 h-10 bg-sky-100 text-sky-700 rounded-xl font-black text-xl hover:bg-sky-200">-</button>
                      <span className="text-3xl font-black text-sky-700 w-10 text-center">{formatNum(customRows, numberSystem)}</span>
                      <button onClick={() => setCustomRows(r => Math.min(9, r + 1))} className="w-10 h-10 bg-sky-100 text-sky-700 rounded-xl font-black text-xl hover:bg-sky-200">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-2 text-center">عناصر في كل مجموعة</label>
                    <div className="flex items-center gap-3 justify-center">
                      <button onClick={() => setCustomCols(c => Math.max(1, c - 1))} className="w-10 h-10 bg-green-100 text-green-700 rounded-xl font-black text-xl hover:bg-green-200">-</button>
                      <span className="text-3xl font-black text-green-700 w-10 text-center">{formatNum(customCols, numberSystem)}</span>
                      <button onClick={() => setCustomCols(c => Math.min(9, c + 1))} className="w-10 h-10 bg-green-100 text-green-700 rounded-xl font-black text-xl hover:bg-green-200">+</button>
                    </div>
                  </div>
                </div>
                <div className="text-center text-3xl font-black text-sky-700 mb-2">
                  {formatNum(customRows, numberSystem)} × {formatNum(customCols, numberSystem)} = {formatNum(customRows * customCols, numberSystem)}
                </div>
              </div>
              <VisualMultiplication rows={customRows} cols={customCols} item={VISUAL_ITEMS[itemIdx]} />
            </motion.div>
          )}

          {tab === 'concept' && (
            <motion.div key="concept" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              {[
                {
                  title: 'الضرب = الجمع المتكرر',
                  content: 'الضرب هو جمع عدد مع نفسه عدة مرات',
                  example: `${formatNum(3, numberSystem)} × ${formatNum(4, numberSystem)} = ${formatNum(4, numberSystem)} + ${formatNum(4, numberSystem)} + ${formatNum(4, numberSystem)} = ${formatNum(12, numberSystem)}`,
                  color: 'from-sky-400 to-blue-500',
                  icon: '🔄',
                },
                {
                  title: 'المضروب والمضروب فيه',
                  content: `في ${formatNum(3, numberSystem)} × ${formatNum(4, numberSystem)}، الرقم ${formatNum(3, numberSystem)} هو عدد المجموعات، والرقم ${formatNum(4, numberSystem)} هو عدد العناصر في كل مجموعة`,
                  example: `${formatNum(3, numberSystem)} مجموعات × ${formatNum(4, numberSystem)} في كل مجموعة = ${formatNum(12, numberSystem)}`,
                  color: 'from-green-400 to-emerald-500',
                  icon: '📊',
                },
                {
                  title: 'الضرب في الصفر',
                  content: 'أي عدد مضروب في صفر يساوي صفر',
                  example: `${formatNum(5, numberSystem)} × ${formatNum(0, numberSystem)} = ${formatNum(0, numberSystem)}`,
                  color: 'from-yellow-400 to-amber-500',
                  icon: '0️⃣',
                },
                {
                  title: 'الضرب في الواحد',
                  content: 'أي عدد مضروب في 1 يساوي نفسه',
                  example: `${formatNum(7, numberSystem)} × ${formatNum(1, numberSystem)} = ${formatNum(7, numberSystem)}`,
                  color: 'from-pink-400 to-rose-500',
                  icon: '1️⃣',
                },
                {
                  title: 'خاصية الإبدال',
                  content: 'يمكن تبديل ترتيب الأرقام في الضرب والناتج لا يتغير',
                  example: `${formatNum(4, numberSystem)} × ${formatNum(6, numberSystem)} = ${formatNum(6, numberSystem)} × ${formatNum(4, numberSystem)} = ${formatNum(24, numberSystem)}`,
                  color: 'from-orange-400 to-red-500',
                  icon: '🔀',
                },
              ].map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={`bg-gradient-to-r ${card.color} text-white rounded-2xl p-6 shadow-md`}>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl flex-shrink-0">{card.icon}</div>
                    <div>
                      <h3 className="text-xl font-black mb-2">{card.title}</h3>
                      <p className="text-white/80 mb-3">{card.content}</p>
                      <div className="bg-white/20 rounded-xl px-4 py-2 font-black text-lg">{card.example}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-10 flex gap-4 justify-center">
          <Link href="/tables" className="bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black py-3 px-8 rounded-2xl shadow-md hover:opacity-90 transition-all flex items-center gap-2">
            انتقل إلى الجداول
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
