'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { CATEGORIES } from '@/types';

interface Stats {
  totalUsers: number;
  todayUsers: number;
  totalLinks: number;
  todayLinks: number;
  categoryDistribution: { category: string; count: number }[];
  dailySignups: { date: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const [
      { count: totalUsers },
      { count: todayUsers },
      { count: totalLinks },
      { count: todayLinks },
      { data: allLinks },
      { data: allUsers },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
      supabase.from('links').select('*', { count: 'exact', head: true }),
      supabase.from('links').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
      supabase.from('links').select('category'),
      supabase.from('users').select('created_at').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const catCounts: Record<string, number> = {};
    CATEGORIES.forEach((c) => (catCounts[c] = 0));
    allLinks?.forEach((l) => {
      catCounts[l.category] = (catCounts[l.category] || 0) + 1;
    });
    const categoryDistribution = CATEGORIES.map((c) => ({ category: c, count: catCounts[c] }));

    const dailyMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      dailyMap[d.toISOString().slice(0, 10)] = 0;
    }
    allUsers?.forEach((u) => {
      const dateKey = u.created_at.slice(0, 10);
      if (dailyMap[dateKey] !== undefined) dailyMap[dateKey]++;
    });
    const dailySignups = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

    setStats({
      totalUsers: totalUsers ?? 0,
      todayUsers: todayUsers ?? 0,
      totalLinks: totalLinks ?? 0,
      todayLinks: todayLinks ?? 0,
      categoryDistribution,
      dailySignups,
    });
  }

  if (!stats) {
    return <p className="text-gray-400 text-center py-10">로딩 중...</p>;
  }

  const maxCatCount = Math.max(...stats.categoryDistribution.map((c) => c.count), 1);
  const maxDaily = Math.max(...stats.dailySignups.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">대시보드</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '총 회원 수', value: stats.totalUsers },
          { label: '오늘 가입자', value: stats.todayUsers },
          { label: '총 링크 수', value: stats.totalLinks },
          { label: '오늘 링크', value: stats.todayLinks },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-2xl font-bold mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold mb-4">카테고리별 링크 분포</h2>
        <div className="space-y-2">
          {stats.categoryDistribution.map((cat) => (
            <div key={cat.category} className="flex items-center gap-3">
              <span className="text-sm w-16 text-gray-600">{cat.category}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all"
                  style={{ width: `${(cat.count / maxCatCount) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-8 text-right">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold mb-4">일별 가입자 추이 (최근 7일)</h2>
        <div className="flex items-end gap-2 h-32">
          {stats.dailySignups.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">{day.count}</span>
              <div
                className="w-full bg-indigo-500 rounded-t"
                style={{ height: `${(day.count / maxDaily) * 100}%`, minHeight: day.count > 0 ? '4px' : '0' }}
              />
              <span className="text-xs text-gray-400">{day.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
