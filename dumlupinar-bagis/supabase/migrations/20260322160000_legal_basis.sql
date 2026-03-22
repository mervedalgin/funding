-- ============================================================================
-- legal_basis_items: Yasal dayanak/mevzuat yönetimi
-- FAQ ile aynı pattern — admin CRUD, public sadece aktif okur
-- ============================================================================

create table public.legal_basis_items (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  content     text not null,
  icon_name   text default 'scale',
  url         text,
  sort_order  integer default 0,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Auto-update updated_at
create trigger set_legal_basis_updated_at
  before update on public.legal_basis_items
  for each row execute function update_updated_at();

-- RLS
alter table public.legal_basis_items enable row level security;

-- Public: sadece aktif kayıtları okuyabilir
create policy "Public can view active legal basis"
  on legal_basis_items for select
  using (is_active = true);

-- Admin: tümünü okuyabilir
create policy "Admin can view all legal basis"
  on legal_basis_items for select
  using (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- Admin: ekleyebilir
create policy "Admin can insert legal basis"
  on legal_basis_items for insert
  with check (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- Admin: güncelleyebilir
create policy "Admin can update legal basis"
  on legal_basis_items for update
  using (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- Admin: silebilir
create policy "Admin can delete legal basis"
  on legal_basis_items for delete
  using (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- Index
create index idx_legal_basis_sort on legal_basis_items(sort_order);
create index idx_legal_basis_active on legal_basis_items(is_active);
