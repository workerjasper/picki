'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { CATEGORIES } from '@/types';

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-500">
          Picki
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-indigo-500 transition"
            aria-label="검색"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </Link>
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            <>
              <Link
                href="/upload"
                className="bg-indigo-500 text-white text-sm px-4 py-1.5 rounded-full hover:bg-indigo-600 transition"
              >
                + 링크 올리기
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center"
                >
                  {user.email?.[0].toUpperCase()}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border py-1">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      내 프로필
                    </Link>
                    <Link
                      href="/saved"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      저장한 링크
                    </Link>
                    <button
                      onClick={() => { signOut(); setMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-indigo-500 text-white text-sm px-4 py-1.5 rounded-full hover:bg-indigo-600 transition"
            >
              로그인
            </Link>
          )}
        </div>
      </div>

      {/* 카테고리 스크롤 바 */}
      <div className="max-w-2xl mx-auto px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 pb-2 pt-1 whitespace-nowrap">
          <Link
            href="/"
            className={`text-xs px-3 py-1.5 rounded-full transition font-medium ${
              pathname === '/'
                ? 'bg-indigo-500 text-white'
                : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'
            }`}
          >
            전체
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/category/${encodeURIComponent(cat)}`}
              className={`text-xs px-3 py-1.5 rounded-full transition font-medium ${
                pathname === `/category/${encodeURIComponent(cat)}`
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
