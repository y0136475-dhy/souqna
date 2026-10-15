-- سوقنا: المخطط الأساسي + سياسات RLS
create type user_role as enum ('customer','merchant','restaurant','provider','courier','admin');
create type listing_status as enum ('pending','active','rejected','sold');
create type order_status as enum ('new','confirmed','preparing','out_for_delivery','delivered','cancelled');

create table wilayas (id int primary key, name text not null);
create table categories (id serial primary key, section text not null, name text not null);
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text, phone text, wilaya_id int references wilayas,
  role user_role not null default 'customer', created_at timestamptz default now());
create table stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles on delete cascade,
  name text not null, description text, wilaya_id int references wilayas, created_at timestamptz default now());
create table listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles on delete cascade,
  store_id uuid references stores on delete set null,
  section text not null check (section in ('products','restaurants','delivery','services','realestate','cars','jobs','classifieds','offers')),
  category_id int references categories,
  title text not null check (char_length(title) between 3 and 120),
  description text check (char_length(description) <= 4000),
  price numeric(12,2) check (price >= 0), -- بالدينار الجزائري
  wilaya_id int references wilayas,
  images text[] default '{}',
  status listing_status not null default 'pending',
  created_at timestamptz default now());
create index on listings (section, wilaya_id, price);
create table addresses (id uuid primary key default gen_random_uuid(), user_id uuid not null references profiles on delete cascade, wilaya_id int references wilayas, line text not null);
create table orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings, customer_id uuid not null references profiles,
  seller_id uuid not null references profiles, courier_id uuid references profiles,
  qty int not null default 1 check (qty > 0), address text not null,
  status order_status not null default 'new', created_at timestamptz default now());
create table favorites (user_id uuid references profiles on delete cascade, listing_id uuid references listings on delete cascade, primary key (user_id, listing_id));
create table reviews (id uuid primary key default gen_random_uuid(), listing_id uuid not null references listings on delete cascade, user_id uuid not null references profiles, rating int not null check (rating between 1 and 5), body text, unique (listing_id, user_id));
create table reports (id uuid primary key default gen_random_uuid(), listing_id uuid references listings on delete cascade, reporter_id uuid not null references profiles, reason text not null, resolved boolean default false, created_at timestamptz default now());
create table messages (id uuid primary key default gen_random_uuid(), listing_id uuid not null references listings on delete cascade, sender_id uuid not null references profiles, recipient_id uuid not null references profiles, body text not null check (char_length(body) <= 2000), created_at timestamptz default now());

create function is_admin() returns boolean language sql security definer stable set search_path = public
as $$ select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;

create function my_role() returns user_role language sql security definer stable set search_path = public
as $$ select role from profiles where id = auth.uid() $$;

-- الأدوار المسموحة عند التسجيل لا تشمل admin أبدًا
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, role) values (new.id, new.raw_user_meta_data->>'full_name',
    case when new.raw_user_meta_data->>'role' in ('merchant','restaurant','provider','courier')
         then (new.raw_user_meta_data->>'role')::user_role else 'customer' end);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

alter table wilayas enable row level security; alter table categories enable row level security;
alter table profiles enable row level security; alter table stores enable row level security;
alter table listings enable row level security; alter table addresses enable row level security;
alter table orders enable row level security; alter table favorites enable row level security;
alter table reviews enable row level security; alter table reports enable row level security;
alter table messages enable row level security;

create policy "قراءة عامة" on wilayas for select using (true);
create policy "قراءة عامة" on categories for select using (true);
create policy "قراءة عامة" on stores for select using (true);
create policy "قراءة عامة" on reviews for select using (true);
create policy "الملف: صاحبه أو المدير" on profiles for select using (id = auth.uid() or is_admin());
create policy "تعديل الملف دون تغيير الدور" on profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = my_role());
create policy "المدير يدير الملفات" on profiles for all using (is_admin());
create policy "المتجر لصاحبه" on stores for all using (owner_id = auth.uid() or is_admin()) with check (owner_id = auth.uid() or is_admin());
create policy "الإعلانات المفعّلة عامة" on listings for select using (status = 'active' or owner_id = auth.uid() or is_admin());
create policy "إضافة إعلان" on listings for insert with check (owner_id = auth.uid() and status = 'pending');
create policy "تعديل إعلانه" on listings for update using (owner_id = auth.uid()) with check (owner_id = auth.uid() and status in ('pending','sold'));
create policy "المدير يراجع الإعلانات" on listings for update using (is_admin());
create policy "حذف إعلانه" on listings for delete using (owner_id = auth.uid() or is_admin());
create policy "عناويني" on addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "طلباتي" on orders for select using (customer_id = auth.uid() or seller_id = auth.uid() or courier_id = auth.uid() or is_admin());
create policy "إنشاء طلب" on orders for insert with check (customer_id = auth.uid() and status = 'new');
create policy "البائع أو المندوب يحدّث الحالة" on orders for update using (seller_id = auth.uid() or courier_id = auth.uid() or is_admin());
create policy "مفضلتي" on favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "كتابة مراجعة" on reviews for insert with check (user_id = auth.uid());
create policy "إبلاغ" on reports for insert with check (reporter_id = auth.uid());
create policy "المدير يرى البلاغات" on reports for select using (is_admin());
create policy "المدير يحل البلاغات" on reports for update using (is_admin());
create policy "رسائلي" on messages for select using (sender_id = auth.uid() or recipient_id = auth.uid());
create policy "إرسال رسالة" on messages for insert with check (sender_id = auth.uid());
