import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ArrowRight, Plane, Ship, CheckCircle2, ChevronRight, Globe, TrendingUp, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const InstantQuote: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    weight: '',
    cbm: '',
    mode: 'sea',
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [quoteResult, setQuoteResult] = useState<{ price: number; transitTime: string; co2: number } | null>(null);

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      // Mock Tariff Engine Logic
      const basePrice = formData.mode === 'air' ? 500 : 150;
      const weightMultiplier = Math.max(1, Number(formData.weight) || 1);
      const cbmMultiplier = Math.max(1, Number(formData.cbm) || 1);
      
      const calculatedPrice = basePrice + (weightMultiplier * (formData.mode === 'air' ? 5.5 : 0.8)) + (cbmMultiplier * (formData.mode === 'sea' ? 45 : 10));
      const transitTime = formData.mode === 'air' ? '3-5 Days' : '25-35 Days';
      const co2 = formData.mode === 'air' ? weightMultiplier * 2.5 : weightMultiplier * 0.4; // rough mock

      setQuoteResult({
        price: Math.round(calculatedPrice),
        transitTime,
        co2: Math.round(co2)
      });
      setIsCalculating(false);
      setStep(2);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-24 pb-12">
      <div className="max-w-4xl mx-auto w-full px-6 flex-1 flex flex-col">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center text-sm font-bold text-jways-blue hover:underline mb-6">
            ← 홈으로 돌아가기
          </Link>
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mb-4">
            <Calculator size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
            빠른 운임 조회 (Instant Quote)
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            1분 만에 예상 운임과 스케줄을 확인해보세요. 복잡한 절차 없이 출발지와 도착지만 입력하면 준비 완료입니다.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Origin & Destination */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">출발지 (Origin)</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          placeholder="Port or City (e.g., Busan, KR)"
                          value={formData.origin}
                          onChange={e => setFormData({...formData, origin: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 transition-all font-medium text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">도착지 (Destination)</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          placeholder="Port or City (e.g., Los Angeles, US)"
                          value={formData.destination}
                          onChange={e => setFormData({...formData, destination: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 transition-all font-medium text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mode & Details */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">운송 수단</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setFormData({...formData, mode: 'sea'})}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold ${
                            formData.mode === 'sea' 
                              ? 'border-jways-blue bg-jways-blue/5 text-jways-blue' 
                              : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          <Ship size={20} />
                          해상 운송
                        </button>
                        <button 
                          onClick={() => setFormData({...formData, mode: 'air'})}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold ${
                            formData.mode === 'air' 
                              ? 'border-jways-blue bg-jways-blue/5 text-jways-blue' 
                              : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          <Plane size={20} />
                          항공 운송
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">총 중량 (Weight)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            placeholder="0"
                            value={formData.weight}
                            onChange={e => setFormData({...formData, weight: e.target.value})}
                            className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 transition-all font-medium text-slate-900 dark:text-white"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">kg</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">총 부피 (Volume)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            placeholder="0.0"
                            value={formData.cbm}
                            onChange={e => setFormData({...formData, cbm: e.target.value})}
                            className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 transition-all font-medium text-slate-900 dark:text-white"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">CBM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={handleCalculate}
                    disabled={isCalculating || !formData.origin || !formData.destination}
                    className="w-full py-5 bg-jways-navy hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCalculating ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>예상 운임 확인하기 <ArrowRight size={20} /></>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-8 md:p-12 flex-1 flex flex-col justify-center items-center text-center bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-900 dark:to-indigo-900/10"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">예상 견적이 산출되었습니다!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md">해당 견적은 참조용이며, 정확한 확정 운임은 세부 조건에 따라 달라질 수 있습니다.</p>

                <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">예상 총 운임</p>
                    <div className="text-4xl font-bold text-jways-blue">${quoteResult?.price.toLocaleString()}</div>
                    <p className="text-xs text-slate-400 mt-2">유류 할증료(FSC) 및 기본 화물료 포함</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                      <div className="text-sm font-bold text-slate-500 flex items-center gap-2"><TrendingUp size={16}/> 예상 소요 시간</div>
                      <div className="font-bold text-slate-900 dark:text-white">{quoteResult?.transitTime}</div>
                    </div>
                    
                    <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-2xl border border-teal-100 dark:border-teal-800 shadow-sm flex items-center justify-between">
                      <div className="text-sm font-bold text-teal-700 dark:text-teal-400 flex items-center gap-2">예상 탄소 배출</div>
                      <div className="font-bold text-teal-900 dark:text-teal-300">{quoteResult?.co2} kg CO2e</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 w-full max-w-md">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    다시 조회
                  </button>
                  <button className="flex-1 py-4 bg-jways-blue text-white rounded-2xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                    정식 견적 의뢰 <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default InstantQuote;
