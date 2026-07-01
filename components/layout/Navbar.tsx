'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useStudent } from '@/lib/student-context';
import { useSettings } from '@/lib/settings-context';
import { formatNum } from '@/lib/numerals';
import { Star, Menu, X, BookOpen, Crown, Gamepad2, FileText, BarChart3, Home, ChevronDown } from 'lucide-react';

const navSections = [
  {
    label: 'التعلم',
    icon: BookOpen,
    color: 'text-sky-600',
    items: [
      { href: '/understand', label: 'فهم الضرب', icon: '🍎' },
      { href: '/tables', label: 'جداول الضرب', icon: '📊' },
      { href: '/practice', label: 'تدريب الكتابة', icon: '✏️' },
      { href: '/exercises', label: 'الجمع المتكرر', icon: '➕' },
      { href: '/commutative', label: 'خاصية الإبدال', icon: '🔄' },
      { href: '/division', label: 'الضرب والقسمة', icon: '➗' },
      { href: '/match', label: 'مطابقة النتائج', icon: '🎯' },
    ],
  },
  {
    label: 'التقييم',
    icon: Crown,
    color: 'text-yellow-600',
    items: [
      { href: '/quizzes', label: 'الاختبارات', icon: '📝' },
      { href: '/games', label: 'الألعاب', icon: '🎮' },
    ],
  },
  {
    label: 'المعلم',
    icon: FileText,
    color: 'text-green-600',
    items: [
      { href: '/worksheets', label: 'أوراق العمل', icon: '📄' },
      { href: '/teacher', label: 'لوحة المعلم', icon: '👩‍🏫' },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const { student } = useStudent();
  const { numberSystem } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-white shadow-md border-b-4 border-sky-400 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white text-xl">👑</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-sky-700 font-black text-lg leading-tight">مملكة</div>
              <div className="text-sky-500 font-bold text-sm leading-tight">جدول الضرب</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/" className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold transition-all ${isActive('/') ? 'bg-sky-100 text-sky-700' : 'text-gray-600 hover:bg-sky-50 hover:text-sky-600'}`}>
              <Home className="w-4 h-4" />
              الرئيسية
            </Link>
            {navSections.map((section) => (
              <div key={section.label} className="relative group">
                <button className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold transition-all text-gray-600 hover:bg-sky-50 hover:text-sky-600`}>
                  <section.icon className={`w-4 h-4 ${section.color}`} />
                  {section.label}
                  <ChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute top-full right-0 mt-1 bg-white rounded-2xl shadow-xl border border-sky-100 p-2 min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {section.items.map((item) => (
                    <Link key={item.href} href={item.href} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${isActive(item.href) ? 'bg-sky-100 text-sky-700' : 'text-gray-600 hover:bg-sky-50 hover:text-sky-600'}`}>
                      <span>{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <Link href="/progress" className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold transition-all ${isActive('/progress') ? 'bg-sky-100 text-sky-700' : 'text-gray-600 hover:bg-sky-50 hover:text-sky-600'}`}>
              <BarChart3 className="w-4 h-4 text-pink-500" />
              تقدمي
            </Link>
          </div>

          {/* Student Badge & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {student && (
              <Link href="/progress" className="hidden sm:flex items-center gap-2 bg-yellow-50 border-2 border-yellow-300 rounded-xl px-3 py-1.5 hover:bg-yellow-100 transition-colors">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                <span className="text-yellow-700 font-bold text-sm">{formatNum(student.total_stars, numberSystem)}</span>
                <span className="text-gray-600 text-sm font-semibold">{student.name}</span>
              </Link>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-sky-100 bg-white px-4 pb-4 max-h-[80vh] overflow-y-auto">
          <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-3 text-gray-700 font-bold border-b border-sky-50">
            <Home className="w-4 h-4 text-sky-500" /> الرئيسية
          </Link>
          {navSections.map((section) => (
            <div key={section.label}>
              <button
                onClick={() => setOpenSection(openSection === section.label ? null : section.label)}
                className="flex items-center justify-between w-full py-3 text-gray-700 font-bold border-b border-sky-50"
              >
                <div className="flex items-center gap-2">
                  <section.icon className={`w-4 h-4 ${section.color}`} />
                  {section.label}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === section.label ? 'rotate-180' : ''}`} />
              </button>
              {openSection === section.label && (
                <div className="pr-6 pb-2">
                  {section.items.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 py-2 text-sm font-semibold ${isActive(item.href) ? 'text-sky-600' : 'text-gray-600'}`}>
                      <span>{item.icon}</span> {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link href="/progress" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-3 text-gray-700 font-bold">
            <BarChart3 className="w-4 h-4 text-pink-500" /> تقدمي
          </Link>
          {student && (
            <div className="mt-3 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
              <span className="text-yellow-700 font-bold">{formatNum(student.total_stars, numberSystem)} نجمة</span>
              <span className="text-gray-600 font-semibold">- {student.name}</span>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
