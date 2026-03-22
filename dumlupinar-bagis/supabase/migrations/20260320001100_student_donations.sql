-- Student donations table — tracks individual donations to student needs
create table public.student_donations (
  id              uuid primary key default gen_random_uuid(),
  student_need_id uuid references public.student_needs(id) on delete set null,
  donor_name      text,
  donor_email     text,
  donor_phone     text,
  amount          numeric(10, 2) not null,
  payment_method  text not null default 'bank_transfer',
  payment_ref     text,
  status          text not null default 'pending'
                    check (status in ('pending', 'confirmed', 'rejected')),
  notes           text,
  receipt_url     text,
  confirmed_by    uuid references auth.users(id),
  confirmed_at    timestamptz,
  created_at      timestamptz default now()
);

create index idx_student_donations_need on student_donations(student_need_id);
create index idx_student_donations_status on student_donations(status);

-- RLS
alter table public.student_donations enable row level security;

-- Public: can create donations
create policy "Anyone can create student donations"
  on student_donations for insert
  with check (true);

-- Admin: full access
create policy "Admin can manage student donations"
  on student_donations for all
  using (auth.jwt() ->> 'email' = '741604birecik@gmail.com');

-- Public: can view confirmed donations (donor list)
create policy "Public can view confirmed student donations"
  on student_donations for select
  using (status = 'confirmed');
