import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Package, ArrowRight, Truck, CheckCircle2, Clock, X, Loader2 } from 'lucide-react';
import { ShipmentData } from '../types';
import ShipmentMap from './ShipmentMap';

const MOCK_SHIPMENT: ShipmentData = {
  id: 'JW-8839-KR',
  status: 'In Transit',
  estimatedDelivery: 'Oct 24, 2024',
  origin: { city: 'Incheon, KR', code: 'ICN', x: 82, y: 36 }, // Approx coordinates on map
  destination: { city: 'Los Angeles, US', code: 'LAX', x: 18, y: 38 },
  current: { city: 'Pacific Ocean', code: 'SEA', x: 50, y: 32, progress: 0.55 },
  steps: [
    { id: '1', label: 'Shipment Picked Up', date: 'Oct 21', time: '14:30', status: 'completed', location: 'Seoul, KR' },
    { id: '2', label: 'Departed from Facility', date: 'Oct 21', time: '18:45', status: 'completed', location: 'Incheon Terminal 1' },
    { id: '3', label: 'Processed at Facility', date: 'Oct 22', time: '09:15', status: 'completed', location: 'Incheon Int. Airport' },
    { id: '4', label: 'International Departure', date: 'Oct 22', time: '13:00', status: 'current', location: 'Incheon (ICN) -> Los Angeles (LAX)' },
    { id: '5', label: 'Arrived at Destination', date: 'Estimated', time: '--:--', status: 'pending', location: 'Los Angeles Int. Airport' },
  ]
};

const Tracking: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [shipment, setShipment] = useState<ShipmentData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId) return;

    setSearchStatus('loading');
    setErrorMessage('');
    
    // Simulate API Delay
    setTimeout(() => {
      // Mock validation: Only allow specific ID for demo purposes
      if (trackingId.toUpperCase() === 'JW-8839-KR') {
        setShipment(MOCK_SHIPMENT);
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
  };

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
                  placeholder="운송장 번호를 입력하세요 (예: JW-8839-KR)"
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
                    <div className="bg-slate-50 dark:bg-slate-950 p-6 lg:p-8 border-l border-slate-100 dark:border-slate-800 lg:h-[500px] overflow-y-auto custom-scrollbar">
                        <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Status Updates</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tracking ID: <span className="font-mono text-slate-700 dark:text-slate-300">{shipment.id}</span></p>
                        </div>

                        <div className="space-y-0 relative">
                            {/* Timeline Line */}
                            <div className="absolute top-2 bottom-2 left-[19px] w-0.5 bg-slate-200 dark:bg-slate-800" />

                            {shipment.steps.map((step, idx) => (
                                <motion.div 
                                    key={step.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 + 0.5 }}
                                    className="relative flex gap-4 pb-8 last:pb-0"
                                >
                                    {/* Icon */}
                                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-50 dark:border-slate-950 shrink-0 transition-colors ${
                                        step.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                                        step.status === 'current' ? 'bg-jways-blue text-white shadow-lg shadow-blue-500/30' :
                                        'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                                    }`}>
                                        {step.status === 'completed' ? <CheckCircle2 size={18} /> :
                                         step.status === 'current' ? <Truck size={18} /> :
                                         <Clock size={18} />}
                                    </div>

                                    {/* Content */}
                                    <div className="pt-1 flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`font-bold text-sm ${
                                                step.status === 'current' ? 'text-jways-blue' : 'text-slate-900 dark:text-white'
                                            }`}>
                                                {step.label}
                                            </p>
                                            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{step.date}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{step.location}</p>
                                        <p className="text-xs text-slate-400 font-mono">{step.time}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick Stats below tracking (Only visible when not searching to reduce clutter) */}
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