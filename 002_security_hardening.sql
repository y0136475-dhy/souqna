-- تحسينات أمان إضافية. نفّذ هذا الملف بعد 001_init.sql.
-- الطلبات تُقرأ من الأطراف المعنية فقط. لا نسمح بتغيير الحالة مباشرة من المتصفح
-- حتى تتم إضافة إجراءات خادمية/RPC تتحقق من انتقالات الحالات.
drop policy if exists "إنشاء طلب" on public.orders;
create policy "إنشاء طلب مرتبط بإعلان منشور" on public.orders
for insert with check (
  customer_id = auth.uid()
  and status = 'new'
  and exists (
    select 1 from public.listings l
    where l.id = listing_id and l.owner_id = seller_id and l.status = 'active'
  )
);
drop policy if exists "البائع أو المندوب يحدّث الحالة" on public.orders;

-- قصر الرسائل على أطراف مرتبطة بإعلان، ومنع انتحال هوية المرسل.
drop policy if exists "إرسال رسالة" on public.messages;
create policy "رسالة مرتبطة بإعلان" on public.messages
for insert with check (
  sender_id = auth.uid()
  and sender_id <> recipient_id
  and exists (
    select 1 from public.listings l
    where l.id = listing_id
      and (l.owner_id = recipient_id or l.owner_id = sender_id)
  )
);

-- المراجعات تخص إعلانًا منشورًا ولا يراجع المالك إعلانه.
drop policy if exists "كتابة مراجعة" on public.reviews;
create policy "مراجعة إعلان منشور" on public.reviews
for insert with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.listings l
    where l.id = listing_id and l.status = 'active' and l.owner_id <> auth.uid()
  )
);

create index if not exists listings_active_created_idx on public.listings (created_at desc) where status = 'active';
create index if not exists listings_owner_created_idx on public.listings (owner_id, created_at desc);
create index if not exists messages_listing_created_idx on public.messages (listing_id, created_at);
