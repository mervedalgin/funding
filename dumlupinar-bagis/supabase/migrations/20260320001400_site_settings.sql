-- Site ayarları tablosu (key-value)
create table public.site_settings (
  key         text primary key,
  value       jsonb not null default '{}',
  updated_at  timestamptz default now()
);

-- Otomatik updated_at
create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function update_updated_at();

-- RLS
alter table public.site_settings enable row level security;

-- Herkes okuyabilir
create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

-- Sadece authenticated kullanıcılar yazabilir
create policy "Authenticated users can manage site settings"
  on public.site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Varsayılan ayarlar
insert into public.site_settings (key, value) values
  ('general', '{"site_name": "Dumlupınar Üniversitesi Bağış Platformu", "site_description": "Dumlupınar Üniversitesi öğrencileri için bağış toplama platformu", "contact_email": "bagis@dumlupinar.edu.tr", "contact_phone": "", "address": ""}'),
  ('donation', '{"min_amount": 10, "auto_approve": false, "show_donor_names": true, "show_collected_amounts": true, "allow_anonymous": true}'),
  ('notification', '{"email_on_new_donation": true, "email_on_goal_reached": true, "admin_email": "741604birecik@gmail.com"}'),
  ('appearance', '{"maintenance_mode": false, "announcement_text": "", "announcement_active": false, "primary_color": "#0d9488"}')
on conflict (key) do nothing;
