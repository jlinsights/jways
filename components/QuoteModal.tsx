import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Calculator, CheckCircle2 } from 'lucide-react';

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

  // Reset state when modal opens and lock body scroll
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsSubmitting(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

              {/* Content */}
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <CheckCircle2 size={40} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">견적 요청이 완료되었습니다!</h3>
                      <p className="text-slate-600 mb-8 max-w-sm">
                        담당자가 내용을 확인 후 입력하신 이메일로 24시간 이내에 상세 견적서를 보내드립니다.
                      </p>
                      <button
                        onClick={handleClose}
                        className="px-8 py-3 bg-jways-navy text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
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
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">이름 (Name)</label>
                          <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all" placeholder="홍길동" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">이메일 (Email)</label>
                          <input required type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all" placeholder="example@company.com" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">출발지 (Origin)</label>
                          <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all" placeholder="City, Country" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">도착지 (Destination)</label>
                          <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all" placeholder="City, Country" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">화물 종류 (Cargo Type)</label>
                          <div className="relative">
                              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all appearance-none cursor-pointer">
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
                          <label className="text-sm font-bold text-slate-700">예상 중량 (Weight)</label>
                          <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all" placeholder="kg / tons" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">희망 배송일 (Target Date)</label>
                          <input 
                            type="date" 
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all text-slate-600 placeholder:text-slate-400" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">추가 요청사항 (Message)</label>
                        <textarea rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all resize-none" placeholder="화물에 대한 상세 정보나 특별 요청사항을 적어주세요." />
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