'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudent } from '@/lib/student-context';
import { useSettings } from '@/lib/settings-context';
import {
  formatNum, formatEquation, formatText,
  speakEquationArabic, speakEquationEnglish,
  speakFullTableArabic, speakFullTableEnglish,
  startChant, pauseChant, resumeChant, stopChant,
  type VoiceType, type ChantSpeed, type ChantState,
} from '@/lib/numerals';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
} from 'docx';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

async function saveFileNative(dataUrl: string, filename: string) {
  if (Capacitor.isNativePlatform()) {
    const base64Data = dataUrl.split(',')[1];
    const safeName = filename.replace(/[^a-zA-Z0-9.\-]/g, '_');
    try {
      const result = await Filesystem.writeFile({
        path: safeName, data: base64Data, directory: Directory.Documents, recursive: true,
      });
      await Share.share({ title: filename, url: result.uri, dialogTitle: 'حفظ أو مشاركة' });
    } catch (e) {
      console.error('Filesystem error:', e);
      const link = document.createElement('a'); link.href = dataUrl; link.download = filename; link.click();
    }
  } else {
    const link = document.createElement('a'); link.href = dataUrl; link.download = filename; link.click();
  }
}
import {
  ChevronLeft, ChevronRight, Star, CheckCircle, RotateCcw, Volume2,
  Printer, Download, Lock, Trophy, Languages, Hash, Play, Pause,
  Repeat, Zap, PackageOpen,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════

const TABLE_CONFIG: Record<number, { gradient: string; emoji: string; animal: string; tip: string; pattern: string }> = {
  1: { gradient: 'from-blue-400 to-blue-600', emoji: '🏰', animal: '🐬', tip: 'أي رقم × 1 = نفسه!', pattern: 'كل النواتج = الرقم نفسه' },
  2: { gradient: 'from-green-400 to-green-600', emoji: '🏯', animal: '🦊', tip: 'الأعداد الزوجية!', pattern: 'كل ناتج عدد زوجي' },
  3: { gradient: 'from-yellow-400 to-amber-600', emoji: '🗼', animal: '🐝', tip: 'مجموع الأرقام = 3 أو 6 أو 9', pattern: 'مجموع أرقام الناتج قابل للقسمة على 3' },
  4: { gradient: 'from-pink-400 to-pink-600', emoji: '🏔️', animal: '🦋', tip: 'جدول 4 = جدول 2 × 2', pattern: 'كل ناتج عدد زوجي' },
  5: { gradient: 'from-sky-400 to-sky-600', emoji: '🌉', animal: '🐟', tip: 'آحاده 0 أو 5!', pattern: 'تبديل بين 0 و 5 في الآحاد' },
  6: { gradient: 'from-emerald-400 to-emerald-600', emoji: '🌳', animal: '🐸', tip: 'جدول 6 = 2 × 3', pattern: 'أعداد زوجية تقبل القسمة على 3' },
  7: { gradient: 'from-cyan-500 to-cyan-700', emoji: '🏖️', animal: '🦉', tip: 'يحتاج حفظاً - تدرب!', pattern: 'لا نمط بسيط - يحتاج حفظ' },
  8: { gradient: 'from-orange-400 to-orange-600', emoji: '⛰️', animal: '🐯', tip: 'جدول 8 = 4 × 2', pattern: 'أعداد زوجية تقبل القسمة على 4' },
  9: { gradient: 'from-rose-400 to-rose-600', emoji: '🌆', animal: '🦜', tip: 'مجموع الأرقام = 9!', pattern: 'العشرات تزيد والآحاد تنقص' },
  10: { gradient: 'from-amber-400 to-amber-600', emoji: '👑', animal: '🦁', tip: 'أضف صفراً على اليمين!', pattern: 'الرقم مع صفر على اليمين' },
  11: { gradient: 'from-violet-400 to-violet-600', emoji: '⭐', animal: '🦄', tip: 'اكتب الرقم مرتين: 3×11=33', pattern: 'الناتج = مضاعفة الرقم' },
  12: { gradient: 'from-red-400 to-red-600', emoji: '🏆', animal: '🐉', tip: 'جدول 12 = 10 + 2', pattern: 'أعداد تقبل القسمة على 2 و 3 و 4' },
};

const VISUAL_ITEMS = [
  { emoji: '🍎', name: 'تفاحة' }, { emoji: '🍊', name: 'برتقالة' }, { emoji: '🌟', name: 'نجمة' },
  { emoji: '🎈', name: 'بالون' }, { emoji: '🌸', name: 'زهرة' }, { emoji: '🦋', name: 'فراشة' },
];

type Section = 'learn' | 'visual' | 'writing' | 'addition' | 'commutative' | 'division' | 'equal' | 'quiz' | 'export';

const SECTIONS: { id: Section; title: string; titleEn: string; icon: string }[] = [
  { id: 'learn',       title: 'تعلم الجدول',        titleEn: 'Learn Table',    icon: '📖' },
  { id: 'visual',      title: 'الفهم البصري',        titleEn: 'Visual',         icon: '🍎' },
  { id: 'addition',    title: 'الجمع المتكرر',       titleEn: 'Addition',       icon: '➕' },
  { id: 'commutative', title: 'خاصية الإبدال',       titleEn: 'Commutative',    icon: '🔄' },
  { id: 'writing',     title: 'تدريب الكتابة',       titleEn: 'Writing',        icon: '✏️' },
  { id: 'equal',       title: 'النتائج المتشابهة',   titleEn: 'Equal Products', icon: '🎯' },
  { id: 'division',    title: 'الضرب والقسمة',       titleEn: 'Division',       icon: '➗' },
  { id: 'quiz',        title: 'الاختبار',            titleEn: 'Quiz',           icon: '📝' },
  { id: 'export',      title: 'تصدير أوراق العمل',  titleEn: 'Worksheets',     icon: '📄' },
];

function findFactorPairs(n: number): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 2; i <= 12; i++) {
    if (n % i === 0 && n / i >= 2 && n / i <= 12) pairs.push([i, n / i]);
  }
  return pairs;
}

function generateChoices(correct: number): number[] {
  const set = new Set<number>([correct]);
  while (set.size < 4) { const v = correct + Math.floor(Math.random() * 10) - 5; if (v > 0 && v !== correct) set.add(v); }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

// ═══════════════════════════════════════════════════════════
// SETTINGS BAR WITH VOICE + NUMERAL + LANGUAGE TOGGLES
// ═══════════════════════════════════════════════════════════

function SettingsBar({ num }: { num: number }) {
  const { numberSystem, language, voiceType, toggleNumberSystem, toggleLanguage, setVoiceType } = useSettings();
  const [speaking, setSpeaking] = useState(false);

  const listenAll = () => {
    setSpeaking(true);
    if (language === 'ar') speakFullTableArabic(num, voiceType);
    else speakFullTableEnglish(num);
    setTimeout(() => setSpeaking(false), 38000);
  };

  const voiceOptions: { id: VoiceType; label: string; icon: string }[] = [
    { id: 'boy', label: 'ولد', icon: '👦' },
    { id: 'girl', label: 'بنت', icon: '👧' },
    { id: 'mixed', label: 'مختلط', icon: '👦👧' },
  ];

  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button onClick={toggleLanguage} className="flex items-center gap-1.5 bg-white border-2 border-sky-200 rounded-xl px-3 py-1.5 text-sm font-bold hover:bg-sky-50 transition-all shadow-sm">
          <Languages className="w-4 h-4 text-sky-600" />
          {language === 'ar' ? 'العربية' : 'English'}
        </button>
        <button onClick={toggleNumberSystem} className="flex items-center gap-1.5 bg-white border-2 border-amber-200 rounded-xl px-3 py-1.5 text-sm font-bold hover:bg-amber-50 transition-all shadow-sm">
          <Hash className="w-4 h-4 text-amber-600" />
          {numberSystem === 'western' ? '1 2 3' : '١ ٢ ٣'}
        </button>
        <button onClick={listenAll} disabled={speaking} className="flex items-center gap-1.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl px-3 py-1.5 text-sm font-bold hover:opacity-90 disabled:opacity-50 shadow-sm transition-all">
          <Volume2 className={`w-4 h-4 ${speaking ? 'animate-pulse' : ''}`} />
          {language === 'ar' ? 'استمع للجدول' : 'Listen'}
        </button>
      </div>
      {/* Voice type selector */}
      {language === 'ar' && (
        <div className="flex items-center gap-1.5 justify-center">
          <span className="text-xs font-bold text-gray-500 ml-1">{language === 'ar' ? 'الصوت:' : 'Voice:'}</span>
          {voiceOptions.map(v => (
            <button key={v.id} onClick={() => setVoiceType(v.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                voiceType === v.id ? 'bg-sky-500 text-white shadow-sm' : 'bg-white border border-sky-200 text-sky-700 hover:bg-sky-50'
              }`}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 1: LEARN THE TABLE (with auto-play + chant mode)
// ═══════════════════════════════════════════════════════════

function LearnSection({ num, config }: { num: number; config: typeof TABLE_CONFIG[1] }) {
  const { numberSystem, language, voiceType, chantSpeed, setChantSpeed, chantRepeat, setChantRepeat } = useSettings();
  const facts = Array.from({ length: 12 }, (_, i) => ({ b: i + 1, result: num * (i + 1) }));
  const [revealAll, setRevealAll] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoIdx, setAutoIdx] = useState(-1);
  const autoRef = useRef<NodeJS.Timeout | null>(null);

  // Chant mode state
  const [chantState, setChantState] = useState<ChantState>('idle');
  const [chantIdx, setChantIdx] = useState(-1);

  const speakOne = (b: number, result: number) => {
    if (language === 'ar') speakEquationArabic(num, b, result, voiceType);
    else speakEquationEnglish(num, b, result);
  };

  const startAutoPlay = () => {
    setAutoPlay(true); setAutoIdx(0);
  };

  useEffect(() => {
    if (!autoPlay) return;
    if (autoIdx < 0 || autoIdx >= facts.length) {
      setAutoPlay(false); setAutoIdx(-1); return;
    }
    const f = facts[autoIdx];
    speakOne(f.b, f.result);
    autoRef.current = setTimeout(() => setAutoIdx(i => i + 1), 2500);
    return () => { if (autoRef.current) clearTimeout(autoRef.current); };
  }, [autoIdx, autoPlay]);

  // Chant controls
  const handleChantPlay = useCallback(async () => {
    if (chantState === 'paused') {
      resumeChant();
      setChantState('playing');
    } else {
      // Set repeat in numerals module before starting
      const { setChantRepeat: setModRepeat } = await import('@/lib/numerals');
      setModRepeat(chantRepeat);
      const state = await startChant(num, voiceType, chantSpeed, (idx) => setChantIdx(idx), () => {
        setChantState('idle');
        setChantIdx(-1);
      });
      setChantState(state);
    }
  }, [chantState, num, voiceType, chantSpeed, chantRepeat]);

  const handleChantPause = useCallback(() => {
    pauseChant();
    setChantState('paused');
  }, []);

  const handleChantStop = useCallback(() => {
    stopChant();
    setChantState('idle');
    setChantIdx(-1);
  }, []);

  const speedOptions: { id: ChantSpeed; label: string; icon: string }[] = [
    { id: 'slow', label: 'بطيء', icon: '🐢' },
    { id: 'normal', label: 'عادي', icon: '🚶' },
    { id: 'fast', label: 'سريع', icon: '⚡' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl shadow-xl border-2 border-sky-200 overflow-hidden relative">
        <div className={`bg-gradient-to-r ${config.gradient} text-white p-5 text-center relative overflow-hidden`}>
          <div className="absolute top-0 right-0 text-6xl opacity-20">{config.emoji}</div>
          <div className="absolute bottom-0 left-3 text-3xl opacity-20">{config.animal}</div>
          <div className="relative">
            <div className="text-4xl mb-1">{config.animal}</div>
            <h2 className="text-3xl font-black">{language === 'ar' ? `جدول الضرب في ${formatNum(num, numberSystem)}` : `Table of ${formatNum(num, numberSystem)}`}</h2>
            <p className="text-white/80 text-sm mt-1">{formatText(config.tip, numberSystem)}</p>
          </div>
          <div className="absolute bottom-0 right-0 flex gap-1 text-lg opacity-40">🐝🌸⭐🦋</div>
        </div>

        <div className="p-4 space-y-1">
          {facts.map((fact, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className={`flex items-center justify-between py-3 px-4 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer ${
                (autoIdx === i || chantIdx === i) ? 'bg-yellow-50 ring-2 ring-yellow-300' : i % 2 === 0 ? 'bg-sky-50' : 'bg-white'
              } border border-transparent hover:border-sky-200`}
              onClick={() => speakOne(fact.b, fact.result)}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center hover:bg-sky-200 transition-colors">
                  <Volume2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-lg font-black text-gray-700">{formatEquation(num, fact.b, revealAll ? fact.result : NaN, numberSystem).replace(/NaN/, '＿＿')}</span>
              </div>
              <span className={`text-2xl font-black bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                {revealAll ? formatNum(fact.result, numberSystem) : ''}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="bg-sky-50 border-t border-sky-100 p-4 flex flex-wrap gap-2 justify-center">
          <button onClick={() => setRevealAll(!revealAll)} className="flex items-center gap-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white font-bold py-2 px-4 rounded-xl hover:opacity-90 shadow-md text-sm">
            {revealAll ? '🙈 إخفاء' : '👁️ أظهر الكل'}
          </button>
          <button onClick={startAutoPlay} disabled={autoPlay} className="flex items-center gap-2 bg-green-500 text-white font-bold py-2 px-4 rounded-xl hover:bg-green-600 disabled:opacity-50 shadow-md text-sm">
            <Volume2 className="w-4 h-4" /> {autoPlay ? '🔄 جاري التشغيل...' : '▶️ تشغيل تلقائي'}
          </button>
        </div>
      </div>

      {/* ═══ CHANT MODE (نشيد الحفظ) ═══ */}
      {language === 'ar' && (
        <div className="bg-white rounded-3xl p-5 shadow-lg border-2 border-amber-200 relative">
          <div className="absolute -top-1 -right-1 text-xl">🎵</div>
          <h3 className="text-lg font-black text-amber-700 mb-4 flex items-center gap-2">🎵 نشيد الحفظ</h3>
          <p className="text-gray-500 text-sm mb-4">استمع للجدول بنمط نشيد إيقاعي للحفظ السريع</p>

          {/* Chant progress visualization */}
          <div className="flex gap-1 mb-4 justify-center">
            {facts.map((f, i) => (
              <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                chantIdx === i ? 'bg-amber-400 text-white scale-110 shadow-md' :
                chantIdx > i ? 'bg-green-100 text-green-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {formatNum(i + 1, numberSystem)}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 justify-center mb-3">
            {chantState === 'playing' ? (
              <button onClick={handleChantPause} className="flex items-center gap-2 bg-amber-500 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-amber-600 shadow-md text-sm">
                <Pause className="w-4 h-4" /> إيقاف مؤقت
              </button>
            ) : (
              <button onClick={handleChantPlay} className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold py-2.5 px-5 rounded-xl hover:opacity-90 shadow-md text-sm">
                <Play className="w-4 h-4" /> {chantState === 'paused' ? 'استمرار' : 'تشغيل'}
              </button>
            )}
            <button onClick={handleChantStop} disabled={chantState === 'idle'} className="flex items-center gap-2 bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl hover:bg-gray-300 disabled:opacity-40 text-sm">
              <RotateCcw className="w-4 h-4" /> إيقاف
            </button>
            <button onClick={() => setChantRepeat(!chantRepeat)}
              className={`flex items-center gap-2 font-bold py-2.5 px-4 rounded-xl text-sm transition-all ${
                chantRepeat ? 'bg-sky-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
              <Repeat className="w-4 h-4" /> تكرار
            </button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-2 justify-center">
            <Zap className="w-3.5 h-3.5 text-gray-400" />
            {speedOptions.map(s => (
              <button key={s.id} onClick={() => setChantSpeed(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chantSpeed === s.id ? 'bg-sky-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pattern */}
      <div className="bg-white rounded-3xl p-5 shadow-lg border-2 border-amber-200 relative">
        <div className="absolute -bottom-1 -left-1 text-xl">🐝</div>
        <h3 className="text-lg font-black text-amber-700 mb-3 flex items-center gap-2">🔍 {language === 'ar' ? 'اكتشف النمط' : 'Pattern Discovery'}</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {facts.map((f, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
              className="bg-amber-50 border-2 border-amber-200 rounded-xl px-3 py-2 text-center shadow-sm">
              <span className="text-xl font-black text-amber-600">{formatNum(f.result, numberSystem)}</span>
            </motion.div>
          ))}
        </div>
        <p className="text-amber-700 text-sm mt-3 font-bold text-center">📌 {formatText(config.pattern, numberSystem)}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 2: VISUAL
// ═══════════════════════════════════════════════════════════

function VisualSection({ num }: { num: number }) {
  const { numberSystem, language } = useSettings();
  const [b, setB] = useState(num > 1 ? 4 : 1);
  const [itemIdx, setItemIdx] = useState(0);
  const result = num * b;
  const item = VISUAL_ITEMS[itemIdx];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl shadow-xl border-2 border-pink-200 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-400 to-rose-500 text-white p-4 text-center">
          <h3 className="text-xl font-black">{language === 'ar' ? `فهم ${formatNum(num, numberSystem)} × ${formatNum(b, numberSystem)} بالصور` : `${formatNum(num, numberSystem)} × ${formatNum(b, numberSystem)} Visual`}</h3>
        </div>
        <div className="p-6">
          <div className="my-4">
            {Array.from({ length: Math.min(num, 10) }, (_, r) => (
              <motion.div key={r} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: r * 0.12 }}
                className="grid justify-center mb-1 mx-auto"
                style={{ gridTemplateColumns: `repeat(${Math.min(b, 12)}, minmax(0, 1fr))`, maxWidth: `${Math.min(b, 12) * 2.5}rem` }}>
                {Array.from({ length: Math.min(b, 12) }, (_, c) => (
                  <motion.span key={c}
                    className="text-center leading-none"
                    style={{ fontSize: b <= 4 ? '1.75rem' : b <= 6 ? '1.5rem' : b <= 8 ? '1.25rem' : '1rem' }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: r * 0.12 + c * 0.04 }}>
                    {item.emoji}
                  </motion.span>
                ))}
              </motion.div>
            ))}
            {num > 10 && <div className="text-gray-400 text-sm font-bold text-center">... {language === 'ar' ? 'وأكثر' : 'more'}</div>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 text-center">
              <p className="text-sky-700 font-bold text-sm mb-1">{language === 'ar' ? 'الجمع المتكرر' : 'Repeated Addition'}</p>
              <p className="text-lg font-black text-sky-800">{Array.from({ length: Math.min(num, 6) }, () => formatNum(b, numberSystem)).join(' + ')}{num > 6 ? ' + ...' : ''} = <span className="text-green-600">{formatNum(result, numberSystem)}</span></p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
              <p className="text-green-700 font-bold text-sm mb-1">{language === 'ar' ? 'الضرب' : 'Multiplication'}</p>
              <p className="text-lg font-black text-green-800">{formatEquation(num, b, result, numberSystem)}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <div className="flex items-center gap-2 bg-white rounded-xl p-2 shadow border border-sky-200">
          <button onClick={() => setB(Math.max(1, b - 1))} className="w-8 h-8 bg-sky-100 text-sky-700 rounded-lg font-black hover:bg-sky-200">-</button>
          <span className="text-xl font-black text-sky-700 w-6 text-center">{formatNum(b, numberSystem)}</span>
          <button onClick={() => setB(Math.min(12, b + 1))} className="w-8 h-8 bg-sky-100 text-sky-700 rounded-lg font-black hover:bg-sky-200">+</button>
        </div>
        {VISUAL_ITEMS.map((v, i) => (
          <button key={i} onClick={() => setItemIdx(i)} className={`text-2xl p-2 rounded-xl border-2 transition-all ${itemIdx === i ? 'border-pink-400 bg-pink-50 scale-110' : 'border-transparent hover:border-pink-200'}`}>{v.emoji}</button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 3: WRITING
// ═══════════════════════════════════════════════════════════

function WritingSection({ num }: { num: number }) {
  const { numberSystem, language } = useSettings();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const facts = Array.from({ length: 12 }, (_, i) => ({ b: i + 1, result: num * (i + 1) }));
  const correctCount = Object.keys(answers).filter(k => answers[k]?.trim() === facts[parseInt(k) - 1]?.result?.toString()).length;

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-yellow-200 overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white p-4 text-center">
        <h3 className="text-xl font-black">{language === 'ar' ? `اكتب جدول ${formatNum(num, numberSystem)}` : `Write Table of ${formatNum(num, numberSystem)}`}</h3>
      </div>
      <div className="p-5 notebook-lines">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {facts.map((fact) => {
            const key = `${fact.b}`;
            const isCorrect = answers[key]?.trim() === fact.result.toString();
            const isWrong = answers[key] && !isCorrect;
            return (
              <div key={key} className={`flex items-center gap-2 rounded-xl px-3 py-2 border-2 transition-all ${isCorrect ? 'bg-green-50 border-green-300' : isWrong ? 'bg-red-50 border-red-200' : 'bg-white border-sky-200'}`}>
                <span className="text-lg font-black text-gray-600">{formatNum(num, numberSystem)} × {formatNum(fact.b, numberSystem)} =</span>
                <input value={answers[key] || ''} onChange={e => setAnswers(a => ({ ...a, [key]: e.target.value }))}
                  className={`w-14 text-center text-lg font-black border-2 rounded-lg py-1 focus:outline-none ${isCorrect ? 'border-green-400 text-green-700' : isWrong ? 'border-red-300 text-red-600' : 'border-sky-200 focus:border-sky-400'}`}
                  maxLength={3} inputMode="numeric" />
                {answers[key] && <span className="text-lg">{isCorrect ? '✅' : '❌'}</span>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-amber-50 border-t px-5 py-3 flex items-center justify-between text-sm">
        <span className="text-amber-700 font-bold">{formatNum(correctCount, numberSystem)} / {formatNum(12, numberSystem)}</span>
        <button onClick={() => setAnswers({})} className="text-gray-500 hover:text-red-500 flex items-center gap-1"><RotateCcw className="w-3 h-3" /> إعادة</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 4: ADDITION
// ═══════════════════════════════════════════════════════════

function AdditionSection({ num }: { num: number }) {
  const { numberSystem, language } = useSettings();
  const { addStars, updateTableProgress } = useStudent();
  const [b, setB] = useState(num > 1 ? 3 : 1);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const result = num * b;
  const additions = Array.from({ length: num }, () => b);

  const check = () => {
    if (!answer.trim() || feedback) return;
    const correct = parseInt(answer) === result;
    setFeedback(correct ? 'correct' : 'wrong');
    updateTableProgress(num, correct);
    if (correct) { setScore(s => s + 1); setStreak(s => s + 1); addStars(1); } else setStreak(0);
    setTimeout(() => { setB(Math.floor(Math.random() * 12) + 1); setAnswer(''); setFeedback(null); }, 1200);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-green-200 overflow-hidden">
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white p-4 text-center">
        <h3 className="text-xl font-black">{language === 'ar' ? 'الجمع المتكرر' : 'Repeated Addition'}</h3>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {additions.map((val, i) => (
            <motion.div key={`${b}-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.06 }}
              className="bg-green-400 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-md">{formatNum(val, numberSystem)}</motion.div>
          ))}
        </div>
        <div className="text-center text-xl font-black text-gray-700 mb-4">{additions.map(v => formatNum(v, numberSystem)).join(' + ')} = ?</div>
        <div className="text-center text-3xl font-black text-green-700 mb-4">{formatEquation(num, b, NaN, numberSystem).replace(/NaN/, '?')}</div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} placeholder="؟" inputMode="numeric"
            className={`flex-1 text-center text-2xl font-black border-2 rounded-xl py-3 focus:outline-none min-w-0 ${feedback === 'correct' ? 'border-green-400 bg-green-50 text-green-700' : feedback === 'wrong' ? 'border-red-300 bg-red-50 text-red-600' : 'border-green-300 focus:border-green-500'}`} />
          <button onClick={check} className="bg-green-500 text-white font-black py-3 px-6 rounded-xl hover:bg-green-600 shadow-md flex-shrink-0">✓</button>
        </div>
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className={`mt-3 text-center py-3 rounded-xl font-black text-lg ${feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {feedback === 'correct' ? '✅ ممتاز!' : `❌ ${formatNum(result, numberSystem)}`}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex justify-between mt-3 text-sm font-bold">
          <span className="text-green-600">✅ {formatNum(score, numberSystem)}</span><span className="text-orange-500">🔥 {streak}</span>
          <button onClick={() => { setB(Math.floor(Math.random() * 12) + 1); setAnswer(''); setFeedback(null); }} className="text-sky-500 hover:text-sky-700 flex items-center gap-1"><RotateCcw className="w-3 h-3" /> جديد</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 5: COMMUTATIVE
// ═══════════════════════════════════════════════════════════

function CommutativeSection({ num }: { num: number }) {
  const { numberSystem, language } = useSettings();
  const { addStars } = useStudent();
  const [b, setB] = useState(num > 1 ? 4 : 1);
  const [ans1, setAns1] = useState('');
  const [ans2, setAns2] = useState('');
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const result = num * b;

  const check = () => {
    setChecked(true);
    const c1 = parseInt(ans1) === result, c2 = parseInt(ans2) === result;
    if (c1 || c2) { addStars(c1 && c2 ? 2 : 1); setScore(s => s + (c1 && c2 ? 2 : 1)); }
  };
  const next = () => { setB(Math.floor(Math.random() * 12) + 1); setAns1(''); setAns2(''); setChecked(false); };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-teal-200 overflow-hidden">
      <div className="bg-gradient-to-r from-teal-400 to-green-500 text-white p-4 text-center">
        <h3 className="text-xl font-black">{language === 'ar' ? 'خاصية الإبدال' : 'Commutative Property'}</h3>
      </div>
      <div className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-2xl p-4 border-2 text-center ${checked && parseInt(ans1) === result ? 'border-green-400 bg-green-50' : 'border-sky-200 bg-sky-50'}`}>
            <div className="text-2xl font-black text-sky-700 mb-2">{formatEquation(num, b, NaN, numberSystem).replace(/NaN/, '')} =</div>
            <input type="text" value={ans1} onChange={e => setAns1(e.target.value)} disabled={checked} className="w-16 text-center text-xl font-black border-2 border-sky-300 rounded-lg py-1 focus:outline-none" inputMode="numeric" />
          </div>
          <div className={`rounded-2xl p-4 border-2 text-center ${checked && parseInt(ans2) === result ? 'border-green-400 bg-green-50' : 'border-pink-200 bg-pink-50'}`}>
            <div className="text-2xl font-black text-pink-600 mb-2">{formatEquation(b, num, NaN, numberSystem).replace(/NaN/, '')} =</div>
            <input type="text" value={ans2} onChange={e => setAns2(e.target.value)} disabled={checked} className="w-16 text-center text-xl font-black border-2 border-pink-300 rounded-lg py-1 focus:outline-none" inputMode="numeric" />
          </div>
        </div>
        {checked && <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center font-black text-lg text-green-700">{formatEquation(num, b, result, numberSystem)} = {formatEquation(b, num, result, numberSystem)}</div>}
        {!checked ? (
          <button onClick={check} disabled={!ans1 || !ans2} className="w-full bg-teal-500 text-white font-black py-3 rounded-xl hover:opacity-90 disabled:opacity-50 whitespace-nowrap">تحقق</button>
        ) : (
          <button onClick={next} className="w-full bg-green-500 text-white font-black py-3 rounded-xl hover:bg-green-600 flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> جديد</button>
        )}
        <div className="text-center text-sm font-bold text-teal-600">النقاط: {formatNum(score, numberSystem)}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 6: DIVISION
// ═══════════════════════════════════════════════════════════

function DivisionSection({ num }: { num: number }) {
  const { numberSystem, language } = useSettings();
  const { addStars, updateTableProgress } = useStudent();
  const [b, setB] = useState(num > 1 ? 5 : 1);
  const [answers, setAnswers] = useState({ d1: '', d2: '' });
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const result = num * b;

  const check = () => {
    setChecked(true);
    const c1 = parseInt(answers.d1) === num, c2 = parseInt(answers.d2) === b;
    if (c1 || c2) { addStars(c1 && c2 ? 2 : 1); setScore(s => s + (c1 && c2 ? 2 : 1)); }
    updateTableProgress(num, c1 && c2);
  };
  const next = () => { setB(Math.floor(Math.random() * 12) + 1); setAnswers({ d1: '', d2: '' }); setChecked(false); };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-200 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-4 text-center">
        <h3 className="text-xl font-black">{language === 'ar' ? 'الضرب والقسمة' : 'Multiply & Divide'}</h3>
      </div>
      <div className="p-5 space-y-3">
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-orange-700">{formatEquation(num, b, result, numberSystem)}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl p-3 border-2 text-center ${checked && parseInt(answers.d1) === num ? 'border-green-400 bg-green-50' : 'border-sky-200'}`}>
            <p className="text-lg font-black text-sky-700">{formatNum(result, numberSystem)} ÷ {formatNum(b, numberSystem)} =</p>
            <input type="text" value={answers.d1} onChange={e => setAnswers(a => ({ ...a, d1: e.target.value }))} disabled={checked} className="w-14 text-center text-xl font-black border-2 border-sky-300 rounded-lg py-1 focus:outline-none" inputMode="numeric" />
          </div>
          <div className={`rounded-xl p-3 border-2 text-center ${checked && parseInt(answers.d2) === b ? 'border-green-400 bg-green-50' : 'border-pink-200'}`}>
            <p className="text-lg font-black text-pink-600">{formatNum(result, numberSystem)} ÷ {formatNum(num, numberSystem)} =</p>
            <input type="text" value={answers.d2} onChange={e => setAnswers(a => ({ ...a, d2: e.target.value }))} disabled={checked} className="w-14 text-center text-xl font-black border-2 border-pink-300 rounded-lg py-1 focus:outline-none" inputMode="numeric" />
          </div>
        </div>
        {checked && <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center text-green-700 font-bold">{formatNum(result, numberSystem)} ÷ {formatNum(b, numberSystem)} = {formatNum(num, numberSystem)} | {formatNum(result, numberSystem)} ÷ {formatNum(num, numberSystem)} = {formatNum(b, numberSystem)}</div>}
        {!checked ? (
          <button onClick={check} className="w-full bg-orange-500 text-white font-black py-3 rounded-xl hover:bg-orange-600 whitespace-nowrap">تحقق</button>
        ) : (
          <button onClick={next} className="w-full bg-green-500 text-white font-black py-3 rounded-xl hover:bg-green-600 flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> جديد</button>
        )}
        <div className="text-center text-sm font-bold text-orange-600">النقاط: {formatNum(score, numberSystem)}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 7: EQUAL PRODUCTS (النتائج المتشابهة)
// ═══════════════════════════════════════════════════════════

// ALL products of the table: num×1 … num×12, each with their factor pairs
function getTableAllProducts(num: number): { product: number; pairs: [number, number][]; multiplier: number }[] {
  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const product = num * m;
    const pairs = findFactorPairs(product);
    return { product, pairs, multiplier: m };
  });
}

// Subset that have 2+ factor pairs (used by activities)
function getTableEqualProducts(num: number): { product: number; pairs: [number, number][] }[] {
  if (num <= 2) return [];
  return getTableAllProducts(num)
    .filter(p => p.pairs.length >= 2)
    .map(({ product, pairs }) => ({ product, pairs }));
}

// ── Interactive "Select All Correct Equations" quiz ────────────────────────
function EqualProductsQuiz({ num }: { num: number }) {
  const { numberSystem, language } = useSettings();
  const { addStars } = useStudent();

  // All table products sorted ascending — use ones with 2+ factor pairs for quiz targets
  const allProducts = getTableAllProducts(num);
  const quizTargets = allProducts.filter(p => p.pairs.length >= 2);

  const [targetIdx, setTargetIdx] = useState(() =>
    quizTargets.length > 0 ? Math.floor(Math.random() * quizTargets.length) : 0
  );

  if (quizTargets.length === 0) return null;

  const current = quizTargets[targetIdx];
  const target = current.product;
  const correctPairs = current.pairs;

  // Build options: all correct pairs + distractors that do NOT equal target
  const buildOptions = (tgt: number, correct: [number, number][]): [number, number][] => {
    const opts: [number, number][] = [...correct];
    const seen = new Set(correct.map(([a, b]) => `${a}x${b}`));
    let attempts = 0;
    while (opts.length < Math.max(correct.length + 3, 6) && attempts < 500) {
      attempts++;
      const a = Math.floor(Math.random() * 11) + 2;
      const b = Math.floor(Math.random() * 11) + 2;
      const key = `${a}x${b}`;
      if (a * b !== tgt && !seen.has(key)) {
        seen.add(key);
        opts.push([a, b]);
      }
    }
    return opts.sort(() => Math.random() - 0.5);
  };

  const [options, setOptions] = useState<[number, number][]>(() => buildOptions(target, correctPairs));
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAsked, setTotalAsked] = useState(0);

  const correctIdxs = options.reduce((acc, [a, b], i) => {
    if (a * b === target) acc.push(i);
    return acc;
  }, [] as number[]);

  const check = () => {
    if (selected.size === 0) return;
    setChecked(true);
    const allCorrectSelected = correctIdxs.every(i => selected.has(i));
    const noWrongSelected = Array.from(selected).every(i => correctIdxs.includes(i));
    if (allCorrectSelected && noWrongSelected) {
      addStars(correctIdxs.length);
      setScore(s => s + correctIdxs.length);
    }
    setTotalAsked(t => t + 1);
  };

  const next = () => {
    const newIdx = Math.floor(Math.random() * quizTargets.length);
    const newTarget = quizTargets[newIdx];
    setTargetIdx(newIdx);
    setOptions(buildOptions(newTarget.product, newTarget.pairs));
    setSelected(new Set());
    setChecked(false);
  };

  const toggle = (i: number) => {
    if (checked) return;
    setSelected(s => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-fuchsia-200 overflow-hidden">
      <div className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white p-5 text-center">
        <h3 className="text-xl font-black">🎯 {language === 'ar' ? 'النتائج المتشابهة' : 'Equal Products Quiz'}</h3>
        <p className="text-white/80 text-sm mt-1">
          {language === 'ar'
            ? 'اختر جميع العمليات التي ناتجها:'
            : 'Select all equations whose result is:'}
        </p>
        <div className="text-6xl font-black mt-3 drop-shadow-lg">{formatNum(target, numberSystem)}</div>
        <div className="text-white/70 text-xs mt-1">
          {language === 'ar' ? `يوجد ${correctIdxs.length} معادلة صحيحة` : `${correctIdxs.length} correct equation(s)`}
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {options.map(([a, b], i) => {
            const isCorrect = a * b === target;
            const isSel = selected.has(i);
            let cls = 'border-fuchsia-200 bg-white text-fuchsia-700 hover:border-fuchsia-400 hover:bg-fuchsia-50';
            if (checked) {
              if (isCorrect && isSel)  cls = 'border-green-400 bg-green-50 text-green-700 ring-2 ring-green-300';
              else if (isCorrect)       cls = 'border-yellow-400 border-dashed bg-yellow-50 text-yellow-700';
              else if (isSel)           cls = 'border-red-400 bg-red-50 text-red-600';
              else                      cls = 'border-gray-200 bg-gray-50 text-gray-400';
            } else if (isSel) {
              cls = 'border-fuchsia-500 bg-fuchsia-100 text-fuchsia-700 scale-105 shadow-md';
            }
            return (
              <button key={i} onClick={() => toggle(i)}
                className={`py-4 rounded-2xl border-2 font-black text-xl transition-all ${cls}`}>
                {formatNum(a, numberSystem)} × {formatNum(b, numberSystem)}
                {checked && isCorrect && <span className="block text-sm">= {formatNum(target, numberSystem)} ✓</span>}
                {checked && !isCorrect && isSel && <span className="block text-xs">✗</span>}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {checked && (
          <div className={`rounded-xl p-3 text-center font-bold mb-3 text-sm ${
            correctIdxs.every(i => selected.has(i)) && Array.from(selected).every(i => correctIdxs.includes(i))
              ? 'bg-green-50 border-2 border-green-300 text-green-700'
              : 'bg-amber-50 border-2 border-amber-300 text-amber-700'
          }`}>
            {correctIdxs.every(i => selected.has(i)) && Array.from(selected).every(i => correctIdxs.includes(i))
              ? (language === 'ar' ? '🎉 ممتاز! كل الإجابات صحيحة' : '🎉 Perfect! All correct')
              : (language === 'ar'
                  ? `الإجابات الصحيحة: ${correctPairs.map(([a, b]) => `${formatNum(a, numberSystem)}×${formatNum(b, numberSystem)}`).join('، ')}`
                  : `Correct: ${correctPairs.map(([a, b]) => `${a}×${b}`).join(', ')}`)
            }
          </div>
        )}

        {!checked ? (
          <button onClick={check} disabled={selected.size === 0}
            className="w-full bg-fuchsia-500 text-white font-black py-3 rounded-xl hover:bg-fuchsia-600 disabled:opacity-50 transition-all">
            {language === 'ar' ? 'تحقق من إجابتي' : 'Check My Answer'}
          </button>
        ) : (
          <button onClick={next}
            className="w-full bg-green-500 text-white font-black py-3 rounded-xl hover:bg-green-600 flex items-center justify-center gap-2 transition-all">
            <RotateCcw className="w-4 h-4" /> {language === 'ar' ? 'سؤال تالٍ' : 'Next Question'}
          </button>
        )}

        <div className="flex justify-between items-center mt-3 text-sm font-bold text-fuchsia-600">
          <span>{language === 'ar' ? `النقاط: ${formatNum(score, numberSystem)}` : `Score: ${formatNum(score, numberSystem)}`}</span>
          {totalAsked > 0 && <span>{language === 'ar' ? `أسئلة: ${formatNum(totalAsked, numberSystem)}` : `Questions: ${formatNum(totalAsked, numberSystem)}`}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Reference table: ALL products with their factor pairs ─────────────────
function EqualProductsReference({ num }: { num: number }) {
  const { numberSystem, language } = useSettings();
  const allProducts = getTableAllProducts(num);

  const COLORS = [
    'border-blue-300 bg-blue-50',
    'border-emerald-300 bg-emerald-50',
    'border-amber-300 bg-amber-50',
    'border-rose-300 bg-rose-50',
    'border-violet-300 bg-violet-50',
    'border-cyan-300 bg-cyan-50',
  ];

  return (
    <div className="bg-white rounded-3xl shadow-lg border-2 border-amber-200 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white p-4 text-center">
        <h3 className="text-lg font-black">
          📊 {language === 'ar'
            ? `جميع نواتج جدول ${formatNum(num, numberSystem)}`
            : `All Products of Table ${formatNum(num, numberSystem)}`}
        </h3>
        <p className="text-white/80 text-xs mt-1">
          {language === 'ar' ? 'المعادلات المتشابهة مظللة' : 'Shaded products have multiple factor pairs'}
        </p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {allProducts.map(({ product, pairs, multiplier }, idx) => {
            const hasMultiple = pairs.length >= 2;
            const colorClass = hasMultiple ? COLORS[idx % COLORS.length] : 'border-gray-200 bg-gray-50';
            return (
              <div key={product} className={`rounded-2xl border-2 p-3 ${colorClass}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 font-bold w-5">{multiplier}×</span>
                  <span className="text-xl font-black text-gray-800">{formatNum(num, numberSystem)} × {formatNum(multiplier, numberSystem)} = {formatNum(product, numberSystem)}</span>
                  {hasMultiple && <span className="mr-auto bg-white rounded-full px-2 py-0.5 text-xs font-bold text-fuchsia-600 border border-fuchsia-200">{pairs.length} معادلات</span>}
                </div>
                {hasMultiple && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {pairs.map(([a, b]) => (
                      <span key={`${a}x${b}`} className="text-xs font-bold bg-white rounded-lg px-2 py-0.5 border border-current opacity-80">
                        {formatNum(a, numberSystem)} × {formatNum(b, numberSystem)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EqualSection({ num }: { num: number }) {
  const { numberSystem, language } = useSettings();
  const { addStars } = useStudent();

  // Tables 1 and 2: only the reference table, no activities
  if (num <= 2) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 text-center">
          <p className="text-gray-600 text-sm">
            {language === 'ar'
              ? 'جداول 1 و 2 لا تحتوي على نتائج متشابهة بين جداول مختلفة. عرض الجدول للمراجعة:'
              : 'Tables 1 and 2 have no shared equal products. Reference table shown below.'}
          </p>
        </div>
        <EqualProductsReference num={num} />
      </div>
    );
  }

  const [activityType, setActivityType] = useState<'match' | 'partner' | 'complete' | 'dragdrop' | 'color'>('match');

  // For activities: only products with 2+ factor pairs
  const tableProducts = getTableEqualProducts(num);

  // If no valid products found, show reference only
  if (tableProducts.length === 0) {
    return (
      <div className="space-y-4">
        <EqualProductsReference num={num} />
      </div>
    );
  }

  const ActivityComponent = () => {
    if (activityType === 'match')    return <MatchActivity    num={num} tableProducts={tableProducts} setActivityType={setActivityType} />;
    if (activityType === 'partner')  return <PartnerActivity  num={num} tableProducts={tableProducts} setActivityType={setActivityType} />;
    if (activityType === 'complete') return <CompleteActivity num={num} tableProducts={tableProducts} setActivityType={setActivityType} />;
    if (activityType === 'dragdrop') return <DragDropActivity num={num} tableProducts={tableProducts} setActivityType={setActivityType} />;
    return <ColorActivity num={num} tableProducts={tableProducts} setActivityType={setActivityType} />;
  };

  return (
    <div className="space-y-6">
      {/* 1. Interactive quiz — always visible */}
      <EqualProductsQuiz num={num} />

      {/* 2. Reference table — all products */}
      <EqualProductsReference num={num} />

      {/* 3. Practice activities */}
      <div className="border-t-2 border-dashed border-sky-200 pt-4">
        <p className="text-center text-sm font-bold text-sky-600 mb-3">
          {language === 'ar' ? '🎮 أنشطة تدريبية إضافية' : '🎮 Extra Practice Activities'}
        </p>
        <ActivityComponent />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ACTIVITY 1: MATCH - Select all equations with the same result
// ═══════════════════════════════════════════════════════════

function MatchActivity({ num, tableProducts, setActivityType }: { num: number; tableProducts: { product: number; pairs: [number, number][] }[]; setActivityType: (a: any) => void }) {
  const { numberSystem, language } = useSettings();
  const { addStars } = useStudent();

  // Pick a random valid product
  const [productIdx, setProductIdx] = useState(() => Math.floor(Math.random() * tableProducts.length));
  const current = tableProducts[productIdx];
  const target = current.product;
  const correctPairs = current.pairs;

  // Generate options: correct pairs + distractors
  const [options, setOptions] = useState<[number, number][]>(() => {
    const opts = [...correctPairs];
    // Add distractors that DON'T equal the target
    while (opts.length < Math.max(6, correctPairs.length + 2)) {
      const a = Math.floor(Math.random() * 11) + 2;
      const b = Math.floor(Math.random() * 11) + 2;
      if (a * b !== target && !opts.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) {
        opts.push([a, b]);
      }
    }
    return opts.sort(() => Math.random() - 0.5);
  });

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const correctIdxs = options.reduce((acc, [a, b], i) => {
    if (a * b === target) acc.push(i);
    return acc;
  }, [] as number[]);

  const check = () => {
    setChecked(true);
    const allCorrect = correctIdxs.every(i => selected.has(i)) && Array.from(selected).every(i => correctIdxs.includes(i));
    if (allCorrect) {
      addStars(correctIdxs.length);
      setScore(s => s + correctIdxs.length);
    }
  };

  const next = () => {
    const newIdx = Math.floor(Math.random() * tableProducts.length);
    setProductIdx(newIdx);
    const newProduct = tableProducts[newIdx];
    const newOpts = [...newProduct.pairs];
    while (newOpts.length < Math.max(6, newProduct.pairs.length + 2)) {
      const a = Math.floor(Math.random() * 11) + 2;
      const b = Math.floor(Math.random() * 11) + 2;
      if (a * b !== newProduct.product && !newOpts.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) {
        newOpts.push([a, b]);
      }
    }
    setOptions(newOpts.sort(() => Math.random() - 0.5));
    setSelected(new Set());
    setChecked(false);
  };

  return (
    <div className="space-y-4">
      <ActivityTabBar current="match" onSwitch={setActivityType} />
      <ReferencePanel num={num} tableProducts={tableProducts} />

      <div className="bg-white rounded-3xl shadow-xl border-2 border-fuchsia-200 overflow-hidden">
        <div className="bg-gradient-to-r from-fuchsia-400 to-pink-500 text-white p-5 text-center">
          <h3 className="text-xl font-black">🎯 {language === 'ar' ? 'مطابقة النتائج' : 'Match Equal Products'}</h3>
          <p className="text-white/80 text-sm mt-1">{language === 'ar' ? 'اختر كل المعادلات التي ناتجها:' : 'Select all equations equal to:'}</p>
          <div className="text-5xl font-black mt-2">{formatNum(target, numberSystem)}</div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {options.map(([a, b], i) => {
              const isCorrect = a * b === target;
              const isSelected = selected.has(i);
              let styling = 'border-fuchsia-200 bg-white text-fuchsia-700 hover:border-fuchsia-400';
              if (checked) {
                if (isCorrect && isSelected) styling = 'border-green-400 bg-green-50 text-green-700';
                else if (isCorrect && !isSelected) styling = 'border-yellow-400 border-dashed bg-yellow-50 text-yellow-700';
                else if (!isCorrect && isSelected) styling = 'border-red-300 bg-red-50 text-red-600';
                else styling = 'border-gray-200 bg-gray-50 text-gray-400';
              } else if (isSelected) styling = 'border-fuchsia-500 bg-fuchsia-100 text-fuchsia-700 scale-105';
              return (
                <button key={i} onClick={() => { if (!checked) setSelected(s => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; }); }}
                  className={`py-4 rounded-2xl border-2 font-black text-xl transition-all ${styling}`}>
                  {formatNum(a, numberSystem)} × {formatNum(b, numberSystem)}
                </button>
              );
            })}
          </div>

          {!checked ? (
            <button onClick={check} disabled={selected.size === 0} className="w-full mt-4 bg-fuchsia-500 text-white font-black py-3 rounded-xl hover:bg-fuchsia-600 disabled:opacity-50">
              {language === 'ar' ? 'تحقق' : 'Check'}
            </button>
          ) : (
            <button onClick={next} className="w-full mt-4 bg-green-500 text-white font-black py-3 rounded-xl hover:bg-green-600 flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> {language === 'ar' ? 'التالي' : 'Next'}
            </button>
          )}
        </div>

        <div className="bg-sky-50 border-t px-5 py-3 text-center">
          <span className="text-sm font-bold text-fuchsia-600">{language === 'ar' ? 'النقاط' : 'Score'}: {score}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ACTIVITY 2: FIND PARTNER - Given equation, find another equal
// ═══════════════════════════════════════════════════════════

function PartnerActivity({ num, tableProducts, setActivityType }: { num: number; tableProducts: { product: number; pairs: [number, number][] }[]; setActivityType: (a: any) => void }) {
  const { numberSystem, language } = useSettings();
  const { addStars } = useStudent();

  const [productIdx, setProductIdx] = useState(() => Math.floor(Math.random() * tableProducts.length));
  const current = tableProducts[productIdx];
  const target = current.product;
  const pairs = current.pairs;

  // Pick one equation as the "given" one
  const [givenPairIdx, setGivenPairIdx] = useState(() => Math.floor(Math.random() * pairs.length));
  const givenPair = pairs[givenPairIdx];

  // Other correct answers (all pairs except the given one)
  const correctAnswers = pairs.filter((_, i) => i !== givenPairIdx);

  // Options: correct answers + distractors
  const [options, setOptions] = useState<[number, number][]>(() => {
    const opts = [...correctAnswers];
    while (opts.length < 4) {
      const a = Math.floor(Math.random() * 11) + 2;
      const b = Math.floor(Math.random() * 11) + 2;
      if (a * b !== target && !opts.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) {
        opts.push([a, b]);
      }
    }
    return opts.sort(() => Math.random() - 0.5);
  });

  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const check = () => {
    if (selected === null) return;
    setChecked(true);
    const [a, b] = options[selected];
    if (a * b === target) {
      addStars(1);
      setScore(s => s + 1);
    }
  };

  const next = () => {
    const newIdx = Math.floor(Math.random() * tableProducts.length);
    const newProduct = tableProducts[newIdx];
    const newGivenIdx = Math.floor(Math.random() * newProduct.pairs.length);
    setProductIdx(newIdx);
    setGivenPairIdx(newGivenIdx);

    const newCorrect = newProduct.pairs.filter((_, i) => i !== newGivenIdx);
    const newOpts = [...newCorrect];
    while (newOpts.length < 4) {
      const a = Math.floor(Math.random() * 11) + 2;
      const b = Math.floor(Math.random() * 11) + 2;
      if (a * b !== newProduct.product && !newOpts.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) {
        newOpts.push([a, b]);
      }
    }
    setOptions(newOpts.sort(() => Math.random() - 0.5));
    setSelected(null);
    setChecked(false);
  };

  return (
    <div className="space-y-4">
      <ActivityTabBar current="partner" onSwitch={setActivityType} />
      <ReferencePanel num={num} tableProducts={tableProducts} />

      <div className="bg-white rounded-3xl shadow-xl border-2 border-emerald-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white p-5 text-center">
          <h3 className="text-xl font-black">🔍 {language === 'ar' ? 'جد الشريك' : 'Find the Partner'}</h3>
          <p className="text-white/80 text-sm mt-1">{language === 'ar' ? 'هذه المعادلة تساوي' : 'This equation equals'} {formatNum(target, numberSystem)}. {language === 'ar' ? 'جد معادلة أخرى بنفس الناتج' : 'Find another with the same result.'}</p>
        </div>

        <div className="p-5">
          {/* Given equation */}
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 mb-4 text-center">
            <div className="text-3xl font-black text-emerald-700">
              {formatNum(givenPair[0], numberSystem)} × {formatNum(givenPair[1], numberSystem)} = {formatNum(target, numberSystem)}
            </div>
          </div>

          <p className="text-center text-gray-500 font-bold mb-3">{language === 'ar' ? 'اختر معادلة أخرى تساوي نفس الناتج:' : 'Select another equation with the same result:'}</p>

          <div className="grid grid-cols-2 gap-3">
            {options.map(([a, b], i) => {
              const isCorrect = a * b === target;
              const isSelected = selected === i;
              let styling = 'border-emerald-200 bg-white text-emerald-700 hover:border-emerald-400';
              if (checked) {
                if (isCorrect) styling = 'border-green-400 bg-green-50 text-green-700';
                else if (isSelected) styling = 'border-red-300 bg-red-50 text-red-600';
                else styling = 'border-gray-200 bg-gray-50 text-gray-400';
              } else if (isSelected) styling = 'border-emerald-500 bg-emerald-100 text-emerald-700';
              return (
                <button key={i} onClick={() => { if (!checked) setSelected(i); }}
                  className={`py-4 rounded-2xl border-2 font-black text-xl transition-all ${styling}`}>
                  {formatNum(a, numberSystem)} × {formatNum(b, numberSystem)}
                </button>
              );
            })}
          </div>

          {!checked ? (
            <button onClick={check} disabled={selected === null} className="w-full mt-4 bg-emerald-500 text-white font-black py-3 rounded-xl hover:bg-emerald-600 disabled:opacity-50">
              {language === 'ar' ? 'تحقق' : 'Check'}
            </button>
          ) : (
            <button onClick={next} className="w-full mt-4 bg-green-500 text-white font-black py-3 rounded-xl hover:bg-green-600 flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> {language === 'ar' ? 'التالي' : 'Next'}
            </button>
          )}
        </div>

        <div className="bg-emerald-50 border-t px-5 py-3 text-center">
          <span className="text-sm font-bold text-emerald-600">{language === 'ar' ? 'النقاط' : 'Score'}: {score}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ACTIVITY 3: COMPLETE THE GROUP - Fill in the missing equation
// ═══════════════════════════════════════════════════════════

function CompleteActivity({ num, tableProducts, setActivityType }: { num: number; tableProducts: { product: number; pairs: [number, number][] }[]; setActivityType: (a: any) => void }) {
  const { numberSystem, language } = useSettings();
  const { addStars } = useStudent();

  // Pick a product with at least 3 pairs for this activity, fallback to products with 2 pairs
  const validProducts = tableProducts.filter(p => p.pairs.length >= 3);
  const fallbackProducts = tableProducts.filter(p => p.pairs.length >= 2);
  const productsToUse = validProducts.length > 0 ? validProducts : fallbackProducts;

  // Handle empty case
  if (productsToUse.length === 0) {
    return (
      <div className="space-y-4">
        <ActivityTabBar current="complete" onSwitch={setActivityType} />
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 text-center">
          <p className="text-amber-700 font-bold">لا توجد منتجات كافية لهذا النشاط في هذا الجدول.</p>
        </div>
      </div>
    );
  }

  const [productIdx, setProductIdx] = useState(() => Math.floor(Math.random() * productsToUse.length));
  const current = productsToUse[productIdx];
  const target = current.product;
  const allPairs = current.pairs;

  // Show some, hide one (only if we have 2+ pairs)
  const [hiddenIdx, setHiddenIdx] = useState(() => Math.floor(Math.random() * allPairs.length));
  const shownPairs = allPairs.filter((_, i) => i !== hiddenIdx);
  const hiddenPair = allPairs[hiddenIdx];

  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const check = () => {
    setChecked(true);
    const a = parseInt(answer1);
    const b = parseInt(answer2);
    // Accept any valid a×b = target (not just the specific hidden pair)
    if (!isNaN(a) && !isNaN(b) && a >= 1 && b >= 1 && a * b === target) {
      addStars(2);
      setScore(s => s + 2);
    }
  };

  const next = () => {
    const newIdx = Math.floor(Math.random() * productsToUse.length);
    const newProduct = productsToUse[newIdx];
    const newHidden = Math.floor(Math.random() * newProduct.pairs.length);
    setProductIdx(newIdx);
    setHiddenIdx(newHidden);
    setAnswer1('');
    setAnswer2('');
    setChecked(false);
  };

  if (!current || !hiddenPair) return null;

  return (
    <div className="space-y-4">
      <ActivityTabBar current="complete" onSwitch={setActivityType} />
      <ReferencePanel num={num} tableProducts={tableProducts} />

      <div className="bg-white rounded-3xl shadow-xl border-2 border-violet-200 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-400 to-purple-500 text-white p-5 text-center">
          <h3 className="text-xl font-black">📝 {language === 'ar' ? 'أكمل المجموعة' : 'Complete the Group'}</h3>
          <p className="text-white/80 text-sm mt-1">{language === 'ar' ? 'املأ الفراغ بمعادلة تساوي نفس الناتج' : 'Fill in with an equation that equals the same result'}</p>
        </div>

        <div className="p-5">
          {/* Target product display */}
          <div className="bg-violet-50 border-2 border-violet-300 rounded-2xl p-4 mb-4 text-center">
            <div className="text-5xl font-black text-violet-700">{formatNum(target, numberSystem)}</div>
          </div>

          {/* Shown equations */}
          <div className="space-y-2 mb-4">
            {shownPairs.map(([a, b], i) => (
              <div key={i} className="bg-green-50 border-2 border-green-300 rounded-xl p-3 text-center">
                <span className="text-xl font-black text-green-700">
                  {formatNum(a, numberSystem)} × {formatNum(b, numberSystem)} = {formatNum(target, numberSystem)}
                </span>
              </div>
            ))}
          </div>

          {/* Hidden equation input */}
          {!checked ? (
            <div className="bg-violet-50 border-2 border-dashed border-violet-400 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2">
                <input type="text" value={answer1} onChange={e => setAnswer1(e.target.value)}
                  className="w-14 text-center text-2xl font-black border-2 border-violet-300 rounded-lg py-2 focus:outline-none focus:border-violet-500"
                  placeholder="؟" maxLength={2} />
                <span className="text-2xl font-black text-violet-600">×</span>
                <input type="text" value={answer2} onChange={e => setAnswer2(e.target.value)}
                  className="w-14 text-center text-2xl font-black border-2 border-violet-300 rounded-lg py-2 focus:outline-none focus:border-violet-500"
                  placeholder="؟" maxLength={2} />
                <span className="text-2xl font-black text-violet-600">= {formatNum(target, numberSystem)}</span>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
              <span className="text-xl font-black text-green-700">
                {formatNum(hiddenPair[0], numberSystem)} × {formatNum(hiddenPair[1], numberSystem)} = {formatNum(target, numberSystem)}
              </span>
            </div>
          )}

          {!checked ? (
            <button onClick={check} disabled={!answer1 || !answer2} className="w-full mt-4 bg-violet-500 text-white font-black py-3 rounded-xl hover:bg-violet-600 disabled:opacity-50">
              {language === 'ar' ? 'تحقق' : 'Check'}
            </button>
          ) : (
            <button onClick={next} className="w-full mt-4 bg-green-500 text-white font-black py-3 rounded-xl hover:bg-green-600 flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> {language === 'ar' ? 'التالي' : 'Next'}
            </button>
          )}
        </div>

        <div className="bg-violet-50 border-t px-5 py-3 text-center">
          <span className="text-sm font-bold text-violet-600">{language === 'ar' ? 'النقاط' : 'Score'}: {score}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ACTIVITY 4: GROUP EQUATIONS - Sort equations by product
// Validation is ALWAYS result-based: a * b === targetGroupProduct
// ═══════════════════════════════════════════════════════════

function DragDropActivity({ num, tableProducts, setActivityType }: { num: number; tableProducts: { product: number; pairs: [number, number][] }[]; setActivityType: (a: any) => void }) {
  const { numberSystem, language } = useSettings();
  const { addStars } = useStudent();

  // Select 2–3 products to sort (stable across renders)
  const [products] = useState(() => {
    const shuffled = [...tableProducts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(3, shuffled.length));
  });

  // All equations from these products — id is unique per equation
  const [allEquations] = useState(() =>
    products.flatMap(p =>
      p.pairs.map(([a, b]) => ({
        correctProduct: p.product, // the REAL result: a * b === correctProduct
        a,
        b,
        id: `${a}x${b}_${p.product}`,
      }))
    ).sort(() => Math.random() - 0.5)
  );

  // placed: equationId → the product bucket the user dropped it into
  const [placed, setPlaced] = useState<Record<string, number>>({});
  // selectedEq: the equation the user clicked first (waiting to pick a bucket)
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [wrongPlacement, setWrongPlacement] = useState<string | null>(null); // warning flash
  const [score, setScore] = useState(0);

  const remaining = allEquations.filter(eq => !placed[eq.id]);

  // Step 1: user selects an unplaced equation
  const handleEquationClick = (eqId: string) => {
    if (checked) return;
    setSelectedEqId(prev => prev === eqId ? null : eqId);
    setWrongPlacement(null);
  };

  // Step 2: user selects a target bucket
  // Validation: eq.a * eq.b must equal targetProduct
  const handleBucketClick = (targetProduct: number) => {
    if (checked || !selectedEqId) return;
    const eq = allEquations.find(e => e.id === selectedEqId);
    if (!eq) return;

    const actualResult = eq.a * eq.b;

    if (actualResult === targetProduct) {
      // Correct group — place it
      setPlaced(prev => ({ ...prev, [eq.id]: targetProduct }));
      setSelectedEqId(null);
      setWrongPlacement(null);
    } else {
      // Wrong group — flash warning, don't place
      setWrongPlacement(selectedEqId);
      setTimeout(() => setWrongPlacement(null), 1200);
    }
  };

  // Remove from a bucket by clicking a placed equation
  const handleRemovePlaced = (eqId: string) => {
    if (checked) return;
    setPlaced(prev => {
      const next = { ...prev };
      delete next[eqId];
      return next;
    });
    setSelectedEqId(null);
  };

  const check = () => {
    setChecked(true);
    let correct = 0;
    for (const eq of allEquations) {
      // Result-based validation: the placed product must equal eq.a * eq.b
      if (placed[eq.id] === eq.a * eq.b) correct++;
    }
    addStars(correct);
    setScore(s => s + correct);
  };

  const reset = () => {
    setPlaced({});
    setChecked(false);
    setSelectedEqId(null);
    setWrongPlacement(null);
  };

  return (
    <div className="space-y-4">
      <ActivityTabBar current="dragdrop" onSwitch={setActivityType} />
      <ReferencePanel num={num} tableProducts={tableProducts} />

      <div className="bg-white rounded-3xl shadow-xl border-2 border-amber-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white p-5 text-center">
          <h3 className="text-xl font-black">📦 {language === 'ar' ? 'تجميع المعادلات' : 'Group the Equations'}</h3>
          <p className="text-white/80 text-sm mt-1">
            {language === 'ar'
              ? 'اختر معادلة، ثم اضغط على المجموعة الصحيحة لها'
              : 'Select an equation, then tap the correct group for it'}
          </p>
        </div>

        <div className="p-5">
          {/* Instructions when an equation is selected */}
          {selectedEqId && !checked && (
            <div className="bg-sky-50 border-2 border-sky-300 rounded-xl p-3 mb-3 text-center text-sky-700 font-bold text-sm animate-pulse">
              {language === 'ar' ? '👇 الآن اختر المجموعة الصحيحة أدناه' : '👇 Now tap the correct group below'}
            </div>
          )}

          {/* Wrong placement warning */}
          {wrongPlacement && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 mb-3 text-center text-red-700 font-bold text-sm">
              {language === 'ar' ? '❌ هذه المعادلة لا تنتمي لهذه المجموعة!' : '❌ This equation does not belong to this group!'}
            </div>
          )}

          {/* Product buckets — clicking a bucket places the selected equation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {products.map(p => {
              const isTarget = selectedEqId !== null && !checked;
              return (
                <div
                  key={p.product}
                  onClick={() => handleBucketClick(p.product)}
                  className={`border-2 border-dashed rounded-2xl p-3 min-h-[110px] transition-all ${
                    isTarget
                      ? 'border-amber-500 bg-amber-100 cursor-pointer shadow-md scale-[1.02]'
                      : 'border-amber-300 bg-amber-50'
                  }`}
                >
                  <div className="text-3xl font-black text-amber-700 text-center mb-2">
                    {formatNum(p.product, numberSystem)}
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center min-h-[40px]">
                    {allEquations
                      .filter(eq => placed[eq.id] === p.product)
                      .map(eq => {
                        const isCorrect = eq.a * eq.b === placed[eq.id];
                        return (
                          <button
                            key={eq.id}
                            onClick={e => { e.stopPropagation(); handleRemovePlaced(eq.id); }}
                            className={`text-sm font-bold px-2 py-1 rounded-lg transition-all ${
                              checked
                                ? isCorrect
                                  ? 'bg-green-100 text-green-700 border border-green-300'
                                  : 'bg-red-100 text-red-600 border border-red-300'
                                : 'bg-sky-100 text-sky-700 border border-sky-300 hover:bg-red-50 hover:border-red-300'
                            }`}
                          >
                            {formatNum(eq.a, numberSystem)} × {formatNum(eq.b, numberSystem)}
                            {!checked && <span className="ml-1 text-xs opacity-60">✕</span>}
                          </button>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unplaced equations bank */}
          {!checked && remaining.length > 0 && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
              <p className="text-center text-gray-500 text-sm font-bold mb-3">
                {language === 'ar'
                  ? 'اضغط على معادلة لتحديدها، ثم اضغط على مجموعتها'
                  : 'Tap an equation to select it, then tap its group above'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {remaining.map(eq => {
                  const isSelected = selectedEqId === eq.id;
                  const isWrong = wrongPlacement === eq.id;
                  return (
                    <button
                      key={eq.id}
                      onClick={() => handleEquationClick(eq.id)}
                      className={`border-2 rounded-xl px-3 py-2 font-bold transition-all text-base ${
                        isWrong
                          ? 'bg-red-100 border-red-400 text-red-700 animate-bounce'
                          : isSelected
                          ? 'bg-sky-500 border-sky-600 text-white shadow-lg scale-105'
                          : 'bg-white border-sky-300 text-sky-700 hover:bg-sky-50'
                      }`}
                    >
                      {formatNum(eq.a, numberSystem)} × {formatNum(eq.b, numberSystem)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Result after checking */}
          {checked && (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">{score === allEquations.length ? '🏆' : '⭐'}</div>
              <p className={`font-black text-lg ${score === allEquations.length ? 'text-green-600' : 'text-amber-600'}`}>
                {language === 'ar'
                  ? `${formatNum(score, numberSystem)} من ${formatNum(allEquations.length, numberSystem)} صحيحة`
                  : `${formatNum(score, numberSystem)} of ${formatNum(allEquations.length, numberSystem)} correct`}
              </p>
            </div>
          )}

          {!checked ? (
            <button
              onClick={check}
              disabled={Object.keys(placed).length !== allEquations.length}
              className="w-full mt-4 bg-amber-500 text-white font-black py-3 rounded-xl hover:bg-amber-600 disabled:opacity-50"
            >
              {language === 'ar' ? 'تحقق من الإجابات' : 'Check Answers'}
            </button>
          ) : (
            <button
              onClick={reset}
              className="w-full mt-4 bg-green-500 text-white font-black py-3 rounded-xl hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> {language === 'ar' ? 'محاولة جديدة' : 'Try Again'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ACTIVITY 5: COLOR MATCHING - Same color = same product
// ═══════════════════════════════════════════════════════════

function ColorActivity({ num, tableProducts, setActivityType }: { num: number; tableProducts: { product: number; pairs: [number, number][] }[]; setActivityType: (a: any) => void }) {
  const { numberSystem, language } = useSettings();
  const { addStars } = useStudent();

  const COLORS = ['bg-red-100 border-red-400 text-red-700', 'bg-blue-100 border-blue-400 text-blue-700', 'bg-green-100 border-green-400 text-green-700', 'bg-yellow-100 border-yellow-400 text-yellow-700', 'bg-purple-100 border-purple-400 text-purple-700'];
  const COLOR_NAMES = ['🔴', '🔵', '🟢', '🟡', '🟣'];

  // Select products
  const [products] = useState(() => {
    const shuffled = [...tableProducts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(3, shuffled.length));
  });

  // All equations mixed
  const [equations] = useState(() => {
    const eqs = products.flatMap((p, pIdx) =>
      p.pairs.map(([a, b]) => ({ product: p.product, a, b, id: `${a}x${b}-${p.product}`, correctColor: pIdx }))
    );
    return eqs.sort(() => Math.random() - 0.5);
  });

  const [colors, setColors] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const check = () => {
    setChecked(true);
    let correct = 0;
    for (const eq of equations) {
      if (colors[eq.id] === eq.correctColor) correct++;
    }
    addStars(correct);
    setScore(s => s + correct);
  };

  const reset = () => {
    setColors({});
    setChecked(false);
  };

  return (
    <div className="space-y-4">
      <ActivityTabBar current="color" onSwitch={setActivityType} />
      <ReferencePanel num={num} tableProducts={tableProducts} />

      <div className="bg-white rounded-3xl shadow-xl border-2 border-pink-200 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-400 to-rose-500 text-white p-5 text-center">
          <h3 className="text-xl font-black">🎨 {language === 'ar' ? 'مطابقة الألوان' : 'Color Matching'}</h3>
          <p className="text-white/80 text-sm mt-1">{language === 'ar' ? 'أعطِ كل معادلة اللون الذي يناسب ناتجها' : 'Give each equation the color matching its result'}</p>
        </div>

        <div className="p-5">
          {/* Color legend */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {products.map((p, i) => (
              <div key={p.product} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${COLORS[i]}`}>
                <span className="text-lg">{COLOR_NAMES[i]}</span>
                <span className="font-black">{formatNum(p.product, numberSystem)}</span>
              </div>
            ))}
          </div>

          {/* Equations with color buttons */}
          <div className="space-y-2">
            {equations.map(eq => {
              const assignedColor = colors[eq.id];
              const isCorrect = assignedColor === eq.correctColor;
              return (
                <div key={eq.id} className={`flex items-center gap-2 p-2 rounded-xl ${checked ? (isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300') : 'bg-gray-50 border-2 border-gray-200'}`}>
                  <span className="flex-1 font-black text-lg">
                    {formatNum(eq.a, numberSystem)} × {formatNum(eq.b, numberSystem)} = ?
                  </span>
                  <div className="flex gap-1">
                    {products.map((_, colorIdx) => (
                      <button key={colorIdx}
                        onClick={() => { if (!checked) setColors(prev => ({ ...prev, [eq.id]: colorIdx })); }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          assignedColor === colorIdx ? `ring-2 ring-offset-2 ${COLORS[colorIdx]}` : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                        } ${checked ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {COLOR_NAMES[colorIdx]}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {!checked ? (
            <button onClick={check} disabled={Object.keys(colors).length !== equations.length} className="w-full mt-4 bg-pink-500 text-white font-black py-3 rounded-xl hover:bg-pink-600 disabled:opacity-50">
              {language === 'ar' ? 'تحقق' : 'Check'}
            </button>
          ) : (
            <button onClick={reset} className="w-full mt-4 bg-green-500 text-white font-black py-3 rounded-xl hover:bg-green-600 flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> {language === 'ar' ? 'محاولة جديدة' : 'Try Again'}
            </button>
          )}
        </div>

        <div className="bg-pink-50 border-t px-5 py-3 text-center">
          <span className="text-sm font-bold text-pink-600">{language === 'ar' ? 'النقاط' : 'Score'}: {score} / {equations.length}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════

function ActivityTabBar({ current, onSwitch }: { current: string; onSwitch: (id: any) => void }) {
  const activities = [
    { id: 'match', label: 'مطابقة', icon: '🎯' },
    { id: 'partner', label: 'الشريك', icon: '🔍' },
    { id: 'complete', label: 'أكمل', icon: '📝' },
    { id: 'dragdrop', label: 'تجميع', icon: '📦' },
    { id: 'color', label: 'ألوان', icon: '🎨' },
  ];

  return (
    <div className="flex gap-1 bg-sky-100 rounded-2xl p-1 overflow-x-auto">
      {activities.map(a => (
        <button key={a.id} onClick={() => onSwitch(a.id)}
          className={`flex-1 min-w-[60px] py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${current === a.id ? 'bg-white shadow-md text-sky-700' : 'text-gray-600 hover:bg-sky-50'}`}>
          {a.icon} <span className="hidden sm:inline">{a.label}</span>
        </button>
      ))}
    </div>
  );
}

function ReferencePanel({ num, tableProducts }: { num: number; tableProducts: { product: number; pairs: [number, number][] }[] }) {
  const { numberSystem, language } = useSettings();

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
      <h4 className="font-black text-amber-700 mb-3 text-sm flex items-center gap-2">
        📌 {language === 'ar' ? 'النتائج المتشابهة في جدول' : 'Equal Products in Table'} {formatNum(num, numberSystem)}
      </h4>
      <div className="space-y-2">
        {tableProducts.slice(0, 5).map(({ product, pairs }) => (
          <div key={product} className="flex items-center gap-2 flex-wrap">
            <span className="bg-amber-200 text-amber-800 text-sm font-black px-2 py-0.5 rounded-lg min-w-[40px] text-center">
              {formatNum(product, numberSystem)}
            </span>
            <span className="text-gray-400">=</span>
            <div className="flex flex-wrap gap-1">
              {pairs.map(([a, b], i) => (
                <span key={i} className="bg-white text-sky-700 text-xs font-bold px-1.5 py-0.5 rounded border border-sky-200">
                  {formatNum(a, numberSystem)} × {formatNum(b, numberSystem)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 8: QUIZ
// ═══════════════════════════════════════════════════════════

function QuizSection({ num, onPass }: { num: number; onPass: () => void }) {
  const { numberSystem, language } = useSettings();
  const { updateTableProgress, addStars } = useStudent();
  const [quizType, setQuizType] = useState<'multiple' | 'truefalse' | 'fill'>('multiple');
  const [questions] = useState(() => Array.from({ length: 10 }, (_, i) => {
    const b = i + 1; const r = num * b;
    return { q: `${num} × ${b}`, answer: r, choices: generateChoices(r) };
  }));
  const [idx, setIdx] = useState(0);
  const [fillAnswer, setFillAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [tfShown, setTfShown] = useState(() => {
    const r = Math.random();
    if (r > 0.5) return questions[0].answer;
    return questions[0].answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
  });

  const handleMultipleChoice = (choice: number) => {
    if (feedback) return;
    const correct = choice === questions[idx].answer;
    setFeedback(correct ? 'correct' : 'wrong');
    updateTableProgress(num, correct);
    if (correct) setScore(s => s + 1);
    setTimeout(() => advance(), 1200);
  };

  const handleFill = () => {
    if (!fillAnswer.trim() || feedback) return;
    const correct = parseInt(fillAnswer) === questions[idx].answer;
    setFeedback(correct ? 'correct' : 'wrong');
    updateTableProgress(num, correct);
    if (correct) setScore(s => s + 1);
    setTimeout(() => advance(), 1200);
  };

  const handleTF = (ans: boolean) => {
    if (feedback) return;
    const isActuallyCorrect = tfShown === questions[idx].answer;
    const correct = (ans && isActuallyCorrect) || (!ans && !isActuallyCorrect);
    setFeedback(correct ? 'correct' : 'wrong');
    updateTableProgress(num, correct);
    if (correct) setScore(s => s + 1);
    setTimeout(() => advance(), 1200);
  };

  const advance = () => {
    if (idx < questions.length - 1) {
      setIdx(i => i + 1); setFillAnswer(''); setFeedback(null);
      const nextAnswer = questions[idx + 1].answer;
      if (Math.random() > 0.5) {
        setTfShown(nextAnswer);
      } else {
        setTfShown(nextAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1));
      }
    } else { setDone(true); addStars(score); }
  };

  useEffect(() => { if (done && score >= 8) onPass(); }, [done]);

  if (done) {
    const passed = score >= 8;
    return (
      <div className="text-center py-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-7xl mb-4">{passed ? '🏆' : score >= 5 ? '⭐' : '💪'}</motion.div>
        <h2 className="text-3xl font-black text-sky-700 mb-2">{passed ? 'أحسنت! تجاوزت الاختبار!' : 'انتهى الاختبار'}</h2>
        <p className="text-xl font-bold text-gray-600 mb-2">{formatNum(score, numberSystem)} / {formatNum(10, numberSystem)}</p>
        <p className={`text-sm font-bold ${passed ? 'text-green-600' : 'text-red-500'}`}>{passed ? '✅ نجحت! (80%+ مطلوب)' : '❌ تحتاج 80% - حاول مرة أخرى!'}</p>
        <button onClick={() => { setIdx(0); setScore(0); setDone(false); setFeedback(null); setFillAnswer(''); }}
          className="mt-4 bg-sky-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-sky-600 flex items-center gap-2 mx-auto"><RotateCcw className="w-4 h-4" /> حاول مرة أخرى</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 bg-sky-100 rounded-2xl p-1">
        {[{ id: 'multiple' as const, l: 'اختيار متعدد' }, { id: 'truefalse' as const, l: 'صواب/خطأ' }, { id: 'fill' as const, l: 'أكمل الفراغ' }].map(t => (
          <button key={t.id} onClick={() => setQuizType(t.id)} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${quizType === t.id ? 'bg-white shadow-md text-sky-700' : 'text-gray-600'}`}>{t.l}</button>
        ))}
      </div>
      <div className="flex items-center justify-between mb-2 text-sm font-bold"><span className="text-gray-500">{formatNum(idx + 1, numberSystem)} / {formatNum(10, numberSystem)}</span><span className="text-yellow-600 flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400" />{formatNum(score, numberSystem)}</span></div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-4"><div className="h-full bg-sky-400 rounded-full transition-all" style={{ width: `${(idx / 10) * 100}%` }} /></div>
      <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        {quizType === 'multiple' && (
          <>
            <div className="text-4xl md:text-5xl font-black text-sky-700 text-center mb-6">{formatEquation(num, idx + 1, NaN, numberSystem).replace(/NaN/, '?')}</div>
            <div className="grid grid-cols-2 gap-3">
              {questions[idx].choices.map(c => (
                <motion.button key={c} whileTap={{ scale: 0.95 }} onClick={() => handleMultipleChoice(c)}
                  className={`py-5 text-2xl font-black rounded-2xl border-2 transition-all ${feedback === null ? 'bg-white border-sky-200 text-sky-700 hover:bg-sky-50' : c === questions[idx].answer ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-50 border-red-200 text-red-300'}`}>
                  {formatNum(c, numberSystem)}
                </motion.button>
              ))}
            </div>
          </>
        )}
        {quizType === 'truefalse' && (
          <>
            <div className="text-4xl font-black text-sky-700 text-center mb-6">{formatNum(num, numberSystem)} × {formatNum(idx + 1, numberSystem)} = {formatNum(tfShown, numberSystem)}</div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleTF(true)} className="py-8 text-2xl font-black rounded-2xl bg-green-500 text-white hover:bg-green-600 shadow-md hover:scale-105 transition-all">✅ صواب</button>
              <button onClick={() => handleTF(false)} className="py-8 text-2xl font-black rounded-2xl bg-red-500 text-white hover:bg-red-600 shadow-md hover:scale-105 transition-all">❌ خطأ</button>
            </div>
          </>
        )}
        {quizType === 'fill' && (
          <>
            <div className="text-4xl md:text-5xl font-black text-sky-700 text-center mb-6">{formatEquation(num, idx + 1, NaN, numberSystem).replace(/NaN/, '?')}</div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input type="text" value={fillAnswer} onChange={e => setFillAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleFill()} placeholder="؟" inputMode="numeric"
                className={`flex-1 text-center text-3xl font-black border-2 rounded-xl py-3 focus:outline-none min-w-0 ${feedback === 'correct' ? 'border-green-400 bg-green-50 text-green-700' : feedback === 'wrong' ? 'border-red-300 bg-red-50 text-red-600' : 'border-sky-300 focus:border-sky-500'}`} />
              <button onClick={handleFill} className="bg-sky-500 text-white font-black py-3 px-6 rounded-xl hover:bg-sky-600 flex-shrink-0">✓</button>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-3">
              {[1,2,3,4,5,6,7,8,9,0].map(n => (
                <button key={n} onClick={() => setFillAnswer(a => a + n)} className="bg-sky-50 border border-sky-200 text-sky-700 font-black rounded-lg py-2 text-lg hover:bg-sky-100">{formatNum(n, numberSystem)}</button>
              ))}
            </div>
          </>
        )}
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className={`mt-4 text-center py-3 rounded-xl font-black text-lg ${feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {feedback === 'correct' ? '✅ ممتاز!' : `❌ ${formatNum(questions[idx].answer, numberSystem)}`}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 9: WORKSHEET EXPORT (7 types + PDF/PNG/JPG/DOCX + Package)
// ═══════════════════════════════════════════════════════════

const WS_TYPES = [
  { id: 'writing', label: 'تدريب كتابة جدول الضرب', labelEn: 'Writing Practice', icon: '✏️' },
  { id: 'addition', label: 'الجمع المتكرر', labelEn: 'Repeated Addition', icon: '➕' },
  { id: 'commutative', label: 'خاصية الإبدال', labelEn: 'Commutative', icon: '🔄' },
  { id: 'division', label: 'الضرب والقسمة', labelEn: 'Multiply & Divide', icon: '➗' },
  { id: 'equal', label: 'النتائج المتشابهة', labelEn: 'Equal Products', icon: '🎯' },
  { id: 'mixed', label: 'مراجعة شاملة', labelEn: 'Mixed Review', icon: '📋' },
  { id: 'assessment', label: 'اختبار نهائي', labelEn: 'Final Assessment', icon: '📝' },
];

// A4 at 96dpi in pixels (used for html2canvas render)
const A4_PX_W = 794;
const A4_PX_H = 1123;
// A4 in mm for jsPDF
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

function ExportSection({ num }: { num: number }) {
  const { numberSystem, language } = useSettings();
  const [wsType, setWsType] = useState('writing');
  const [exporting, setExporting] = useState(false);
  const facts = Array.from({ length: 12 }, (_, i) => ({ b: i + 1, result: num * (i + 1) }));

  // Generate full A4 HTML content for worksheet
  const createA4WorksheetHTML = (type: string, tableNum: number): string => {
    const title = WS_TYPES.find(t => t.id === type)?.label || 'ورقة عمل';
    const tableFacts = Array.from({ length: 12 }, (_, i) => ({ b: i + 1, result: tableNum * (i + 1) }));

    let content = '';
    if (type === 'writing') {
      content = tableFacts.map((f, i) => `
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #38bdf8; border-radius: 16px; padding: 16px 20px; margin-bottom: 12px;">
          <div style="font-size: 26px; font-weight: 900; color: #0369a1; margin-bottom: 10px; text-align: center;">
            ${i + 1}.&nbsp; ${formatNum(tableNum, numberSystem)} &times; ${formatNum(f.b, numberSystem)} = ${formatNum(f.result, numberSystem)}
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${[1, 2].map(() => `
              <div style="display: flex; align-items: center; gap: 14px;">
                <span style="font-size: 22px; font-weight: 700; color: #0284c7; white-space: nowrap;">${formatNum(tableNum, numberSystem)} &times; ${formatNum(f.b, numberSystem)} =</span>
                <div style="flex: 1; border-bottom: 3px solid #94a3b8; height: 38px;"></div>
              </div>`).join('')}
          </div>
        </div>
      `).join('');
    } else if (type === 'addition') {
      content = tableFacts.slice(0, 6).map((f, i) => {
        const addends = Array.from({ length: tableNum }, () => formatNum(f.b, numberSystem)).join(' + ');
        return `
          <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 2px solid #f59e0b; border-radius: 16px; padding: 16px; margin-bottom: 12px; text-align: center;">
            <div style="font-size: 20px; font-weight: 900; color: #92400e; margin-bottom: 10px;">${i + 1}. ${addends}</div>
            <div style="display: flex; justify-content: center; align-items: center; gap: 14px;">
              <span style="font-size: 28px; font-weight: 900; color: #d97706;">=</span>
              <div style="border: 3px dashed #f59e0b; border-radius: 12px; width: 100px; height: 40px;"></div>
            </div>
          </div>
        `;
      }).join('');
    } else if (type === 'commutative') {
      content = tableFacts.slice(0, 6).map((f, i) => `
        <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 2px solid #10b981; border-radius: 16px; padding: 14px; margin-bottom: 10px;">
          <div style="font-size: 14px; font-weight: 900; color: #065f46; margin-bottom: 8px; text-align: center;">${i + 1}. خاصية الإبدال</div>
          <div style="display: flex; justify-content: space-around; align-items: center; gap: 12px;">
            <div style="text-align: center;">
              <div style="font-size: 22px; font-weight: 900; color: #047857;">${formatNum(tableNum, numberSystem)} × ${formatNum(f.b, numberSystem)}</div>
              <div style="border-bottom: 3px solid #6b7280; width: 70px; margin: 8px auto; height: 28px;"></div>
            </div>
            <div style="font-size: 32px; color: #10b981;">⇄</div>
            <div style="text-align: center;">
              <div style="font-size: 22px; font-weight: 900; color: #047857;">${formatNum(f.b, numberSystem)} × ${formatNum(tableNum, numberSystem)}</div>
              <div style="border-bottom: 3px solid #6b7280; width: 70px; margin: 8px auto; height: 28px;"></div>
            </div>
          </div>
        </div>
      `).join('');
    } else if (type === 'division') {
      content = tableFacts.slice(0, 6).map((f, i) => `
        <div style="background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%); border: 2px solid #ea580c; border-radius: 16px; padding: 14px; margin-bottom: 10px;">
          <div style="font-size: 14px; font-weight: 900; color: #9a3412; margin-bottom: 8px; text-align: center;">${i + 1}. الضرب والقسمة</div>
          <div style="display: flex; justify-content: space-around; gap: 16px;">
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 20px; font-weight: 900; color: #c2410c;">${formatNum(f.result, numberSystem)} ÷ ${formatNum(tableNum, numberSystem)} =</div>
              <div style="border-bottom: 3px solid #6b7280; width: 50px; margin: 8px auto; height: 28px;"></div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 20px; font-weight: 900; color: #c2410c;">${formatNum(f.result, numberSystem)} ÷ ${formatNum(f.b, numberSystem)} =</div>
              <div style="border-bottom: 3px solid #6b7280; width: 50px; margin: 8px auto; height: 28px;"></div>
            </div>
          </div>
        </div>
      `).join('');
    } else if (type === 'equal') {
      // Show ALL products of the table — those with 2+ pairs are highlighted
      const allProds = getTableAllProducts(tableNum);
      content = allProds.map(({ product, pairs, multiplier }, i) => {
        const hasMultiple = pairs.length >= 2;
        const bg = hasMultiple ? 'linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
        const border = hasMultiple ? '#c026d3' : '#cbd5e1';
        const titleColor = hasMultiple ? '#86198f' : '#475569';
        return `
          <div style="background: ${bg}; border: 2px solid ${border}; border-radius: 16px; padding: 14px 18px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
              <span style="font-size: 22px; font-weight: 900; color: ${titleColor}; min-width: 80px;">${i + 1}. ${formatNum(product, numberSystem)}</span>
              <span style="font-size: 18px; color: #94a3b8;">=</span>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${pairs.map(([a, b]) => `<span style="background: white; border: 2px solid ${hasMultiple ? '#e879f9' : '#e2e8f0'}; border-radius: 8px; padding: 5px 10px; font-weight: 900; color: ${hasMultiple ? '#a21caf' : '#475569'}; font-size: 16px;">${formatNum(a, numberSystem)} × ${formatNum(b, numberSystem)}</span>`).join('')}
              </div>
              ${hasMultiple ? `<div style="flex: 1; border-bottom: 3px dashed #a855f7; min-width: 80px; height: 28px; margin-right: 8px;"></div>` : ''}
            </div>
          </div>`;
      }).join('');
    } else if (type === 'mixed') {
      content = tableFacts.map((f, i) => `
        <div style="background: ${i % 2 === 0 ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' : 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)'}; border: 2px solid ${i % 2 === 0 ? '#3b82f6' : '#ec4899'}; border-radius: 12px; padding: 12px; margin-bottom: 8px; text-align: center;">
          <span style="font-size: 18px; font-weight: 900; color: #1e40af;">${i + 1}.</span>
          <span style="font-size: 22px; font-weight: 900; color: #1f2937;">${formatNum(tableNum, numberSystem)} ×</span>
          <span style="display: inline-block; border: 3px dashed #6b7280; border-radius: 8px; width: 50px; height: 30px; vertical-align: middle;"></span>
          <span style="font-size: 22px; font-weight: 900; color: #1f2937;">= ${formatNum(f.result, numberSystem)}</span>
        </div>
      `).join('');
    } else if (type === 'assessment') {
      content = `
        <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border: 3px solid #7c3aed; border-radius: 16px; padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 20px; font-weight: 900; color: #5b21b6; text-align: center; margin-bottom: 12px;">القسم أ: أكمل الفراغ</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            ${tableFacts.slice(0, 6).map((f, i) => `<div style="font-size: 20px; font-weight: 700; color: #374151; padding: 8px; background: white; border-radius: 8px; text-align: center;">${i + 1}. ${formatNum(tableNum, numberSystem)} × ${formatNum(f.b, numberSystem)} = _______</div>`).join('')}
          </div>
        </div>
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 3px solid #d97706; border-radius: 16px; padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 20px; font-weight: 900; color: #92400e; text-align: center; margin-bottom: 12px;">القسم ب: صواب أم خطأ</div>
          ${tableFacts.slice(0, 4).map((f, i) => {
            const wrong = i % 2 === 0 ? f.result : f.result + 2;
            return `<div style="font-size: 18px; font-weight: 700; color: #374151; padding: 8px; background: white; border-radius: 8px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;"><span>${i + 7}. ${formatNum(tableNum, numberSystem)} × ${formatNum(f.b, numberSystem)} = ${formatNum(wrong, numberSystem)}</span><span style="border: 2px solid #6b7280; border-radius: 4px; padding: 3px 10px; font-size: 14px;">صواب / خطأ</span></div>`;
          }).join('')}
        </div>
        <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 3px solid #059669; border-radius: 16px; padding: 14px;">
          <div style="font-size: 20px; font-weight: 900; color: #065f46; text-align: center; margin-bottom: 12px;">القسم ج: أكمل جدول الضرب</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
            ${tableFacts.slice(0, 6).map((f, i) => `<div style="font-size: 16px; font-weight: 700; color: #374151; padding: 6px; background: white; border-radius: 8px; text-align: center;">${formatNum(tableNum, numberSystem)} × ${formatNum(f.b, numberSystem)} = ____</div>`).join('')}
          </div>
        </div>
      `;
    }

    // Free-flowing document — no height limit so content never crops.
    // html2canvas will capture the full scrollHeight, then we paginate.
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
    html, body { width: ${A4_PX_W}px; background: #ffffff; direction: rtl; }
    .page {
      width: ${A4_PX_W}px;
      min-height: ${A4_PX_H}px;
      padding: 50px 56px 60px;
      background: linear-gradient(180deg, #f0f9ff 0%, #ffffff 60%, #f0fdf4 100%);
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 55%, #7c3aed 100%);
      color: white; padding: 18px 24px; border-radius: 20px; margin-bottom: 18px;
      box-shadow: 0 6px 18px rgba(59,130,246,0.35);
    }
    .title { font-size: 30px; font-weight: 900; text-align: center; margin-bottom: 12px; }
    .info-row {
      display: flex; flex-wrap: wrap; gap: 6px 18px;
      font-size: 15px; padding: 10px 14px;
      background: rgba(255,255,255,0.18); border-radius: 12px;
    }
    .decor-bar { text-align: center; font-size: 20px; margin-bottom: 16px; opacity: 0.7; letter-spacing: 6px; }
    .content { width: 100%; }
    .footer {
      border-top: 3px dashed #93c5fd; padding-top: 10px; margin-top: 20px;
      display: flex; justify-content: space-between; font-size: 13px; color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="title">📌 ${WS_TYPES.find(t => t.id === type)?.label || 'ورقة عمل'} &mdash; جدول ${formatNum(tableNum, numberSystem)}</div>
      <div class="info-row">
        <span>📝 الاسم: _________________________</span>
        <span>👨‍🏫 المعلم/ة: _________________</span>
        <span>📅 التاريخ: ___________</span>
        <span>⭐ الدرجة: ___ / 12</span>
      </div>
    </div>
    <div class="decor-bar">⭐ 🌸 🦋 🌺 🐝 🌟 🐝 🌺 🦋 🌸 ⭐</div>
    <div class="content">${content}</div>
    <div class="footer">
      <span>🌸⭐🦋🌺🐝</span>
      <span style="font-weight:900;color:#3b82f6;font-size:15px;">مملكة جدول الضرب</span>
      <span>🐝🌺🦋⭐🌸</span>
    </div>
  </div>
</body>
</html>`;
  };

  // Render worksheet HTML off-screen, capture full height, return array of A4-page canvases
  const captureWorksheetPages = async (type: string, tableNum: number): Promise<HTMLCanvasElement[]> => {
    const htmlContent = createA4WorksheetHTML(type, tableNum);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '-10000px';
    iframe.style.width = `${A4_PX_W}px`;
    iframe.style.height = `${A4_PX_H * 4}px`; // tall enough for any content
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) { document.body.removeChild(iframe); return []; }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Wait for fonts / layout
    await new Promise(r => setTimeout(r, 500));

    const pageEl = iframeDoc.querySelector('.page') as HTMLElement;
    if (!pageEl) { document.body.removeChild(iframe); return []; }

    // Capture full content at 2× scale
    const fullCanvas = await html2canvas(pageEl, {
      scale: 2,
      width: A4_PX_W,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: A4_PX_W,
      scrollX: 0,
      scrollY: 0,
    });

    document.body.removeChild(iframe);

    // Slice full canvas into A4-height pages
    const pageHeightPx = A4_PX_H * 2; // ×2 for scale
    const totalPages = Math.ceil(fullCanvas.height / pageHeightPx);
    const pages: HTMLCanvasElement[] = [];

    for (let p = 0; p < totalPages; p++) {
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = fullCanvas.width;
      pageCanvas.height = pageHeightPx;
      const ctx = pageCanvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        fullCanvas,
        0, p * pageHeightPx,
        fullCanvas.width, pageHeightPx,
        0, 0,
        fullCanvas.width, pageHeightPx,
      );
      pages.push(pageCanvas);
    }

    return pages;
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const pages = await captureWorksheetPages(wsType, num);
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      pages.forEach((canvas, i) => {
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
      });
      const pdfData = pdf.output('datauristring');
      await saveFileNative(pdfData, `table-${num}-${wsType}.pdf`);
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setExporting(false);
    }
  };

  const exportImage = async (format: 'png' | 'jpg') => {
    setExporting(true);
    try {
      const pages = await captureWorksheetPages(wsType, num);
      for (let i = 0; i < pages.length; i++) {
        const canvas = pages[i];
        const dataUrl = canvas.toDataURL(`image/${format}`, 0.95);
        const filename = pages.length > 1
          ? `table-${num}-${wsType}-page${i + 1}.${format}`
          : `table-${num}-${wsType}.${format}`;
        await saveFileNative(dataUrl, filename);
      }
    } catch (e) {
      console.error('Image export error:', e);
    } finally {
      setExporting(false);
    }
  };

  const exportDOCX = async () => {
    setExporting(true);
    const title = WS_TYPES.find(t => t.id === wsType)?.label || 'ورقة عمل';
    const tableFacts = Array.from({ length: 12 }, (_, i) => ({ b: i + 1, result: num * (i + 1) }));
    const children: Paragraph[] = [];

    // Title banner with styling
    children.push(new Paragraph({
      children: [new TextRun({ text: `${title} - جدول ${formatNum(num, numberSystem)}`, bold: true, size: 56, color: '1d4ed8' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 24, color: '3b82f6' } },
    }));

    // Info row
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '📝 الاسم: _______________________    ', size: 28 }),
        new TextRun({ text: '📅 التاريخ: ___________    ', size: 28 }),
        new TextRun({ text: '⭐ الدرجة: ____ / 12', size: 28 }),
      ],
      spacing: { after: 400 },
    }));

    // Content based on type
    if (wsType === 'writing') {
      tableFacts.forEach((f, i) => {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${i + 1}. `, size: 36, bold: true, color: '0369a1' }),
            new TextRun({ text: `${formatNum(num, numberSystem)} × ${formatNum(f.b, numberSystem)} = ${formatNum(f.result, numberSystem)}`, size: 36, bold: true }),
          ],
          spacing: { after: 80 },
        }));
        // Practice lines
        for (let j = 0; j < 3; j++) {
          children.push(new Paragraph({
            children: [new TextRun({ text: `       ${formatNum(num, numberSystem)} × ${formatNum(f.b, numberSystem)} = ____________`, size: 32, color: '64748b' })],
            spacing: { after: 60 },
          }));
        }
        children.push(new Paragraph({ children: [], spacing: { after: 120 } }));
      });
    } else if (wsType === 'addition') {
      tableFacts.slice(0, 6).forEach((f, i) => {
        const addends = Array.from({ length: num }, () => `${formatNum(f.b, numberSystem)}`).join(' + ');
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${i + 1}. `, size: 36, bold: true, color: '92400e' }),
            new TextRun({ text: `${addends} = `, size: 36, bold: true }),
            new TextRun({ text: '____________', size: 36, color: '6b7280' }),
          ],
          spacing: { after: 300 },
          border: { bottom: { style: BorderStyle.DOTTED, size: 6, color: 'd97706' } },
        }));
      });
    } else if (wsType === 'commutative') {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'خاصية الإبدال: أ × ب = ب × أ', bold: true, size: 32, color: '065f46' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }));
      tableFacts.slice(0, 6).forEach((f, i) => {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${i + 1}. `, size: 36, bold: true, color: '047857' }),
            new TextRun({ text: `${formatNum(num, numberSystem)} × ${formatNum(f.b, numberSystem)} = ______`, size: 36, bold: true }),
            new TextRun({ text: '     ⇄     ', size: 36, color: '10b981' }),
            new TextRun({ text: `${formatNum(f.b, numberSystem)} × ${formatNum(num, numberSystem)} = ______`, size: 36, bold: true }),
          ],
          spacing: { after: 250 },
          border: { bottom: { style: BorderStyle.DOTTED, size: 6, color: '10b981' } },
        }));
      });
    } else if (wsType === 'division') {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'الضرب والقسمة', bold: true, size: 32, color: '9a3412' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }));
      tableFacts.slice(0, 6).forEach((f, i) => {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${i + 1}. `, size: 36, bold: true, color: 'c2410c' }),
            new TextRun({ text: `${formatNum(f.result, numberSystem)} ÷ ${formatNum(num, numberSystem)} = ______`, size: 36, bold: true }),
            new TextRun({ text: '     |     ', size: 36, color: '6b7280' }),
            new TextRun({ text: `${formatNum(f.result, numberSystem)} ÷ ${formatNum(f.b, numberSystem)} = ______`, size: 36, bold: true }),
          ],
          spacing: { after: 250 },
          border: { bottom: { style: BorderStyle.DOTTED, size: 6, color: 'ea580c' } },
        }));
      });
    } else if (wsType === 'equal') {
      const equalProducts = getTableEqualProducts(num).slice(0, 4);
      equalProducts.forEach(({ product, pairs }, i) => {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${i + 1}. `, size: 36, bold: true, color: '86198f' }),
            new TextRun({ text: `كل المسائل التي ناتجها ${formatNum(product, numberSystem)}:`, size: 36, bold: true }),
          ],
          spacing: { after: 80 },
        }));
        children.push(new Paragraph({
          children: [new TextRun({ text: pairs.map(([a, b]) => `${formatNum(a, numberSystem)} × ${formatNum(b, numberSystem)}`).join('   |   '), size: 32, color: 'a21caf' })],
          spacing: { after: 80 },
        }));
        children.push(new Paragraph({
          children: [new TextRun({ text: '________________________________________________', size: 32, color: '6b7280' })],
          spacing: { after: 200 },
        }));
      });
    } else if (wsType === 'mixed') {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'أكمل الفراغ:', bold: true, size: 32, color: '1e40af' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }));
      tableFacts.forEach((f, i) => {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${i + 1}. `, size: 36, bold: true }),
            new TextRun({ text: `${formatNum(num, numberSystem)} × `, size: 36, bold: true }),
            new TextRun({ text: '____', size: 36, color: '6b7280' }),
            new TextRun({ text: ` = ${formatNum(f.result, numberSystem)}`, size: 36, bold: true }),
          ],
          spacing: { after: 130 },
        }));
      });
    } else if (wsType === 'assessment') {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'القسم أ: أكمل الفراغ', bold: true, size: 36, color: '5b21b6' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }));
      tableFacts.slice(0, 6).forEach((f, i) => {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${i + 1}. ${formatNum(num, numberSystem)} × ${formatNum(f.b, numberSystem)} = `, size: 34, bold: true }),
            new TextRun({ text: '________', size: 34, color: '6b7280' }),
          ],
          spacing: { after: 110 },
        }));
      });
      children.push(new Paragraph({
        children: [new TextRun({ text: 'القسم ب: صواب أم خطأ', bold: true, size: 36, color: '92400e' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }));
      tableFacts.slice(0, 4).forEach((f, i) => {
        const wrong = i % 2 === 0 ? f.result : f.result + 2;
        children.push(new Paragraph({
          children: [new TextRun({ text: `${i + 7}. ${formatNum(num, numberSystem)} × ${formatNum(f.b, numberSystem)} = ${formatNum(wrong, numberSystem)}     [  صواب  /  خطأ  ]`, size: 32, bold: true })],
          spacing: { after: 110 },
        }));
      });
    }

    // Footer
    children.push(new Paragraph({
      children: [new TextRun({ text: '🌸⭐🦋🌺    مملكة جدول الضرب    🌺🐝🌸⭐', size: 24, color: '6b7280' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
    }));

    const doc = new Document({
      sections: [{
        properties: {
          page: { size: { width: A4_WIDTH_MM * 20, height: A4_HEIGHT_MM * 20 }, margin: { top: 300, bottom: 300, left: 300, right: 300 } },
        },
        children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `table-${num}-${wsType}.docx`;
    link.click();
    URL.revokeObjectURL(link.href);
    setExporting(false);
  };

  const exportFullPackage = async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      let firstPage = true;

      for (let i = 0; i < WS_TYPES.length; i++) {
        const pages = await captureWorksheetPages(WS_TYPES[i].id, num);
        for (const canvas of pages) {
          if (!firstPage) pdf.addPage();
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
          firstPage = false;
        }
      }

      pdf.save(`table-${num}-full-package.pdf`);
    } finally {
      setExporting(false);
    }
  };

  // Preview worksheet (scaled for UI display)
  const renderWorksheetPreview = () => {
    const title = WS_TYPES.find(t => t.id === wsType)?.label || 'ورقة عمل';
    const tableFacts = Array.from({ length: 12 }, (_, i) => ({ b: i + 1, result: num * (i + 1) }));

    return (
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-sky-400 to-blue-500 text-white p-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 flex gap-1 text-base opacity-30">🌸⭐🦋🌺🐝</div>
          <div className="text-center">
            <h3 className="text-base font-black">{title} - {language === 'ar' ? `جدول ${formatNum(num, numberSystem)}` : `Table of ${formatNum(num, numberSystem)}`}</h3>
            <div className="flex justify-between text-xs mt-1">
              <span>الاسم: ________</span>
              <span>التاريخ: ______</span>
              <span>الدرجة: __ / 12</span>
            </div>
          </div>
        </div>
        <div className="p-3 space-y-2">
          {wsType === 'writing' && (
            <div className="grid grid-cols-2 gap-2">
              {tableFacts.slice(0, 6).map((f, i) => (
                <div key={i} className="bg-sky-50 rounded-lg p-2 text-sm">
                  <div className="font-black text-sky-700">{i + 1}. {formatNum(num, numberSystem)} × {formatNum(f.b, numberSystem)} = {formatNum(f.result, numberSystem)}</div>
                  <div className="text-xs text-gray-500 mt-1">___ × ___ = ___ (×3)</div>
                </div>
              ))}
            </div>
          )}
          {wsType === 'addition' && (
            <div className="space-y-2">
              {tableFacts.slice(0, 4).map((f, i) => (
                <div key={i} className="bg-amber-50 rounded-lg p-2 text-sm font-bold text-amber-700">
                  {i + 1}. {Array.from({ length: Math.min(num, 5) }, () => formatNum(f.b, numberSystem)).join(' + ')}{num > 5 ? '...' : ''} = ____
                </div>
              ))}
            </div>
          )}
          {wsType === 'commutative' && (
            <div className="grid grid-cols-2 gap-2">
              {tableFacts.slice(0, 4).map((f, i) => (
                <div key={i} className="bg-green-50 rounded-lg p-2 text-xs text-center font-bold text-green-700">
                  {formatNum(num, numberSystem)} × {formatNum(f.b, numberSystem)} ⇄ {formatNum(f.b, numberSystem)} × {formatNum(num, numberSystem)}
                </div>
              ))}
            </div>
          )}
          {wsType === 'division' && (
            <div className="grid grid-cols-2 gap-2">
              {tableFacts.slice(0, 4).map((f, i) => (
                <div key={i} className="bg-orange-50 rounded-lg p-2 text-xs text-center font-bold text-orange-700">
                  {formatNum(f.result, numberSystem)} ÷ {formatNum(num, numberSystem)} | {formatNum(f.result, numberSystem)} ÷ {formatNum(f.b, numberSystem)}
                </div>
              ))}
            </div>
          )}
          {wsType === 'equal' && (
            <div className="space-y-2">
              {getTableEqualProducts(num).slice(0, 3).map(({ product, pairs }, i) => (
                <div key={i} className="bg-fuchsia-50 rounded-lg p-2 text-sm">
                  <div className="font-bold text-fuchsia-700">الناتج {formatNum(product, numberSystem)}</div>
                  <div className="text-xs text-gray-600">{pairs.slice(0, 3).map(([a, b]) => `${formatNum(a, numberSystem)}×${formatNum(b, numberSystem)}`).join(' | ')}</div>
                </div>
              ))}
            </div>
          )}
          {wsType === 'mixed' && (
            <div className="grid grid-cols-2 gap-2">
              {tableFacts.slice(0, 6).map((f, i) => (
                <div key={i} className="bg-blue-50 rounded-lg p-2 text-sm font-bold text-blue-700">
                  {i + 1}. {formatNum(num, numberSystem)} × ___ = {formatNum(f.result, numberSystem)}
                </div>
              ))}
            </div>
          )}
          {wsType === 'assessment' && (
            <div className="space-y-2 text-xs">
              <div className="bg-purple-50 rounded-lg p-2">
                <div className="font-bold text-purple-700 mb-1">القسم أ: أكمل الفراغ</div>
                <div className="text-gray-600">6 أسئلة</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2">
                <div className="font-bold text-yellow-700 mb-1">القسم ب: صواب أم خطأ</div>
                <div className="text-gray-600">4 أسئلة</div>
              </div>
            </div>
          )}
        </div>
        <div className="bg-sky-50 border-t p-2 flex justify-between text-xs text-gray-400">
          <span>🌸⭐🦋🌺</span><span className="font-semibold">مملكة جدول الضرب</span><span>🌺🐝🌸⭐</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {WS_TYPES.map(t => (
          <button key={t.id} onClick={() => setWsType(t.id)}
            className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${wsType === t.id ? 'bg-sky-500 text-white border-transparent shadow-md' : 'bg-white border-sky-200 text-gray-600 hover:border-sky-400'}`}>
            <span className="text-base">{t.icon}</span> {language === 'ar' ? t.label : t.labelEn}
          </button>
        ))}
      </div>

      {renderWorksheetPreview()}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button onClick={exportPDF} disabled={exporting} className="flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 text-sm disabled:opacity-50"><Download className="w-4 h-4" /> PDF</button>
        <button onClick={() => exportImage('png')} disabled={exporting} className="flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 text-sm disabled:opacity-50"><Download className="w-4 h-4" /> PNG</button>
        <button onClick={() => exportImage('jpg')} disabled={exporting} className="flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 text-sm disabled:opacity-50"><Download className="w-4 h-4" /> JPG</button>
        <button onClick={exportDOCX} disabled={exporting} className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 text-sm disabled:opacity-50"><Download className="w-4 h-4" /> DOCX</button>
        <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-sky-500 text-white font-bold py-3 rounded-xl hover:bg-sky-600 text-sm"><Printer className="w-4 h-4" /> طباعة</button>
      </div>

      <button onClick={exportFullPackage} disabled={exporting}
        className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black py-4 rounded-2xl text-lg shadow-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-3">
        <PackageOpen className="w-5 h-5" />
        تحميل حزمة الجدول كاملة
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN TABLE PAGE
// ═══════════════════════════════════════════════════════════

export default function TablePageClient({ num }: { num: number }) {
  const config = TABLE_CONFIG[num] || TABLE_CONFIG[1];
  const { tableProgress } = useStudent();
  const prog = tableProgress.find(p => p.table_number === num);
  const mastery = prog?.mastery_percent || 0;
  const { numberSystem, language } = useSettings();
  const [activeSection, setActiveSection] = useState<Section>('learn');
  const [quizPassed, setQuizPassed] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<Section>>(new Set());

  useEffect(() => { if (mastery >= 80) setQuizPassed(true); }, [mastery]);

  const markComplete = (sid: Section) => setCompletedSections(prev => { const n = new Set(prev); n.add(sid); return n; });
  const isCompleted = (sid: Section) => completedSections.has(sid) || (sid === 'quiz' && quizPassed);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50">
      <div className="h-2 bg-gradient-to-r from-green-400 via-sky-400 to-blue-500" />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br ${config.gradient} rounded-3xl p-6 md:p-8 text-white text-center mb-4 shadow-xl relative overflow-hidden`}>
          <div className="absolute top-2 right-3 text-4xl opacity-20 animate-float">{config.emoji}</div>
          <div className="absolute bottom-2 left-3 text-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>{config.animal}</div>
          <div className="relative">
            <div className="text-5xl mb-2">{config.animal}</div>
            <h1 className="text-4xl md:text-5xl font-black mb-2">{language === 'ar' ? `جدول الضرب في ${formatNum(num, numberSystem)}` : `Table of ${formatNum(num, numberSystem)}`}</h1>
            <p className="text-white/80 text-lg">{formatText(config.tip, numberSystem)}</p>
            <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
              {mastery > 0 && <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-300 fill-yellow-200" /><span className="font-bold">{language === 'ar' ? 'الإتقان' : 'Mastery'}: {formatNum(mastery, numberSystem)}%</span></div>}
              {quizPassed && <div className="bg-yellow-400/30 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-200" /><span className="font-bold">{language === 'ar' ? 'تم النجاح!' : 'Passed!'}</span></div>}
            </div>
          </div>
        </motion.div>

        <SettingsBar num={num} />

        {/* Section Navigator */}
        <div className="mb-6 bg-white rounded-2xl shadow-md border border-sky-100 p-3 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {SECTIONS.map((sec) => {
              const completed = isCompleted(sec.id);
              const isActive = activeSection === sec.id;
              return (
                <button key={sec.id} onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    isActive ? `bg-gradient-to-r ${config.gradient} text-white shadow-md` :
                    completed ? 'bg-green-50 text-green-700 border border-green-200' :
                    'bg-gray-50 text-gray-600 hover:bg-sky-50 hover:text-sky-600'
                  }`}>
                  <span className="text-sm sm:text-base">{sec.icon}</span>
                  <span className="hidden sm:inline">{language === 'ar' ? sec.title : sec.titleEn}</span>
                  {completed && <span className="text-green-500 text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Section */}
        <AnimatePresence mode="wait">
          <motion.div key={activeSection} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center text-white text-xl shadow-md`}>{SECTIONS.find(s => s.id === activeSection)?.icon}</div>
              <h2 className="text-xl font-black text-gray-800">{language === 'ar' ? SECTIONS.find(s => s.id === activeSection)?.title : SECTIONS.find(s => s.id === activeSection)?.titleEn}</h2>
              <div className="mr-auto flex gap-1 text-sm opacity-50">🌸⭐🐝</div>
            </div>

            {activeSection === 'learn' && <LearnSection num={num} config={config} />}
            {activeSection === 'visual' && <VisualSection num={num} />}
            {activeSection === 'writing' && <WritingSection num={num} />}
            {activeSection === 'addition' && <AdditionSection num={num} />}
            {activeSection === 'commutative' && <CommutativeSection num={num} />}
            {activeSection === 'division' && <DivisionSection num={num} />}
            {activeSection === 'equal' && <EqualSection num={num} />}
            {activeSection === 'quiz' && <QuizSection num={num} onPass={() => { setQuizPassed(true); markComplete('quiz'); }} />}
            {activeSection === 'export' && <ExportSection num={num} />}

            {activeSection !== 'quiz' && !isCompleted(activeSection) && (
              <button onClick={() => markComplete(activeSection)} className="mt-4 w-full bg-green-100 border-2 border-green-300 text-green-700 font-bold py-3 rounded-xl hover:bg-green-200 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> أنهيت هذا القسم
              </button>
            )}
            {isCompleted(activeSection) && activeSection !== 'quiz' && (
              <div className="mt-4 w-full bg-green-50 border-2 border-green-200 text-green-600 font-bold py-3 rounded-xl text-center flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> تم إكمال هذا القسم
              </div>
            )}

            {/* Progress bar */}
            <div className="mt-6 bg-white rounded-2xl p-4 shadow-md border border-sky-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-600">{language === 'ar' ? 'تقدمك في الجدول' : 'Progress'}</span>
                <span className="text-sm font-bold text-sky-600">{formatNum(completedSections.size, numberSystem)} / {formatNum(SECTIONS.length, numberSystem)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all`} style={{ width: `${(completedSections.size / SECTIONS.length) * 100}%` }} />
              </div>
              <div className="flex gap-1 mt-3 flex-wrap">
                {SECTIONS.map(sec => (
                  <div key={sec.id} className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${isCompleted(sec.id) ? 'bg-green-400 text-white' : 'bg-gray-100 text-gray-400'}`}>{sec.icon}</div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {num > 1 && <Link href={`/tables/${num - 1}`} className="flex items-center gap-2 bg-white border-2 border-sky-200 text-sky-600 font-bold py-3 px-5 rounded-xl hover:bg-sky-50 shadow-sm"><ChevronRight className="w-4 h-4" /> {language === 'ar' ? `جدول ${formatNum(num - 1, numberSystem)}` : `Table ${formatNum(num - 1, numberSystem)}`}</Link>}
          <Link href="/tables" className="mx-auto bg-gray-100 text-gray-600 font-bold py-3 px-5 rounded-xl hover:bg-gray-200 shadow-sm">{language === 'ar' ? 'كل الجداول' : 'All Tables'}</Link>
          {num < 12 && <Link href={`/tables/${num + 1}`} className={`flex items-center gap-2 font-bold py-3 px-5 rounded-xl shadow-sm ${quizPassed || num === 1 ? 'bg-white border-2 border-sky-200 text-sky-600 hover:bg-sky-50' : 'bg-gray-100 text-gray-400'}`}>{language === 'ar' ? `جدول ${formatNum(num + 1, numberSystem)}` : `Table ${formatNum(num + 1, numberSystem)}`}{quizPassed || num === 1 ? <ChevronLeft className="w-4 h-4" /> : <Lock className="w-3 h-3" />}</Link>}
        </div>
      </div>
    </div>
  );
}
