-- ============================================
-- Picki DDL - Supabase SQL Editor에서 실행
-- ============================================

-- 1. users 테이블
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  email text not null,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- 2. links 테이블
create table public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  url text not null,
  title text not null default '',
  description text not null default '',
  thumbnail text,
  site_name text,
  category text not null,
  comment text not null default '',
  like_count int not null default 0,
  save_count int not null default 0,
  created_at timestamptz default now() not null
);

-- 3. likes 테이블
create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  link_id uuid not null references public.links(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(user_id, link_id)
);

-- 4. saves 테이블
create table public.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  link_id uuid not null references public.links(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(user_id, link_id)
);

-- ============================================
-- 인덱스
-- ============================================

create index idx_links_user_id on public.links(user_id);
create index idx_links_category on public.links(category);
create index idx_links_created_at on public.links(created_at desc);
create index idx_likes_user_id on public.likes(user_id);
create index idx_likes_link_id on public.likes(link_id);
create index idx_saves_user_id on public.saves(user_id);
create index idx_saves_link_id on public.saves(link_id);

-- ============================================
-- RLS (Row Level Security) 활성화
-- ============================================

alter table public.users enable row level security;
alter table public.links enable row level security;
alter table public.likes enable row level security;
alter table public.saves enable row level security;

-- ============================================
-- RLS 정책 - users
-- ============================================

-- 누구나 프로필 조회 가능
create policy "users: 누구나 조회 가능"
  on public.users for select
  using (true);

-- 본인만 자기 프로필 생성
create policy "users: 본인 생성"
  on public.users for insert
  with check (auth.uid() = id);

-- 본인만 자기 프로필 수정
create policy "users: 본인 수정"
  on public.users for update
  using (auth.uid() = id);

-- ============================================
-- RLS 정책 - links
-- ============================================

-- 누구나 링크 조회 가능
create policy "links: 누구나 조회 가능"
  on public.links for select
  using (true);

-- 로그인한 사용자만 링크 생성
create policy "links: 로그인 사용자 생성"
  on public.links for insert
  with check (auth.uid() = user_id);

-- 본인 링크만 수정 (like_count, save_count 업데이트용)
create policy "links: 카운트 업데이트"
  on public.links for update
  using (true);

-- 본인 링크만 삭제
create policy "links: 본인 삭제"
  on public.links for delete
  using (auth.uid() = user_id);

-- ============================================
-- RLS 정책 - likes
-- ============================================

-- 누구나 좋아요 조회 가능
create policy "likes: 누구나 조회 가능"
  on public.likes for select
  using (true);

-- 본인만 좋아요 생성
create policy "likes: 본인 생성"
  on public.likes for insert
  with check (auth.uid() = user_id);

-- 본인만 좋아요 삭제
create policy "likes: 본인 삭제"
  on public.likes for delete
  using (auth.uid() = user_id);

-- ============================================
-- RLS 정책 - saves
-- ============================================

-- 누구나 저장 조회 가능
create policy "saves: 누구나 조회 가능"
  on public.saves for select
  using (true);

-- 본인만 저장 생성
create policy "saves: 본인 생성"
  on public.saves for insert
  with check (auth.uid() = user_id);

-- 본인만 저장 삭제
create policy "saves: 본인 삭제"
  on public.saves for delete
  using (auth.uid() = user_id);
