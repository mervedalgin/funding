-- Student Needs table — parallel to donation_items but for individual student needs
create table public.student_needs (
  id                   uuid primary key default gen_random_uuid(),
  title                text not null,
  description          text,
  image_url            text,
  price                numeric(10, 2) not null default 0,
  bank_name            text,
  iban                 text,
  payment_ref          text,
  payment_url          text,
  internet_banking_url text,
  impact_text          text,
  donor_count          integer default 0,
  custom_amount_min    numeric(10, 2) default 10,
  target_amount        numeric(10, 2) default 0,
  collected_amount     numeric(10, 2) default 0,
  status               text not null default 'draft'
                         check (status in ('active', 'draft', 'completed')),
  sort_order           integer default 0,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- Auto-update updated_at (reuse existing function)
create trigger set_student_needs_updated_at
  before update on public.student_needs
  for each row execute function update_updated_at();

-- RLS
alter table public.student_needs enable row level security;

-- Public: read only active
create policy "Public can view active student needs"
  on student_needs for select
  using (status = 'active');

-- Admin: read all
create policy "Admin can view all student needs"
  on student_needs for select
  using (auth.jwt() ->> 'email' = 'bozkurt@dumlupinar.edu.tr');

-- Admin: insert
create policy "Admin can insert student needs"
  on student_needs for insert
  with check (auth.jwt() ->> 'email' = 'bozkurt@dumlupinar.edu.tr');

-- Admin: update
create policy "Admin can update student needs"
  on student_needs for update
  using (auth.jwt() ->> 'email' = 'bozkurt@dumlupinar.edu.tr');

-- Admin: delete
create policy "Admin can delete student needs"
  on student_needs for delete
  using (auth.jwt() ->> 'email' = 'bozkurt@dumlupinar.edu.tr');

-- Audit log trigger
create or replace function audit_student_needs()
returns trigger as $$
begin
  insert into public.audit_log (user_id, action, table_name, record_id, old_data, new_data)
  values (
    auth.uid(),
    TG_OP,
    'student_needs',
    coalesce(NEW.id, OLD.id),
    case when TG_OP = 'DELETE' then row_to_json(OLD)::jsonb else null end,
    case when TG_OP != 'DELETE' then row_to_json(NEW)::jsonb else null end
  );
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

create trigger audit_student_needs_trigger
  after insert or update or delete on public.student_needs
  for each row execute function audit_student_needs();
