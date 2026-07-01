'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useStudent } from '@/lib/student-context';
import { useSettings } from '@/lib/settings-context';
import { formatNum } from '@/lib/numerals';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Printer, RefreshCw, Download, FileText, Star, FileDown } from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard';
type QuestionType = 'fill' | 'multiple' | 'matching' | 'true_false';

function generateWorksheetQuestions(tables: number[], difficulty: Difficulty, types: QuestionType[]) {
  const count = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 16 : 20;
  const questions: { q: string; a: string; type: QuestionType }[] = [];

  for (let i = 0; i < count; i++) {
    const t = tables[Math.floor(Math.random() * tables.length)];
    const b = Math.floor(Math.random() * 12) + 1;
    const type = types[Math.floor(Math.random() * types.length)];
    questions.push({ q: `${t} × ${b} = ___`, a: `${t * b}`, type });
  }

  return questions;
}

const DECORATIONS = ['🌸', '⭐', '🌟', '🦋', '🌺', '🐝', '🌻', '🎀', '🌈', '🐱', '🌷', '✨'];

function WorksheetPreview({ config }: {
  config: { tables: number[]; difficulty: Difficulty; studentName: string; teacherName: string; schoolName: string; title: string };
}) {
  const questions = generateWorksheetQuestions(config.tables, config.difficulty, ['fill']);
  const cols = 2;
  const half = Math.ceil(questions.length / 2);

  return (
    <div id="worksheet-preview" className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 print:shadow-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-400 to-blue-500 p-4 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 text-5xl opacity-20">
          {DECORATIONS.slice(0, 4).map((d, i) => <span key={i} className="mx-1">{d}</span>)}
        </div>
        <div className="relative text-center">
          {config.schoolName && <p className="text-blue-100 text-sm font-semibold">{config.schoolName}</p>}
          <h2 className="text-2xl font-black">{config.title || 'ورقة عمل - جدول الضرب'}</h2>
          <div className="flex justify-between mt-3 text-sm">
            <div>الاسم: <span className="font-bold">{config.studentName || '________________'}</span></div>
            <div>التاريخ: ________________</div>
            <div>الدرجة: __ / {questions.length}</div>
          </div>
          {config.teacherName && <div className="text-blue-100 text-sm mt-1">المعلم: {config.teacherName}</div>}
        </div>
      </div>

      {/* Decorative borders */}
      <div className="border-t-4 border-dashed border-sky-200 mx-4" />

      {/* Questions */}
      <div className="p-6 notebook-lines">
        <p className="text-gray-600 font-bold mb-4 text-sm">أجب على المسائل التالية:</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {questions.map((q, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sky-600 font-black text-sm w-6 flex-shrink-0">{typeof formatNum === 'function' ? formatNum(i + 1, 'western') : i + 1}.</span>
              <span className="text-gray-800 font-black text-lg">{q.q}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-sky-50 border-t border-sky-100 p-3 flex justify-between items-center text-xs text-gray-400">
        <div className="flex gap-1 text-lg">{DECORATIONS.slice(4, 9).map((d, i) => <span key={i}>{d}</span>)}</div>
        <span className="font-semibold">مملكة جدول الضرب</span>
        <div className="flex gap-1 text-lg">{DECORATIONS.slice(9).map((d, i) => <span key={i}>{d}</span>)}</div>
      </div>
    </div>
  );
}

export default function WorksheetsPage() {
  const { student } = useStudent();
  const { numberSystem } = useSettings();
  const [tables, setTables] = useState<number[]>([2, 3, 4, 5]);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [studentName, setStudentName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [title, setTitle] = useState('');
  const [generated, setGenerated] = useState(false);
  const [key, setKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const generate = () => {
    setKey(k => k + 1);
    setGenerated(true);
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    const questions = generateWorksheetQuestions(tables, difficulty, ['fill']);
    await supabase.from('worksheets').insert({
      title: title || 'ورقة عمل جدول الضرب',
      created_by: teacherName || 'معلم',
      table_numbers: tables,
      difficulty,
      student_name: studentName,
      teacher_name: teacherName,
      school_name: schoolName,
      questions,
    });
    setSaved(true);
    setSaving(false);
  };

  const handlePrint = () => window.print();

  const previewRef = useRef<HTMLDivElement>(null);

  const exportPDF = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const imgData = canvas.toDataURL('image/png');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
    pdf.save(`${title || 'worksheet'}.pdf`);
  };

  const exportImage = async (format: 'png' | 'jpg') => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const link = document.createElement('a');
    link.href = canvas.toDataURL(`image/${format}`);
    link.download = `${title || 'worksheet'}.${format}`;
    link.click();
  };

  const config = { tables, difficulty, studentName, teacherName, schoolName, title };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">📄</motion.div>
          <h1 className="text-4xl font-black text-sky-700 mb-2">مولّد أوراق العمل</h1>
          <p className="text-gray-500 text-lg">أنشئ أوراق عمل جميلة ومخصصة لطباعتها</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Tables */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-sky-100">
              <h3 className="font-black text-gray-700 mb-4 flex items-center gap-2">
                <span>📊</span> اختر الجداول
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                  <button key={num} onClick={() => setTables(t => t.includes(num) ? t.filter(x => x !== num) : [...t, num])}
                    className={`w-12 h-12 rounded-xl font-black text-lg transition-all ${tables.includes(num) ? 'bg-sky-500 text-white shadow-md' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'}`}>
                    {formatNum(num, numberSystem)}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-sky-100">
              <h3 className="font-black text-gray-700 mb-4 flex items-center gap-2">
                <span>🎯</span> مستوى الصعوبة
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'easy', label: 'سهل', num: `${formatNum(12, numberSystem)} سؤال`, color: 'bg-green-500' },
                  { id: 'medium', label: 'متوسط', num: `${formatNum(16, numberSystem)} سؤال`, color: 'bg-yellow-500' },
                  { id: 'hard', label: 'صعب', num: `${formatNum(20, numberSystem)} سؤال`, color: 'bg-red-500' },
                ] as const).map(d => (
                  <button key={d.id} onClick={() => setDifficulty(d.id)}
                    className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${difficulty === d.id ? `${d.color} text-white border-transparent shadow-md` : 'border-gray-200 text-gray-600 hover:border-sky-200'}`}>
                    <div>{d.label}</div>
                    <div className="text-xs opacity-80">{d.num}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-sky-100 space-y-3">
              <h3 className="font-black text-gray-700 mb-4 flex items-center gap-2">
                <span>📝</span> معلومات الورقة
              </h3>
              {[
                { label: 'عنوان الورقة', val: title, set: setTitle, placeholder: 'مثال: اختبار جداول الضرب' },
                { label: 'اسم الطالب', val: studentName, set: setStudentName, placeholder: 'اسم الطالب (اختياري)' },
                { label: 'اسم المعلم', val: teacherName, set: setTeacherName, placeholder: 'اسم المعلم' },
                { label: 'اسم المدرسة', val: schoolName, set: setSchoolName, placeholder: 'اسم المدرسة' },
              ].map(field => (
                <div key={field.label}>
                  <label className="block text-sm font-bold text-gray-600 mb-1">{field.label}</label>
                  <input value={field.val} onChange={e => field.set(e.target.value)} placeholder={field.placeholder}
                    className="w-full border-2 border-sky-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-300 bg-sky-50" />
                </div>
              ))}
            </div>

            {/* Generate Button */}
            <button onClick={generate} disabled={tables.length === 0}
              className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black py-4 rounded-2xl text-xl shadow-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5" />
              توليد الورقة
            </button>
          </div>

          {/* Preview */}
          <div>
            {generated ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div ref={previewRef}>
                  <WorksheetPreview key={key} config={config} />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button onClick={handlePrint} className="flex items-center justify-center gap-2 bg-sky-500 text-white font-bold py-3 rounded-xl hover:bg-sky-600 shadow-md text-sm">
                    <Printer className="w-4 h-4" /> طباعة
                  </button>
                  <button onClick={() => exportPDF()} className="flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 shadow-md text-sm">
                    <FileDown className="w-4 h-4" /> PDF
                  </button>
                  <button onClick={() => exportImage('png')} className="flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 shadow-md text-sm">
                    <Download className="w-4 h-4" /> PNG
                  </button>
                  <button onClick={() => exportImage('jpg')} className="flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 shadow-md text-sm">
                    <Download className="w-4 h-4" /> JPG
                  </button>
                </div>
                <div className="flex gap-3 mt-3">
                  <button onClick={generate} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200">
                    <RefreshCw className="w-4 h-4" /> جديدة
                  </button>
                  <button onClick={save} disabled={saving || saved} className={`flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl shadow-md ${saved ? 'bg-green-100 text-green-700' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                    <Star className="w-4 h-4" />
                    {saving ? '...' : saved ? 'تم الحفظ' : 'حفظ'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-3xl border-2 border-dashed border-sky-200 p-12 text-center flex flex-col items-center justify-center min-h-80">
                <div className="text-5xl mb-4">📄</div>
                <p className="text-gray-400 font-semibold text-lg">اضبط الإعدادات واضغط</p>
                <p className="text-sky-400 font-black text-xl">"توليد الورقة"</p>
                <p className="text-gray-400 text-sm mt-2">لتظهر الورقة هنا</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #worksheet-preview, #worksheet-preview * { visibility: visible; }
          #worksheet-preview { position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
