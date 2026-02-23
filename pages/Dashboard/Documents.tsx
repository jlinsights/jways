import React, { useState, useEffect } from 'react';
import { Search, Download, FileText, Receipt, ClipboardList, Award, Shield, File, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DashboardDocument, DocumentCategory } from '../../types';
import { getDocuments, downloadDocument } from '../../lib/api';

const CATEGORY_CONFIG: Record<DocumentCategory, { label: string; icon: React.FC<{ size?: number; className?: string }> }> = {
  bl: { label: 'B/L', icon: FileText },
  invoice: { label: 'Invoice', icon: Receipt },
  'packing-list': { label: 'Packing List', icon: ClipboardList },
  co: { label: 'C/O', icon: Award },
  insurance: { label: '보험증권', icon: Shield },
  other: { label: '기타', icon: File },
};

type FilterValue = DocumentCategory | 'all';

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DashboardDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getDocuments({
        category: filter === 'all' ? undefined : filter,
        search: search || undefined,
      });
      setDocuments(data);
      setLoading(false);
    };
    load();
  }, [filter, search]);

  const handleDownload = async (doc: DashboardDocument) => {
    setToast(`${doc.name} 다운로드 준비 중...`);
    await downloadDocument(doc.id);
    setToast(`${doc.name} 다운로드가 완료되었습니다.`);
    setTimeout(() => setToast(null), 3000);
  };

  const filters: { value: FilterValue; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'bl', label: 'B/L' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'packing-list', label: 'Packing List' },
    { value: 'co', label: 'C/O' },
    { value: 'insurance', label: '보험증권' },
  ];

  const statusBadge = (status: DashboardDocument['status']) => {
    const config: Record<string, string> = {
      issued: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      draft: 'bg-slate-100 text-slate-500 dark:bg-slate-700/30 dark:text-slate-400',
    };
    const label: Record<string, string> = { issued: '발급', pending: '대기', draft: '초안' };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config[status]}`}>
        {label[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">서류 관리</h2>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="서류명, 선적번호 검색..."
            aria-label="서류 검색"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-jways-blue/30 focus:border-jways-blue transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="서류 유형 필터">
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

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-jways-blue/30 border-t-jways-blue rounded-full animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400">표시할 서류가 없습니다</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">서류명</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">유형</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">선적번호</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">발행일</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">상태</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map(doc => {
                  const catConfig = CATEGORY_CONFIG[doc.category];
                  const Icon = catConfig.icon;
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Icon size={16} className="text-slate-400 shrink-0" aria-hidden="true" />
                          <div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{doc.name}</span>
                            <span className="block text-xs text-slate-500 sm:hidden">{catConfig.label}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">{catConfig.label}</td>
                      <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">{doc.shipmentBlNumber}</td>
                      <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{doc.uploadDate}</td>
                      <td className="py-4 px-4">{statusBadge(doc.status)}</td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-jways-blue"
                          aria-label={`${doc.name} 다운로드`}
                        >
                          <Download size={16} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl px-4 py-3 shadow-lg text-sm font-medium z-50"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Documents;
