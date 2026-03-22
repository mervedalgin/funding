-- Login attempt tracking for server-side rate limiting
create table public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  email text,
  attempted_at timestamptz default now()
);

create index idx_login_attempts_ip_time on login_attempts(ip_address, attempted_at desc);
create index idx_login_attempts_cleanup on login_attempts(attempted_at);

-- RLS: no public access at all
alter table public.login_attempts enable row level security;

-- Only service_role can access (Edge Functions use service_role key)
create policy "Service role full access" on login_attempts
  for all using (auth.role() = 'service_role');

-- Auto-cleanup: delete attempts older than 1 hour
create or replace function cleanup_old_login_attempts()
returns void as $$
begin
  delete from public.login_attempts where attempted_at < now() - interval '1 hour';
end;
$$ language plpgsql security definer;
