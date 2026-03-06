'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

interface SaveButtonProps {
  linkId: string;
  initialCount: number;
  initialSaved: boolean;
}

export default function SaveButton({ linkId, initialCount, initialSaved }: SaveButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setSaved(initialSaved); }, [initialSaved]);
  useEffect(() => { setCount(initialCount); }, [initialCount]);

  const handleClick = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (loading) return;
    setLoading(true);

    if (saved) {
      setSaved(false);
      setCount((c) => c - 1);
      await supabase.from('saves').delete().match({ user_id: user.id, link_id: linkId });
      await supabase.from('links').update({ save_count: count - 1 }).eq('id', linkId);
    } else {
      setSaved(true);
      setCount((c) => c + 1);
      await supabase.from('saves').insert({ user_id: user.id, link_id: linkId });
      await supabase.from('links').update({ save_count: count + 1 }).eq('id', linkId);
    }
    setLoading(false);
  };

  return (
    <button onClick={handleClick} className="flex items-center gap-1 text-sm group">
      <svg
        className={`w-5 h-5 transition ${saved ? 'text-indigo-500 fill-indigo-500' : 'text-gray-400 group-hover:text-indigo-400'}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        fill={saved ? 'currentColor' : 'none'}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      <span className={saved ? 'text-indigo-500' : 'text-gray-400'}>{count}</span>
    </button>
  );
}
