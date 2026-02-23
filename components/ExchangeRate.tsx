import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Euro, Banknote, Clock, ArrowRightLeft } from 'lucide-react';

interface Rate {
  id: string;
  currency: string;
  name: string;
  tts: number; // 전신환 매도율 (Telegraphic Transfer Selling) - 송금 보낼 때
  cashBuy: number; // 현찰 살 때
  trend: 'up' | 'down' | 'flat';
  change: number;
  icon: React.ElementType;
}

const generateMockRates = (): Rate[] => {
  const baseUSD = 1330 + Math.random() * 20;
  return [
    { 
      id: 'USD', 
      currency: 'USD', 
      name: '미국 달러', 
      tts: Number((baseUSD + 13.5).toFixed(2)), 
      cashBuy: Number((baseUSD + 23.0).toFixed(2)), 
      trend: Math.random() > 0.5 ? 'up' : 'down', 
      change: Number((Math.random() * 5).toFixed(2)), 
      icon: DollarSign 
    },
    { 
      id: 'EUR', 
      currency: 'EUR', 
      name: '유로', 
      tts: Number((baseUSD * 1.08 + 14.5).toFixed(2)), 
      cashBuy: Number((baseUSD * 1.08 + 25.0).toFixed(2)), 
      trend: Math.random() > 0.5 ? 'up' : 'down', 
      change: Number((Math.random() * 5).toFixed(2)), 
      icon: Euro 
    },
    { 
      id: 'JPY', 
      currency: 'JPY(100)', 
      name: '일본 엔', 
      tts: Number((baseUSD * 0.67 + 8.5).toFixed(2)), 
      cashBuy: Number((baseUSD * 0.67 + 15.0).toFixed(2)), 
      trend: Math.random() > 0.5 ? 'up' : 'down', 
      change: Number((Math.random() * 3).toFixed(2)), 
      icon: Banknote 
    },
    { 
      id: 'CNY', 
      currency: 'CNY', 
      name: '중국 위안', 
      tts: Number((baseUSD * 0.14 + 2.5).toFixed(2)), 
      cashBuy: Number((baseUSD * 0.14 + 9.0).toFixed(2)), 
      trend: Math.random() > 0.5 ? 'up' : 'down', 
      change: Number((Math.random() * 1).toFixed(2)), 
      icon: Banknote 
    },
  ];
};

const ExchangeRate: React.FC = () => {
  const [rates, setRates] = useState<Rate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = () => {
    setIsLoading(true);
    // Simulate network delay for fetching real-time rates
    setTimeout(() => {
      setRates(generateMockRates());
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 800);
  };

  useEffect(() => {
    fetchRates();
    // Refresh every 5 minutes automatically
    const interval = setInterval(fetchRates, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <ArrowRightLeft size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">실시간 고시 환율</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5" aria-live="polite" aria-atomic="true">
              <Clock size={12} />
              <span>{lastUpdated ? `${formatTime(lastUpdated)} 기준` : '업데이트 중...'}</span>
            </div>
          </div>
        </div>
        <button
          onClick={fetchRates}
          disabled={isLoading}
          aria-label="환율 정보 새로고침"
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          새로고침
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {rates.map((rate, idx) => (
              <motion.div
                key={rate.id}
                role="group"
                aria-label={`${rate.currency} 환율 정보`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-600">
                      <rate.icon size={14} />
                    </div>
                    <div>
                      <span className="block font-bold text-slate-900 dark:text-white leading-tight">{rate.currency}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{rate.name}</span>
                    </div>
                  </div>
                  <div
                    aria-label={`${rate.trend === 'up' ? '상승' : rate.trend === 'down' ? '하락' : '보합'} ${rate.change}`}
                    className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    rate.trend === 'up' ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20' :
                    rate.trend === 'down' ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' :
                    'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800'
                  }`}>
                    {rate.trend === 'up' ? <TrendingUp size={12} /> : rate.trend === 'down' ? <TrendingDown size={12} /> : null}
                    {rate.change}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">송금 보낼때 (TTS)</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                        {rate.tts.toLocaleString('ko-KR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-slate-500">KRW</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">현찰 살때</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums tracking-tight">
                        {rate.cashBuy.toLocaleString('ko-KR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-500">KRW</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="mt-6 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
          <span className="text-jways-blue font-bold">*</span>
          <p>
            위 환율은 참조용 예상 (Mock) 데이터이며, 실제 거래 시 거래 은행 및 관세청 고시환율과 차이가 있을 수 있습니다. <br className="hidden md:block"/>
            수출입 통관 시에는 관세청에서 고시하는 과세환율이 적용됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRate;
