-- ============================================================================
-- Kritik düzeltmeler: RPC, RLS, indexler, audit trigger, amount constraint
-- ============================================================================

-- 1. increment_donation_stats RPC fonksiyonu (payment-callback tarafından çağrılıyor)
create or replace function increment_donation_stats(
  p_item_id uuid,
  p_amount numeric
)
returns void as $$
begin
  update public.donation_items
  set
    collected_amount = collected_amount + p_amount,
    donor_count = donor_count + 1
  where id = p_item_id;
end;
$$ language plpgsql security definer;

-- Student needs için de aynı fonksiyon
create or replace function increment_student_need_stats(
  p_need_id uuid,
  p_amount numeric
)
returns void as $$
begin
  update public.student_needs
  set
    collected_amount = collected_amount + p_amount,
    donor_count = donor_count + 1
  where id = p_need_id;
end;
$$ language plpgsql security definer;

-- 2. Bağış reddedildiğinde veya silindiğinde collected_amount düşür
create or replace function decrement_donation_stats()
returns trigger as $$
begin
  -- Sadece confirmed -> rejected/deleted geçişinde düşür
  if OLD.status = 'confirmed' and (NEW.status = 'rejected' or TG_OP = 'DELETE') then
    if OLD.item_id is not null then
      update public.donation_items
      set
        collected_amount = greatest(0, collected_amount - OLD.amount),
        donor_count = greatest(0, donor_count - 1)
      where id = OLD.item_id;
    end if;
  end if;

  if TG_OP = 'DELETE' then
    return OLD;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_decrement_donation_stats
  after update or delete on public.donations
  for each row execute function decrement_donation_stats();

-- Student donations için de aynı trigger
create or replace function decrement_student_donation_stats()
returns trigger as $$
begin
  if OLD.status = 'confirmed' and (NEW.status = 'rejected' or TG_OP = 'DELETE') then
    if OLD.student_need_id is not null then
      update public.student_needs
      set
        collected_amount = greatest(0, collected_amount - OLD.amount),
        donor_count = greatest(0, donor_count - 1)
      where id = OLD.student_need_id;
    end if;
  end if;

  if TG_OP = 'DELETE' then
    return OLD;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_decrement_student_donation_stats
  after update or delete on public.student_donations
  for each row execute function decrement_student_donation_stats();

-- 3. site_settings RLS düzeltmesi: sadece admin yazabilir
drop policy if exists "Authenticated users can manage site settings" on public.site_settings;

create policy "Admin can manage site settings"
  on public.site_settings for insert
  to authenticated
  with check (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

create policy "Admin can update site settings"
  on public.site_settings for update
  to authenticated
  using (auth.jwt() ->> 'email' = '741604birecik@gmail.com')
  with check (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

create policy "Admin can delete site settings"
  on public.site_settings for delete
  to authenticated
  using (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- 4. student_donations için audit trigger
create or replace function audit_student_donations()
returns trigger as $$
begin
  insert into public.audit_log (user_id, action, table_name, record_id, old_data, new_data)
  values (
    auth.uid(),
    TG_OP,
    'student_donations',
    coalesce(NEW.id, OLD.id),
    case when TG_OP = 'DELETE' then row_to_json(OLD)::jsonb else null end,
    case when TG_OP != 'DELETE' then row_to_json(NEW)::jsonb else null end
  );
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

create trigger audit_student_donations_trigger
  after insert or update or delete on public.student_donations
  for each row execute function audit_student_donations();

-- 5. Eksik indexler
create index if not exists idx_donations_confirmed_at on public.donations(confirmed_at desc);
create index if not exists idx_donations_donor_email on public.donations(donor_email);
create index if not exists idx_student_donations_created_at on public.student_donations(created_at desc);
create index if not exists idx_student_donations_donor_email on public.student_donations(donor_email);
create index if not exists idx_audit_log_user_id on public.audit_log(user_id);
create index if not exists idx_payment_channels_active on public.payment_channels(is_active);

-- 6. Amount check constraint (0'dan büyük, makul üst limit)
alter table public.donations
  add constraint chk_donation_amount check (amount > 0 and amount <= 999999);

alter table public.student_donations
  add constraint chk_student_donation_amount check (amount > 0 and amount <= 999999);

-- 7. confirmed_by FK düzeltmesi: ON DELETE SET NULL
-- (ALTER CONSTRAINT desteklenmediğinden, yeni constraint ekle)
alter table public.donations
  drop constraint if exists donations_confirmed_by_fkey;
alter table public.donations
  add constraint donations_confirmed_by_fkey
  foreign key (confirmed_by) references auth.users(id) on delete set null;

alter table public.student_donations
  drop constraint if exists student_donations_confirmed_by_fkey;
alter table public.student_donations
  add constraint student_donations_confirmed_by_fkey
  foreign key (confirmed_by) references auth.users(id) on delete set null;
