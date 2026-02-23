import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Calculator, CheckCircle2, Box, ChevronLeft, ChevronRight, Plane, Ship, Truck, Warehouse, Check } from 'lucide-react';
import { ServiceType, QuoteFormData } from '../types';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedService?: ServiceType;
}

const cargoTypes = [
  '일반 화물 (General Cargo)',
  '냉동/냉장 화물 (Cold Chain)',
  '위험물 (Dangerous Goods)',
  '대형 화물 (Project Cargo)',
  '벌크 화물 (Bulk Cargo)',
  '기타 (Other)'
];

const serviceOptions: { id: ServiceType; label: string; labelEn: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'air', label: '항공 운송', labelEn: 'Air Freight', icon: Plane },
  { id: 'ocean', label: '해상 운송', labelEn: 'Ocean Freight', icon: Ship },
  { id: 'land', label: '육상 운송', labelEn: 'Land Transport', icon: Truck },
  { id: 'warehouse', label: '물류 창고', labelEn: 'Warehouse', icon: Warehouse },
];

const wizardSteps = [
  { label: '연락처', labelEn: 'Contact' },
  { label: '화물정보', labelEn: 'Cargo Info' },
  { label: '검토', labelEn: 'Review' },
];

const initialFormData: QuoteFormData = {
  name: '',
  email: '',
  serviceType: '',
  origin: '',
  destination: '',
  cargoType: cargoTypes[0],
  weight: '',
  length: '',
  width: '',
  height: '',
  targetDate: '',
  message: ''
};

// ─── Step Indicator ───

const StepIndicator: React.FC<{ currentStep: number; onStepClick: (step: number) => void }> = ({ currentStep, onStepClick }) => (
  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700" role="tablist" aria-label="견적 요청 단계">
    <div className="flex items-center justify-center gap-0">
      {wizardSteps.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const isClickable = isCompleted;

        return (
          <React.Fragment key={stepNum}>
            {idx > 0 && (
              <div className="flex-1 max-w-[60px] h-0.5 mx-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-jways-blue"
                  initial={false}
                  animate={{ width: isCompleted || isCurrent ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
              </div>
            )}
            <button
              type="button"
              className={`flex flex-col items-center gap-1 ${isClickable ? 'cursor-pointer' : ''}`}
              role="tab"
              aria-selected={isCurrent}
              aria-label={`${step.label} (${step.labelEn})${isCompleted ? ' - 클릭하여 이동' : ''}`}
              tabIndex={isClickable || isCurrent ? 0 : -1}
              onClick={() => isClickable && onStepClick(stepNum)}
              onKeyDown={(e) => { if (isClickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onStepClick(stepNum); } }}
            >
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-all duration-300 ${
                isCompleted
                  ? 'bg-jways-blue text-white hover:bg-blue-600'
                  : isCurrent
                    ? 'bg-jways-blue text-white ring-4 ring-jways-blue/20 dark:ring-blue-500/20'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
              }`}>
                {isCompleted ? <Check size={14} /> : stepNum}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${
                isCurrent ? 'text-jways-blue dark:text-blue-400' : isCompleted ? 'text-jways-blue/70 dark:text-blue-400/70' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {step.label}
              </span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

// ─── Step Transition Variants ───

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -50 : 50,
    opacity: 0,
  }),
};

// ─── Main Component ───

const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose, preSelectedService }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [calculatedCBM, setCalculatedCBM] = useState<number | null>(null);
  const [formData, setFormData] = useState<QuoteFormData>({ ...initialFormData });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsSubmitting(false);
      setCurrentStep(1);
      setDirection(0);
      setCalculatedCBM(null);
      setErrors({});
      setFormData({
        ...initialFormData,
        serviceType: preSelectedService || '',
      });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, preSelectedService]);

  // Escape key + focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // ─── Validation ───

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요.';
      if (!formData.email.trim()) {
        newErrors.email = '이메일을 입력해주세요.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = '유효한 이메일 주소를 입력해주세요.';
      }
    }

    if (step === 2) {
      if (!formData.origin.trim()) newErrors.origin = '출발지를 입력해주세요.';
      if (!formData.destination.trim()) newErrors.destination = '도착지를 입력해주세요.';
      if (!formData.weight || isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
        newErrors.weight = '유효한 중량을 입력해주세요 (kg).';
      }
      if (!formData.length || isNaN(Number(formData.length)) || Number(formData.length) <= 0) {
        newErrors.dimensions = '유효한 치수를 입력해주세요.';
      }
      if (!formData.width || isNaN(Number(formData.width)) || Number(formData.width) <= 0) {
        newErrors.dimensions = '유효한 치수를 입력해주세요.';
      }
      if (!formData.height || isNaN(Number(formData.height)) || Number(formData.height) <= 0) {
        newErrors.dimensions = '유효한 치수를 입력해주세요.';
      }
      if (!formData.targetDate) {
        newErrors.targetDate = '희망 배송일을 선택해주세요.';
      } else {
        const selectedDate = new Date(formData.targetDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          newErrors.targetDate = '과거 날짜는 선택할 수 없습니다.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Input Handler ───

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (['length', 'width', 'height', 'weight'].includes(name) && Number(value) < 0) return;

    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      if (['length', 'width', 'height'].includes(name)) {
        const l = parseFloat(newData.length) || 0;
        const w = parseFloat(newData.width) || 0;
        const h = parseFloat(newData.height) || 0;
        if (l > 0 && w > 0 && h > 0) {
          setCalculatedCBM(Number(((l * w * h) / 1000000).toFixed(3)));
        } else {
          setCalculatedCBM(null);
        }
      }
      return newData;
    });

    if (errors[name] || (['length', 'width', 'height'].includes(name) && errors.dimensions)) {
      const newErrors = { ...errors };
      delete newErrors[name];
      if (['length', 'width', 'height'].includes(name)) delete newErrors.dimensions;
      setErrors(newErrors);
    }
  };

  // ─── Navigation ───

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setDirection(1);
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  const goToStep = (step: number) => {
    setDirection(step < currentStep ? -1 : 1);
    setCurrentStep(step);
    setErrors({});
  };

  // ─── Submit ───

  const handleSubmit = () => {
    setIsSuccess(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsSuccess(false);
      setIsSubmitting(false);
    }, 300);
  };

  // ─── Input field class helper ───

  const inputClass = (fieldName: string) =>
    `w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all dark:text-white ${
      errors[fieldName] ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
    }`;

  // ─── Service label helper ───

  const getServiceLabel = (id: string) => {
    const s = serviceOptions.find(o => o.id === id);
    return s ? s.label : '';
  };

  const getServiceIcon = (id: string) => {
    const s = serviceOptions.find(o => o.id === id);
    if (!s) return null;
    const Icon = s.icon;
    return <Icon size={16} className="text-jways-blue" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center px-4 pointer-events-none">
            <motion.div
              ref={modalRef}
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-label="견적 요청"
            >
              {/* Header */}
              <div className="bg-jways-navy p-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-jways-accent flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                    <Calculator size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">견적 요청 (Request a Quote)</h2>
                    <p className="text-slate-400 text-xs">빠르고 정확한 운임 견적을 받아보세요.</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Step Indicator (hidden during success) */}
              {!isSuccess && <StepIndicator currentStep={currentStep} onStepClick={goToStep} />}

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    /* ─── Success Screen ─── */
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center justify-center py-12 px-6 text-center"
                    >
                      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <CheckCircle2 size={40} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">견적 요청이 완료되었습니다!</h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-sm">
                        담당자가 내용을 확인 후 입력하신 이메일로 24시간 이내에 상세 견적서를 보내드립니다.
                      </p>
                      <button
                        onClick={handleClose}
                        className="px-8 py-3 bg-jways-navy dark:bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-lg"
                      >
                        확인
                      </button>
                    </motion.div>
                  ) : (
                    /* ─── Wizard Steps ─── */
                    <motion.div
                      key={currentStep}
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="p-6 md:p-8"
                      role="tabpanel"
                      aria-label={wizardSteps[currentStep - 1]?.label}
                    >
                      {/* ─── Step 1: Contact + Service ─── */}
                      {currentStep === 1 && (
                        <div className="space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label htmlFor="quote-name" className="text-sm font-bold text-slate-700 dark:text-slate-300">이름 (Name)</label>
                              <input
                                id="quote-name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                type="text"
                                className={inputClass('name')}
                                placeholder="홍길동"
                                aria-invalid={!!errors.name}
                                aria-describedby={errors.name ? 'error-quote-name' : undefined}
                              />
                              {errors.name && <p id="error-quote-name" role="alert" className="text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="quote-email" className="text-sm font-bold text-slate-700 dark:text-slate-300">이메일 (Email)</label>
                              <input
                                id="quote-email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                type="email"
                                className={inputClass('email')}
                                placeholder="example@company.com"
                                aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? 'error-quote-email' : undefined}
                              />
                              {errors.email && <p id="error-quote-email" role="alert" className="text-xs text-red-500">{errors.email}</p>}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">서비스 종류 (Service Type)</label>
                            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="서비스 종류 선택">
                              {serviceOptions.map(option => {
                                const Icon = option.icon;
                                const selected = formData.serviceType === option.id;
                                return (
                                  <motion.button
                                    key={option.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setFormData(prev => ({ ...prev, serviceType: option.id }))}
                                    className={`relative p-4 rounded-xl border-2 cursor-pointer text-left transition-all duration-200 ${
                                      selected
                                        ? 'border-jways-blue bg-jways-blue/5 dark:bg-jways-blue/10 ring-2 ring-jways-blue/20'
                                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-jways-blue/50'
                                    }`}
                                  >
                                    {selected && (
                                      <div className="absolute top-2 right-2 w-5 h-5 bg-jways-blue rounded-full flex items-center justify-center">
                                        <Check size={12} className="text-white" />
                                      </div>
                                    )}
                                    <Icon size={28} className={`mb-2 ${selected ? 'text-jways-blue' : 'text-slate-400 dark:text-slate-500'}`} />
                                    <div className={`text-sm font-bold ${selected ? 'text-jways-blue dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                      {option.label}
                                    </div>
                                    <div className="text-[11px] text-slate-400 dark:text-slate-500">{option.labelEn}</div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ─── Step 2: Cargo Info ─── */}
                      {currentStep === 2 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label htmlFor="quote-origin" className="text-sm font-bold text-slate-700 dark:text-slate-300">출발지 (Origin)</label>
                              <input
                                id="quote-origin"
                                name="origin"
                                value={formData.origin}
                                onChange={handleInputChange}
                                type="text"
                                className={inputClass('origin')}
                                placeholder="City, Country"
                                aria-invalid={!!errors.origin}
                                aria-describedby={errors.origin ? 'error-quote-origin' : undefined}
                              />
                              {errors.origin && <p id="error-quote-origin" role="alert" className="text-xs text-red-500">{errors.origin}</p>}
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="quote-destination" className="text-sm font-bold text-slate-700 dark:text-slate-300">도착지 (Destination)</label>
                              <input
                                id="quote-destination"
                                name="destination"
                                value={formData.destination}
                                onChange={handleInputChange}
                                type="text"
                                className={inputClass('destination')}
                                placeholder="City, Country"
                                aria-invalid={!!errors.destination}
                                aria-describedby={errors.destination ? 'error-quote-destination' : undefined}
                              />
                              {errors.destination && <p id="error-quote-destination" role="alert" className="text-xs text-red-500">{errors.destination}</p>}
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="quote-cargoType" className="text-sm font-bold text-slate-700 dark:text-slate-300">화물 종류 (Cargo Type)</label>
                              <div className="relative">
                                <select
                                  id="quote-cargoType"
                                  name="cargoType"
                                  value={formData.cargoType}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all appearance-none cursor-pointer dark:text-white"
                                >
                                  {cargoTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="quote-weight" className="text-sm font-bold text-slate-700 dark:text-slate-300">예상 중량 (Weight)</label>
                              <div className="relative">
                                <input
                                  id="quote-weight"
                                  name="weight"
                                  value={formData.weight}
                                  onChange={handleInputChange}
                                  type="number"
                                  min="0"
                                  className={inputClass('weight')}
                                  placeholder="0"
                                  aria-invalid={!!errors.weight}
                                  aria-describedby={errors.weight ? 'error-quote-weight' : undefined}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">kg</span>
                              </div>
                              {errors.weight && <p id="error-quote-weight" role="alert" className="text-xs text-red-500">{errors.weight}</p>}
                            </div>
                          </div>

                          {/* Dimensions */}
                          <div className="space-y-2">
                            <label id="quote-dimensions-label" className="text-sm font-bold text-slate-700 dark:text-slate-300">화물 규격 (Dimensions - cm)</label>
                            <div className="grid grid-cols-3 gap-2 sm:gap-4" role="group" aria-labelledby="quote-dimensions-label" aria-describedby={errors.dimensions ? 'error-quote-dimensions' : undefined}>
                              <input id="quote-length" name="length" value={formData.length} onChange={handleInputChange} type="number" min="0" className={inputClass('dimensions')} placeholder="가로 (L)" aria-label="가로 길이 (Length)" aria-invalid={!!errors.dimensions} />
                              <input id="quote-width" name="width" value={formData.width} onChange={handleInputChange} type="number" min="0" className={inputClass('dimensions')} placeholder="세로 (W)" aria-label="세로 길이 (Width)" aria-invalid={!!errors.dimensions} />
                              <input id="quote-height" name="height" value={formData.height} onChange={handleInputChange} type="number" min="0" className={inputClass('dimensions')} placeholder="높이 (H)" aria-label="높이 (Height)" aria-invalid={!!errors.dimensions} />
                            </div>
                            {errors.dimensions && <p id="error-quote-dimensions" role="alert" className="text-xs text-red-500 mt-1">{errors.dimensions}</p>}

                            {/* CBM Preview */}
                            <AnimatePresence mode="popLayout">
                              {calculatedCBM !== null && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0, y: -10 }}
                                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                                  exit={{ opacity: 0, height: 0, y: -10 }}
                                  className="mt-3 overflow-hidden"
                                >
                                  <div className="bg-gradient-to-br from-jways-blue/10 to-indigo-500/10 dark:from-jways-blue/20 dark:to-indigo-500/20 p-4 md:p-5 rounded-2xl border border-jways-blue/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                      <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-jways-blue dark:text-blue-400 shrink-0 shadow-sm border border-slate-100 dark:border-slate-700">
                                        <Box size={24} />
                                      </div>
                                      <div className="text-left">
                                        <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-0.5">예상 부피 (1단위 기준)</span>
                                        <div className="flex items-baseline gap-1.5">
                                          <span className="text-2xl md:text-3xl font-bold text-jways-navy dark:text-white tabular-nums tracking-tight">
                                            {calculatedCBM}
                                          </span>
                                          <span className="text-sm font-semibold text-jways-blue dark:text-blue-400">CBM</span>
                                        </div>
                                      </div>
                                    </div>

                                    {Number(formData.weight) > 0 && (
                                      <div className="w-full sm:w-auto bg-white/70 dark:bg-slate-900/70 rounded-xl p-3 flex flex-row gap-4 sm:gap-6 justify-center sm:justify-end border border-white/50 dark:border-slate-800 backdrop-blur-sm">
                                        <div className="text-center sm:text-right">
                                          <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1">항공 운임중량</span>
                                          <span className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                                            {Math.max(Number(formData.weight), calculatedCBM * 167).toFixed(1)} kg
                                          </span>
                                        </div>
                                        <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
                                        <div className="text-center sm:text-right">
                                          <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1">해상 운임톤</span>
                                          <span className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                                            {Math.max(calculatedCBM, Number(formData.weight) / 1000).toFixed(3)} RT
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Target Date */}
                          <div className="space-y-2">
                            <label htmlFor="quote-targetDate" className="text-sm font-bold text-slate-700 dark:text-slate-300">희망 배송일 (Target Date)</label>
                            <input
                              id="quote-targetDate"
                              name="targetDate"
                              value={formData.targetDate}
                              onChange={handleInputChange}
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              className={`${inputClass('targetDate')} text-slate-600 dark:text-slate-300`}
                              aria-invalid={!!errors.targetDate}
                              aria-describedby={errors.targetDate ? 'error-quote-targetDate' : undefined}
                            />
                            {errors.targetDate && <p id="error-quote-targetDate" role="alert" className="text-xs text-red-500">{errors.targetDate}</p>}
                          </div>
                        </div>
                      )}

                      {/* ─── Step 3: Review + Submit ─── */}
                      {currentStep === 3 && (
                        <div className="space-y-5">
                          {/* Summary Card */}
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[40vh] overflow-y-auto">
                            {/* Contact Section */}
                            <div className="px-5 py-3 bg-slate-100 dark:bg-slate-800 flex justify-between items-center">
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">연락처 정보</span>
                              <button
                                type="button"
                                onClick={() => goToStep(1)}
                                className="text-jways-blue text-sm font-medium hover:underline"
                                aria-label="연락처 정보 편집"
                              >
                                편집
                              </button>
                            </div>
                            <div className="px-5 py-3 space-y-1.5">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">이름</span>
                                <span className="text-slate-800 dark:text-slate-200 font-medium">{formData.name}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">이메일</span>
                                <span className="text-slate-800 dark:text-slate-200 font-medium">{formData.email}</span>
                              </div>
                              <div className="flex justify-between text-sm items-center">
                                <span className="text-slate-500 dark:text-slate-400">서비스</span>
                                <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                                  {formData.serviceType ? (
                                    <>
                                      {getServiceIcon(formData.serviceType)}
                                      {getServiceLabel(formData.serviceType)}
                                    </>
                                  ) : (
                                    <span className="text-slate-400">미선택</span>
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Cargo Section */}
                            <div className="px-5 py-3 bg-slate-100 dark:bg-slate-800 flex justify-between items-center border-t border-slate-200 dark:border-slate-700">
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">화물 정보</span>
                              <button
                                type="button"
                                onClick={() => goToStep(2)}
                                className="text-jways-blue text-sm font-medium hover:underline"
                                aria-label="화물 정보 편집"
                              >
                                편집
                              </button>
                            </div>
                            <div className="px-5 py-3 space-y-1.5">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">구간</span>
                                <span className="text-slate-800 dark:text-slate-200 font-medium">{formData.origin} → {formData.destination}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">화물</span>
                                <span className="text-slate-800 dark:text-slate-200 font-medium">{formData.cargoType.split(' (')[0]} / {formData.weight} kg</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">규격</span>
                                <span className="text-slate-800 dark:text-slate-200 font-medium">{formData.length} × {formData.width} × {formData.height} cm</span>
                              </div>
                              {calculatedCBM !== null && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-500 dark:text-slate-400">CBM</span>
                                  <span className="font-bold text-jways-blue">{calculatedCBM} CBM</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">배송일</span>
                                <span className="text-slate-800 dark:text-slate-200 font-medium">{formData.targetDate}</span>
                              </div>
                            </div>
                          </div>

                          {/* Message */}
                          <div className="space-y-2">
                            <label htmlFor="quote-message" className="text-sm font-bold text-slate-700 dark:text-slate-300">추가 요청사항 (Message)</label>
                            <textarea
                              id="quote-message"
                              name="message"
                              value={formData.message}
                              onChange={handleInputChange}
                              rows={4}
                              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all resize-none dark:text-white"
                              placeholder="화물에 대한 상세 정보나 특별 요청사항을 적어주세요."
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Footer (hidden during success) */}
              {!isSuccess && (
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium flex items-center gap-2 transition-colors"
                      aria-label="이전 단계로 이동"
                    >
                      <ChevronLeft size={18} />
                      이전
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 3 ? (
                    <motion.button
                      type="button"
                      onClick={handleNext}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-jways-blue text-white rounded-xl font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-colors"
                      aria-label="다음 단계로 이동"
                    >
                      다음
                      <ChevronRight size={18} />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                      whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                      className="px-8 py-3 bg-jways-blue text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          처리중...
                        </>
                      ) : (
                        <>
                          견적 요청 보내기
                          <Send size={18} />
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuoteModal;
