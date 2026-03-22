-- FAQ items table
create table public.faq_items (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  category   text default 'genel',
  sort_order integer default 0,
  is_active  boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger set_faq_items_updated_at
  before update on public.faq_items
  for each row execute function update_updated_at();

alter table public.faq_items enable row level security;

create policy "Public can view active faq" on faq_items for select using (is_active = true);
create policy "Admin can view all faq" on faq_items for select using (auth.jwt() ->> 'email' = '741604birecik@gmail.com');
create policy "Admin can insert faq" on faq_items for insert with check (auth.jwt() ->> 'email' = '741604birecik@gmail.com');
create policy "Admin can update faq" on faq_items for update using (auth.jwt() ->> 'email' = '741604birecik@gmail.com');
create policy "Admin can delete faq" on faq_items for delete using (auth.jwt() ->> 'email' = '741604birecik@gmail.com');
