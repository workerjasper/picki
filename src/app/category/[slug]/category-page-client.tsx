'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { useAuth } from '@/lib/auth-context';
import { Link as LinkType, Category } from '@/types';
import LinkCard from '@/components/link-card';

interface Props {
  category: Category;
  initialLinks: LinkType[];
  metaTitle: string;
}

export default function CategoryPageClient({ category, initialLinks, metaTitle }: Props) {
  const { user } = useAuth();
  const [links, setLinks] = useState<LinkType[]>(initialLinks);

  // 로그인 상태에 따라 좋아요/저장 여부 추가
  useEffect(() => {
    if (!user || links.length === 0) return;
    async function fetchUserState() {
      const linkIds = links.map((l) => l.id);
      const [{ data: likedData }, { data: savedData }] = await Promise.all([
        supabase.from('likes').select('link_id').eq('user_id', user!.id).in('link_id', linkIds),
        supabase.from('saves').select('link_id').eq('user_id', user!.id).in('link_id', linkIds),
      ]);
      const likedSet = new Set(likedData?.map((l) => l.link_id));
      const savedSet = new Set(savedData?.map((s) => s.link_id));
      setLinks((prev) =>
        prev.map((link) => ({
          ...link,
          is_liked: likedSet.has(link.id),
          is_saved: savedSet.has(link.id),
        }))
      );
    }
    fetchUserState();
  }, [user]);

  return (
    <div className="pt-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl font-bold text-gray-900">{category}</span>
          <span className="text-sm bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-medium">
            {links.length}개
          </span>
        </div>
        <p className="text-sm text-gray-500">{metaTitle}</p>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">아직 링크가 없어요</p>
          <p className="text-sm">첫 번째 {category} 링크를 공유해보세요!</p>
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
