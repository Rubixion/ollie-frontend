-- Signup consents and the email list. Run this once in the Supabase dashboard -> SQL Editor.
-- Only the server (/api/consent, service_role key) writes here; RLS on with no policies = browsers can't touch it.

create table if not exists public.user_consents (
  user_id           uuid primary key references auth.users (id) on delete cascade, -- deleting the account deletes this
  email             text,
  terms_version     text not null,         -- which Terms/Privacy text they agreed to (its "Last updated" date)
  terms_accepted_at timestamptz not null,
  email_opt_in      boolean not null default false,
  email_opt_in_at   timestamptz,           -- when they ticked the email box: proof of consent (Canada's CASL)
  email_opt_out_at  timestamptz,           -- when they unsubscribed; set this (and email_opt_in = false) on request
  updated_at        timestamptz not null default now()
);
alter table public.user_consents enable row level security;
revoke all on public.user_consents from anon, authenticated;

-- The mailing list: everyone who opted in and hasn't unsubscribed. Export it from here for your email tool,
-- and put an unsubscribe link in every email (CASL); on unsubscribe, set email_opt_in = false, email_opt_out_at = now().
create or replace view public.email_list with (security_invoker = true) as
  select email, email_opt_in_at as subscribed_at
  from public.user_consents
  where email_opt_in and email is not null;
revoke all on public.email_list from anon, authenticated;
