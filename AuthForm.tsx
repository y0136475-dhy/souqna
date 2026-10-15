'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AuthForm() {
  const [mode,setMode] = useState<'signin'|'signup'>('signin');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [name,setName] = useState('');
  const [message,setMessage] = useState('');
  const [busy,setBusy] = useState(false);
  async function submit(e:FormEvent) {
    e.preventDefault(); setMessage('');
    if (!supabase) { setMessage('قاعدة البيانات غير مربوطة بعد. أضف مفاتيح Supabase في متغيرات البيئة.'); return; }
    setBusy(true);
    try {
      if (mode==='signup') {
        const {error} = await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});
        if(error) throw error;
        setMessage('تم إرسال طلب التسجيل. إذا كان تأكيد البريد مفعّلًا، افتح بريدك لتأكيد الحساب.');
      } else {
        const {error} = await supabase.auth.signInWithPassword({email,password});
        if(error) throw error;
        window.location.href='/dashboard';
      }
    } catch(err:any) { setMessage(err?.message || 'تعذّر إتمام العملية. حاول مجددًا.'); }
    finally { setBusy(false); }
  }
  return <div className="card mx-auto w-full max-w-md p-6 sm:p-8">
    <div className="mb-5 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ink text-2xl font-extrabold text-white">س</div><h1 className="mt-4 text-2xl font-extrabold">{mode==='signin'?'مرحبًا بعودتك':'أنشئ حسابك في سوقنا'}</h1><p className="mt-2 text-sm text-slate-500">حساب واحد للتصفح وإدارة إعلاناتك.</p></div>
    <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={()=>{setMode('signin');setMessage('')}} className={`rounded-lg p-2 text-sm font-bold ${mode==='signin'?'bg-white shadow-sm':''}`}>تسجيل الدخول</button><button type="button" onClick={()=>{setMode('signup');setMessage('')}} className={`rounded-lg p-2 text-sm font-bold ${mode==='signup'?'bg-white shadow-sm':''}`}>حساب جديد</button></div>
    <form onSubmit={submit} className="space-y-4">
      {mode==='signup'&&<div className="field"><label htmlFor="name">الاسم الكامل</label><input id="name" value={name} onChange={e=>setName(e.target.value)} required minLength={2} autoComplete="name" placeholder="اسمك"/></div>}
      <div className="field"><label htmlFor="email">البريد الإلكتروني</label><input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" dir="ltr"/></div>
      <div className="field"><label htmlFor="password">كلمة المرور</label><input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} autoComplete={mode==='signin'?'current-password':'new-password'} placeholder="8 أحرف على الأقل" dir="ltr"/></div>
      <button disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy?'جارٍ المعالجة...':mode==='signin'?'تسجيل الدخول':'إنشاء الحساب'}</button>
    </form>
    {message&&<p role="status" className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">{message}</p>}
    <p className="mt-5 text-center text-xs leading-6 text-slate-500">بإنشاء الحساب، توافق على <Link className="text-teal-700 underline" href="/terms">شروط الاستخدام</Link> و<Link className="text-teal-700 underline" href="/privacy">سياسة الخصوصية</Link>.</p>
  </div>;
}
