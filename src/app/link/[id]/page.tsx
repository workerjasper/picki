import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import LinkDetailClient from './link-detail-client';

const BASE_URL = 'https://picki-phi.vercel.app';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = getSupabase();

  const { data: link } = await supabase
    .from('links')
    .select('title, description, thumbnail, category, comment, site_name')
    .eq('id', id)
    .eq('is_hidden', false)
    .single();

  if (!link) {
    return { title: 'Picki - 링크를 찾을 수 없습니다' };
  }

  const title = `${link.title} | Picki`;
  const description = link.comment
    ? `"${link.comment}" — ${link.description ?? ''}`
    : (link.description ?? 'Picki에서 큐레이션된 링크');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/link/${id}`,
      siteName: 'Picki',
      images: link.thumbnail
        ? [{ url: link.thumbnail, width: 1200, height: 630, alt: link.title }]
        : [],
      locale: 'ko_KR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: link.thumbnail ? [link.thumbnail] : [],
    },
    alternates: {
      canonical: `${BASE_URL}/link/${id}`,
    },
  };
}

export default async function LinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data: link } = await supabase
    .from('links')
    .select('*, users(nickname, avatar_url)')
    .eq('id', id)
    .eq('is_hidden', false)
    .single();

  return <LinkDetailClient id={id} initialLink={link ?? null} />;
}
