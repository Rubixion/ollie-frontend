-- Saved outfits from /ai-stylist, listed on /account. Run this once in the Supabase dashboard -> SQL Editor.
-- The browser reads and writes this table directly with the signed-in user's token; row-level security limits
-- every row to its owner. Deleting the account deletes their outfits (on delete cascade).

create table if not exists public.saved_outfits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 60),
  look       jsonb not null check (pg_column_size(look) < 2000), -- { gender, build, lookId, outfit: {slot: itemId}, face: {tab: id} }
  created_at timestamptz not null default now()
);
create index if not exists saved_outfits_user on public.saved_outfits (user_id, created_at desc);

alter table public.saved_outfits enable row level security;
drop policy if exists "own outfits" on public.saved_outfits;
create policy "own outfits" on public.saved_outfits for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke all on public.saved_outfits from anon;
grant select, insert, delete on public.saved_outfits to authenticated;
grant update (name, look) on public.saved_outfits to authenticated; -- rename / edit a saved outfit (added 2026-10-03)
grant all on public.saved_outfits to service_role;

-- At most 100 outfits per account, so one person can't fill the database.
create or replace function public.saved_outfits_cap() returns trigger language plpgsql as $$
begin
  if (select count(*) from public.saved_outfits where user_id = new.user_id) >= 100 then
    raise exception 'outfit limit reached' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists saved_outfits_cap on public.saved_outfits;
create trigger saved_outfits_cap before insert on public.saved_outfits for each row execute function public.saved_outfits_cap();
