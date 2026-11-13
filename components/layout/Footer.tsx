export const TEACHER_CREDIT = 'مستر وائل عبد الله – قناة التأسيس السليم';

export default function Footer() {
  return (
    <footer
      dir="rtl"
      className="border-t border-sky-100 bg-white/80 backdrop-blur-sm px-4 py-3 text-center select-none print:hidden"
    >
      <p className="text-xs sm:text-sm font-semibold text-sky-800">{TEACHER_CREDIT}</p>
    </footer>
  );
}
