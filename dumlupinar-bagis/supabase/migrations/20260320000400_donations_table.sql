-- ============================================================================
-- 0004: Donations table — bağışçı takip sistemi
--
-- Bağışçıların yaptığı bağışları kayıt altına alır.
-- Anonim kullanıcılar bağış kaydı oluşturabilir (INSERT),
-- sadece admin onaylayabilir/görüntüleyebilir (SELECT/UPDATE).
-- ============================================================================

create table public.donations (
  id             uuid primary key default gen_random_uuid(),
  item_id        uuid references public.donation_items(id) on delete set null,
  donor_name     text,
  donor_email    text,
  donor_phone    text,
  amount         numeric(10, 2) not null,
  payment_method text default 'bank_transfer',
  payment_ref    text,
  status         text default 'pending'
                   check (status in ('pending', 'confirmed', 'rejected')),
  notes          text,
  confirmed_by   uuid references auth.users(id),
  confirmed_at   timestamptz,
  created_at     timestamptz default now()
);

-- RLS
alter table public.donations enable row level security;

-- Anonim kullanıcılar bağış kaydı oluşturabilir
create policy "Anyone can insert donations"
  on public.donations for insert
  to anon, authenticated
  with check (true);

-- Sadece admin bağışları görüntüleyebilir
create policy "Admin can read donations"
  on public.donations for select
  to authenticated
  using (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- Sadece admin bağış durumunu güncelleyebilir
create policy "Admin can update donations"
  on public.donations for update
  to authenticated
  using (auth.jwt() ->> 'email' = '741604birecik@gmail.com')
  with check (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- Sadece admin bağış kaydı silebilir
create policy "Admin can delete donations"
  on public.donations for delete
  to authenticated
  using (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- Index: item_id ile sorgulama hızlandırma
create index idx_donations_item_id on public.donations(item_id);
create index idx_donations_status on public.donations(status);
create index idx_donations_created_at on public.donations(created_at desc);
