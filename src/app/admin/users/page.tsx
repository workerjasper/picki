'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';

interface AdminUser {
  id: string;
  nickname: string;
  email: string;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
  link_count?: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      const userIds = data.map((u) => u.id);
      const { data: linkCounts } = await supabase
        .from('links')
        .select('user_id')
        .in('user_id', userIds);

      const countMap: Record<string, number> = {};
      linkCounts?.forEach((l) => {
        countMap[l.user_id] = (countMap[l.user_id] || 0) + 1;
      });

      setUsers(data.map((u) => ({ ...u, link_count: countMap[u.id] || 0 })));
    }
    setLoading(false);
  }

  async function toggleBan(userId: string, currentBanned: boolean) {
    await supabase.from('users').update({ is_banned: !currentBanned }).eq('id', userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_banned: !currentBanned } : u))
    );
  }

  async function toggleAdmin(userId: string, currentAdmin: boolean) {
    const action = currentAdmin ? '관리자 권한을 해제' : '관리자로 승격';
    if (!confirm(`이 회원을 ${action}하시겠습니까?`)) return;
    await supabase.from('users').update({ is_admin: !currentAdmin }).eq('id', userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_admin: !currentAdmin } : u))
    );
  }

  const filtered = users.filter(
    (u) =>
      u.nickname.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">회원 관리</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="닉네임 또는 이메일 검색"
        className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {loading ? (
        <p className="text-gray-400">로딩 중...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 pr-4">닉네임</th>
                <th className="py-2 pr-4">이메일</th>
                <th className="py-2 pr-4">가입일</th>
                <th className="py-2 pr-4">링크 수</th>
                <th className="py-2 pr-4">상태</th>
                <th className="py-2">관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-medium">
                    {user.nickname}
                    {user.is_admin && (
                      <span className="ml-1 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">관리자</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-gray-500">{user.email}</td>
                  <td className="py-2 pr-4 text-gray-400">{new Date(user.created_at).toLocaleDateString('ko-KR')}</td>
                  <td className="py-2 pr-4">{user.link_count}</td>
                  <td className="py-2 pr-4">
                    {user.is_banned ? (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">차단됨</span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">정상</span>
                    )}
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAdmin(user.id, user.is_admin)}
                        className={`text-xs px-3 py-1 rounded-lg transition ${
                          user.is_admin
                            ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            : 'bg-indigo-500 text-white hover:bg-indigo-600'
                        }`}
                      >
                        {user.is_admin ? '관리자 해제' : '관리자 승격'}
                      </button>
                      {!user.is_admin && (
                        <button
                          onClick={() => toggleBan(user.id, user.is_banned)}
                          className={`text-xs px-3 py-1 rounded-lg transition ${
                            user.is_banned
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                        >
                          {user.is_banned ? '차단 해제' : '차단'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-8">검색 결과가 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
}
