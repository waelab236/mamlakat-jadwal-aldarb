'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '@/lib/settings-context';
import { formatNum } from '@/lib/numerals';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Printer, RefreshCw, PlusCircle, Trash2, Users, FileText, BookOpen, Star, Download, PackageOpen } from 'lucide-react';

type ExamType = 'homework' | 'exam' | 'worksheet';
type Difficulty = 'easy' | 'medium' | 'hard';

function generateQuestions(tables: number[], difficulty: Difficulty, type: string) {
  const count = { easy: 10, medium: 15, hard: 20 }[difficulty];
  return Array.from({ length: count }, (_, i) => {
    const t = tables[Math.floor(Math.random() * tables.length)];
    const b = Math.floor(Math.random() * 12) + 1;
    return { num: i + 1, q: `${t} × ${b} = ___`, answer: t * b };
  });
}

const WS_TYPES = [
  { id: 'writing', label: 'كتابة جدول الضرب', icon: '✏️' },
  { id: 'addition', label: 'الجمع المتكرر', icon: '➕' },
  { id: 'commutative', label: 'خاصية الإبدال', icon: '🔄' },
  { id: 'division', label: 'الضرب والقسمة', icon: '➗' },
  { id: 'equal', label: 'النتائج المتشابهه', icon: '🎯' },
  { id: 'mixed', label: 'مراجعة شاملة', icon: '📋' },
  { id: 'assessment', label: 'اختبار نهائي', icon: '📝' },
];

function BulkWorksheetPreview({ num, wsType, numberSystem, language }: { num: number; wsType: string; numberSystem: 'western' | 'arabic'; language: 'ar' | 'en' }) {
  const facts = Array.from({ length: 12 }, (_, i) => ({ b: i + 1, result: num * (i + 1) }));
  const title = WS_TYPES.find(t => t.id === wsType)?.label || 'ورقة عمل';
  const TABLE_CONFIG: Record<number, { gradient: string; emoji: string; tip: string }> = {
    1: { gradient: 'from-blue-400 to-blue-600', emoji: '🏰', tip: 'أي رقم × 1 = نفسه!' },
    2: { gradient: 'from-green-400 to-green-600', emoji: '🏯', tip: 'الأعداد الزوجية!' },
    3: { gradient: 'from-yellow-400 to-amber-600', emoji: '🗼', tip: 'مجموع الأرقام = 3 أو 6 أو 9' },
    4: { gradient: 'from-pink-400 to-pink-600', emoji: '🏔️', tip: 'جدول 4 = جدول 2 × 2' },
    5: { gradient: 'from-sky-400 to-sky-600', emoji: '🌉', tip: 'ينتهي بـ 0 أو 5!' },
    6: { gradient: 'from-emerald-400 to-emerald-600', emoji: '🌳', tip: 'جدول 6 = 2 × 3' },
    7: { gradient: 'from-cyan-500 to-cyan-700', emoji: '🏖️', tip: 'يحتاج حفظاً!' },
    8: { gradient: 'from-orange-400 to-orange-600', emoji: '⛰️', tip: 'جدول 8 = 4 × 2' },
    9: { gradient: 'from-rose-400 to-rose-600', emoji: '🌆', tip: 'مجموع الأرقام = 9!' },
    10: { gradient: 'from-amber-400 to-amber-600', emoji: '👑', tip: 'أضف صفراً!' },
    11: { gradient: 'from-violet-400 to-violet-600', emoji: '⭐', tip: 'اكتب الرقم مرتين!' },
    12: { gradient: 'from-red-400 to-red-600', emoji: '🏆', tip: 'جدول 12 = 10 + 2' },
  };
  const config = TABLE_CONFIG[num] || TABLE_CONFIG[1];

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
      <div className={`bg-gradient-to-r ${config.gradient} text-white p-4 relative overflow-hidden`}>
        <div className="absolute top-0 left-0 flex gap-1 text-lg opacity-30">🌸⭐🦋🌺🐝</div>
        <div className="text-center">
          <h3 className="text-lg font-black">{title} - {language === 'ar' ? `جدول ${formatNum(num, numberSystem)}` : `Table of ${formatNum(num, numberSystem)}`}</h3>
          <div className="flex justify-between text-xs mt-2">
            <span>الاسم: ________________</span>
            <span>التاريخ: ____________</span>
            <span>الدرجة: __ / 12</span>
          </div>
        </div>
      </div>
      <div className="border-t-4 border-dashed border-sky-200 mx-3" />
      <div className="p-5 notebook-lines">
        {wsType === 'writing' && (
          <div className="grid grid-cols-2 gap-3">
            {facts.map((f, i) => (
              <div key={i} className="flex items-center gap-2"><span className="text-sky-600 font-black text-sm w-5">{i + 1}.</span><span className="text-gray-800 font-black">{formatNum(num, numberSystem)} × {formatNum(f.b, numberSystem)} =</span><span className="text-gray-400 font-black">____</span></div>
            ))}
          </div>
        )}
        {wsType === 'addition' && (
          <div className="grid grid-cols-1 gap-3">
            {facts.slice(0, 8).map((f, i) => (
              <div key={i} className="flex items-center gap-2"><span className="text-sky-600 font-black text-sm w-5">{i + 1}.</span><span className="text-gray-800 font-black">{Array.from({ length: num }, () => formatNum(f.b, numberSystem)).join(' + ')} = ______</span></div>
            ))}
          </div>
        )}
        {wsType === 'commutative' && (
          <div className="grid grid-cols-2 gap-3">
            {facts.slice(0, 8).map((f, i) => (
              <div key={i} className="bg-sky-50 rounded-xl p-3"><p className="font-black text-gray-700">{formatNum(num, numberSystem)} × {formatNum(f.b, numberSystem)} = ______</p><p className="font-black text-gray-700">{formatNum(f.b, numberSystem)} × {formatNum(num, numberSystem)} = ______</p></div>
            ))}
          </div>
        )}
        {wsType === 'division' && (
          <div className="grid grid-cols-2 gap-3">
            {facts.slice(0, 8).map((f, i) => (
              <div key={i} className="bg-orange-50 rounded-xl p-3"><p className="font-black text-gray-700">{formatNum(f.result, numberSystem)} ÷ {formatNum(num, numberSystem)} = ______</p><p className="font-black text-gray-700">{formatNum(f.result, numberSystem)} ÷ {formatNum(f.b, numberSystem)} = ______</p></div>
            ))}
          </div>
        )}
        {wsType === 'equal' && (
          <div className="space-y-3">
            {[24, 36, 48, 60, 72].filter(v => v <= num * 12).slice(0, 4).map((target, i) => (
              <div key={i} className="bg-fuchsia-50 rounded-xl p-3"><p className="font-black text-fuchsia-700 mb-1">كل المسائل التي ناتجها {formatNum(target, numberSystem)}:</p><p className="text-gray-500">_____________________________________________</p></div>
            ))}
          </div>
        )}
        {wsType === 'mixed' && (
          <div className="grid grid-cols-2 gap-3">
            {facts.sort(() => Math.random() - 0.5).slice(0, 10).map((f, i) => (
              <div key={i} className="flex items-center gap-2"><span className="text-sky-600 font-black text-sm w-5">{i + 1}.</span><span className="text-gray-800 font-black">{formatNum(num, numberSystem)} × ___ = {formatNum(f.result, numberSystem)}</span></div>
            ))}
          </div>
        )}
        {wsType === 'assessment' && (
          <div className="space-y-3">
            <div className="text-center font-black text-gray-700 mb-4">القسم أ: أكمل الفراغ</div>
            <div className="grid grid-cols-2 gap-2">
              {facts.slice(0, 6).map((f, i) => (<div key={i} className="font-bold text-gray-700">{i + 1}. {formatNum(num, numberSystem)} × {formatNum(f.b, numberSystem)} = ____</div>))}
            </div>
            <div className="text-center font-black text-gray-700 mt-4 mb-2">القسم ب: صواب أم خطأ</div>
            <div className="grid grid-cols-1 gap-2">
              {facts.slice(0, 4).map((f, i) => {
                const wrong = i % 2 === 0 ? f.result : f.result + 2;
                return <div key={i} className="font-bold text-gray-700">{i + 7}. {formatNum(num, numberSystem)} × {formatNum(f.b, numberSystem)} = {formatNum(wrong, numberSystem)} ( صواب / خطأ )</div>;
              })}
            </div>
          </div>
        )}
      </div>
      <div className="bg-sky-50 border-t p-2 flex justify-between text-xs text-gray-400">
        <span>🌸⭐🦋🌺</span><span className="font-semibold">مملكة جدول الضرب</span><span>🌺🐝🌸⭐</span>
      </div>
    </div>
  );
}

export default function TeacherPage() {
  const { numberSystem, language } = useSettings();
  const [tab, setTab] = useState<'create' | 'saved' | 'bulk'>('create');
  const [examType, setExamType] = useState<ExamType>('worksheet');
  const [tables, setTables] = useState<number[]>([2, 3, 4, 5]);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [studentName, setStudentName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [title, setTitle] = useState('');
  const [generated, setGenerated] = useState(false);
  const [questions, setQuestions] = useState<{ num: number; q: string; answer: number }[]>([]);
  const [savedSheets, setSavedSheets] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Bulk export state
  const [bulkTable, setBulkTable] = useState(2);
  const [bulkExporting, setBulkExporting] = useState(false);
  const bulkRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const generate = () => {
    const qs = generateQuestions(tables, difficulty, examType);
    setQuestions(qs);
    setGenerated(true);
  };

  const save = () => {
    const sheet = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      title: title || getTitle(),
      created_by: teacherName || 'معلم',
      table_numbers: tables,
      difficulty,
      student_name: studentName,
      teacher_name: teacherName,
      school_name: schoolName,
      questions,
      created_at: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('mk_saved_sheets') || '[]');
    localStorage.setItem('mk_saved_sheets', JSON.stringify([sheet, ...existing].slice(0, 30)));
    setSavedSheets(s => [sheet, ...s]);
    alert('تم حفظ الورقة بنجاح!');
  };

  const loadSaved = () => {
    setLoadingSaved(true);
    const data = JSON.parse(localStorage.getItem('mk_saved_sheets') || '[]');
    setSavedSheets(data);
    setLoadingSaved(false);
  };

  const deleteSaved = (id: string) => {
    const updated = savedSheets.filter(x => x.id !== id);
    localStorage.setItem('mk_saved_sheets', JSON.stringify(updated));
    setSavedSheets(updated);
  };

  const getTitle = () => {
    const typeNames = { homework: 'واجب منزلي', exam: 'اختبار', worksheet: 'ورقة عمل' };
    return `${typeNames[examType]} - جداول ${tables.join('، ')}`;
  };

  const bulkExportSinglePDF = async (wsType: string) => {
    const el = bulkRefs.current.get(wsType);
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    pdf.save(`table-${bulkTable}-${wsType}.pdf`);
  };

  const bulkExportAll = async () => {
    setBulkExporting(true);
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    for (let i = 0; i < WS_TYPES.length; i++) {
      const wsType = WS_TYPES[i].id;
      const el = bulkRefs.current.get(wsType);
      if (!el) continue;
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
      if (i > 0) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    }
    pdf.save(`table-${bulkTable}-all-worksheets.pdf`);
    setBulkExporting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">👩‍🏫</motion.div>
          <h1 className="text-4xl font-black text-sky-700 mb-2">لوحة المعلم</h1>
          <p className="text-gray-500 text-lg">أنشئ اختبارات وأوراق عمل ووظائف منزلية مخصصة</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-sky-100 rounded-2xl p-1 mb-6">
          <button onClick={() => setTab('create')} className={`flex-1 py-2 rounded-xl font-bold transition-all ${tab === 'create' ? 'bg-white shadow-md text-sky-700' : 'text-gray-600'}`}>
            ✏️ إنشاء جديد
          </button>
          <button onClick={() => setTab('bulk')} className={`flex-1 py-2 rounded-xl font-bold transition-all ${tab === 'bulk' ? 'bg-white shadow-md text-sky-700' : 'text-gray-600'}`}>
            <span className="inline-flex items-center gap-1"><PackageOpen className="w-4 h-4" /> تصدير شامل</span>
          </button>
          <button onClick={() => { setTab('saved'); loadSaved(); }} className={`flex-1 py-2 rounded-xl font-bold transition-all ${tab === 'saved' ? 'bg-white shadow-md text-sky-700' : 'text-gray-600'}`}>
            📁 المحفوظة
          </button>
        </div>

        {tab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Config */}
            <div className="space-y-5">
              {/* Type */}
              <div className="bg-white rounded-3xl p-5 shadow-md border border-sky-100">
                <h3 className="font-black text-gray-700 mb-3">نوع الورقة</h3>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'worksheet', label: 'ورقة عمل', icon: '📄' },
                    { id: 'exam', label: 'اختبار', icon: '📝' },
                    { id: 'homework', label: 'واجب منزلي', icon: '🏠' },
                  ] as const).map(t => (
                    <button key={t.id} onClick={() => setExamType(t.id)}
                      className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${examType === t.id ? 'bg-sky-500 text-white border-transparent' : 'border-gray-200 text-gray-600 hover:border-sky-200'}`}>
                      <div className="text-xl mb-1">{t.icon}</div>{t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tables */}
              <div className="bg-white rounded-3xl p-5 shadow-md border border-sky-100">
                <h3 className="font-black text-gray-700 mb-3">الجداول</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setTables(t => t.includes(n) ? t.filter(x => x !== n) : [...t, n])}
                      className={`w-11 h-11 rounded-xl font-black text-base transition-all ${tables.includes(n) ? 'bg-sky-500 text-white' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'}`}>
                      {formatNum(n, numberSystem)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="bg-white rounded-3xl p-5 shadow-md border border-sky-100">
                <h3 className="font-black text-gray-700 mb-3">المستوى</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[{ id: 'easy' as const, l: 'سهل', n: '10', c: 'bg-green-500' }, { id: 'medium' as const, l: 'متوسط', n: '15', c: 'bg-yellow-500' }, { id: 'hard' as const, l: 'صعب', n: '20', c: 'bg-red-500' }].map(d => (
                    <button key={d.id} onClick={() => setDifficulty(d.id)}
                      className={`py-2 rounded-xl font-bold text-sm border-2 transition-all ${difficulty === d.id ? `${d.c} text-white border-transparent` : 'border-gray-200 text-gray-600 hover:border-sky-200'}`}>
                      {d.l} ({d.n})
                    </button>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="bg-white rounded-3xl p-5 shadow-md border border-sky-100 space-y-3">
                <h3 className="font-black text-gray-700 mb-2">بيانات الورقة</h3>
                {[
                  { l: 'العنوان', v: title, s: setTitle, p: 'عنوان الاختبار...' },
                  { l: 'اسم الطالب', v: studentName, s: setStudentName, p: 'اسم الطالب' },
                  { l: 'اسم المعلم', v: teacherName, s: setTeacherName, p: 'اسم المعلم' },
                  { l: 'المدرسة', v: schoolName, s: setSchoolName, p: 'اسم المدرسة' },
                ].map(f => (
                  <div key={f.l}>
                    <label className="text-xs font-bold text-gray-500 block mb-1">{f.l}</label>
                    <input value={f.v} onChange={e => f.s(e.target.value)} placeholder={f.p}
                      className="w-full border border-sky-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-400 bg-sky-50" />
                  </div>
                ))}
              </div>

              <button onClick={generate} disabled={tables.length === 0}
                className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black py-4 rounded-2xl text-xl shadow-md hover:opacity-90 disabled:opacity-50">
                توليد الورقة ✨
              </button>
            </div>

            {/* Preview */}
            <div>
              {generated ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} id="print-area">
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-sky-400 to-blue-500 text-white p-4">
                      <div className="flex items-center justify-between text-xs text-blue-100 mb-2">
                        {schoolName && <span>{schoolName}</span>}
                        <span>{new Date().toLocaleDateString('ar-SA')}</span>
                      </div>
                      <h3 className="text-xl font-black text-center">{title || getTitle()}</h3>
                      <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                        <div>الاسم: {studentName || '___________'}</div>
                        <div className="text-center">المعلم: {teacherName || '___________'}</div>
                        <div className="text-left">الدرجة: __ / {questions.length}</div>
                      </div>
                    </div>
                    <div className="p-4 notebook-lines">
                      <div className="grid grid-cols-2 gap-3">
                        {questions.map(q => (
                          <div key={q.num} className="flex items-center gap-2">
                            <span className="text-sky-600 font-black text-sm w-5">{q.num}.</span>
                            <span className="text-gray-800 font-black">{q.q}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-sky-50 border-t p-2 text-center text-xs text-gray-400 flex justify-between">
                      <span>🌸⭐🦋🌺</span>
                      <span>مملكة جدول الضرب</span>
                      <span>🌸⭐🦋🌺</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 bg-sky-500 text-white font-bold py-3 rounded-xl hover:bg-sky-600">
                      <Printer className="w-4 h-4" /> طباعة
                    </button>
                    <button onClick={generate} className="flex items-center gap-2 bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button onClick={save} className="flex items-center gap-2 bg-green-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-600">
                      <Star className="w-4 h-4" /> حفظ
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-3xl border-2 border-dashed border-sky-200 p-12 text-center min-h-80 flex flex-col items-center justify-center">
                  <FileText className="w-16 h-16 text-sky-200 mb-4" />
                  <p className="text-gray-400 font-semibold">اضبط الإعدادات وانقر</p>
                  <p className="text-sky-500 font-black text-xl">"توليد الورقة"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'bulk' && (
          <div className="space-y-6">
            {/* Table selector */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-sky-100">
              <h3 className="font-black text-gray-700 mb-4 flex items-center gap-2"><PackageOpen className="w-5 h-5 text-sky-600" /> {language === 'ar' ? 'تصدير شامل لجدول' : 'Bulk Export Table'}</h3>
              <p className="text-gray-500 text-sm mb-4">{language === 'ar' ? 'اختر جدولاً لتصدير جميع أنواع أوراق العمل السبعة دفعة واحدة' : 'Select a table to export all 7 worksheet types at once'}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setBulkTable(n)}
                    className={`w-12 h-12 rounded-xl font-black text-base transition-all ${bulkTable === n ? 'bg-sky-500 text-white shadow-md scale-110' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'}`}>
                    {formatNum(n, numberSystem)}
                  </button>
                ))}
              </div>
              <button onClick={bulkExportAll} disabled={bulkExporting}
                className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black py-4 rounded-2xl text-lg shadow-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Download className="w-5 h-5" /> {bulkExporting ? (language === 'ar' ? 'جار التصدير...' : 'Exporting...') : (language === 'ar' ? 'تصدير الكل كملف PDF واحد' : 'Export All as One PDF')}
              </button>
            </div>

            {/* All 7 worksheet previews */}
            <div className="grid grid-cols-1 gap-6">
              {WS_TYPES.map(ws => (
                <div key={ws.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-gray-700 flex items-center gap-2"><span className="text-xl">{ws.icon}</span> {ws.label}</h3>
                    <button onClick={() => bulkExportSinglePDF(ws.id)} className="flex items-center gap-1.5 bg-white border-2 border-sky-200 text-sky-600 font-bold py-1.5 px-3 rounded-xl text-sm hover:bg-sky-50 transition-all shadow-sm">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                  <div ref={el => { if (el) bulkRefs.current.set(ws.id, el); }}>
                    <BulkWorksheetPreview num={bulkTable} wsType={ws.id} numberSystem={numberSystem} language={language} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'saved' && (
          <div>
            {loadingSaved ? (
              <div className="text-center py-12 text-sky-600 font-bold">جار التحميل...</div>
            ) : savedSheets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📁</div>
                <p className="text-gray-400 font-semibold">لا توجد أوراق محفوظة بعد</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedSheets.map(sheet => (
                  <div key={sheet.id} className="bg-white rounded-2xl p-4 shadow-md border border-sky-100 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black text-gray-700">{sheet.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">الجداول: {sheet.table_numbers?.join('، ')}</p>
                        {sheet.student_name && <p className="text-sm text-sky-600">الطالب: {sheet.student_name}</p>}
                        {sheet.teacher_name && <p className="text-sm text-green-600">المعلم: {sheet.teacher_name}</p>}
                        <p className="text-xs text-gray-400 mt-1">{new Date(sheet.created_at).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => deleteSaved(sheet.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-bold ${sheet.difficulty === 'easy' ? 'bg-green-100 text-green-700' : sheet.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {sheet.difficulty === 'easy' ? 'سهل' : sheet.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body > * { display: none; }
          #print-area { display: block !important; position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
