'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { useAuth } from '@/lib/auth-context';
import { Link as LinkType } from '@/types';
import LinkCard from '@/components/link-card';

export default function SavedPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchSavedLinks();
    }
  }, [user, authLoading]);

  async function fetchSavedLinks() {
    if (!user) return;

    const { data: saves } = await supabase
      .from('saves')
      .select('link_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!saves || saves.length === 0) {
      setLinks([]);
      setLoading(false);
      return;
    }

    const linkIds = saves.map((s) => s.link_id);

    const { data: linksData } = await supabase
      .from('links')
      .select('*, users(nickname, avatar_url)')
      .in('id', linkIds)
      .eq('is_hidden', false);

    if (linksData) {
      const [{ data: likedData }] = await Promise.all([
        supabase.from('likes').select('link_id').eq('user_id', user.id).in('link_id', linkIds),
      ]);

      const likedSet = new Set(likedData?.map((l) => l.link_id));

      setLinks(
        linksData.map((link) => ({
          ...link,
          is_liked: likedSet.has(link.id),
          is_saved: true,
        }))
      );
    }

    setLoading(false);
  }

  if (authLoading || loading) {
    return (
      <div className="animate-pulse space-y-4 pt-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="pt-4">
      <h1 className="text-2xl font-bold mb-6">저장한 링크</h1>

      {links.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">저장한 링크가 없어요</p>
          <p className="text-sm">마음에 드는 링크를 저장해보세요!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      )}
    </div>
  );
}
