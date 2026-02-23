import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ArrowRight, Plane, Ship, Globe, MapPin, ArrowLeftRight, X, Clock, Trash2, RotateCcw, Share2, Leaf, DollarSign, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchPorts, calculateQuote, formatUSD, getQuoteHistory, saveQuoteHistory, removeQuoteHistoryItem, clearQuoteHistory, relativeTime, MAJOR_PORTS } from '../lib/tariff';
import QuoteModal from '../components/QuoteModal';
import type { PortInfo, Incoterms, ContainerType, TariffResult, QuoteComparisonResult, QuoteHistoryItem, InstantQuoteFormData, ServiceType, QuoteFormData } from '../types';

// ─── Port Search Input ───

interface PortSearchInputProps {
  id: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  selectedPort: PortInfo | null;
  onInputChange: (value: string) => void;
  onPortSelect: (port: PortInfo) => void;
  modeFilter?: 'sea' | 'air' | 'both';
  error?: string;
}

const PortSearchInput: React.FC<PortSearchInputProps> = ({
  id, label, placeholder, icon, value, selectedPort, onInputChange, onPortSelect, modeFilter, error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<PortInfo[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (value.length >= 1 && !selectedPort) {
      setResults(searchPorts(value, modeFilter));
      setIsOpen(true);
      setActiveIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [value, modeFilter, selectedPort]);

  const handleSelect = (port: PortInfo) => {
    onPortSelect(port);
    onInputChange(`${port.name} (${port.nameEn})`);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const listboxId = `${id}-listbox`;

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">{icon}</span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-owns={listboxId}
          aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
          aria-autocomplete="list"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onInputChange(e.target.value);
            onPortSelect(null as unknown as PortInfo);
          }}
          onFocus={() => { if (results.length > 0 && !selectedPort) setIsOpen(true); }}
          onBlur={() => { setTimeout(() => setIsOpen(false), 200); }}
          onKeyDown={handleKeyDown}
          className={`w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 transition-all font-medium text-slate-900 dark:text-white ${
            error ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'
          }`}
        />
      </div>
      {error && <p id={`${id}-error`} role="alert" className="text-xs text-red-500 mt-1">{error}</p>}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-auto"
          >
            {results.map((port, idx) => (
              <li
                key={port.code}
                id={`${id}-option-${idx}`}
                role="option"
                aria-selected={activeIndex === idx}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer text-sm transition-colors ${
                  activeIndex === idx
                    ? 'bg-jways-blue/10 text-jways-blue'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
                onMouseDown={() => handleSelect(port)}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <div>
                  <span className="font-mono text-xs text-slate-400 mr-2">{port.code}</span>
                  <span className="font-medium">{port.name}</span>
                  <span className="text-slate-400 ml-1">({port.nameEn})</span>
                </div>
                <span aria-hidden="true">{port.type === 'air' ? '✈️' : port.type === 'sea' ? '🚢' : '🚢✈️'}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Cost Breakdown Card ───

const CostBreakdown: React.FC<{ result: TariffResult; incoterms: Incoterms }> = ({ result, incoterms }) => {
  const { breakdown } = result;
  const items: { label: string; labelEn: string; value: number }[] = [
    { label: '기본운임', labelEn: 'Base Freight', value: breakdown.baseFreight },
    { label: result.mode === 'air' ? '유류할증료 (FSC)' : '유류할증료 (BAF)', labelEn: result.mode === 'air' ? 'FSC' : 'BAF', value: breakdown.baf },
    { label: '터미널비', labelEn: 'THC', value: breakdown.thc },
    { label: '서류비', labelEn: 'Doc Fee', value: breakdown.docFee },
  ];
  if (breakdown.insurance != null) items.push({ label: '보험료', labelEn: 'Insurance', value: breakdown.insurance });
  if (breakdown.customs != null) items.push({ label: '관세', labelEn: 'Customs', value: breakdown.customs });
  if (breakdown.inland != null) items.push({ label: '내륙운송', labelEn: 'Inland', value: breakdown.inland });

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">비용 상세 내역 ({incoterms} 기준)</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.labelEn} className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
            <span className="font-medium text-slate-900 dark:text-white">{formatUSD(item.value)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-100 dark:border-slate-700">
          <span className="text-slate-900 dark:text-white">합계</span>
          <span className="text-jways-blue">{formatUSD(result.totalPrice)}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Comparison Card ───

const ComparisonCard: React.FC<{
  result: TariffResult;
  recommended: 'sea' | 'air' | null;
  incoterms: Incoterms;
  onRequestQuote: (mode: 'sea' | 'air') => void;
}> = ({ result, recommended, incoterms, onRequestQuote }) => {
  const isSea = result.mode === 'sea';
  const badges: { label: string; color: string }[] = [];

  if (recommended === result.mode) {
    badges.push({ label: '최저가', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' });
  }
  if (!isSea) {
    badges.push({ label: '최단시간', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' });
  }
  if (isSea) {
    badges.push({ label: '친환경', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm"
      role="region"
      aria-label={isSea ? '해상 운송 견적' : '항공 운송 견적'}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSea ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
            {isSea ? <Ship size={20} /> : <Plane size={20} />}
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">{isSea ? '해상 운송' : '항공 운송'}</h3>
        </div>
        <div className="flex gap-1.5">
          {badges.map((b) => (
            <span key={b.label} className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.color}`}>{b.label}</span>
          ))}
        </div>
      </div>

      <div className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{formatUSD(result.totalPrice)}</div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Clock size={14} />
          <span>{result.transitDays}일</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400">
          <Leaf size={14} />
          <span>{result.co2Kg} kg CO2</span>
        </div>
      </div>

      <CostBreakdown result={result} incoterms={incoterms} />

      <button
        onClick={() => onRequestQuote(result.mode)}
        className="mt-4 w-full py-3 bg-jways-blue text-white rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
      >
        정식 견적 의뢰 <ChevronRight size={16} />
      </button>
    </motion.div>
  );
};

// ─── Main Component ───

const InstantQuote: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Form state
  const [formData, setFormData] = useState<InstantQuoteFormData>({
    origin: '', destination: '', weight: '', cbm: '',
    mode: 'both', incoterms: 'FOB', containerType: '20ft',
  });
  const [originPort, setOriginPort] = useState<PortInfo | null>(null);
  const [destPort, setDestPort] = useState<PortInfo | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Result state
  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [quoteResult, setQuoteResult] = useState<QuoteComparisonResult | null>(null);

  // History
  const [history, setHistory] = useState<QuoteHistoryItem[]>([]);

  // QuoteModal
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteModalService, setQuoteModalService] = useState<ServiceType | undefined>();
  const [quoteModalPrefill, setQuoteModalPrefill] = useState<Partial<QuoteFormData> | undefined>();

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    setHistory(getQuoteHistory());
  }, []);

  // Parse URL params on mount
  useEffect(() => {
    const o = searchParams.get('o');
    const d = searchParams.get('d');
    if (!o || !d) return;

    const op = MAJOR_PORTS.find((p) => p.code === o);
    const dp = MAJOR_PORTS.find((p) => p.code === d);
    if (!op || !dp) return;

    setOriginPort(op);
    setDestPort(dp);
    setFormData((prev) => ({
      ...prev,
      origin: `${op.name} (${op.nameEn})`,
      destination: `${dp.name} (${dp.nameEn})`,
      weight: searchParams.get('w') || prev.weight,
      cbm: searchParams.get('v') || prev.cbm,
      mode: (searchParams.get('m') as 'sea' | 'air' | 'both') || prev.mode,
      incoterms: (searchParams.get('i') as Incoterms) || prev.incoterms,
      containerType: (searchParams.get('c') as ContainerType) || prev.containerType,
    }));

    // Auto-calculate after a short delay
    setTimeout(() => {
      const w = Number(searchParams.get('w'));
      const v = Number(searchParams.get('v'));
      if (w > 0 || v > 0) {
        doCalculate(op, dp, searchParams.get('w') || '0', searchParams.get('v') || '0',
          (searchParams.get('i') as Incoterms) || 'FOB',
          (searchParams.get('c') as ContainerType) || '20ft');
      }
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!originPort) errs.origin = '출발지를 선택해 주세요.';
    if (!destPort) errs.destination = '도착지를 선택해 주세요.';
    const w = Number(formData.weight);
    const v = Number(formData.cbm);
    if (!w && !v) errs.weight = '중량 또는 부피를 입력해 주세요.';
    if (w < 0) errs.weight = '유효한 중량을 입력해 주세요.';
    if (v < 0) errs.cbm = '유효한 부피를 입력해 주세요.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const doCalculate = useCallback((
    op: PortInfo, dp: PortInfo, weight: string, cbm: string,
    incoterms: Incoterms, containerType: ContainerType
  ) => {
    setIsCalculating(true);
    setTimeout(() => {
      const result = calculateQuote({
        origin: op,
        destination: dp,
        weightKg: Number(weight) || 0,
        cbm: Number(cbm) || 0,
        incoterms,
        containerType,
      });
      setQuoteResult(result);
      setIsCalculating(false);
      setStep(2);

      // Save to history
      const historyItem: QuoteHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        origin: op,
        destination: dp,
        weight: Number(weight) || 0,
        cbm: Number(cbm) || 0,
        incoterms,
        containerType,
        result,
      };
      saveQuoteHistory(historyItem);
      setHistory(getQuoteHistory());
    }, 800);
  }, []);

  const handleCalculate = () => {
    if (!validate() || !originPort || !destPort) return;
    doCalculate(originPort, destPort, formData.weight, formData.cbm, formData.incoterms, formData.containerType);
  };

  const handleRequery = (item: QuoteHistoryItem) => {
    setOriginPort(item.origin);
    setDestPort(item.destination);
    setFormData({
      origin: `${item.origin.name} (${item.origin.nameEn})`,
      destination: `${item.destination.name} (${item.destination.nameEn})`,
      weight: String(item.weight),
      cbm: String(item.cbm),
      mode: 'both',
      incoterms: item.incoterms,
      containerType: item.containerType || '20ft',
    });
    setErrors({});
    doCalculate(item.origin, item.destination, String(item.weight), String(item.cbm), item.incoterms, item.containerType || '20ft');
  };

  const handleDeleteHistory = (id: string) => {
    removeQuoteHistoryItem(id);
    setHistory(getQuoteHistory());
  };

  const handleClearHistory = () => {
    if (!confirm('전체 조회 이력을 삭제하시겠습니까?')) return;
    clearQuoteHistory();
    setHistory([]);
  };

  const handleRequestQuote = (mode: 'sea' | 'air') => {
    setQuoteModalService(mode === 'sea' ? 'ocean' : 'air');
    setQuoteModalPrefill({
      serviceType: mode === 'sea' ? 'ocean' : 'air',
      origin: originPort?.nameEn || formData.origin,
      destination: destPort?.nameEn || formData.destination,
      weight: formData.weight,
    });
    setQuoteModalOpen(true);
  };

  const handleShareLink = () => {
    if (!originPort || !destPort) return;
    const params = new URLSearchParams({
      o: originPort.code,
      d: destPort.code,
      w: formData.weight || '0',
      v: formData.cbm || '0',
      m: formData.mode,
      i: formData.incoterms,
      c: formData.containerType,
    });
    const url = `${window.location.origin}/instant-quote?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      setToast('견적 링크가 클립보드에 복사되었습니다.');
      setTimeout(() => setToast(null), 3000);
    });
  };

  const handleReset = () => {
    setStep(1);
    setQuoteResult(null);
    setErrors({});
  };

  const modeOptions: { value: 'sea' | 'air' | 'both'; label: string; icon: React.ReactNode }[] = [
    { value: 'sea', label: '해상 운송', icon: <Ship size={18} /> },
    { value: 'air', label: '항공 운송', icon: <Plane size={18} /> },
    { value: 'both', label: '동시 비교', icon: <ArrowLeftRight size={18} /> },
  ];

  const containerOptions: { value: ContainerType; label: string }[] = [
    { value: '20ft', label: '20ft Standard' },
    { value: '40ft', label: '40ft Standard' },
    { value: '40ft-hc', label: '40ft High Cube' },
  ];

  const incotermsOptions: { value: Incoterms; label: string; desc: string }[] = [
    { value: 'EXW', label: 'EXW', desc: 'Ex Works' },
    { value: 'FOB', label: 'FOB', desc: 'Free On Board' },
    { value: 'CIF', label: 'CIF', desc: 'Cost+Ins+Frt' },
    { value: 'DDP', label: 'DDP', desc: 'Delivered Paid' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-24 pb-12">
      <div className="max-w-5xl mx-auto w-full px-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center text-sm font-bold text-jways-blue hover:underline mb-6">
            ← 홈으로 돌아가기
          </Link>
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Calculator size={32} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
            빠른 운임 조회
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            1분 만에 예상 운임과 스케줄을 확인해보세요. 출발지와 도착지만 입력하면 해상/항공 비교까지 한눈에.
          </p>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Form Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 md:p-12" aria-busy={isCalculating}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Origin / Destination */}
                  <div className="space-y-6">
                    <PortSearchInput
                      id="origin"
                      label="출발지 (Origin)"
                      placeholder="항구 또는 도시 (예: 부산, Busan)"
                      icon={<Globe size={18} />}
                      value={formData.origin}
                      selectedPort={originPort}
                      onInputChange={(v) => setFormData({ ...formData, origin: v })}
                      onPortSelect={setOriginPort}
                      modeFilter={formData.mode === 'both' ? undefined : formData.mode}
                      error={errors.origin}
                    />
                    <PortSearchInput
                      id="destination"
                      label="도착지 (Destination)"
                      placeholder="항구 또는 도시 (예: LA, Los Angeles)"
                      icon={<MapPin size={18} />}
                      value={formData.destination}
                      selectedPort={destPort}
                      onInputChange={(v) => setFormData({ ...formData, destination: v })}
                      onPortSelect={setDestPort}
                      modeFilter={formData.mode === 'both' ? undefined : formData.mode}
                      error={errors.destination}
                    />
                  </div>

                  {/* Mode, Weight, CBM, Container, Incoterms */}
                  <div className="space-y-6">
                    {/* Mode Selector */}
                    <div>
                      <span className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2" id="mode-label">운송 수단</span>
                      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="mode-label">
                        {modeOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            role="radio"
                            aria-checked={formData.mode === opt.value}
                            onClick={() => setFormData({ ...formData, mode: opt.value })}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm ${
                              formData.mode === opt.value
                                ? 'border-jways-blue bg-jways-blue/5 text-jways-blue dark:bg-jways-blue/10'
                                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            {opt.icon}
                            <span className="hidden sm:inline">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Weight & CBM */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="weight" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">총 중량</label>
                        <div className="relative">
                          <input
                            id="weight"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            aria-invalid={!!errors.weight}
                            aria-describedby={errors.weight ? 'weight-error' : undefined}
                            className={`w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 transition-all font-medium text-slate-900 dark:text-white ${
                              errors.weight ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
                            }`}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold" aria-hidden="true">kg</span>
                        </div>
                        {errors.weight && <p id="weight-error" role="alert" className="text-xs text-red-500 mt-1">{errors.weight}</p>}
                      </div>
                      <div>
                        <label htmlFor="cbm" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">총 부피</label>
                        <div className="relative">
                          <input
                            id="cbm"
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0.0"
                            value={formData.cbm}
                            onChange={(e) => setFormData({ ...formData, cbm: e.target.value })}
                            aria-invalid={!!errors.cbm}
                            aria-describedby={errors.cbm ? 'cbm-error' : undefined}
                            className={`w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 transition-all font-medium text-slate-900 dark:text-white ${
                              errors.cbm ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
                            }`}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold" aria-hidden="true">CBM</span>
                        </div>
                        {errors.cbm && <p id="cbm-error" role="alert" className="text-xs text-red-500 mt-1">{errors.cbm}</p>}
                      </div>
                    </div>

                    {/* Container Type (sea only) */}
                    {formData.mode !== 'air' && (
                      <div>
                        <label htmlFor="container" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">컨테이너 타입</label>
                        <select
                          id="container"
                          value={formData.containerType}
                          onChange={(e) => setFormData({ ...formData, containerType: e.target.value as ContainerType })}
                          className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 transition-all font-medium text-slate-900 dark:text-white appearance-none cursor-pointer"
                        >
                          {containerOptions.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Incoterms */}
                    <div>
                      <label htmlFor="incoterms" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Incoterms</label>
                      <select
                        id="incoterms"
                        value={formData.incoterms}
                        onChange={(e) => setFormData({ ...formData, incoterms: e.target.value as Incoterms })}
                        className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 transition-all font-medium text-slate-900 dark:text-white appearance-none cursor-pointer"
                      >
                        {incotermsOptions.map((i) => (
                          <option key={i.value} value={i.value}>{i.label} - {i.desc}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="w-full py-5 bg-jways-navy hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculating ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" role="status" aria-label="계산 중" />
                  ) : (
                    <>예상 운임 확인하기 <ArrowRight size={20} /></>
                  )}
                </button>

                {/* Disclaimer */}
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-4">
                  * 본 견적은 참조용이며, 정확한 확정 운임은 세부 조건에 따라 달라질 수 있습니다.
                </p>
              </div>

              {/* Quote History */}
              {history.length > 0 && (
                <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock size={18} className="text-slate-400" />
                      최근 조회 이력
                    </h2>
                    <button
                      onClick={handleClearHistory}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={12} /> 전체 삭제
                    </button>
                  </div>
                  <ul role="list" className="space-y-3">
                    {history.map((item) => (
                      <li key={item.id} role="listitem" className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 dark:text-white truncate">
                            {item.origin.nameEn} → {item.destination.nameEn}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {item.incoterms} · {item.containerType || '-'} · {item.weight}kg · {item.cbm}CBM · {relativeTime(item.timestamp)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4 shrink-0">
                          <span className="text-sm font-bold text-jways-blue">
                            {item.result.sea ? formatUSD(item.result.sea.totalPrice) : '-'}
                            {item.result.sea && item.result.air ? ' / ' : ''}
                            {item.result.air ? formatUSD(item.result.air.totalPrice) : '-'}
                          </span>
                          <button
                            onClick={() => handleRequery(item)}
                            className="text-slate-400 hover:text-jways-blue transition-colors"
                            aria-label={`${item.origin.nameEn} → ${item.destination.nameEn} 재조회`}
                          >
                            <RotateCcw size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteHistory(item.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            aria-label={`${item.origin.nameEn} → ${item.destination.nameEn} 삭제`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Result Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">예상 견적이 산출되었습니다!</h2>
                <p className="text-slate-500 dark:text-slate-400">
                  {originPort?.nameEn} → {destPort?.nameEn} · {formData.incoterms} · {formData.weight}kg · {formData.cbm}CBM
                </p>
                {quoteResult?.recommendReason && (
                  <p className="text-sm text-jways-blue font-medium mt-2">{quoteResult.recommendReason}</p>
                )}
              </div>

              {/* Comparison View */}
              <div className={`grid gap-6 mb-8 ${
                quoteResult?.sea && quoteResult?.air ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-lg mx-auto'
              }`}>
                {quoteResult?.sea && (
                  <ComparisonCard
                    result={quoteResult.sea}
                    recommended={quoteResult.recommended}
                    incoterms={formData.incoterms}
                    onRequestQuote={handleRequestQuote}
                  />
                )}
                {quoteResult?.air && (
                  <ComparisonCard
                    result={quoteResult.air}
                    recommended={quoteResult.recommended}
                    incoterms={formData.incoterms}
                    onRequestQuote={handleRequestQuote}
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <button
                  onClick={handleReset}
                  className="flex-1 py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  다시 조회
                </button>
                <button
                  onClick={handleShareLink}
                  className="flex-1 py-4 border-2 border-jways-blue text-jways-blue rounded-2xl font-bold hover:bg-jways-blue/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 size={16} /> 결과 공유 링크 복사
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* QuoteModal */}
      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        preSelectedService={quoteModalService}
        prefillData={quoteModalPrefill}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50"
            role="status"
            aria-live="polite"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstantQuote;
