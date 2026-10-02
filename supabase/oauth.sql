-- OAuth 2.1 authorization server for the ChatGPT MCP apps (lib/oauth.ts).
-- Only the service role touches these tables: RLS on, no policies, so the anon key can never read tokens.
-- Run in the Supabase SQL editor.

create table if not exists oauth_clients (
  client_id     text primary key,
  client_name   text,
  redirect_uris text[] not null,
  created_at    timestamptz not null default now()
);

create table if not exists oauth_codes (
  code_hash      text primary key,          -- sha256 of the authorization code (never store the code itself)
  client_id      text not null,
  user_id        uuid not null,             -- the Supabase user who approved
  redirect_uri   text not null,
  code_challenge text not null,             -- PKCE S256 challenge
  scope          text not null,
  expires_at     timestamptz not null,
  created_at     timestamptz not null default now()
);

create table if not exists oauth_tokens (
  token_hash         text primary key,      -- sha256 of the access token
  refresh_hash       text unique,           -- sha256 of the refresh token
  client_id          text not null,
  user_id            uuid not null,
  scope              text not null,
  expires_at         timestamptz not null,
  refresh_expires_at timestamptz not null,
  created_at         timestamptz not null default now()
);

create index if not exists oauth_tokens_user on oauth_tokens (user_id);

alter table oauth_clients enable row level security;
alter table oauth_codes  enable row level security;
alter table oauth_tokens enable row level security;

-- The server talks to these via the service role with direct table access (not an RPC), so it needs explicit grants.
-- service_role bypasses RLS, so with RLS on and no policies, only the server can read/write — exactly what we want.
grant all on oauth_clients, oauth_codes, oauth_tokens to service_role;

-- Refresh-token rotation family: all tokens rotated from one grant share a family_id, so reuse of an old
-- refresh token can invalidate the whole family.
alter table oauth_tokens add column if not exists family_id text;

-- Rotated-out refresh tokens, kept until they would have expired, so replaying one is detected as a breach.
create table if not exists oauth_used_refresh (
  refresh_hash text primary key,
  family_id    text not null,
  expires_at   timestamptz not null
);

-- Durable per-IP rate limit for dynamic client registration (Workers are stateless, so in-memory won't do).
create table if not exists oauth_register_log (
  id         bigserial primary key,
  ip         text not null,
  created_at timestamptz not null default now()
);
create index if not exists oauth_register_log_ip on oauth_register_log (ip, created_at);

alter table oauth_used_refresh  enable row level security;
alter table oauth_register_log  enable row level security;
grant all on oauth_used_refresh, oauth_register_log to service_role;
grant usage, select on sequence oauth_register_log_id_seq to service_role;

-- Housekeeping: drop expired codes/tokens/used-refresh/register-log. Call from a cron, or just let them grow slowly.
create or replace function oauth_gc() returns void language sql as $$
  delete from oauth_codes        where expires_at < now();
  delete from oauth_tokens       where refresh_expires_at < now();
  delete from oauth_used_refresh where expires_at < now();
  delete from oauth_register_log where created_at < now() - interval '2 days';
$$;
