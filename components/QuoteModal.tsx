import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Calculator, CheckCircle2, Box } from 'lucide-react';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const cargoTypes = [
  '일반 화물 (General Cargo)',
  '냉동/냉장 화물 (Cold Chain)',
  '위험물 (Dangerous Goods)',
  '대형 화물 (Project Cargo)',
  '벌크 화물 (Bulk Cargo)',
  '기타 (Other)'
];

const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [calculatedCBM, setCalculatedCBM] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    origin: '',
    destination: '',
    cargoType: cargoTypes[0],
    weight: '',
    length: '',
    width: '',
    height: '',
    targetDate: '',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset state when modal opens and lock body scroll
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        origin: '',
        destination: '',
        cargoType: cargoTypes[0],
        weight: '',
        length: '',
        width: '',
        height: '',
        targetDate: '',
        message: ''
      });
      setErrors({});
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요.';
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.';
    }
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // For dimensions, prevent negative numbers
    if (['length', 'width', 'height', 'weight'].includes(name) && Number(value) < 0) return;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Calculate CBM if dimensions are available
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
    
    // Clear error when user types
    if (errors[name] || (['length', 'width', 'height'].includes(name) && errors.dimensions)) {
       const newErrors = { ...errors };
       delete newErrors[name];
       if (['length', 'width', 'height'].includes(name)) delete newErrors.dimensions;
       setErrors(newErrors);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const handleClose = () => {
    onClose();
    // Reset state after animation
    setTimeout(() => {
      setIsSuccess(false);
      setIsSubmitting(false);
    }, 300);
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
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto"
              role="dialog"
              aria-modal="true"
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

              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
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
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-4 md:space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">이름 (Name)</label>
                          <input 
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            type="text" 
                            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all dark:text-white ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                            placeholder="홍길동" 
                          />
                          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">이메일 (Email)</label>
                          <input 
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            type="email" 
                            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all dark:text-white ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                            placeholder="example@company.com" 
                          />
                          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">출발지 (Origin)</label>
                          <input 
                            name="origin"
                            value={formData.origin}
                            onChange={handleInputChange}
                            type="text" 
                            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all dark:text-white ${errors.origin ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                            placeholder="City, Country" 
                          />
                          {errors.origin && <p className="text-xs text-red-500">{errors.origin}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">도착지 (Destination)</label>
                          <input 
                            name="destination"
                            value={formData.destination}
                            onChange={handleInputChange}
                            type="text" 
                            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all dark:text-white ${errors.destination ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                            placeholder="City, Country" 
                          />
                          {errors.destination && <p className="text-xs text-red-500">{errors.destination}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">화물 종류 (Cargo Type)</label>
                          <div className="relative">
                              <select 
                                name="cargoType"
                                value={formData.cargoType}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all appearance-none cursor-pointer dark:text-white"
                              >
                                {cargoTypes.map((type) => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                              </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">예상 중량 (Weight)</label>
                          <div className="relative">
                            <input 
                                name="weight"
                                value={formData.weight}
                                onChange={handleInputChange}
                                type="number" 
                                min="0"
                                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all dark:text-white ${errors.weight ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                                placeholder="0" 
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">kg</span>
                          </div>
                          {errors.weight && <p className="text-xs text-red-500">{errors.weight}</p>}
                        </div>
                        
                        {/* New Dimensions Fields */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">화물 규격 (Dimensions - cm)</label>
                            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                <div>
                                    <input 
                                        name="length"
                                        value={formData.length}
                                        onChange={handleInputChange}
                                        type="number" 
                                        min="0"
                                        className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all dark:text-white ${errors.dimensions ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                                        placeholder="가로 (L)" 
                                    />
                                </div>
                                <div>
                                    <input 
                                        name="width"
                                        value={formData.width}
                                        onChange={handleInputChange}
                                        type="number" 
                                        min="0"
                                        className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all dark:text-white ${errors.dimensions ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                                        placeholder="세로 (W)" 
                                    />
                                </div>
                                <div>
                                    <input 
                                        name="height"
                                        value={formData.height}
                                        onChange={handleInputChange}
                                        type="number" 
                                        min="0"
                                        className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all dark:text-white ${errors.dimensions ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                                        placeholder="높이 (H)" 
                                    />
                                </div>
                            </div>
                            {errors.dimensions && <p className="text-xs text-red-500 mt-2">{errors.dimensions}</p>}
                            
                            {/* Real-time CBM Preview */}
                            <AnimatePresence mode="popLayout">
                              {calculatedCBM !== null && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0, y: -10 }}
                                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                                  exit={{ opacity: 0, height: 0, y: -10 }}
                                  className="mt-4 overflow-hidden"
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

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">희망 배송일 (Target Date)</label>
                          <input 
                            name="targetDate"
                            value={formData.targetDate}
                            onChange={handleInputChange}
                            type="date" 
                            min={new Date().toISOString().split('T')[0]}
                            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all text-slate-600 dark:text-slate-300 placeholder:text-slate-400 ${errors.targetDate ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                          />
                          {errors.targetDate && <p className="text-xs text-red-500">{errors.targetDate}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">추가 요청사항 (Message)</label>
                        <textarea 
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            rows={4} 
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all resize-none dark:text-white" 
                            placeholder="화물에 대한 상세 정보나 특별 요청사항을 적어주세요." 
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-jways-blue text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuoteModal;