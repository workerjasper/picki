'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { useAuth } from '@/lib/auth-context';
import { Link as LinkType } from '@/types';
import LinkCard from '@/components/link-card';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [links, setLinks] = useState<LinkType[]>([]);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading]);

  async function fetchProfile() {
    if (!user) return;

    const [{ data: userData }, { data: linksData }] = await Promise.all([
      supabase.from('users').select('nickname').eq('id', user.id).single(),
      supabase
        .from('links')
        .select('*, users(nickname, avatar_url)')
        .eq('user_id', user.id)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false }),
    ]);

    setNickname(userData?.nickname ?? user.email ?? '');
    setLinks(linksData ?? []);
    setLoading(false);
  }

  if (authLoading || loading) {
    return (
      <div className="animate-pulse space-y-4 pt-4">
        <div className="h-20 bg-gray-200 rounded-xl" />
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600">
            {nickname[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold">{nickname}</h1>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-4 text-sm text-gray-500">
          <span>올린 링크 <strong className="text-gray-900">{links.length}</strong></span>
        </div>
      </div>

      <h2 className="font-semibold text-gray-900 mb-4">내가 올린 링크</h2>

      {links.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>아직 올린 링크가 없어요</p>
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
