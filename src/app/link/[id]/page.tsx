'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { useAuth } from '@/lib/auth-context';
import { Link as LinkType } from '@/types';
import LikeButton from '@/components/like-button';
import SaveButton from '@/components/save-button';
import ReportButton from '@/components/report-button';
import ShareButton from '@/components/share-button';

export default function LinkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [link, setLink] = useState<LinkType | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwner = user?.id === link?.user_id;

  const handleDelete = async () => {
    if (!confirm('이 링크를 삭제하시겠습니까?')) return;
    await supabase.from('links').update({ is_hidden: true }).eq('id', id);
    router.push('/');
  };

  useEffect(() => {
    async function fetchLink() {
      const { data } = await supabase
        .from('links')
        .select('*, users(nickname, avatar_url)')
        .eq('id', id)
        .eq('is_hidden', false)
        .single();

      if (data && user) {
        const [{ data: likeData }, { data: saveData }] = await Promise.all([
          supabase.from('likes').select('id').match({ user_id: user.id, link_id: id }).maybeSingle(),
          supabase.from('saves').select('id').match({ user_id: user.id, link_id: id }).maybeSingle(),
        ]);
        setLink({ ...data, is_liked: !!likeData, is_saved: !!saveData });
      } else {
        setLink(data);
      }

      setLoading(false);
    }

    fetchLink();
  }, [id, user]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 pt-4">
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  if (!link) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">링크를 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {link.thumbnail && (
          <div className="relative w-full h-64 bg-gray-100">
            <Image
              src={link.thumbnail}
              alt={link.title}
              fill
              className="object-cover"
              sizes="(max-width: 672px) 100vw, 672px"
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-medium">
              {link.category}
            </span>
            {link.site_name && (
              <span className="text-sm text-gray-400">{link.site_name}</span>
            )}
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">{link.title}</h1>

          {link.comment && (
            <p className="text-indigo-600 font-medium mb-3">&ldquo;{link.comment}&rdquo;</p>
          )}

          <p className="text-gray-500 mb-4">{link.description}</p>

          <div className="flex items-center gap-3">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-indigo-500 text-white px-5 py-2 rounded-lg hover:bg-indigo-600 transition text-sm"
            >
              원본 링크 방문
            </a>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="inline-block bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition text-sm"
              >
                삭제
              </button>
            )}
            {!isOwner && link.user_id && (
              <ReportButton linkId={link.id} linkUserId={link.user_id} size="md" />
            )}
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <LikeButton linkId={link.id} initialCount={link.like_count} initialLiked={link.is_liked ?? false} />
              <SaveButton linkId={link.id} initialCount={link.save_count} initialSaved={link.is_saved ?? false} />
              <ShareButton linkId={link.id} title={link.title} size="md" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                {link.users?.nickname?.[0] ?? '?'}
              </div>
              <span className="text-sm text-gray-500">{link.users?.nickname ?? '익명'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
