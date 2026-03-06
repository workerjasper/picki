'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { useAuth } from '@/lib/auth-context';
import { Link as LinkType, Category } from '@/types';
import LinkCard from '@/components/link-card';
import CategoryFilter from '@/components/category-filter';

export default function Home() {
  const { user } = useAuth();
  const [links, setLinks] = useState<LinkType[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, [category, user]);

  async function fetchLinks() {
    setLoading(true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let query = supabase
      .from('links')
      .select('*, users(nickname, avatar_url)')
      .eq('is_hidden', false)
      .gte('created_at', today.toISOString())
      .order('like_count', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: linksData } = await query;

    if (linksData && user) {
      const linkIds = linksData.map((l) => l.id);

      const [{ data: likedData }, { data: savedData }] = await Promise.all([
        supabase.from('likes').select('link_id').eq('user_id', user.id).in('link_id', linkIds),
        supabase.from('saves').select('link_id').eq('user_id', user.id).in('link_id', linkIds),
      ]);

      const likedSet = new Set(likedData?.map((l) => l.link_id));
      const savedSet = new Set(savedData?.map((s) => s.link_id));

      setLinks(
        linksData.map((link) => ({
          ...link,
          is_liked: likedSet.has(link.id),
          is_saved: savedSet.has(link.id),
        }))
      );
    } else {
      setLinks(linksData ?? []);
    }

    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">오늘의 트렌드</h1>
        <CategoryFilter selected={category} onChange={setCategory} />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">아직 오늘의 링크가 없어요</p>
          <p className="text-sm">첫 번째 트렌드 링크를 공유해보세요!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link, index) => (
            <div key={link.id} className="relative">
              {index < 3 && (
                <div className="absolute -left-3 top-4 w-6 h-6 bg-indigo-500 text-white text-xs font-bold rounded-full flex items-center justify-center z-10">
                  {index + 1}
                </div>
              )}
              <LinkCard link={link} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
