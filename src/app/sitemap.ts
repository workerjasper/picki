import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { CATEGORIES } from '@/types';

const BASE_URL = 'https://picki-phi.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 개별 링크 페이지들
  const { data: links } = await supabase
    .from('links')
    .select('id, created_at')
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(1000);

  const linkUrls: MetadataRoute.Sitemap = (links ?? []).map((link) => ({
    url: `${BASE_URL}/link/${link.id}`,
    lastModified: new Date(link.created_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 카테고리 검색 페이지들
  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${BASE_URL}/search?category=${encodeURIComponent(category)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    ...categoryUrls,
    ...linkUrls,
  ];
}
