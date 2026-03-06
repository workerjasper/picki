'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase-browser';
import { useAuth } from '@/lib/auth-context';
import { CATEGORIES, Category, OgData } from '@/types';

export default function UploadPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [url, setUrl] = useState('');
  const [ogData, setOgData] = useState<OgData | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [comment, setComment] = useState('');
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!authLoading && !user) {
    router.push('/login');
    return null;
  }

  const handleParse = async () => {
    if (!url) return;
    setError('');
    setOgData(null);

    try {
      const parsed = new URL(url);
      if (!parsed.hostname.includes('.')) {
        throw new Error();
      }
    } catch {
      setError('올바른 URL 형식이 아닙니다. https://로 시작하는 주소를 입력해주세요.');
      return;
    }

    setParsing(true);

    try {
      const res = await fetch(`/api/og?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setOgData(data);
    } catch {
      setError('URL을 파싱할 수 없습니다.');
    }

    setParsing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ogData || !category || !user) return;

    setSubmitting(true);

    const { error: insertError } = await supabase.from('links').insert({
      user_id: user.id,
      url,
      title: ogData.title,
      description: ogData.description,
      thumbnail: ogData.thumbnail,
      site_name: ogData.site_name,
      category,
      comment,
    });

    if (insertError) {
      setError('링크 저장에 실패했습니다.');
      setSubmitting(false);
      return;
    }

    router.push('/');
  };

  return (
    <div className="max-w-lg mx-auto pt-4">
      <h1 className="text-2xl font-bold mb-6">링크 올리기</h1>

      <div className="space-y-4">
        {/* URL 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://..."
              required
            />
            <button
              onClick={handleParse}
              disabled={parsing || !url}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition disabled:opacity-50 whitespace-nowrap"
            >
              {parsing ? '파싱 중...' : '미리보기'}
            </button>
          </div>
        </div>

        {error && !ogData && <p className="text-red-500 text-sm">{error}</p>}

        {/* OG 미리보기 카드 */}
        {ogData && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {ogData.thumbnail && (
              <div className="relative w-full h-48 bg-gray-100">
                <Image
                  src={ogData.thumbnail}
                  alt={ogData.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 512px) 100vw, 512px"
                />
              </div>
            )}
            <div className="p-4">
              <p className="text-xs text-gray-400 mb-1">{ogData.site_name}</p>
              <h3 className="font-semibold text-gray-900">{ogData.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ogData.description}</p>
            </div>
          </div>
        )}

        {ogData && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 카테고리 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm transition ${
                      category === cat
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 한줄 코멘트 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                한줄 코멘트 <span className="text-gray-400">({comment.length}/60)</span>
              </label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="이 링크를 한 마디로 소개해주세요"
                maxLength={60}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !category}
              className="w-full bg-indigo-500 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-600 transition disabled:opacity-50"
            >
              {submitting ? '올리는 중...' : '링크 올리기'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
