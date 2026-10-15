'use client';
import { FormEvent, useState } from 'react';
import { supabase, SECTIONS, WILAYAS } from '@/lib/supabase';

export default function NewListingForm() {
  const [title,setTitle]=useState(''); const [section,setSection]=useState('products');
  const [description,setDescription]=useState(''); const [price,setPrice]=useState('');
  const [wilaya,setWilaya]=useState(''); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
  async function submit(e:FormEvent) {
    e.preventDefault(); setMessage('');
    if(!supabase){setMessage('قاعدة البيانات غير مربوطة. أكمل إعداد Supabase أولًا.');return}
    setBusy(true);
    try {
      const {data:{user},error:authError}=await supabase.auth.getUser();
      if(authError||!user){window.location.href='/auth';return}
      const {data,error}=await supabase.from('listings').insert({
        owner_id:user.id, title:title.trim(), section, description:description.trim(),
        price:price===''?null:Number(price), wilaya_id:Number(wilaya), status:'pending'
      }).select('id').single();
      if(error) throw error;
      setMessage('تم إرسال إعلانك بنجاح، وهو الآن قيد المراجعة. يمكنك متابعة حالته من لوحة التحكم.');
      setTitle(''); setDescription(''); setPrice(''); setWilaya('');
    } catch(err:any){setMessage(err?.message||'تعذّر حفظ الإعلان. تأكد من تسجيل الدخول وإعداد قاعدة البيانات.')}
    finally{setBusy(false)}
  }
  return <form onSubmit={submit} className="card space-y-4 p-5 sm:p-7">
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="field sm:col-span-2"><label htmlFor="title">عنوان الإعلان *</label><input id="title" value={title} onChange={e=>setTitle(e.target.value)} required minLength={3} maxLength={120} placeholder="عنوان واضح ومختصر"/></div>
      <div className="field"><label htmlFor="section">القسم *</label><select id="section" value={section} onChange={e=>setSection(e.target.value)}>{Object.entries(SECTIONS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
      <div className="field"><label htmlFor="wilaya">الولاية *</label><select id="wilaya" value={wilaya} onChange={e=>setWilaya(e.target.value)} required><option value="">اختر الولاية</option>{WILAYAS.map((v,i)=><option key={v} value={i+1}>{v}</option>)}</select></div>
      <div className="field sm:col-span-2"><label htmlFor="price">السعر بالدينار الجزائري (اختياري)</label><input id="price" type="number" min="0" step="1" value={price} onChange={e=>setPrice(e.target.value)} placeholder="مثال: 15000"/></div>
      <div className="field sm:col-span-2"><label htmlFor="description">التفاصيل *</label><textarea id="description" value={description} onChange={e=>setDescription(e.target.value)} required minLength={10} maxLength={4000} placeholder="اكتب وصفًا صادقًا، والحالة، والسعر، وطريقة التواصل..."/></div>
    </div>
    <div className="rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">سيظهر إعلانك بحالة «قيد المراجعة» إلى أن يوافق عليه مدير المنصة. لا تضع رقم بطاقة أو بيانات حساسة في الوصف.</div>
    <button disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy?'جارٍ الحفظ...':'إرسال الإعلان للمراجعة'}</button>
    {message&&<p role="status" className="rounded-xl bg-slate-50 p-3 text-sm">{message}</p>}
  </form>;
}
