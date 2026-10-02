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

-- Housekeeping: drop expired codes/tokens. Call from a cron, or just let the table grow slowly.
create or replace function oauth_gc() returns void language sql as $$
  delete from oauth_codes  where expires_at < now();
  delete from oauth_tokens where refresh_expires_at < now();
$$;
