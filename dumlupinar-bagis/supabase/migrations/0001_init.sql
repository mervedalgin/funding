-- Bağış ihtiyaç kalemleri tablosu
create table public.donation_items (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  image_url   text,
  price       numeric(10, 2) not null default 0,

  -- Seçenek A: Ödeme bilgileri (IBAN + açıklama kodu)
  bank_name   text,
  iban        text,
  payment_ref text,
  payment_url text,

  -- Etki metni ve bağışçı sayacı
  impact_text       text,
  donor_count       integer default 0,

  -- Tutar seçici için minimum katkı tutarı
  custom_amount_min numeric(10, 2) default 10,

  -- Bağış takip
  target_amount    numeric(10, 2) default 0,
  collected_amount numeric(10, 2) default 0,

  -- İnternet bankacılığı yönlendirme linki
  internet_banking_url text,

  -- Durum yönetimi
  status      text not null default 'draft'
                check (status in ('active', 'draft', 'completed')),
  sort_order  integer default 0,

  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Ödeme kanalları tablosu
create table public.payment_channels (
  id           uuid primary key default gen_random_uuid(),
  label        text not null,
  icon_name    text,
  bank_name    text,
  iban         text,
  description  text,
  url          text,
  is_active    boolean default true,
  sort_order   integer default 0
);

alter table public.payment_channels enable row level security;
create policy "Public can read active payment channels"
  on public.payment_channels for select
  using (is_active = true);

-- Otomatik updated_at güncellemesi
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger donation_items_updated_at
  before update on public.donation_items
  for each row execute function update_updated_at();

-- RLS — sadece aktif kayıtlar halka açık
alter table public.donation_items enable row level security;

create policy "Public can read active items"
  on public.donation_items for select
  using (status = 'active');
