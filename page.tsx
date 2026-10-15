import Link from 'next/link';
import { SECTIONS } from '@/lib/supabase';

const icons: Record<string,string> = {products:'🛍️',restaurants:'🍽️',delivery:'🚚',services:'🧰',realestate:'🏠',cars:'🚗',jobs:'💼',classifieds:'📣',offers:'✨'};
export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-bl from-emerald-50 via-white to-amber-50">
        <div className="container grid gap-8 py-12 md:grid-cols-[1.1fr_.9fr] md:items-center md:py-20">
          <div>
            <span className="badge">السوق الجزائري في مكان واحد</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">تبحث عن شيء؟<br/><span className="text-teal-700">ستجده في سوقنا.</span></h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">اكتشف المنتجات والمطاعم والخدمات والعقارات والوظائف في ولايتك. هل لديك مشروع؟ اعرض ما تقدمه واجعل العملاء يصلون إليك.</p>
            <form action="/search" className="mt-7 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row">
              <input name="q" aria-label="كلمات البحث" placeholder="ابحث عن هاتف، مطعم، شقة، خدمة..." className="min-w-0 flex-1 rounded-xl px-3 py-3 outline-none"/>
              <button className="btn btn-primary">ابحث الآن ←</button>
            </form>
            <div className="mt-6 flex flex-wrap gap-5 text-sm text-slate-600"><span>✓ تصفح حسب الولاية</span><span>✓ أقسام متعددة</span><span>✓ إضافة إعلان بسهولة</span></div>
          </div>
          <div className="relative mx-auto grid w-full max-w-md grid-cols-3 gap-3 rounded-[30px] bg-emerald-100 p-5 sm:p-8">
            {Object.entries(SECTIONS).slice(0,6).map(([key,label]) => <Link key={key} href={`/search?section=${key}`} className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-white bg-white p-3 text-center shadow-sm transition hover:-translate-y-1 hover:border-teal-300"><span className="text-3xl">{icons[key]}</span><span className="mt-2 text-sm font-bold">{label}</span></Link>)}
            <div className="col-span-3 rounded-2xl bg-ink p-4 text-center text-white"><p className="font-bold">سوقنا — فرص أقرب إليك</p><p className="mt-1 text-xs text-slate-300">ابدأ البحث أو انشر إعلانك اليوم</p></div>
          </div>
        </div>
      </section>
      <section className="container py-12">
        <div className="mb-6 flex items-end justify-between gap-3"><div><h2 className="text-2xl font-extrabold">تصفّح الأقسام</h2><p className="mt-1 text-sm text-slate-500">اختر القسم المناسب للوصول إلى ما تحتاجه.</p></div><Link href="/search" className="text-sm font-bold text-teal-700">كل الإعلانات ←</Link></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{Object.entries(SECTIONS).map(([key,label]) => <Link key={key} href={`/search?section=${key}`} className="card flex items-center gap-3 p-4 transition hover:-translate-y-1 hover:border-teal-300"><span className="text-2xl">{icons[key]}</span><span className="font-bold text-sm">{label}</span></Link>)}</div>
      </section>
      <section className="container pb-2"><div className="flex flex-col justify-between gap-5 rounded-3xl bg-ink p-7 text-white sm:flex-row sm:items-center sm:p-10"><div><h2 className="text-2xl font-extrabold">هل لديك متجر أو خدمة؟</h2><p className="mt-2 text-slate-300">أنشئ إعلانك وعرّف الناس بما تقدمه.</p></div><Link href="/listings/new" className="btn bg-amber-400 text-ink">＋ أضف إعلانك مجانًا</Link></div></section>
    </>
  );
}
