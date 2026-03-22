-- ============================================================================
-- slug alanları: donation_items ve student_needs için SEO-friendly URL'ler
-- ============================================================================

-- Türkçe → ASCII slug fonksiyonu (DB seviyesinde)
create or replace function generate_slug(input text)
returns text as $$
declare
  result text;
begin
  result := input;
  -- Türkçe karakter dönüşümü
  result := replace(result, 'ç', 'c'); result := replace(result, 'Ç', 'c');
  result := replace(result, 'ğ', 'g'); result := replace(result, 'Ğ', 'g');
  result := replace(result, 'ı', 'i'); result := replace(result, 'İ', 'i');
  result := replace(result, 'ö', 'o'); result := replace(result, 'Ö', 'o');
  result := replace(result, 'ş', 's'); result := replace(result, 'Ş', 's');
  result := replace(result, 'ü', 'u'); result := replace(result, 'Ü', 'u');
  -- Lowercase + temizlik
  result := lower(result);
  result := regexp_replace(result, '[^a-z0-9\s-]', '', 'g');
  result := regexp_replace(result, '\s+', '-', 'g');
  result := regexp_replace(result, '-+', '-', 'g');
  result := trim(both '-' from result);
  result := left(result, 80);
  return result;
end;
$$ language plpgsql immutable;

-- 1. donation_items slug
alter table public.donation_items add column if not exists slug text;

-- Mevcut kayıtlar için slug backfill
update public.donation_items set slug = generate_slug(title) where slug is null;

-- Uniqueness: çakışma varsa id'nin ilk 6 karakterini ekle
update public.donation_items d1
set slug = d1.slug || '-' || left(d1.id::text, 6)
where exists (
  select 1 from public.donation_items d2
  where d2.slug = d1.slug and d2.id != d1.id and d2.ctid < d1.ctid
);

alter table public.donation_items alter column slug set not null;
create unique index if not exists idx_donation_items_slug on public.donation_items(slug);

-- 2. student_needs slug
alter table public.student_needs add column if not exists slug text;

update public.student_needs set slug = generate_slug(title) where slug is null;

update public.student_needs d1
set slug = d1.slug || '-' || left(d1.id::text, 6)
where exists (
  select 1 from public.student_needs d2
  where d2.slug = d1.slug and d2.id != d1.id and d2.ctid < d1.ctid
);

alter table public.student_needs alter column slug set not null;
create unique index if not exists idx_student_needs_slug on public.student_needs(slug);

-- 3. Trigger: yeni kayıtlarda slug otomatik oluştur (boşsa)
create or replace function auto_generate_slug()
returns trigger as $$
begin
  if NEW.slug is null or NEW.slug = '' then
    NEW.slug := generate_slug(NEW.title);
    -- Uniqueness check: çakışma varsa random suffix ekle
    while exists (
      select 1 from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = TG_TABLE_SCHEMA and c.relname = TG_TABLE_NAME
    ) and exists (
      select 1 from public.donation_items where slug = NEW.slug and id != coalesce(NEW.id, '00000000-0000-0000-0000-000000000000')
      union all
      select 1 from public.student_needs where slug = NEW.slug and id != coalesce(NEW.id, '00000000-0000-0000-0000-000000000000')
    ) loop
      NEW.slug := NEW.slug || '-' || left(gen_random_uuid()::text, 4);
    end loop;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger trg_donation_items_auto_slug
  before insert or update on public.donation_items
  for each row execute function auto_generate_slug();

create trigger trg_student_needs_auto_slug
  before insert or update on public.student_needs
  for each row execute function auto_generate_slug();
