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
