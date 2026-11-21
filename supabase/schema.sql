-- Схема контента. Выполнить один раз в Supabase SQL Editor.
-- Не хранит священные тексты: только проверяемые учебные слова.

create table if not exists public.learning_words (
  id uuid primary key default gen_random_uuid(),
  arabic text not null,
  meaning_ru text not null,
  category text not null default 'general',
  image_url text,
  audio_url text,
  scope text not null default 'published' check (scope in ('private', 'published')),
  status text not null default 'draft' check (status in ('draft', 'checked', 'published', 'archived')),
  owner_id uuid,
  checked_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_words_public_idx
  on public.learning_words (scope, status, updated_at desc);

-- Авторизация семей и роли. Создание пользователей выполняется только через
-- Supabase Auth/Vercel API, а не из frontend.
create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'parent' check (role in ('parent', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table if not exists public.registration_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists registration_requests_pending_email_idx
  on public.registration_requests (lower(email)) where status = 'pending';

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.registration_requests enable row level security;

alter table public.family_members add column if not exists active boolean not null default true;

alter table public.learning_words enable row level security;

-- Публичное приложение видит только опубликованные общие слова.
drop policy if exists "published words are readable" on public.learning_words;
create policy "published words are readable"
  on public.learning_words for select
  using (scope = 'published' and status = 'published');

-- Записи через Vercel API используют server-only service role key.
-- Никогда не помещайте service role key во frontend или GitHub.

insert into storage.buckets (id, name, public)
values ('learning-media', 'learning-media', true)
on conflict (id) do nothing;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists learning_words_updated_at on public.learning_words;
create trigger learning_words_updated_at
before update on public.learning_words
for each row execute function public.set_updated_at();
