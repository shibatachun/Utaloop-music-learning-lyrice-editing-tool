create extension if not exists "pgcrypto";

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  platform text not null default 'youtube' check (platform in ('youtube', 'bilibili')),
  external_video_id text not null,
  youtube_video_id text generated always as (case when platform = 'youtube' then external_video_id else null end) stored,
  title text,
  thumbnail_url text,
  duration numeric,
  channel_name text,
  created_at timestamptz not null default now(),
  unique (platform, external_video_id)
);

create table if not exists public.user_profiles (
  user_id uuid primary key,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.subtitles (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  language text,
  source text not null check (source in ('youtube', 'upload', 'manual', 'generated')),
  format text not null check (format in ('lrc', 'srt', 'vtt', 'json')),
  raw_content text,
  created_at timestamptz not null default now()
);

create table if not exists public.lyric_lines (
  id uuid primary key default gen_random_uuid(),
  subtitle_id uuid not null references public.subtitles(id) on delete cascade,
  start_time numeric not null,
  end_time numeric not null,
  text text not null,
  order_index integer not null
);

create table if not exists public.lyric_words (
  id uuid primary key default gen_random_uuid(),
  line_id uuid not null references public.lyric_lines(id) on delete cascade,
  start_time numeric not null,
  end_time numeric not null,
  text text not null,
  order_index integer not null
);

create table if not exists public.user_video_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  video_id uuid not null references public.videos(id) on delete cascade,
  current_time numeric not null default 0,
  last_line_id uuid references public.lyric_lines(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (user_id, video_id)
);

create table if not exists public.user_saved_videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  video_id uuid not null references public.videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, video_id)
);

create table if not exists public.pronunciation_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  video_id uuid not null references public.videos(id) on delete cascade,
  line_id uuid references public.lyric_lines(id) on delete set null,
  audio_url text,
  score numeric,
  feedback_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.lyric_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  video_id uuid not null references public.videos(id) on delete cascade,
  subtitle_id uuid references public.subtitles(id) on delete set null,
  status text not null default 'pending' check (status in ('draft', 'pending', 'approved', 'rejected')),
  reviewer_id uuid,
  review_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
