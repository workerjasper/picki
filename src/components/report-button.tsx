'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { useAuth } from '@/lib/auth-context';

interface ReportButtonProps {
  linkId: string;
  linkUserId: string;
  size?: 'sm' | 'md';
}

export default function ReportButton({ linkId, linkUserId, size = 'sm' }: ReportButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!user || user.id === linkUserId) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    await supabase.from('reports').insert({
      link_id: linkId,
      reporter_id: user.id,
      reason: reason.trim(),
    });
    setSubmitting(false);
    setDone(true);
    setTimeout(() => {
      setOpen(false);
      setDone(false);
      setReason('');
    }, 1500);
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={
          size === 'sm'
            ? 'text-xs text-gray-400 hover:text-red-500 transition'
            : 'text-sm text-gray-400 hover:text-red-500 transition'
        }
      >
        신고
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!submitting) setOpen(false);
          }}
        >
          <div
            className="bg-white rounded-xl p-5 w-full max-w-sm mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <p className="text-center text-green-600 font-medium py-4">신고가 접수되었습니다.</p>
            ) : (
              <>
                <h3 className="text-lg font-bold">신고하기</h3>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="신고 사유를 입력해주세요"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!reason.trim() || submitting}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                  >
                    {submitting ? '접수 중...' : '신고'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
