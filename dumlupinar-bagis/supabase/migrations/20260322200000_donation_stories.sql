-- ============================================================================
-- donation_stories: Bağış hikayeleri / blog
-- Tamamlanan bağışların hikayelerini yönetir
-- ============================================================================

create table public.donation_stories (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text unique not null,
  summary           text,
  content           text not null,
  cover_image_url   text,
  gallery_images    jsonb default '[]',
  donation_item_id  uuid references public.donation_items(id) on delete set null,
  donation_amount   numeric(10, 2),
  impact_text       text,
  completed_at      date,
  tags              text[] default '{}',
  is_published      boolean default false,
  view_count        integer default 0,
  sort_order        integer default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Auto-update updated_at
create trigger set_stories_updated_at
  before update on public.donation_stories
  for each row execute function update_updated_at();

-- RLS
alter table public.donation_stories enable row level security;

-- Public: sadece yayınlanmış hikayeler
create policy "Public can view published stories"
  on donation_stories for select
  using (is_published = true);

-- Admin: tümünü okuyabilir
create policy "Admin can view all stories"
  on donation_stories for select
  using (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- Admin: ekleyebilir
create policy "Admin can insert stories"
  on donation_stories for insert
  with check (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- Admin: güncelleyebilir
create policy "Admin can update stories"
  on donation_stories for update
  using (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- Admin: silebilir
create policy "Admin can delete stories"
  on donation_stories for delete
  using (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- Indexes
create index idx_stories_slug on donation_stories(slug);
create index idx_stories_published on donation_stories(is_published);
create index idx_stories_item on donation_stories(donation_item_id);
create index idx_stories_created on donation_stories(created_at desc);
create index idx_stories_sort on donation_stories(sort_order);

-- Görüntülenme sayacı RPC (atomic increment)
create or replace function increment_story_view(p_story_id uuid)
returns void as $$
begin
  update public.donation_stories
  set view_count = view_count + 1
  where id = p_story_id;
end;
$$ language plpgsql security definer;

-- Audit trigger
create or replace function audit_donation_stories()
returns trigger as $$
begin
  insert into public.audit_log (user_id, action, table_name, record_id, old_data, new_data)
  values (
    auth.uid(),
    TG_OP,
    'donation_stories',
    coalesce(NEW.id, OLD.id),
    case when TG_OP = 'DELETE' then row_to_json(OLD)::jsonb else null end,
    case when TG_OP != 'DELETE' then row_to_json(NEW)::jsonb else null end
  );
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

create trigger audit_stories_trigger
  after insert or update or delete on public.donation_stories
  for each row execute function audit_donation_stories();
