import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Ship, Plane, Clock, MapPin, Package, ChevronRight } from 'lucide-react';
import type { ShipmentListItem, ShipmentStatus } from '../../types';
import { getShipments } from '../../lib/api';

const STATUS_CONFIG: Record<ShipmentStatus, { label: string; className: string }> = {
  'in-transit': { label: '운송중', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  'customs': { label: '통관중', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  'delivered': { label: '완료', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  'delayed': { label: '지연', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  'pending': { label: '대기', className: 'bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-400' },
};

type FilterValue = ShipmentStatus | 'all';

const Shipments: React.FC = () => {
  const [shipments, setShipments] = useState<ShipmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getShipments({
        status: filter === 'all' ? undefined : filter,
        search: search || undefined,
      });
      setShipments(data);
      setLoading(false);
    };
    load();
  }, [filter, search]);

  const allShipments = shipments;
  const selected = allShipments.find(s => s.id === selectedId) || null;

  const filters: { value: FilterValue; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'in-transit', label: '운송중' },
    { value: 'customs', label: '통관중' },
    { value: 'delivered', label: '완료' },
    { value: 'delayed', label: '지연' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">내 화물 관리</h2>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="B/L 번호, 출발/도착지 검색..."
            aria-label="화물 검색"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-jways-blue/30 focus:border-jways-blue transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="화물 상태 필터">
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
      ) : shipments.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400">표시할 화물이 없습니다</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">B/L No.</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">구간</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">상태</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">운송</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">예정 도착</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">진행률</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {shipments.map(s => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-4">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{s.blNumber}</span>
                      <span className="block text-xs text-slate-500 sm:hidden">{s.origin.split(' ')[0]} → {s.destination.split(' ')[0]}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300 hidden sm:table-cell">
                      {s.origin.split(' ')[0]} → {s.destination.split(' ')[0]}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[s.status].className}`}>
                        {STATUS_CONFIG[s.status].label}
                      </span>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      {s.mode === 'sea' ? <Ship size={16} className="text-blue-500" /> : <Plane size={16} className="text-indigo-500" />}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{s.estimatedArrival}</td>
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-jways-blue rounded-full transition-all"
                            style={{ width: `${s.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{s.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <ChevronRight size={16} className="text-slate-400" aria-hidden="true" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over Detail Panel */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSelectedId(null)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-y-auto"
              role="dialog"
              aria-label={`${selected.blNumber} 상세 정보`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selected.blNumber}</h3>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    aria-label="닫기"
                  >
                    <X size={20} className="text-slate-500" aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${STATUS_CONFIG[selected.status].className}`}>
                      {STATUS_CONFIG[selected.status].label}
                    </span>
                    {selected.mode === 'sea' ? (
                      <span className="flex items-center gap-1 text-sm text-slate-500"><Ship size={14} /> 해상운송</span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-slate-500"><Plane size={14} /> 항공운송</span>
                    )}
                  </div>

                  {/* Route */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{selected.origin}</p>
                        <p className="text-xs text-slate-500">출발: {selected.departureDate}</p>
                      </div>
                    </div>
                    <div className="ml-1.5 border-l-2 border-dashed border-slate-300 dark:border-slate-600 h-6" />
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-jways-blue" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{selected.destination}</p>
                        <p className="text-xs text-slate-500">예정 도착: {selected.estimatedArrival}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500 dark:text-slate-400">진행률</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selected.progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selected.progress}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-jways-blue rounded-full"
                      />
                    </div>
                  </div>

                  {/* Cargo Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-1">화물 유형</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{selected.cargoType}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-1">중량</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{selected.weight}</p>
                    </div>
                    {selected.containerCount && (
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                        <p className="text-xs text-slate-500 mb-1">컨테이너</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{selected.containerCount}대</p>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">추적 타임라인</h4>
                    <div className="space-y-0">
                      {[
                        { label: '출발', date: selected.departureDate, location: selected.origin.split(' ')[0], done: true },
                        { label: selected.status === 'customs' ? '통관 진행중' : '환적/운송', date: '-', location: '운송중', done: selected.progress > 50 },
                        { label: '도착 예정', date: selected.estimatedArrival, location: selected.destination.split(' ')[0], done: selected.status === 'delivered' },
                      ].map((step, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${step.done ? 'bg-jways-blue' : 'bg-slate-300 dark:bg-slate-600'}`} />
                            {i < 2 && <div className={`w-0.5 h-10 ${step.done ? 'bg-jways-blue' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                          </div>
                          <div className="pb-4">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{step.label}</p>
                            <p className="text-xs text-slate-500">{step.date} &middot; {step.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shipments;
