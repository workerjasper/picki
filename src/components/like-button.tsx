'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
  linkId: string;
  initialCount: number;
  initialLiked: boolean;
}

export default function LikeButton({ linkId, initialCount, initialLiked }: LikeButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setLiked(initialLiked); }, [initialLiked]);
  useEffect(() => { setCount(initialCount); }, [initialCount]);

  const handleClick = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (loading) return;
    setLoading(true);

    if (liked) {
      setLiked(false);
      setCount((c) => c - 1);
      await supabase.from('likes').delete().match({ user_id: user.id, link_id: linkId });
      await supabase.from('links').update({ like_count: count - 1 }).eq('id', linkId);
    } else {
      setLiked(true);
      setCount((c) => c + 1);
      await supabase.from('likes').insert({ user_id: user.id, link_id: linkId });
      await supabase.from('links').update({ like_count: count + 1 }).eq('id', linkId);
    }
    setLoading(false);
  };

  return (
    <button onClick={handleClick} className="flex items-center gap-1 text-sm group">
      <svg
        className={`w-5 h-5 transition ${liked ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover:text-red-400'}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        fill={liked ? 'currentColor' : 'none'}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className={liked ? 'text-red-500' : 'text-gray-400'}>{count}</span>
    </button>
  );
}
