-- ============================================================================
-- 0005: Audit log tablosu
--
-- Admin işlemlerinin kaydını tutar. Trigger ile otomatik doldurulur.
-- Sadece admin okuyabilir, kimse doğrudan yazamaz (trigger ile INSERT).
-- ============================================================================

create table public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id),
  action      text not null,
  table_name  text not null,
  record_id   uuid,
  old_data    jsonb,
  new_data    jsonb,
  created_at  timestamptz default now()
);

-- RLS
alter table public.audit_log enable row level security;

-- Sadece admin okuyabilir
create policy "Admin can read audit log"
  on public.audit_log for select
  to authenticated
  using (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- Trigger fonksiyonu: donation_items değişikliklerini logla
create or replace function log_donation_items_changes()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.audit_log (user_id, action, table_name, record_id, new_data)
    values (auth.uid(), 'create', 'donation_items', new.id, to_jsonb(new));
    return new;
  elsif (tg_op = 'UPDATE') then
    insert into public.audit_log (user_id, action, table_name, record_id, old_data, new_data)
    values (auth.uid(), 'update', 'donation_items', new.id, to_jsonb(old), to_jsonb(new));
    return new;
  elsif (tg_op = 'DELETE') then
    insert into public.audit_log (user_id, action, table_name, record_id, old_data)
    values (auth.uid(), 'delete', 'donation_items', old.id, to_jsonb(old));
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger fonksiyonu: payment_channels değişikliklerini logla
create or replace function log_payment_channels_changes()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.audit_log (user_id, action, table_name, record_id, new_data)
    values (auth.uid(), 'create', 'payment_channels', new.id, to_jsonb(new));
    return new;
  elsif (tg_op = 'UPDATE') then
    insert into public.audit_log (user_id, action, table_name, record_id, old_data, new_data)
    values (auth.uid(), 'update', 'payment_channels', new.id, to_jsonb(old), to_jsonb(new));
    return new;
  elsif (tg_op = 'DELETE') then
    insert into public.audit_log (user_id, action, table_name, record_id, old_data)
    values (auth.uid(), 'delete', 'payment_channels', old.id, to_jsonb(old));
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger'ları bağla
create trigger audit_donation_items
  after insert or update or delete on public.donation_items
  for each row execute function log_donation_items_changes();

create trigger audit_payment_channels
  after insert or update or delete on public.payment_channels
  for each row execute function log_payment_channels_changes();

-- Index: tablo ve tarih bazlı sorgulama
create index idx_audit_log_table_name on public.audit_log(table_name);
create index idx_audit_log_created_at on public.audit_log(created_at desc);
