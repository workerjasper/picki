'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Link as LinkType } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-browser';
import LikeButton from './like-button';
import SaveButton from './save-button';
import ReportButton from './report-button';
import ShareButton from './share-button';

interface LinkCardProps {
  link: LinkType;
}

export default function LinkCard({ link }: LinkCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const isOwner = user?.id === link.user_id;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('이 링크를 삭제하시겠습니까?')) return;
    await supabase.from('links').update({ is_hidden: true }).eq('id', link.id);
    router.refresh();
    window.location.reload();
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
      <Link href={`/link/${link.id}`}>
        {link.thumbnail && (
          <div className="relative w-full h-48 bg-gray-100">
            <Image
              src={link.thumbnail}
              alt={link.title}
              fill
              className="object-cover"
              sizes="(max-width: 672px) 100vw, 672px"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
              {link.category}
            </span>
            {link.site_name && (
              <span className="text-xs text-gray-400">{link.site_name}</span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
            {link.title}
          </h3>
          {link.comment && (
            <p className="text-sm text-gray-500 mb-2">&ldquo;{link.comment}&rdquo;</p>
          )}
          <p className="text-xs text-gray-400 line-clamp-1">{link.description}</p>
        </div>
      </Link>
      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <LikeButton linkId={link.id} initialCount={link.like_count} initialLiked={link.is_liked ?? false} />
          <SaveButton linkId={link.id} initialCount={link.save_count} initialSaved={link.is_saved ?? false} />
        </div>
        <div className="flex items-center gap-3">
          <ShareButton linkId={link.id} title={link.title} />
          {isOwner ? (
            <button
              onClick={handleDelete}
              className="text-xs text-red-400 hover:text-red-600 transition"
            >
              삭제
            </button>
          ) : (
            <ReportButton linkId={link.id} linkUserId={link.user_id} />
          )}
          <span className="text-xs text-gray-400">
            {link.users?.nickname ?? '익명'}
          </span>
        </div>
      </div>
    </div>
  );
}
