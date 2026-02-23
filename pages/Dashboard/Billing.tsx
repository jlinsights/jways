import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, AlertTriangle, CreditCard } from 'lucide-react';
import type { Invoice, InvoiceStatus, BillingSummary } from '../../types';
import { getInvoices, getBillingSummary } from '../../lib/api';

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
  paid: { label: '완납', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  unpaid: { label: '미수', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  overdue: { label: '연체', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  partial: { label: '부분납', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

type FilterValue = InvoiceStatus | 'all';

const formatKRW = (amount: number) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(amount);

const Billing: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [inv, sum] = await Promise.all([
        getInvoices(filter === 'all' ? undefined : { status: filter }),
        getBillingSummary(),
      ]);
      setInvoices(inv);
      setSummary(sum);
      setLoading(false);
    };
    load();
  }, [filter]);

  const filters: { value: FilterValue; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'unpaid', label: '미수' },
    { value: 'overdue', label: '연체' },
    { value: 'paid', label: '완납' },
    { value: 'partial', label: '부분납' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">정산 / 인보이스</h2>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">총 미수금</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formatKRW(summary.totalOutstanding)}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 dark:bg-green-900/20 text-green-500">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">이번 달 정산</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formatKRW(summary.monthlySettled)}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-500">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">미납 건수</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{summary.overdueCount}건</h3>
              {summary.overdueCount > 0 && (
                <p className="text-xs text-red-500 font-medium">연체 포함</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="인보이스 상태 필터">
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

      {/* Invoice Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-jways-blue/30 border-t-jways-blue rounded-full animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-20">
          <CreditCard size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400">표시할 인보이스가 없습니다</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">인보이스 No</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">선적번호</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">금액</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">상태</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">발행일</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">납부기한</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{inv.invoiceNumber}</span>
                      <span className="block text-xs text-slate-500 sm:hidden">{inv.blNumber}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">{inv.blNumber}</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-900 dark:text-white">{formatKRW(inv.amount)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[inv.status].className}`}>
                        {STATUS_CONFIG[inv.status].label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">{inv.issueDate}</td>
                    <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                      <span className={inv.status === 'overdue' ? 'text-red-500 font-semibold' : ''}>{inv.dueDate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
