import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { CATEGORIES, Category } from '@/types';
import CategoryPageClient from './category-page-client';

const BASE_URL = 'https://picki-phi.vercel.app';

// 카테고리별 SEO 최적화 메타데이터
const CATEGORY_META: Record<Category, { title: string; description: string; keywords: string[] }> = {
  맛집: {
    title: '서울 맛집 추천 2025 — 블루리본·미쉐린 큐레이션',
    description: '블루리본서베이·미쉐린 가이드 기반 서울 맛집 추천. 사람들이 직접 픽한 믿을 수 있는 맛집 링크 모음.',
    keywords: ['서울 맛집', '맛집 추천', '블루리본', '미쉐린 서울', '2025 맛집'],
  },
  재테크: {
    title: '재테크 정보 2025 — ETF·주식·절세 큐레이션',
    description: '직장인 재테크 필수 정보. ETF 수익률 분석, ISA·IRP 절세 전략, 월배당 투자법까지 사람들이 픽한 링크 모음.',
    keywords: ['재테크', 'ETF 추천', '주식 투자', '절세', 'ISA', '월배당 ETF', '2025 재테크'],
  },
  재미: {
    title: '재미있는 영상·콘텐츠 추천 2025 — 유튜브 트렌드',
    description: '지금 가장 핫한 유튜브·SNS 콘텐츠. 추성훈·핫이슈지·정서불안 김햄찌 등 트렌드 영상 큐레이션.',
    keywords: ['유튜브 추천', '재미있는 영상', '유튜브 트렌드', '핫한 영상', '2025 유튜브'],
  },
  건강: {
    title: '건강 정보 추천 2025 — 운동·식단·웰니스',
    description: '믿을 수 있는 건강 정보 큐레이션. 운동 루틴, 건강 식단, 웰니스 트렌드까지 사람들이 픽한 링크 모음.',
    keywords: ['건강 정보', '운동 추천', '건강 식단', '웰니스', '다이어트'],
  },
  꿀팁: {
    title: '생활 꿀팁 모음 2025 — 직장인·일상 꿀팁',
    description: '알아두면 쓸모 있는 생활 꿀팁. 직장인 꿀팁, 절약 노하우, 스마트한 일상 팁을 사람들이 직접 큐레이션.',
    keywords: ['꿀팁', '생활 꿀팁', '직장인 꿀팁', '절약 꿀팁', '일상 팁'],
  },
  게임: {
    title: '게임 추천 2025 — 핫한 게임·공략 큐레이션',
    description: '지금 가장 핫한 게임과 공략 정보. 마비노기 모바일, 로블록스 등 사람들이 픽한 게임 링크 모음.',
    keywords: ['게임 추천', '게임 공략', '모바일 게임', '핫한 게임', '2025 게임'],
  },
  영상: {
    title: '영상 콘텐츠 추천 2025 — 드라마·영화·유튜브',
    description: '지금 봐야 할 드라마, 영화, 유튜브 콘텐츠. 오징어 게임, 케이팝 데몬 헌터스 등 트렌드 영상 큐레이션.',
    keywords: ['드라마 추천', '영화 추천', '넷플릭스', '유튜브 영상', 'K드라마'],
  },
  여행: {
    title: '여행 정보 추천 2025 — 국내·해외 여행 큐레이션',
    description: '가볼 만한 여행지와 여행 팁. 서울 맛집 투어, 국내 여행지, 해외 여행 정보를 사람들이 직접 픽.',
    keywords: ['여행 추천', '국내 여행', '서울 여행', '여행 코스', '2025 여행'],
  },
};

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function generateStaticParams() {
  return CATEGORIES.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = decodeURIComponent(slug) as Category;

  if (!CATEGORIES.includes(category)) return {};

  const meta = CATEGORY_META[category];

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/category/${encodeURIComponent(category)}`,
      siteName: 'Picki',
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
    alternates: {
      canonical: `${BASE_URL}/category/${encodeURIComponent(category)}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = decodeURIComponent(slug) as Category;

  if (!CATEGORIES.includes(category)) notFound();

  const supabase = getSupabase();
  const { data: links } = await supabase
    .from('links')
    .select('*, users(nickname, avatar_url)')
    .eq('category', category)
    .eq('is_hidden', false)
    .order('like_count', { ascending: false })
    .limit(50);

  const meta = CATEGORY_META[category];

  return (
    <CategoryPageClient
      category={category}
      initialLinks={links ?? []}
      metaTitle={meta.title}
    />
  );
}
