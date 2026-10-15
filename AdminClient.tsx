'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, SECTIONS } from '@/lib/supabase';
type Pending = {id:string;title:string;description:string|null;section:string;price:number|null;created_at:string;owner_id:string};
export default function AdminClient(){
 const [loading,setLoading]=useState(true);const [allowed,setAllowed]=useState(false);const [items,setItems]=useState<Pending[]>([]);const [message,setMessage]=useState('');const [busy,setBusy]=useState('');
 async function load(){
  if(!supabase){setMessage('قاعدة البيانات غير مربوطة.');setLoading(false);return}
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){window.location.href='/auth';return}
  const {data:profile,error:pError}=await supabase.from('profiles').select('role').eq('id',user.id).maybeSingle();
  if(pError||profile?.role!=='admin'){setAllowed(false);setLoading(false);return}
  setAllowed(true);
  const {data,error}=await supabase.from('listings').select('id,title,description,section,price,created_at,owner_id').eq('status','pending').order('created_at',{ascending:true});
  if(error)setMessage('تعذّر تحميل الإعلانات قيد المراجعة. تحقق من سياسات RLS.');
  else setItems((data||[]) as Pending[]);
  setLoading(false);
 }
 useEffect(()=>{void load()},[]);
 async function decide(id:string,status:'active'|'rejected'){
  if(!supabase)return;setBusy(id);setMessage('');
  const {error}=await supabase.from('listings').update({status}).eq('id',id);
  if(error)setMessage('تعذّر تحديث الإعلان. تحقق من أن حسابك مدير وأن سياسات RLS مفعّلة.');
  else {setItems(old=>old.filter(x=>x.id!==id));setMessage(status==='active'?'تم نشر الإعلان.':'تم رفض الإعلان.')}
  setBusy('');
 }
 if(loading)return <div className="container py-12"><div className="card p-8 text-center">جارٍ التحقق من صلاحيات الحساب...</div></div>;
 if(!allowed)return <div className="container py-12"><div className="card mx-auto max-w-lg p-8 text-center"><h1 className="text-2xl font-extrabold">منطقة الإدارة</h1><p className="mt-3 text-slate-500">هذه الصفحة متاحة لحساب المدير فقط.</p><Link href="/" className="btn btn-primary mt-5">العودة للرئيسية</Link>{message&&<p className="mt-3 text-sm">{message}</p>}</div></div>;
 return <div className="container py-8"><span className="badge">إدارة المنصة</span><h1 className="mt-3 text-3xl font-extrabold">مراجعة الإعلانات</h1><p className="mt-2 text-slate-500">راجع المحتوى قبل نشره للعامة.</p>{message&&<p role="status" className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">{message}</p>}
 <div className="mt-6 space-y-4">{items.length===0?<div className="card p-10 text-center"><p className="text-3xl">✓</p><h2 className="mt-2 font-bold">لا توجد إعلانات تنتظر المراجعة</h2></div>:items.map(item=><article key={item.id} className="card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="badge">{SECTIONS[item.section]||item.section}</span><h2 className="mt-2 text-lg font-extrabold">{item.title}</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{item.description}</p><p className="mt-2 text-xs text-slate-500">المعرّف: {item.id} · {new Date(item.created_at).toLocaleDateString('ar-DZ')}</p></div><strong className="text-teal-700">{item.price==null?'السعر عند التواصل':`${Number(item.price).toLocaleString('ar-DZ')} دج`}</strong></div><div className="mt-5 flex gap-2"><button disabled={busy===item.id} onClick={()=>decide(item.id,'active')} className="btn btn-primary disabled:opacity-50">{busy===item.id?'جارٍ التحديث...':'موافقة ونشر'}</button><button disabled={busy===item.id} onClick={()=>decide(item.id,'rejected')} className="btn btn-secondary disabled:opacity-50">رفض</button></div></article>)}</div></div>
}
