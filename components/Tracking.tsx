import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Package, ArrowRight, Truck, CheckCircle2, Clock,
  X, Loader2, Plane, Ship, FileCheck, ChevronDown, Timer,
} from 'lucide-react';
import { ShipmentData, TrackingStep, MilestoneCategory, MilestoneCategoryGroup, TransportMode } from '../types';
import ShipmentMap from './ShipmentMap';
import type { LucideIcon } from 'lucide-react';

// ─── Category Config ───

const CATEGORY_CONFIG: Record<MilestoneCategory, {
  label: string;
  labelEn: string;
  color: string;
  darkColor: string;
  icon: LucideIcon;
}> = {
  departure: {
    label: '출발',
    labelEn: 'Departure',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    darkColor: 'dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    icon: Package,
  },
  transit: {
    label: '운송',
    labelEn: 'Transit',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    darkColor: 'dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    icon: Truck,
  },
  customs: {
    label: '통관',
    labelEn: 'Customs',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    darkColor: 'dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
    icon: FileCheck,
  },
  arrival: {
    label: '도착',
    labelEn: 'Arrival',
    color: 'bg-green-50 text-green-700 border-green-200',
    darkColor: 'dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    icon: MapPin,
  },
};

// ─── Helpers ───

function getRelativeTime(isoString: string): string {
  const now = new Date();
  const past = new Date(isoString);
  const diffMs = now.getTime() - past.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) return `${diffDay}일 전`;
  if (diffHour > 0) return `${diffHour}시간 전`;
  if (diffMin > 0) return `${diffMin}분 전`;
  return '방금 전';
}

function createMockShipment(config: {
  id: string;
  mode: TransportMode;
  status: string;
  estimatedDelivery: string;
  origin: { city: string; code: string; x: number; y: number };
  destination: { city: string; code: string; x: number; y: number };
  current: { city: string; code: string; x: number; y: number; progress: number };
  steps: TrackingStep[];
}): ShipmentData {
  const completedCount = config.steps.filter(s => s.status === 'completed').length;
  const currentCount = config.steps.filter(s => s.status === 'current').length;
  const total = config.steps.length;
  const totalProgress = Math.round(((completedCount + currentCount * 0.5) / total) * 100);

  const categoryOrder: MilestoneCategory[] = ['departure', 'customs', 'transit', 'arrival'];
  const categories: MilestoneCategoryGroup[] = categoryOrder
    .map(cat => ({
      category: cat,
      label: CATEGORY_CONFIG[cat].label,
      steps: config.steps.filter(s => s.category === cat),
    }))
    .filter(g => g.steps.length > 0);

  return { ...config, totalProgress, categories };
}

// ─── Mock Data ───

const MOCK_SHIPMENTS = new Map<string, ShipmentData>([
  ['JW-8839-KR', createMockShipment({
    id: 'JW-8839-KR',
    mode: 'air',
    status: 'In Transit',
    estimatedDelivery: 'Oct 24, 2024',
    origin: { city: 'Incheon, KR', code: 'ICN', x: 82, y: 36 },
    destination: { city: 'Los Angeles, US', code: 'LAX', x: 18, y: 38 },
    current: { city: 'Pacific Ocean', code: 'PAC', x: 50, y: 32, progress: 55 },
    steps: [
      { id: 'a1', label: '화물 접수 (Pickup)', date: 'Oct 21', time: '14:30', status: 'completed', location: 'Seoul, KR', category: 'departure', completedAt: '2024-10-21T14:30:00Z', detail: '접수 번호: PKG-2024-1021 | 화물 종류: 전자부품 (Class A)' },
      { id: 'a2', label: '출발지 터미널 처리', date: 'Oct 21', time: '18:45', status: 'completed', location: 'Incheon Terminal 1', category: 'departure', completedAt: '2024-10-21T18:45:00Z', detail: '터미널 게이트 T1-B7 통과', port: 'ICN' },
      { id: 'a3', label: '수출 통관 (Export Customs)', date: 'Oct 22', time: '09:15', status: 'completed', location: 'Incheon Customs', category: 'customs', completedAt: '2024-10-22T09:15:00Z', detail: '수출신고번호: EX-2024-88391 | HS Code: 8542.31' },
      { id: 'a4', label: '항공기 탑재/출발', date: 'Oct 22', time: '13:00', status: 'current', location: 'ICN → LAX (KE017)', category: 'transit', eta: '12h 30m', vessel: 'KE017', port: 'ICN' },
      { id: 'a5', label: '도착지 입항 (Arrival)', date: 'Estimated', time: '--:--', status: 'pending', location: 'Los Angeles Int. Airport', category: 'transit', eta: '2h', port: 'LAX' },
      { id: 'a6', label: '수입 통관 (Import Customs)', date: 'Estimated', time: '--:--', status: 'pending', location: 'LAX Customs', category: 'customs', eta: '4h' },
      { id: 'a7', label: '내륙 운송 출발', date: 'Estimated', time: '--:--', status: 'pending', location: 'LAX Cargo Terminal', category: 'arrival', eta: '1h 30m' },
      { id: 'a8', label: '배송 완료 (Delivered)', date: 'Estimated', time: '--:--', status: 'pending', location: 'Los Angeles, US', category: 'arrival', eta: '3h' },
    ],
  })],
  ['JW-2201-SEA', createMockShipment({
    id: 'JW-2201-SEA',
    mode: 'sea',
    status: 'In Transit',
    estimatedDelivery: 'Nov 28, 2024',
    origin: { city: 'Busan, KR', code: 'PUS', x: 82, y: 38 },
    destination: { city: 'Rotterdam, NL', code: 'RTM', x: 35, y: 28 },
    current: { city: 'Singapore', code: 'SIN', x: 74, y: 55, progress: 35 },
    steps: [
      { id: 's1', label: '화물 접수 (Pickup)', date: 'Oct 28', time: '10:00', status: 'completed', location: 'Busan, KR', category: 'departure', completedAt: '2024-10-28T10:00:00Z', detail: '화물 타입: 20ft Container (FCL)' },
      { id: 's2', label: 'CFS/CY 입고', date: 'Oct 28', time: '15:30', status: 'completed', location: 'Busan New Port', category: 'departure', completedAt: '2024-10-28T15:30:00Z', detail: 'Container No: MSCU-2201887 | Seal: KR-SEA-9921', port: 'PUS' },
      { id: 's3', label: '수출 통관 (Export Customs)', date: 'Oct 29', time: '11:00', status: 'completed', location: 'Busan Customs', category: 'customs', completedAt: '2024-10-29T11:00:00Z', detail: '수출신고번호: EX-2024-22019 | HS Code: 8471.30' },
      { id: 's4', label: '선적/출항 (Vessel Departure)', date: 'Oct 30', time: '06:00', status: 'completed', location: 'Busan Port', category: 'transit', completedAt: '2024-10-30T06:00:00Z', vessel: 'EVER GIVEN', detail: 'Voyage: EG-2024W | Berth: B-7', port: 'PUS' },
      { id: 's5', label: '환적 (Transshipment)', date: 'Nov 5', time: '08:00', status: 'current', location: 'Singapore (PSA Terminal)', category: 'transit', eta: '2d 8h', vessel: 'EVER GIVEN', port: 'SIN' },
      { id: 's6', label: '도착항 입항', date: 'Estimated', time: '--:--', status: 'pending', location: 'Rotterdam, NL', category: 'transit', eta: '18d', port: 'RTM' },
      { id: 's7', label: '수입 통관 (Import Customs)', date: 'Estimated', time: '--:--', status: 'pending', location: 'Rotterdam Customs', category: 'customs', eta: '1d' },
      { id: 's8', label: '내륙 운송 (Inland Transport)', date: 'Estimated', time: '--:--', status: 'pending', location: 'Rotterdam → Amsterdam', category: 'arrival', eta: '6h' },
      { id: 's9', label: '배송 완료 (Delivered)', date: 'Estimated', time: '--:--', status: 'pending', location: 'Amsterdam, NL', category: 'arrival', eta: '2h' },
    ],
  })],
]);

// ─── Inline Sub-Components ───

interface MilestoneRowProps {
  step: TrackingStep;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  mode?: TransportMode;
}

const MilestoneRow: React.FC<MilestoneRowProps> = ({ step, index, isExpanded, onToggle, mode }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  const hasExpandContent = step.detail || step.vessel || step.port;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 + 0.3 }}
      className="relative flex gap-3 md:gap-4 pb-6 last:pb-0"
    >
      {/* Icon */}
      <div className={`relative z-10 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-4 border-slate-50 dark:border-slate-950 shrink-0 transition-colors ${
        step.status === 'completed' ? 'bg-blue-100 text-blue-600' :
        step.status === 'current' ? 'bg-jways-blue text-white shadow-lg shadow-blue-500/30' :
        'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
      }`}>
        {step.status === 'completed' ? <CheckCircle2 size={16} className="md:w-[18px] md:h-[18px]" /> :
         step.status === 'current' ? (
           mode === 'sea' ? <Ship size={16} className="md:w-[18px] md:h-[18px]" /> :
           mode === 'air' ? <Plane size={16} className="md:w-[18px] md:h-[18px]" /> :
           <Truck size={16} className="md:w-[18px] md:h-[18px]" />
         ) :
         <Clock size={16} className="md:w-[18px] md:h-[18px]" />}
      </div>

      {/* Content */}
      <div
        className={`pt-0.5 md:pt-1 flex-1 min-w-0 ${hasExpandContent ? 'cursor-pointer' : ''}`}
        role={hasExpandContent ? 'button' : undefined}
        tabIndex={hasExpandContent ? 0 : undefined}
        aria-expanded={hasExpandContent ? isExpanded : undefined}
        aria-label={`${step.label} - ${step.status === 'completed' ? '완료' : step.status === 'current' ? '진행중' : '대기중'}`}
        onClick={hasExpandContent ? onToggle : undefined}
        onKeyDown={hasExpandContent ? handleKeyDown : undefined}
      >
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <p className={`font-bold text-sm md:text-base truncate ${
              step.status === 'current' ? 'text-jways-blue' : 'text-slate-900 dark:text-white'
            }`}>
              {step.label}
            </p>
            {hasExpandContent && (
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} className="text-slate-400 shrink-0" />
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {step.completedAt && step.status === 'completed' && (
              <span className="text-[10px] text-slate-400 hidden md:inline">{getRelativeTime(step.completedAt)}</span>
            )}
            <span className="text-[10px] md:text-xs text-slate-400 whitespace-nowrap">{step.date}</span>
          </div>
        </div>

        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-1">{step.location}</p>

        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[10px] md:text-xs text-slate-400 font-mono">{step.time}</p>
          {step.eta && step.status !== 'completed' && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
              <Timer size={10} />
              ETA {step.eta}
            </span>
          )}
          {step.vessel && (
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">
              {step.vessel}
            </span>
          )}
        </div>

        {/* Expand Panel */}
        <AnimatePresence>
          {isExpanded && hasExpandContent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
              role="region"
              aria-label={`${step.label} 상세 정보`}
            >
              <div className="mt-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                {step.detail && <p>{step.detail}</p>}
                {step.port && <p className="font-mono text-slate-500">Port: {step.port}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── Main Component ───

const Tracking: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [shipment, setShipment] = useState<ShipmentData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleSearch = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!trackingId) return;

    setSearchStatus('loading');
    setErrorMessage('');
    setExpandedIds(new Set());

    setTimeout(() => {
      const found = MOCK_SHIPMENTS.get(trackingId.toUpperCase());
      if (found) {
        setShipment(found);
        setSearchStatus('success');
      } else {
        setShipment(null);
        setSearchStatus('error');
        setErrorMessage('운송장 번호를 찾을 수 없습니다. 올바른 번호를 입력해주세요.');
      }
    }, 1500);
  };

  const clearSearch = () => {
    setSearchStatus('idle');
    setShipment(null);
    setTrackingId('');
    setErrorMessage('');
    setExpandedIds(new Set());
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Derive groups for rendering
  const milestoneGroups: MilestoneCategoryGroup[] = shipment?.categories || (shipment ? [{
    category: 'transit' as MilestoneCategory,
    label: 'Transit',
    steps: shipment.steps,
  }] : []);

  const completedSteps = shipment?.steps.filter(s => s.status === 'completed').length ?? 0;
  const totalSteps = shipment?.steps.length ?? 0;

  return (
    <div id="track" className="relative -mt-20 z-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          layout
          initial={{ borderRadius: 24 }}
          animate={{
            borderRadius: searchStatus === 'success' ? 32 : 24,
            boxShadow: searchStatus === 'success' ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)" : "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
          }}
          className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-500 relative ${
            searchStatus === 'success' ? 'p-0' : 'p-2 md:p-3'
          }`}
        >
          {/* Search Header Area */}
          <div className={`flex flex-col md:flex-row items-center gap-2 transition-all duration-500 ${
             searchStatus === 'success' ? 'bg-slate-50 dark:bg-slate-950 p-4 md:p-6 border-b border-slate-100 dark:border-slate-800' : ''
          }`}>
            <div className={`flex-1 w-full relative transition-all ${searchStatus === 'success' ? 'md:max-w-md' : ''}`}>
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-jways-blue' : 'text-slate-400'}`}>
                <Search size={20} aria-hidden="true" />
              </div>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  aria-label="Tracking Number Input"
                  placeholder="운송장 번호 입력 (예: JW-8839-KR, JW-2201-SEA)"
                  className={`w-full pl-12 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-jways-blue/20 transition-all font-medium ${
                    searchStatus === 'success' ? 'h-12 text-base border border-slate-200 dark:border-slate-700' : 'h-14 md:h-16 text-lg'
                  } ${searchStatus === 'error' ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                  value={trackingId}
                  onChange={(e) => {
                    setTrackingId(e.target.value);
                    if (searchStatus === 'error') {
                        setSearchStatus('idle');
                        setErrorMessage('');
                    }
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  readOnly={searchStatus === 'loading'}
                />
              </form>
              {trackingId && (
                <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                    <X size={16} />
                </button>
              )}
            </div>

            <AnimatePresence mode='popLayout'>
                {searchStatus !== 'success' && (
                    <motion.button
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        onClick={handleSearch}
                        disabled={searchStatus === 'loading'}
                        className="w-full md:w-auto h-14 md:h-16 px-8 bg-jways-navy hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-jways-navy/20 whitespace-nowrap overflow-hidden"
                    >
                        {searchStatus === 'loading' ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>Track Shipment <ArrowRight size={20} /></>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {searchStatus === 'success' && (
                <div className="hidden md:flex flex-1 justify-end gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live Tracking Active
                    </div>
                </div>
            )}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {searchStatus === 'error' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6"
                >
                    <div className="flex items-center gap-3 text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/50">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800/30 flex items-center justify-center shrink-0">
                            <X size={18} />
                        </div>
                        <p className="text-sm font-medium">{errorMessage}</p>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Expanded Result Area */}
          <AnimatePresence>
            {searchStatus === 'success' && shipment && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="bg-white dark:bg-slate-900"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3">

                    {/* Left: Map Visualization */}
                    <div className="lg:col-span-2">
                      <ShipmentMap shipment={shipment} />
                    </div>

                    {/* Right: Timeline & Status */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 lg:h-[500px] overflow-y-auto custom-scrollbar" aria-live="polite">

                        {/* ── ProgressHeader ── */}
                        <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Status Updates</h3>
                                {shipment.mode && (
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                      shipment.mode === 'air'
                                        ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800'
                                        : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800'
                                    }`}
                                    aria-label={shipment.mode === 'air' ? '항공 운송' : '해상 운송'}
                                  >
                                    {shipment.mode === 'air' ? <Plane size={12} /> : <Ship size={12} />}
                                    {shipment.mode === 'air' ? 'Air Freight' : 'Sea Freight'}
                                  </span>
                                )}
                            </div>
                            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-3">
                              Tracking ID: <span className="font-mono text-slate-700 dark:text-slate-300">{shipment.id}</span>
                            </p>

                            {/* Progress Bar */}
                            <div
                              role="progressbar"
                              aria-valuenow={shipment.totalProgress ?? 0}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label="전체 운송 진행률"
                            >
                              <div className="flex justify-between text-[10px] md:text-xs text-slate-400 mb-1.5 font-medium">
                                <span>{completedSteps}/{totalSteps} milestones</span>
                                <span className="text-jways-blue font-bold">{shipment.totalProgress ?? 0}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${shipment.totalProgress ?? 0}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className="h-full bg-gradient-to-r from-blue-500 to-jways-accent rounded-full"
                                />
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1">ETA: {shipment.estimatedDelivery}</p>
                            </div>
                        </div>

                        {/* ── Milestone Groups ── */}
                        <div className="space-y-0 relative">
                            {/* Timeline Line */}
                            <div className="absolute top-2 bottom-2 left-[15px] md:left-[19px] w-0.5 bg-slate-200 dark:bg-slate-800" />

                            {milestoneGroups.map((group, groupIdx) => {
                              const cfg = CATEGORY_CONFIG[group.category];
                              const groupCompleted = group.steps.filter(s => s.status === 'completed').length;
                              const groupTotal = group.steps.length;

                              return (
                                <div key={group.category} role="group" aria-label={`${cfg.label} 마일스톤`}>
                                  {/* Category Header */}
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: groupIdx * 0.15 + 0.2 }}
                                    className="relative z-10 flex items-center gap-2 mb-3 mt-2 first:mt-0"
                                  >
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700 border-dashed" />
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.color} ${cfg.darkColor}`}>
                                      <cfg.icon size={10} aria-hidden="true" />
                                      {cfg.label} ({cfg.labelEn})
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      {groupCompleted}/{groupTotal}
                                    </span>
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700 border-dashed" />
                                  </motion.div>

                                  {/* Steps */}
                                  {group.steps.map((step, idx) => (
                                    <MilestoneRow
                                      key={step.id}
                                      step={step}
                                      index={groupIdx * 3 + idx}
                                      isExpanded={expandedIds.has(step.id)}
                                      onToggle={() => toggleExpand(step.id)}
                                      mode={shipment.mode}
                                    />
                                  ))}
                                </div>
                              );
                            })}
                        </div>
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick Stats below tracking */}
        {!shipment && searchStatus !== 'loading' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
             {[
               { label: '실시간 위치 추적', icon: MapPin, desc: 'GPS 기반 정밀 추적' },
               { label: '안전 배송 보장', icon: Package, desc: '99.9% 배송 완료율' },
               { label: '빠른 통관 서비스', icon: ArrowRight, desc: '원스톱 통관 처리' },
             ].map((item, idx) => (
               <motion.div
                 key={idx}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: idx * 0.1 }}
                 className="bg-white/5 border border-white/10 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/10 transition-colors"
               >
                 <item.icon className="w-8 h-8 text-jways-blue mb-3" aria-hidden="true" />
                 <h3 className="text-white font-bold text-lg mb-1">{item.label}</h3>
                 <p className="text-slate-400 text-sm">{item.desc}</p>
               </motion.div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
};

export default Tracking;
