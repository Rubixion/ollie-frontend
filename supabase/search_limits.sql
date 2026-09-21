-- Search limits: per account and per IP. Run this once in the Supabase dashboard -> SQL Editor.
-- Only the server (service_role key) can call these; browsers can't touch the table or the functions.

create table if not exists public.search_log (
  id         bigint generated always as identity primary key,
  user_id    uuid not null,
  ip         text not null,
  created_at timestamptz not null default now()
);
create index if not exists search_log_user_idx on public.search_log (user_id, created_at);
create index if not exists search_log_ip_idx   on public.search_log (ip, created_at);

-- RLS on with no policies = nobody but service_role (which bypasses RLS) can read or write.
alter table public.search_log enable row level security;

-- Counts one search if both limits allow it. Returns the outcome and how many the user has used.
-- p_user_window / p_ip_window: how far back to count (null user window = lifetime).
create or replace function public.consume_search(
  p_user uuid, p_ip text,
  p_user_limit int, p_ip_limit int,
  p_user_window interval, p_ip_window interval
)
returns table (status text, used int, log_id bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  u int;
  i int;
  new_id bigint;
begin
  -- serialise per user (then per IP, always in this order) so two simultaneous requests can't both slip under a limit
  perform pg_advisory_xact_lock(hashtext('user:' || p_user::text));
  select count(*) into u from search_log
    where user_id = p_user and (p_user_window is null or created_at > now() - p_user_window);
  if u >= p_user_limit then
    return query select 'user_limit'::text, u, null::bigint;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext('ip:' || p_ip));
  select count(*) into i from search_log
    where ip = p_ip and created_at > now() - p_ip_window;
  if i >= p_ip_limit then
    return query select 'ip_limit'::text, u, null::bigint;
    return;
  end if;

  insert into search_log (user_id, ip) values (p_user, p_ip) returning id into new_id;
  return query select 'ok'::text, u + 1, new_id;
end;
$$;

-- Undo one counted search (used when the search server fails).
create or replace function public.refund_search(p_id bigint)
returns void
language sql
security definer
set search_path = public
as $$
  delete from search_log where id = p_id;
$$;

revoke all on function public.consume_search(uuid, text, int, int, interval, interval) from public, anon, authenticated;
revoke all on function public.refund_search(bigint) from public, anon, authenticated;
grant execute on function public.consume_search(uuid, text, int, int, interval, interval) to service_role;
grant execute on function public.refund_search(bigint) to service_role;
