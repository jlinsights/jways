import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Package, ArrowRight, Truck, FileCheck,
  X, Loader2, Plane, Ship, ChevronDown, Bell, Scale, Box, Layers,
} from 'lucide-react';
import { ShipmentData, TrackingStep, MilestoneCategory, MilestoneCategoryGroup, TransportMode, ETAInfo, ShipmentDocument, Waypoint, CargoDetails } from '../types';
import ShipmentMap from './ShipmentMap';
import TrackingDashboard from './TrackingDashboard';
import ETACard from './ETACard';
import EventTimeline from './EventTimeline';
import ShipmentDocuments from './ShipmentDocuments';
import ShipmentCompare from './ShipmentCompare';
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

function createMockShipment(config: {
  id: string;
  mode: TransportMode;
  status: string;
  estimatedDelivery: string;
  origin: { city: string; code: string; x: number; y: number };
  destination: { city: string; code: string; x: number; y: number };
  current: { city: string; code: string; x: number; y: number; progress: number };
  steps: TrackingStep[];
  eta?: ETAInfo;
  documents?: ShipmentDocument[];
  waypoints?: Waypoint[];
  cargoDetails?: CargoDetails;
}): ShipmentData {
  const completedCount = config.steps.filter(s => s.status === 'completed').length;
  const currentCount = config.steps.filter(s => s.status === 'current').length;
  const total = config.steps.length;
  const totalProgress = Math.round(((completedCount + currentCount * 0.5) / total) * 100);

  const categoryOrder: MilestoneCategory[] = ['departure', 'transit', 'customs', 'arrival'];
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
    eta: {
      estimatedArrival: '2024-10-24T18:00:00Z',
      confidence: 'high',
      delayDays: 0,
      lastUpdated: '2024-10-22T13:00:00Z',
    },
    documents: [
      { id: 'd1', type: 'bl', name: 'Air Waybill (AWB)', status: 'issued', date: '2024-10-21', fileSize: '1.2 MB' },
      { id: 'd2', type: 'invoice', name: 'Commercial Invoice', status: 'issued', date: '2024-10-21', fileSize: '0.8 MB' },
      { id: 'd3', type: 'packing-list', name: 'Packing List', status: 'issued', date: '2024-10-21', fileSize: '0.5 MB' },
      { id: 'd4', type: 'certificate', name: 'Certificate of Origin', status: 'pending' },
    ],
    waypoints: [
      { name: 'Anchorage', code: 'ANC', location: { city: 'Anchorage, US', code: 'ANC', x: 12, y: 22 }, type: 'airport', arrivalDate: '2024-10-22T19:00:00Z', departureDate: '2024-10-22T20:30:00Z' },
    ],
    cargoDetails: {
      weight: '450 kg',
      cbm: '1.8 CBM',
      packages: 12,
      hsCode: '8542.31',
    },
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
    eta: {
      estimatedArrival: '2024-11-28T00:00:00Z',
      confidence: 'medium',
      delayDays: 2,
      lastUpdated: '2024-11-05T08:00:00Z',
    },
    documents: [
      { id: 'd5', type: 'bl', name: 'Bill of Lading (B/L)', status: 'issued', date: '2024-10-30', fileSize: '1.5 MB' },
      { id: 'd6', type: 'invoice', name: 'Commercial Invoice', status: 'issued', date: '2024-10-28', fileSize: '0.9 MB' },
      { id: 'd7', type: 'packing-list', name: 'Packing List', status: 'issued', date: '2024-10-28', fileSize: '0.6 MB' },
      { id: 'd8', type: 'certificate', name: 'Insurance Certificate', status: 'draft' },
    ],
    waypoints: [
      { name: 'Singapore', code: 'SIN', location: { city: 'Singapore', code: 'SIN', x: 74, y: 55 }, type: 'port', arrivalDate: '2024-11-05T08:00:00Z', departureDate: '2024-11-07T06:00:00Z' },
      { name: 'Colombo', code: 'CMB', location: { city: 'Colombo, LK', code: 'CMB', x: 64, y: 52 }, type: 'port', arrivalDate: '2024-11-12T00:00:00Z', departureDate: '2024-11-13T00:00:00Z' },
      { name: 'Suez Canal', code: 'SUZ', location: { city: 'Suez, EG', code: 'SUZ', x: 44, y: 40 }, type: 'terminal', arrivalDate: '2024-11-18T00:00:00Z' },
    ],
    cargoDetails: {
      weight: '8,500 kg',
      cbm: '33.2 CBM',
      containerType: '20ft FCL',
      packages: 240,
      hsCode: '8471.30',
    },
  })],
]);

// ─── Main Component ───

const Tracking: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [shipment, setShipment] = useState<ShipmentData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchType, setSearchType] = useState('bl');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'compare'>('single');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'documents' | 'cargo'>('documents');

  const handleSearch = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!trackingId) return;

    setErrorMessage('');
    setExpandedIds(new Set());

    const found = MOCK_SHIPMENTS.get(trackingId.toUpperCase());
    if (found) {
      setShipment(found);
      setSearchStatus('success');
    } else {
      setShipment(null);
      setSearchStatus('error');
      setErrorMessage('운송장 번호를 찾을 수 없습니다. 올바른 번호를 입력해주세요.');
    }
  };

  const clearSearch = () => {
    setSearchStatus('idle');
    setShipment(null);
    setTrackingId('');
    setErrorMessage('');
    setExpandedIds(new Set());
    setIsSubscribed(false);
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

  return (
    <section id="track" aria-label="화물 추적" className="relative -mt-20 z-20 px-6">
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
            <div className={`flex-1 w-full relative transition-all flex gap-2 ${searchStatus === 'success' ? 'md:max-w-md' : ''}`}>
              <div className="relative shrink-0">
                <select 
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className={`appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-jways-blue/20 transition-all font-bold cursor-pointer ${
                    searchStatus === 'success' ? 'h-12 text-sm' : 'h-14 md:h-16 text-sm md:text-base'
                  }`}
                  aria-label="Search Type"
                >
                  <option value="bl">B/L No.</option>
                  <option value="container">Container No.</option>
                  <option value="booking">Booking No.</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown size={16} aria-hidden="true" />
                </div>
              </div>
              <div className="relative flex-1">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-jways-blue' : 'text-slate-400'}`}>
                  <Search size={20} aria-hidden="true" />
                </div>
                <form onSubmit={handleSearch} className="w-full">
                  <input
                    type="text"
                    aria-label="Tracking Number Input"
                    placeholder="번호 입력 (예: JW-8839-KR)"
                    className={`w-full pl-12 pr-10 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-jways-blue/20 transition-all font-medium border ${
                      searchStatus === 'success' ? 'h-12 text-base border-slate-200 dark:border-slate-700' : 'h-14 md:h-16 text-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
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
                      <X size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
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
                            <>Track Shipment <ArrowRight size={20} aria-hidden="true" /></>
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
                    <button
                      onClick={() => {
                        if (viewMode === 'compare') {
                          setViewMode('single');
                          setCompareIds([]);
                        } else {
                          setViewMode('compare');
                          if (shipment) setCompareIds([shipment.id]);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                        viewMode === 'compare'
                          ? 'bg-jways-blue text-white border-jways-blue'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {viewMode === 'compare' ? '단일 보기' : '비교 모드'}
                    </button>
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
                            <X size={18} aria-hidden="true" />
                        </div>
                        <p className="text-sm font-medium">{errorMessage}</p>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Compare Mode */}
          <AnimatePresence>
            {viewMode === 'compare' && searchStatus === 'success' && (
              <ShipmentCompare
                shipments={compareIds.map(id => MOCK_SHIPMENTS.get(id)).filter((s): s is ShipmentData => !!s)}
                onRemove={(id) => {
                  const next = compareIds.filter(cid => cid !== id);
                  if (next.length === 0) { setViewMode('single'); }
                  setCompareIds(next);
                }}
                onClose={() => { setViewMode('single'); setCompareIds([]); }}
                onAdd={() => {
                  const allIds = Array.from(MOCK_SHIPMENTS.keys());
                  const available = allIds.find(id => !compareIds.includes(id));
                  if (available && compareIds.length < 3) {
                    setCompareIds(prev => [...prev, available]);
                  }
                }}
                maxShipments={3}
              />
            )}
          </AnimatePresence>

          {/* Expanded Result Area */}
          <AnimatePresence>
            {searchStatus === 'success' && shipment && viewMode === 'single' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="bg-white dark:bg-slate-900"
              >
                {/* TrackingDashboard (FR-06) */}
                <TrackingDashboard shipment={shipment} />

                <div className="grid grid-cols-1 lg:grid-cols-3">

                    {/* Left: Map Visualization */}
                    <div className="lg:col-span-2">
                      <ShipmentMap shipment={shipment} />
                    </div>

                    {/* Right: ETA + Timeline */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 lg:h-[500px] overflow-y-auto custom-scrollbar" aria-live="polite">

                        {/* ── Header ── */}
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Status Updates</h3>
                            <button
                              onClick={() => setIsSubscribed(!isSubscribed)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                isSubscribed
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                              }`}
                            >
                              <Bell size={14} className={isSubscribed ? "fill-blue-500" : ""} aria-hidden="true" />
                              {isSubscribed ? '알림 설정됨' : '알림 받기'}
                            </button>
                        </div>

                        {/* ── ETACard (FR-01) ── */}
                        {shipment.eta ? (
                          <ETACard eta={shipment.eta} estimatedDelivery={shipment.estimatedDelivery} mode={shipment.mode} />
                        ) : (
                          <div className="mb-4 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-400">ETA: {shipment.estimatedDelivery}</p>
                          </div>
                        )}

                        {/* ── EventTimeline (FR-03) ── */}
                        <EventTimeline
                          categories={milestoneGroups}
                          expandedIds={expandedIds}
                          onToggle={toggleExpand}
                          mode={shipment.mode}
                        />
                    </div>
                </div>

                {/* Bottom Tab Panels (FR-04, FR-08) */}
                <div className="border-t border-slate-100 dark:border-slate-800">
                  {/* Tab Buttons */}
                  <div className="flex gap-0 bg-slate-50 dark:bg-slate-950" role="tablist" aria-label="상세 정보 탭">
                    {(['documents', 'cargo'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 px-4 py-3 text-sm font-bold transition-colors border-b-2 ${
                          activeTab === tab
                            ? 'text-jways-blue border-jways-blue bg-white dark:bg-slate-900'
                            : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                        aria-selected={activeTab === tab}
                        role="tab"
                      >
                        {tab === 'documents' ? '관련 문서' : '화물 상세'}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="p-4 md:p-6" role="tabpanel">
                    <AnimatePresence mode="wait">
                      {activeTab === 'documents' ? (
                        <motion.div key="documents" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                          <ShipmentDocuments documents={shipment.documents ?? []} />
                        </motion.div>
                      ) : (
                        <motion.div key="cargo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                          {shipment.cargoDetails ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3" role="region" aria-label="화물 상세 정보">
                              <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                <Scale size={16} className="text-slate-400 shrink-0" aria-hidden="true" />
                                <div>
                                  <p className="text-xs sm:text-[10px] text-slate-400">중량</p>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">{shipment.cargoDetails.weight}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                <Box size={16} className="text-slate-400 shrink-0" aria-hidden="true" />
                                <div>
                                  <p className="text-xs sm:text-[10px] text-slate-400">부피</p>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">{shipment.cargoDetails.cbm}</p>
                                </div>
                              </div>
                              {shipment.cargoDetails.containerType && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                  <Layers size={16} className="text-slate-400 shrink-0" aria-hidden="true" />
                                  <div>
                                    <p className="text-xs sm:text-[10px] text-slate-400">컨테이너</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{shipment.cargoDetails.containerType}</p>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                <Package size={16} className="text-slate-400 shrink-0" aria-hidden="true" />
                                <div>
                                  <p className="text-xs sm:text-[10px] text-slate-400">포장 수</p>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">{shipment.cargoDetails.packages}건</p>
                                </div>
                              </div>
                              {shipment.cargoDetails.hsCode && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                  <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                    <span className="text-[8px] font-bold text-slate-500">HS</span>
                                  </div>
                                  <div>
                                    <p className="text-xs sm:text-[10px] text-slate-400">HS Code</p>
                                    <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">{shipment.cargoDetails.hsCode}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-sm text-slate-400">
                              화물 상세 정보가 없습니다
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
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
    </section>
  );
};

export default Tracking;
