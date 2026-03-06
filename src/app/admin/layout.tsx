'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-browser';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!data?.is_admin) {
          router.push('/');
        } else {
          setIsAdmin(true);
        }
        setChecking(false);
      });
  }, [user, authLoading, router]);

  if (authLoading || checking || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: '대시보드' },
    { href: '/admin/users', label: '회원 관리' },
    { href: '/admin/links', label: '링크 관리' },
    { href: '/admin/reports', label: '신고 관리' },
  ];

  return (
    <div className="admin-breakout">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="bg-gray-900 text-white px-5 py-3 flex items-center gap-6 rounded-lg mb-6">
          <span className="font-bold text-sm">Admin</span>
          <nav className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition whitespace-nowrap ${
                  pathname === item.href
                    ? 'text-white font-medium'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="ml-auto text-xs text-gray-400 hover:text-white whitespace-nowrap">
            서비스로 돌아가기
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
