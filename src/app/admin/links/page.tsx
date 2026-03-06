'use client';

import { Fragment, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { CATEGORIES, Category } from '@/types';

interface AdminLink {
  id: string;
  title: string;
  url: string;
  category: Category;
  comment: string | null;
  description: string | null;
  is_hidden: boolean;
  like_count: number;
  save_count: number;
  created_at: string;
  users?: { nickname: string };
}

export default function AdminLinksPage() {
  const [links, setLinks] = useState<AdminLink[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, [category, dateFrom]);

  async function fetchLinks() {
    setLoading(true);
    let query = supabase
      .from('links')
      .select('*, users(nickname)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (category) query = query.eq('category', category);
    if (dateFrom) query = query.gte('created_at', new Date(dateFrom).toISOString());

    const { data } = await query;
    setLinks(data ?? []);
    setLoading(false);
  }

  async function hideLink(linkId: string) {
    if (!confirm('이 링크를 숨김 처리하시겠습니까?')) return;
    await supabase.from('links').update({ is_hidden: true }).eq('id', linkId);
    setLinks((prev) => prev.map((l) => (l.id === linkId ? { ...l, is_hidden: true } : l)));
  }

  async function restoreLink(linkId: string) {
    if (!confirm('이 링크를 복구하시겠습니까?')) return;
    await supabase.from('links').update({ is_hidden: false }).eq('id', linkId);
    setLinks((prev) => prev.map((l) => (l.id === linkId ? { ...l, is_hidden: false } : l)));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">링크 관리</h1>

      <div className="flex flex-wrap gap-3">
        <select
          value={category ?? ''}
          onChange={(e) => setCategory((e.target.value || null) as Category | null)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">전체 카테고리</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {(category || dateFrom) && (
          <button
            onClick={() => { setCategory(null); setDateFrom(''); }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            필터 초기화
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400">로딩 중...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 pr-4">제목</th>
                <th className="py-2 pr-4">한줄 코멘트</th>
                <th className="py-2 pr-4">카테고리</th>
                <th className="py-2 pr-4">올린 사람</th>
                <th className="py-2 pr-4">좋아요</th>
                <th className="py-2 pr-4">저장</th>
                <th className="py-2 pr-4">등록일</th>
                <th className="py-2 pr-4">상태</th>
                <th className="py-2">관리</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <Fragment key={link.id}>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4 max-w-xs truncate">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      {link.title || '(제목 없음)'}
                    </a>
                  </td>
                  <td className="py-2 pr-4 max-w-[200px]">
                    {link.comment ? (
                      <span className="text-gray-600 truncate block">{link.comment}</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{link.category}</span>
                  </td>
                  <td className="py-2 pr-4 text-gray-500">{link.users?.nickname ?? '알 수 없음'}</td>
                  <td className="py-2 pr-4">{link.like_count}</td>
                  <td className="py-2 pr-4">{link.save_count}</td>
                  <td className="py-2 pr-4 text-gray-400">{new Date(link.created_at).toLocaleDateString('ko-KR')}</td>
                  <td className="py-2 pr-4">
                    {link.is_hidden ? (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">숨김</span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">공개</span>
                    )}
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDetailId(detailId === link.id ? null : link.id)}
                        className="text-xs px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition"
                      >
                        {detailId === link.id ? '접기' : '상세'}
                      </button>
                      {link.is_hidden ? (
                        <button
                          onClick={() => restoreLink(link.id)}
                          className="text-xs px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                        >
                          복구
                        </button>
                      ) : (
                        <button
                          onClick={() => hideLink(link.id)}
                          className="text-xs px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          숨김
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {detailId === link.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={9} className="px-4 py-3">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">한줄 코멘트: </span>
                          <span className="text-gray-600">{link.comment || '(없음)'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">본문: </span>
                          <span className="text-gray-600 whitespace-pre-wrap">{link.description || '(없음)'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">URL: </span>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">
                            {link.url}
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {links.length === 0 && (
            <p className="text-center text-gray-400 py-8">링크가 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
}
