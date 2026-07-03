'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStudent } from '@/lib/student-context';
import { useSettings } from '@/lib/settings-context';
import { formatNum } from '@/lib/numerals';
import { Star, Lock } from 'lucide-react';

const TABLE_INFO = [
  { num: 1, color: 'from-blue-400 to-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', tip: 'جدول 1 سهل جداً - أي رقم × 1 = نفسه!', emoji: '🏰' },
  { num: 2, color: 'from-green-400 to-green-500', bg: 'bg-green-50', border: 'border-green-200', tip: 'جدول 2 = الأعداد الزوجية', emoji: '🏯' },
  { num: 3, color: 'from-yellow-400 to-amber-500', bg: 'bg-yellow-50', border: 'border-yellow-200', tip: 'مجموع أرقام نواتج جدول 3 دائماً تساوي 3 أو 6 أو 9', emoji: '🗼' },
  { num: 4, color: 'from-pink-400 to-pink-500', bg: 'bg-pink-50', border: 'border-pink-200', tip: 'جدول 4 = جدول 2 × 2', emoji: '🏔️' },
  { num: 5, color: 'from-sky-400 to-sky-500', bg: 'bg-sky-50', border: 'border-sky-200', tip: 'نواتج جدول 5 تنتهي دائماً بـ 0 أو 5', emoji: '🌉' },
  { num: 6, color: 'from-emerald-400 to-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', tip: 'جدول 6 = جدول 2 × جدول 3', emoji: '🌳' },
  { num: 7, color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', tip: 'جدول 7 يحتاج تركيزاً أكثر - تدرب جيداً!', emoji: '🏖️' },
  { num: 8, color: 'from-orange-400 to-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', tip: 'جدول 8 = جدول 2 × 2 × 2', emoji: '⛰️' },
  { num: 9, color: 'from-rose-400 to-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', tip: 'في جدول 9، مجموع الرقمين دائماً = 9!', emoji: '🌆' },
  { num: 10, color: 'from-amber-400 to-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', tip: 'جدول 10 سهل! فقط أضف صفراً على اليمين', emoji: '👑' },
  { num: 11, color: 'from-violet-400 to-violet-500', bg: 'bg-violet-50', border: 'border-violet-200', tip: '1-9 × 11: اكتب الرقم مرتين! مثل 3 × 11 = 33', emoji: '⭐' },
  { num: 12, color: 'from-red-400 to-red-500', bg: 'bg-red-50', border: 'border-red-200', tip: 'جدول 12 = جدول 10 + جدول 2', emoji: '🏆' },
];

export default function TablesPage() {
  const { tableProgress } = useStudent();
  const { numberSystem } = useSettings();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">📊</motion.div>
          <h1 className="text-4xl font-black text-sky-700 mb-2">جداول الضرب</h1>
          <p className="text-gray-500 text-lg">اختر الجدول الذي تريد تعلمه أو مراجعته</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {TABLE_INFO.map((info, i) => {
            const prog = tableProgress.find(p => p.table_number === info.num);
            const mastery = prog?.mastery_percent || 0;

            return (
              <motion.div key={info.num} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/tables/${info.num}`} className="block group">
                  <div className={`${info.bg} ${info.border} border-2 rounded-2xl p-4 hover:shadow-xl transition-all hover:scale-105 relative overflow-hidden`}>
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${info.color}`} />
                    <div className="text-3xl mb-2 text-center">{info.emoji}</div>
                    <div className="text-center">
                      <span className={`text-4xl font-black bg-gradient-to-r ${info.color} bg-clip-text text-transparent`}>{formatNum(info.num, numberSystem)}</span>
                    </div>
                    <p className="text-center text-gray-600 font-bold text-sm mt-1">جدول {formatNum(info.num, numberSystem)}</p>

                    {mastery > 0 ? (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-gray-500">الإتقان</span>
                          <span className={mastery >= 80 ? 'text-green-600' : 'text-yellow-600'}>{formatNum(mastery, numberSystem)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full bg-gradient-to-r ${info.color}`} style={{ width: `${mastery}%` }} />
                        </div>
                        {mastery >= 80 && (
                          <div className="text-center mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-400 inline" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 text-center text-xs text-gray-400 font-semibold">لم تبدأ بعد</div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Tips */}
        <div className="mt-12">
          <h2 className="text-2xl font-black text-sky-700 mb-6 text-center">نصائح سريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TABLE_INFO.map(info => (
              <div key={info.num} className={`${info.bg} ${info.border} border rounded-xl p-4 flex items-start gap-3`}>
                <span className="text-2xl flex-shrink-0">{info.emoji}</span>
                <div>
                  <span className={`font-black bg-gradient-to-r ${info.color} bg-clip-text text-transparent`}>جدول {formatNum(info.num, numberSystem)}: </span>
                  <span className="text-gray-600 text-sm">{info.tip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
