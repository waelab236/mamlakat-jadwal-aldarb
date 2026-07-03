import './globals.css';
import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import { StudentProvider } from '@/lib/student-context';
import { SettingsProvider } from '@/lib/settings-context';
import Navbar from '@/components/layout/Navbar';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '600', '700', '800', '900'],
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: 'مملكة جدول الضرب',
  description: 'تطبيق تعليمي عربي تفاعلي لتعلم جداول الضرب للأطفال من 6 إلى 12 سنة',
  icons: {
    icon: '/favicon.png',
    apple: '/icon.png',
  },
  openGraph: {
    images: [{ url: '/icon.png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo bg-sky-50 min-h-screen`}>
        <StudentProvider>
          <SettingsProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
          </SettingsProvider>
        </StudentProvider>
      </body>
    </html>
  );
}
