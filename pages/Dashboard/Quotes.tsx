import React, { useState, useEffect } from 'react';
import { Ship, Plane, Truck, Warehouse, Plus, Package } from 'lucide-react';
import type { QuoteHistory, QuoteStatus, ServiceType } from '../../types';
import { getQuoteHistory } from '../../lib/api';
import QuoteModal from '../../components/QuoteModal';

const STATUS_CONFIG: Record<QuoteStatus, { label: string; className: string }> = {
  pending: { label: '대기', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  approved: { label: '승인', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  expired: { label: '만료', className: 'bg-slate-100 text-slate-500 dark:bg-slate-700/30 dark:text-slate-400' },
  rejected: { label: '거절', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const SERVICE_ICON: Record<ServiceType, React.FC<{ size?: number; className?: string }>> = {
  air: Plane,
  ocean: Ship,
  land: Truck,
  warehouse: Warehouse,
};

const SERVICE_LABEL: Record<ServiceType, string> = {
  air: '항공 운송',
  ocean: '해상 운송',
  land: '육상 운송',
  warehouse: '물류 창고',
};

type FilterValue = QuoteStatus | 'all';

const Quotes: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [showModal, setShowModal] = useState(false);

  const loadQuotes = async () => {
    setLoading(true);
    const data = await getQuoteHistory(filter === 'all' ? undefined : { status: filter });
    setQuotes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadQuotes();
  }, [filter]);

  const filters: { value: FilterValue; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'pending', label: '대기' },
    { value: 'approved', label: '승인' },
    { value: 'expired', label: '만료' },
    { value: 'rejected', label: '거절' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">견적 관리</h2>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-jways-blue hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-sm font-bold transition-colors min-h-[44px]"
        >
          <Plus size={18} aria-hidden="true" />
          새 견적 요청
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="견적 상태 필터">
        {filters.map(f => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-jways-blue text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Quote Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-jways-blue/30 border-t-jways-blue rounded-full animate-spin" />
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400">표시할 견적이 없습니다</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {quotes.map(q => {
            const Icon = SERVICE_ICON[q.serviceType];
            return (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-jways-blue/30 dark:hover:border-jways-blue/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-jways-blue">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{q.id}</p>
                      <p className="text-xs text-slate-500">{SERVICE_LABEL[q.serviceType]} &middot; {q.requestDate}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold self-start sm:self-center ${STATUS_CONFIG[q.status].className}`}>
                    {STATUS_CONFIG[q.status].label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">구간</span>
                    <p className="font-medium text-slate-900 dark:text-white">{q.origin} → {q.destination}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">화물</span>
                    <p className="font-medium text-slate-900 dark:text-white">{q.cargoType} / {q.weight}</p>
                  </div>
                  <div>
                    {q.estimatedPrice && (
                      <>
                        <span className="text-slate-500 dark:text-slate-400">{q.status === 'approved' ? '확정 금액' : '예상 금액'}</span>
                        <p className="font-bold text-jways-blue">{q.estimatedPrice}</p>
                      </>
                    )}
                  </div>
                </div>

                {(q.validUntil || q.assignedManager) && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 text-xs text-slate-500">
                    {q.validUntil && <span>유효기한: {q.validUntil}</span>}
                    {q.assignedManager && <span>담당: {q.assignedManager}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quote Modal (reuse existing) */}
      <QuoteModal isOpen={showModal} onClose={() => { setShowModal(false); loadQuotes(); }} />
    </div>
  );
};

export default Quotes;
