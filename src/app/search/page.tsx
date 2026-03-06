'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { useAuth } from '@/lib/auth-context';
import { Link as LinkType, Category } from '@/types';
import LinkCard from '@/components/link-card';
import CategoryFilter from '@/components/category-filter';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState<Category | null>(null);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (q: string, cat: Category | null) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    setLoading(true);
    setSearched(true);

    let queryBuilder = supabase
      .from('links')
      .select('*, users(nickname, avatar_url)')
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .limit(50);

    if (cat) {
      queryBuilder = queryBuilder.eq('category', cat);
    }

    queryBuilder = queryBuilder.or(
      `title.ilike.%${trimmed}%,comment.ilike.%${trimmed}%,description.ilike.%${trimmed}%`
    );

    const { data: linksData } = await queryBuilder;

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
  }, [user]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      search(q, category);
    }
  }, [searchParams, category, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.replace(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="pt-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">검색</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="링크 제목, 코멘트, 내용으로 검색"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-500 text-white text-sm rounded-xl hover:bg-indigo-600 transition whitespace-nowrap"
          >
            검색
          </button>
        </div>
      </form>

      <div className="mb-6">
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
      ) : searched && links.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">검색 결과가 없어요</p>
          <p className="text-sm">다른 키워드로 검색해보세요</p>
        </div>
      ) : !searched ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">키워드를 입력해 검색해보세요</p>
          <p className="text-sm">제목, 한줄 코멘트, 본문 내용으로 검색할 수 있어요</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{links.length}개의 결과</p>
          {links.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">검색</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded-xl" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
