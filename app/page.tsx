'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStudent } from '@/lib/student-context';
import { useSettings } from '@/lib/settings-context';
import { supabase } from '@/lib/supabase';
import { formatNum } from '@/lib/numerals';
import { Star, Trophy, Flame, BookOpen, Gamepad2, ChevronLeft, Plus } from 'lucide-react';

const AVATARS = [
  { id: 'lion', emoji: '🦁', name: 'الأسد' },
  { id: 'fox', emoji: '🦊', name: 'الثعلب' },
  { id: 'owl', emoji: '🦉', name: 'البومة' },
  { id: 'penguin', emoji: '🐧', name: 'البطريق' },
  { id: 'cat', emoji: '🐱', name: 'القطة' },
  { id: 'rabbit', emoji: '🐰', name: 'الأرنب' },
  { id: 'bear', emoji: '🐻', name: 'الدب' },
  { id: 'elephant', emoji: '🐘', name: 'الفيل' },
];

const KINGDOM_AREAS = [
  { num: 1, name: 'برج الواحد', emoji: '🏰', color: 'bg-blue-400', x: 10, y: 70 },
  { num: 2, name: 'قصر الاثنين', emoji: '🏯', color: 'bg-green-400', x: 25, y: 55 },
  { num: 3, name: 'قلعة الثلاثة', emoji: '🗼', color: 'bg-yellow-400', x: 40, y: 40 },
  { num: 4, name: 'مغارة الأربعة', emoji: '🏔️', color: 'bg-pink-400', x: 55, y: 55 },
  { num: 5, name: 'جسر الخمسة', emoji: '🌉', color: 'bg-sky-400', x: 70, y: 70 },
  { num: 6, name: 'بستان الستة', emoji: '🌳', color: 'bg-emerald-400', x: 15, y: 35 },
  { num: 7, name: 'بحيرة السبعة', emoji: '🏖️', color: 'bg-cyan-400', x: 30, y: 20 },
  { num: 8, name: 'جبل الثمانية', emoji: '⛰️', color: 'bg-orange-400', x: 50, y: 20 },
  { num: 9, name: 'مدينة التسعة', emoji: '🌆', color: 'bg-rose-400', x: 65, y: 35 },
  { num: 10, name: 'عاصمة العشرة', emoji: '👑', color: 'bg-amber-400', x: 80, y: 50 },
  { num: 11, name: 'نجمة أحد عشر', emoji: '⭐', color: 'bg-violet-400', x: 85, y: 30 },
  { num: 12, name: 'قمة اثني عشر', emoji: '🏆', color: 'bg-red-400', x: 75, y: 15 },
];

const SECTIONS = [
  { href: '/understand', title: 'فهم الضرب', icon: '🍎', desc: 'تعلم بالصور والرسوم', color: 'from-sky-400 to-blue-500', badge: 'ابدأ هنا' },
  { href: '/tables', title: 'جداول الضرب', icon: '📊', desc: 'جداول 1 حتى 12', color: 'from-green-400 to-emerald-500' },
  { href: '/practice', title: 'تدريب الكتابة', icon: '✏️', desc: 'اكتب وتدرب', color: 'from-yellow-400 to-amber-500' },
  { href: '/exercises', title: 'الجمع المتكرر', icon: '➕', desc: 'فهم الضرب بالجمع', color: 'from-pink-400 to-rose-500' },
  { href: '/quizzes', title: 'الاختبارات', icon: '📝', desc: 'اختبر معلوماتك', color: 'from-orange-400 to-red-500' },
  { href: '/games', title: 'الألعاب', icon: '🎮', desc: 'العب وتعلم', color: 'from-cyan-400 to-sky-500' },
  { href: '/commutative', title: 'خاصية الإبدال', icon: '🔄', desc: 'اكتشف القواعد', color: 'from-teal-400 to-green-500' },
  { href: '/match', title: 'مطابقة النتائج', icon: '🎯', desc: 'طابق الأعداد', color: 'from-fuchsia-400 to-pink-500' },
  { href: '/worksheets', title: 'أوراق العمل', icon: '📄', desc: 'اطبع وتدرب', color: 'from-indigo-400 to-blue-500' },
];

function StudentSetup({ onDone }: { onDone: () => void }) {
  const { setStudent } = useStudent();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('lion');
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const { data } = await supabase.from('students').insert({ name: name.trim(), avatar }).select().maybeSingle();
    if (data) {
      setStudent(data);
      onDone();
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-sky-300">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">👋</div>
          <h2 className="text-2xl font-black text-sky-700">مرحباً بك في المملكة!</h2>
          <p className="text-gray-500 mt-1">أخبرنا من أنت لنبدأ رحلة التعلم</p>
        </div>
        <div className="mb-5">
          <label className="block text-sm font-bold text-gray-700 mb-2">اسمك</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="اكتب اسمك هنا..."
            className="w-full border-2 border-sky-200 rounded-xl px-4 py-3 text-lg font-bold text-center focus:outline-none focus:border-sky-400 bg-sky-50"
            onKeyDown={e => e.key === 'Enter' && create()}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">اختر شخصيتك</label>
          <div className="grid grid-cols-4 gap-2">
            {AVATARS.map(a => (
              <button key={a.id} onClick={() => setAvatar(a.id)} className={`p-3 rounded-xl border-2 transition-all ${avatar === a.id ? 'border-sky-400 bg-sky-100 scale-105' : 'border-gray-200 hover:border-sky-200'}`}>
                <div className="text-2xl text-center">{a.emoji}</div>
                <div className="text-xs text-center text-gray-600 mt-1">{a.name}</div>
              </button>
            ))}
          </div>
        </div>
        <button onClick={create} disabled={!name.trim() || loading} className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white py-3 rounded-xl font-black text-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-md">
          {loading ? '...' : 'ابدأ الرحلة! 🚀'}
        </button>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const { student, tableProgress, isLoading } = useStudent();
  const { numberSystem, language } = useSettings();
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (!isLoading && !student) setShowSetup(true);
  }, [isLoading, student]);

  const totalMastery = tableProgress.length > 0
    ? Math.round(tableProgress.reduce((sum, p) => sum + p.mastery_percent, 0) / 12)
    : 0;

  const avatarEmoji = AVATARS.find(a => a.id === student?.avatar)?.emoji || '🦁';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">👑</div>
          <div className="text-sky-600 font-bold text-xl">جار التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-blue-50 to-white">
      {showSetup && <StudentSetup onDone={() => setShowSetup(false)} />}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['⭐', '✨', '🌟', '💫', '⭐', '✨'].map((s, i) => (
            <div key={i} className="absolute animate-float text-2xl opacity-60" style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 20}%`, animationDelay: `${i * 0.5}s` }}>{s}</div>
          ))}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-sky-100 to-transparent" />
        </div>
        <div className="max-w-6xl mx-auto px-4 py-12 relative">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex-1 text-center md:text-right">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <span className="text-yellow-300">✨</span>
                <span className="text-sm font-bold">تطبيق تعليمي للأطفال</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
                مملكة<br />
                <span className="text-yellow-300">جدول الضرب</span>
              </h1>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                رحلة ممتعة لتعلم جداول الضرب<br />بالألعاب والتمارين التفاعلية
              </p>
              {student ? (
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Link href="/tables" className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-black py-3 px-8 rounded-2xl text-lg shadow-lg transition-all hover:scale-105 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    واصل التعلم
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                  <Link href="/games" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-2xl transition-all flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5" />
                    العب الآن
                  </Link>
                </div>
              ) : (
                <button onClick={() => setShowSetup(true)} className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-black py-3 px-8 rounded-2xl text-lg shadow-lg transition-all hover:scale-105 flex items-center gap-2 mx-auto md:mx-0">
                  <Plus className="w-5 h-5" />
                  ابدأ الآن مجاناً
                </button>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex-shrink-0">
              <div className="relative w-48 h-48 md:w-64 md:h-64">
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse-glow" />
                <div className="absolute inset-4 bg-white/30 rounded-full flex items-center justify-center text-8xl md:text-9xl animate-float">
                  {student ? avatarEmoji : '👑'}
                </div>
                {student && (
                  <>
                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-white">
                      <Star className="w-5 h-5 text-yellow-700 fill-yellow-600" />
                    </div>
                    <div className="absolute -bottom-2 -left-2 bg-orange-400 rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-white">
                      <Flame className="w-5 h-5 text-white" />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* Student Stats */}
          {student && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto md:mx-0">
              {[
                { label: 'النجوم', value: formatNum(student.total_stars, numberSystem), icon: '⭐' },
                { label: 'التقدم', value: `${formatNum(totalMastery, numberSystem)}%`, icon: '📈' },
                { label: 'أيام التعلم', value: formatNum(student.streak_days, numberSystem), icon: '🔥' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-black">{stat.value}</div>
                  <div className="text-xs text-blue-100">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Progress Bar */}
      {student && (
        <section className="max-w-6xl mx-auto px-4 -mt-4 relative z-10">
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-sky-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-black text-gray-700">تقدم التعلم</span>
              </div>
              <span className="text-sky-600 font-black text-lg">{formatNum(totalMastery, numberSystem)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totalMastery}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
              />
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(num => {
                const prog = tableProgress.find(p => p.table_number === num);
                const mastery = prog?.mastery_percent || 0;
                return (
                  <Link key={num} href={`/tables/${num}`} className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all hover:scale-110 ${mastery >= 80 ? 'bg-green-400 text-white' : mastery >= 40 ? 'bg-yellow-300 text-yellow-800' : 'bg-gray-100 text-gray-500 hover:bg-sky-100 hover:text-sky-600'}`}>
                    {formatNum(num, numberSystem)}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Kingdom Map */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-sky-700 mb-2">خريطة المملكة</h2>
          <p className="text-gray-500">اختر جدول الضرب الذي تريد تعلمه</p>
        </div>
        <div className="bg-gradient-to-br from-green-100 via-sky-100 to-blue-100 rounded-3xl border-4 border-sky-200 overflow-hidden shadow-xl relative" style={{ minHeight: '350px' }}>
          <div className="absolute inset-0 opacity-20">
            {['🌲', '🌲', '🌳', '🌿', '🌲'].map((t, i) => (
              <div key={i} className="absolute text-4xl" style={{ left: `${5 + i * 20}%`, bottom: '5%' }}>{t}</div>
            ))}
            {['⛅', '☁️'].map((c, i) => (
              <div key={i} className="absolute text-3xl animate-float" style={{ left: `${20 + i * 40}%`, top: '10%', animationDelay: `${i}s` }}>{c}</div>
            ))}
          </div>
          <div className="relative grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
            {KINGDOM_AREAS.map((area, i) => {
              const prog = tableProgress.find(p => p.table_number === area.num);
              const mastery = prog?.mastery_percent || 0;
              return (
                <motion.div key={area.num} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/tables/${area.num}`} className="block group">
                    <div className={`${area.color} rounded-2xl p-3 text-center shadow-md hover:shadow-xl transition-all hover:scale-105 border-2 border-white/50 relative`}>
                      {mastery >= 80 && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center text-xs">⭐</div>
                      )}
                      <div className="text-3xl mb-1">{area.emoji}</div>
                      <div className="text-white font-black text-lg">{formatNum(area.num, numberSystem)}</div>
                      <div className="text-white/80 text-xs font-semibold leading-tight">{area.name}</div>
                      {mastery > 0 && (
                        <div className="mt-2 bg-white/30 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: `${mastery}%` }} />
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sections Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-sky-700 mb-2">أقسام المملكة</h2>
          <p className="text-gray-500">اختر ما تريد تعلمه اليوم</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTIONS.map((section, i) => (
            <motion.div key={section.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Link href={section.href} className="group block">
                <div className={`bg-gradient-to-br ${section.color} rounded-2xl p-6 text-white shadow-md hover:shadow-xl transition-all hover:scale-105 relative overflow-hidden`}>
                  {section.badge && (
                    <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded-full">{section.badge}</div>
                  )}
                  <div className="text-4xl mb-3">{section.icon}</div>
                  <h3 className="text-xl font-black mb-1">{section.title}</h3>
                  <p className="text-white/80 text-sm">{section.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-white/70 text-sm font-bold group-hover:gap-2 transition-all">
                    ابدأ الآن <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sky-700 text-white text-center py-6">
        <div className="text-2xl mb-2">👑</div>
        <p className="font-bold">مملكة جدول الضرب</p>
        <p className="text-sky-200 text-sm mt-1">تطبيق تعليمي للأطفال من 6 إلى 12 سنة</p>
      </footer>
    </div>
  );
}
