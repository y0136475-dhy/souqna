import './globals.css';
import Link from 'next/link';
export const metadata = {
  title: { default: 'سوقنا | السوق الجزائري في مكان واحد', template: '%s | سوقنا' },
  description: 'سوقنا منصة جزائرية للمنتجات والمطاعم والتوصيل والخدمات والعقارات والوظائف.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <nav className="container flex min-h-[74px] items-center gap-4 py-3">
            <Link href="/" className="flex shrink-0 items-center gap-2 text-2xl font-extrabold">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-white">س</span>
              <span>سوقنا<span className="block text-[11px] font-normal text-slate-500 -mt-1">كل شيء أقرب إليك</span></span>
            </Link>
            <div className="mr-auto hidden items-center gap-5 text-sm font-semibold text-slate-600 md:flex">
              <Link href="/search" className="hover:text-teal-700">تصفّح الإعلانات</Link>
              <Link href="/listings/new" className="hover:text-teal-700">أضف إعلانًا</Link>
              <Link href="/dashboard" className="hover:text-teal-700">حسابي</Link>
            </div>
            <Link href="/auth" className="btn btn-primary text-sm">دخول / تسجيل</Link>
          </nav>
          <div className="container flex gap-4 overflow-x-auto pb-3 text-xs font-semibold text-slate-500 md:hidden">
            <Link href="/search">الإعلانات</Link><Link href="/listings/new">أضف إعلانًا</Link><Link href="/dashboard">حسابي</Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-12 border-t border-slate-200 bg-white">
          <div className="container flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-extrabold text-lg">سوقنا 🇩🇿</p><p className="mt-1 max-w-xl text-sm text-slate-500">منصة جزائرية تجمع المنتجات والمطاعم والخدمات والعقارات والوظائف في مكان واحد.</p></div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600"><Link href="/search">تصفّح</Link><Link href="/listings/new">أضف إعلانًا</Link><Link href="/privacy">الخصوصية</Link><Link href="/terms">الشروط</Link></div>
          </div>
          <p className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">© 2026 سوقنا. الإعلانات والمعلومات مسؤولية أصحابها.</p>
        </footer>
      </body>
    </html>
  );
}
