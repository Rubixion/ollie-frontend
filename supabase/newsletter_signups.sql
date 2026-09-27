-- Email-list signups that don't need an account (the /search page's form). Run this once in the Supabase
-- dashboard -> SQL Editor. Only the server (/api/newsletter, service_role key) writes here; RLS on with no
-- policies = browsers can't touch it. Account holders who ticked the signup box are in user_consents instead.

create table if not exists public.newsletter_signups (
  email           text primary key,               -- lowercased by the API
  source          text not null,                  -- which form, e.g. 'search'
  consent_text    text not null,                  -- the exact wording they agreed to: proof of consent (CASL)
  subscribed_at   timestamptz not null default now(),
  unsubscribed_at timestamptz                     -- set this on request; a later signup clears it again
);
alter table public.newsletter_signups enable row level security;
revoke all on public.newsletter_signups from anon, authenticated;
grant all on public.newsletter_signups to service_role;

-- The whole mailing list (both sources), for your email tool:
-- select email from public.newsletter_signups where unsubscribed_at is null
-- union
-- select email from public.user_consents where email_opt_in and email_opt_out_at is null and email is not null;
