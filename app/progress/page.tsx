'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStudent } from '@/lib/student-context';
import { useSettings } from '@/lib/settings-context';
import { formatNum } from '@/lib/numerals';
import { supabase } from '@/lib/supabase';
import { Star, Trophy, Flame, Target, TrendingUp, BookOpen, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const AVATARS: Record<string, string> = {
  lion: '🦁', fox: '🦊', owl: '🦉', penguin: '🐧',
  cat: '🐱', rabbit: '🐰', bear: '🐻', elephant: '🐘',
};

const TABLE_COLORS: Record<number, string> = {
  1: 'bg-blue-400', 2: 'bg-green-400', 3: 'bg-yellow-400', 4: 'bg-pink-400',
  5: 'bg-sky-400', 6: 'bg-emerald-400', 7: 'bg-cyan-500', 8: 'bg-orange-400',
  9: 'bg-rose-400', 10: 'bg-amber-400', 11: 'bg-violet-400', 12: 'bg-red-400',
};

export default function ProgressPage() {
  const { student, tableProgress } = useStudent();
  const { numberSystem } = useSettings();
  const [sessions, setSessions] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<string[]>([]);

  useEffect(() => {
    if (!student) return;
    (async () => {
      const [sessRes, achRes, earnedRes] = await Promise.all([
        supabase.from('quiz_sessions').select('*').eq('student_id', student.id).order('completed_at', { ascending: false }).limit(10),
        supabase.from('achievements').select('*'),
        supabase.from('student_achievements').select('achievement_key').eq('student_id', student.id),
      ]);
      setSessions(sessRes.data || []);
      setAchievements(achRes.data || []);
      setEarnedAchievements((earnedRes.data || []).map((e: any) => e.achievement_key));
    })();
  }, [student]);

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👋</div>
          <h2 className="text-2xl font-black text-sky-700 mb-4">ليس لديك ملف شخصي</h2>
          <Link href="/" className="bg-sky-500 text-white font-bold py-3 px-8 rounded-2xl hover:bg-sky-600">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const totalMastery = tableProgress.length > 0
    ? Math.round(tableProgress.reduce((sum, p) => sum + p.mastery_percent, 0) / 12) : 0;
  const masteredTables = tableProgress.filter(p => p.mastery_percent >= 80).length;
  const totalAttempts = tableProgress.reduce((sum, p) => sum + p.attempts, 0);
  const totalCorrect = tableProgress.reduce((sum, p) => sum + p.correct, 0);
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const weakTables = tableProgress.filter(p => p.mastery_percent < 60 && p.attempts > 0).sort((a, b) => a.mastery_percent - b.mastery_percent);
  const strongTables = tableProgress.filter(p => p.mastery_percent >= 80);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-sky-400 to-blue-600 text-white rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 text-6xl opacity-10">⭐✨🌟</div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-6xl border-4 border-white/40">
              {AVATARS[student.avatar] || '🦁'}
            </div>
            <div className="text-center sm:text-right flex-1">
              <h1 className="text-3xl font-black">{student.name}</h1>
              <p className="text-blue-100 mt-1">المستوى {student.level} • المستكشف</p>
              <div className="flex gap-4 mt-3 justify-center sm:justify-start flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-200" />
                  <span className="font-black">{student.total_stars} نجمة</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-5 h-5 text-orange-300" />
                  <span className="font-black">{student.streak_days} يوم</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                  <span className="font-black">{masteredTables} جدول مُتقن</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'التقدم الكلي', value: `${formatNum(totalMastery, numberSystem)}%`, icon: TrendingUp, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
            { label: 'الجداول المُتقنة', value: `${formatNum(masteredTables, numberSystem)}/12`, icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
            { label: 'الدقة الكلية', value: `${formatNum(overallAccuracy, numberSystem)}%`, icon: Target, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
            { label: 'إجمالي الأسئلة', value: formatNum(totalAttempts, numberSystem), icon: BookOpen, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`${stat.bg} ${stat.border} border-2 rounded-2xl p-4 text-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-gray-500 text-xs font-semibold mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tables Progress */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-sky-100 mb-8">
          <h2 className="text-xl font-black text-sky-700 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5" /> تقدم الجداول
          </h2>
          <div className="space-y-3">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(num => {
              const prog = tableProgress.find(p => p.table_number === num);
              const mastery = prog?.mastery_percent || 0;
              return (
                <div key={num} className="flex items-center gap-3">
                  <Link href={`/tables/${num}`} className={`w-10 h-10 ${TABLE_COLORS[num]} rounded-xl text-white font-black text-sm flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0`}>
                    {formatNum(num, numberSystem)}
                  </Link>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-bold mb-1">
                      <span className="text-gray-600">جدول {formatNum(num, numberSystem)}</span>
                      <span className={mastery >= 80 ? 'text-green-600' : mastery >= 40 ? 'text-yellow-600' : 'text-gray-400'}>
                        {formatNum(mastery, numberSystem)}% {mastery >= 80 ? '⭐' : mastery >= 40 ? '📈' : prog?.attempts ? '💪' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${mastery}%` }} transition={{ duration: 0.8, delay: num * 0.04 }}
                        className={`h-full rounded-full ${mastery >= 80 ? 'bg-green-400' : mastery >= 40 ? 'bg-yellow-400' : 'bg-sky-300'}`} />
                    </div>
                    {prog && <div className="text-xs text-gray-400 mt-0.5">{formatNum(prog.correct, numberSystem)} / {formatNum(prog.attempts, numberSystem)} إجابة صحيحة</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weak & Strong Areas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {weakTables.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-5">
              <h3 className="font-black text-red-700 mb-3 flex items-center gap-2">⚠️ تحتاج تدريباً أكثر</h3>
              <div className="space-y-2">
                {weakTables.slice(0, 4).map(p => (
                  <Link key={p.table_number} href={`/tables/${p.table_number}`}
                    className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-red-100 hover:bg-red-50 transition-colors">
                    <span className="font-bold text-red-700">جدول {formatNum(p.table_number, numberSystem)}</span>
                    <span className="text-red-500 text-sm font-bold">{formatNum(p.mastery_percent, numberSystem)}% ←</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {strongTables.length > 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-5">
              <h3 className="font-black text-green-700 mb-3 flex items-center gap-2">⭐ جداول مُتقنة</h3>
              <div className="flex flex-wrap gap-2">
                {strongTables.map(p => (
                  <div key={p.table_number} className={`${TABLE_COLORS[p.table_number]} text-white font-black w-12 h-12 rounded-xl flex items-center justify-center text-lg`}>
                    {formatNum(p.table_number, numberSystem)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-sky-100 mb-8">
          <h2 className="text-xl font-black text-sky-700 mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> الإنجازات
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {achievements.map(ach => {
              const earned = earnedAchievements.includes(ach.key);
              return (
                <div key={ach.key} className={`rounded-2xl p-3 text-center border-2 transition-all ${earned ? 'bg-yellow-50 border-yellow-300 shadow-md' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                  <div className="text-3xl mb-2">{earned ? '🏅' : '🔒'}</div>
                  <div className={`text-xs font-black ${earned ? 'text-yellow-700' : 'text-gray-400'}`}>{ach.title_ar}</div>
                  {earned && <div className="text-xs text-gray-500 mt-1">{ach.description_ar}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-sky-100">
            <h2 className="text-xl font-black text-sky-700 mb-4">آخر الجلسات</h2>
            <div className="space-y-2">
              {sessions.map(s => (
                <div key={s.id} className="flex items-center justify-between bg-sky-50 rounded-xl px-4 py-3 border border-sky-100">
                  <div>
                    <span className="font-bold text-sky-700 text-sm">{s.session_type === 'quiz' ? 'اختبار' : 'ممارسة'}</span>
                    <span className="text-gray-400 text-xs mr-2">{new Date(s.completed_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-green-600 font-bold">{formatNum(s.correct_answers, numberSystem)}/{formatNum(s.total_questions, numberSystem)}</span>
                    <span className={`font-bold ${s.accuracy >= 80 ? 'text-green-600' : s.accuracy >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {formatNum(s.accuracy, numberSystem)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {weakTables.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 rounded-3xl p-6">
            <h3 className="font-black text-sky-700 text-xl mb-4 flex items-center gap-2">
              🤖 توصيات ذكية
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sky-700">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>تدرب على جدول {weakTables[0]?.table_number} يومياً لمدة 10 دقائق</span>
              </li>
              {weakTables.length > 1 && (
                <li className="flex items-start gap-2 text-sky-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>راجع جداول {weakTables.slice(0, 3).map(t => t.table_number).join('، ')} باستخدام ألعاب التذكر</span>
                </li>
              )}
              <li className="flex items-start gap-2 text-sky-700">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>جرب لعبة تحدي السرعة لزيادة سرعة الإجابة</span>
              </li>
            </ul>
            <div className="mt-4 flex gap-3 flex-wrap">
              {weakTables.slice(0, 3).map(t => (
                <Link key={t.table_number} href={`/tables/${t.table_number}`}
                  className="bg-sky-500 text-white font-bold py-2 px-4 rounded-xl text-sm hover:bg-sky-600 transition-colors">
                  تدرب على جدول {formatNum(t.table_number, numberSystem)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
