'use client';

import { Fragment, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';

interface AdminReport {
  id: string;
  link_id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'ignored';
  created_at: string;
  links?: { title: string; url: string; id: string; comment: string | null; description: string | null };
  reporter?: { nickname: string; email: string };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  async function fetchReports() {
    setLoading(true);
    let query = supabase
      .from('reports')
      .select('*, links(id, title, url, comment, description), reporter:users!reports_reporter_id_fkey(nickname, email)')
      .order('created_at', { ascending: false });

    if (statusFilter) query = query.eq('status', statusFilter);

    const { data } = await query;
    setReports((data as AdminReport[]) ?? []);
    setLoading(false);
  }

  async function handleResolve(reportId: string, linkId: string) {
    if (!confirm('이 링크를 숨김 처리하고 신고를 처리하시겠습니까?')) return;
    await supabase.from('links').update({ is_hidden: true }).eq('id', linkId);
    await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId);
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r))
    );
  }

  async function handleIgnore(reportId: string) {
    if (!confirm('이 신고를 무시 처리하시겠습니까?')) return;
    await supabase.from('reports').update({ status: 'ignored' }).eq('id', reportId);
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'ignored' } : r))
    );
  }

  const statusLabel: Record<string, string> = {
    pending: '미처리',
    resolved: '처리완료',
    ignored: '무시됨',
  };

  const statusStyle: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-600',
    ignored: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">신고 관리</h1>

      <div className="flex gap-2">
        {['', 'pending', 'resolved', 'ignored'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm transition ${
              statusFilter === s
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === '' ? '전체' : statusLabel[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">로딩 중...</p>
      ) : reports.length === 0 ? (
        <p className="text-center text-gray-400 py-8">신고 내역이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 pr-4">신고 대상</th>
                <th className="py-2 pr-4">신고 사유</th>
                <th className="py-2 pr-4">신고자</th>
                <th className="py-2 pr-4">신고일</th>
                <th className="py-2 pr-4">상태</th>
                <th className="py-2">관리</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <Fragment key={report.id}>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4 max-w-xs truncate">
                    {report.links ? (
                      <a href={report.links.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                        {report.links.title || '(제목 없음)'}
                      </a>
                    ) : (
                      <span className="text-gray-400">(삭제된 링크)</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-gray-600 max-w-xs">
                    <button
                      onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                      className="text-left hover:text-gray-900 transition"
                    >
                      {expandedId === report.id ? (
                        <span className="whitespace-pre-wrap break-words">{report.reason}</span>
                      ) : (
                        <span className="block truncate max-w-xs">{report.reason}</span>
                      )}
                    </button>
                  </td>
                  <td className="py-2 pr-4 text-gray-500">{report.reporter?.nickname ?? '알 수 없음'}</td>
                  <td className="py-2 pr-4 text-gray-400">{new Date(report.created_at).toLocaleDateString('ko-KR')}</td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle[report.status]}`}>
                      {statusLabel[report.status]}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      {report.links && (
                        <button
                          onClick={() => setDetailId(detailId === report.id ? null : report.id)}
                          className="text-xs px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition"
                        >
                          {detailId === report.id ? '접기' : '상세'}
                        </button>
                      )}
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleResolve(report.id, report.link_id)}
                            className="text-xs px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                          >
                            숨김 처리
                          </button>
                          <button
                            onClick={() => handleIgnore(report.id)}
                            className="text-xs px-3 py-1 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition"
                          >
                            무시
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                {detailId === report.id && report.links && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">한줄 코멘트: </span>
                          <span className="text-gray-600">{report.links.comment || '(없음)'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">본문: </span>
                          <span className="text-gray-600 whitespace-pre-wrap">{report.links.description || '(없음)'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">URL: </span>
                          <a href={report.links.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">
                            {report.links.url}
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
        </div>
      )}
    </div>
  );
}
