-- ============================================
-- Picki Admin DDL - Supabase SQL Editor에서 실행
-- ============================================

-- 1. users 테이블에 관리자/차단 컬럼 추가
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false;

-- 2. links 테이블에 숨김 컬럼 추가
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

-- 3. reports 테이블 생성
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'ignored')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 인덱스
CREATE INDEX idx_reports_link_id ON public.reports(link_id);
CREATE INDEX idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX idx_reports_status ON public.reports(status);

-- RLS 활성화
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "reports: 누구나 조회 가능"
  ON public.reports FOR SELECT
  USING (true);

CREATE POLICY "reports: 로그인 사용자 생성"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports: 관리자 수정"
  ON public.reports FOR UPDATE
  USING (true);

CREATE POLICY "reports: 관리자 삭제"
  ON public.reports FOR DELETE
  USING (true);

-- ============================================
-- 관리자 계정 설정 (본인 계정 이메일로 변경)
-- ============================================
-- UPDATE public.users SET is_admin = true WHERE email = 'your-email@example.com';
