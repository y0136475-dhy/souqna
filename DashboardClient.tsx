'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase, SECTIONS } from '@/lib/supabase';

type Listing = { id:string; title:string; section:string; status:string; price:number|null; created_at:string };
export default function DashboardClient(){
  const [loading,setLoading]=useState(true); const [email,setEmail]=useState(''); const [role,setRole]=useState('customer'); const [items,setItems]=useState<Listing[]>([]); const [error,setError]=useState('');
  useEffect(()=>{let live=true;(async()=>{
    if(!supabase){if(live){setError('قاعدة البيانات غير مربوطة بعد.');setLoading(false)}return}
    const {data:{user},error:authError}=await supabase.auth.getUser();
    if(!live)return;
    if(authError||!user){window.location.href='/auth';return}
    setEmail(user.email||'');
    const {data:profile}=await supabase.from('profiles').select('role').eq('id',user.id).maybeSingle();
    if(profile?.role)setRole(profile.role);
    const {data,error:queryError}=await supabase.from('listings').select('id,title,section,status,price,created_at').eq('owner_id',user.id).order('created_at',{ascending:false});
    if(!live)return;
    if(queryError)setError('تعذّر تحميل إعلاناتك. تحقق من سياسات قاعدة البيانات.');
    else setItems((data||[]) as Listing[]);
    setLoading(false);
  })();return()=>{live=false}},[]);
  async function logout(){if(supabase)await supabase.auth.signOut();window.location.href='/'}
  const statuses:Record<string,string>={pending:'قيد المراجعة',active:'منشور',rejected:'مرفوض',sold:'مباع'};
  return <div className="container py-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><span className="badge">مساحة المستخدم</span><h1 className="mt-3 text-3xl font-extrabold">لوحة التحكم</h1><p className="mt-2 text-sm text-slate-500">{email}</p></div><div className="flex flex-wrap gap-2">{role==='admin'&&<Link href="/admin" className="btn btn-secondary">إدارة المنصة</Link>}<Link href="/listings/new" className="btn btn-primary">＋ إعلان جديد</Link><button onClick={logout} className="btn btn-secondary">تسجيل الخروج</button></div></div>
    <div className="mt-7 grid gap-4 sm:grid-cols-3"><div className="card p-5"><p className="text-sm text-slate-500">إجمالي إعلاناتك</p><p className="mt-2 text-3xl font-extrabold">{loading?'—':items.length}</p></div><div className="card p-5"><p className="text-sm text-slate-500">إعلانات منشورة</p><p className="mt-2 text-3xl font-extrabold">{loading?'—':items.filter(x=>x.status==='active').length}</p></div><div className="card p-5"><p className="text-sm text-slate-500">قيد المراجعة</p><p className="mt-2 text-3xl font-extrabold">{loading?'—':items.filter(x=>x.status==='pending').length}</p></div></div>
    <div className="mt-8"><h2 className="mb-4 text-xl font-extrabold">إعلاناتي</h2>{loading?<div className="card p-8 text-center">جارٍ تحميل بياناتك...</div>:error?<div className="rounded-xl bg-amber-50 p-4 text-amber-900">{error}</div>:items.length===0?<div className="card py-12 text-center"><p className="text-4xl">📦</p><h3 className="mt-3 font-bold">لم تضف أي إعلان بعد</h3><p className="mt-2 text-sm text-slate-500">ابدأ بإضافة أول منتج أو خدمة.</p><Link href="/listings/new" className="btn btn-primary mt-5">أضف إعلانك</Link></div>:<div className="space-y-3">{items.map(item=><div key={item.id} className="card flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"><div><h3 className="font-bold">{item.title}</h3><p className="mt-1 text-sm text-slate-500">{SECTIONS[item.section]||item.section} · {new Date(item.created_at).toLocaleDateString('ar-DZ')}</p></div><div className="flex items-center gap-3"><span className="badge">{statuses[item.status]||item.status}</span><strong className="text-teal-700">{item.price==null?'السعر عند التواصل':`${Number(item.price).toLocaleString('ar-DZ')} دج`}</strong></div></div>)}</div>}</div>
  </div>
}
