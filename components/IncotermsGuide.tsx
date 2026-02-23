import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, FileText, ChevronRight, Check, X } from 'lucide-react';

const steps = [
  { id: 'packaging', name: '수출지 포장', short: '포장' },
  { id: 'export_customs', name: '수출 통관', short: '수출통관' },
  { id: 'origin_inland', name: '수출지 내륙운송', short: '내륙운송' },
  { id: 'origin_port', name: '수출항 하역/선적', short: '수출항선적' },
  { id: 'main_carriage', name: '주 운송 (해상/항공)', short: '주운송' },
  { id: 'insurance', name: '적하 보험', short: '적하보험' },
  { id: 'dest_port', name: '수입항 하역', short: '수입항하역' },
  { id: 'import_customs', name: '수입 통관 및 관세', short: '수입통관' },
  { id: 'dest_inland', name: '수입지 내륙운송', short: '내륙운송' },
];

const incotermsList = [
  { 
    code: 'EXW', 
    name: 'Ex Works (공장인도조건)', 
    desc: '매도인(수출자)은 자신의 영업소에서 화물을 매수인(수입자)의 처분에 맡길 때 위험과 비용이 이전됩니다. 수입자가 거의 모든 책임을 집니다.',
    sellerSteps: 1 // Only packaging
  },
  { 
    code: 'FOB', 
    name: 'Free On Board (본선적재인도조건)', 
    desc: '매도인이 지정된 본선(배)에 화물을 적재할 때까지의 위험과 비용을 부담합니다. 해상 운송에만 사용됩니다.',
    sellerSteps: 4 // Up to origin port
  },
  { 
    code: 'CIF', 
    name: 'Cost, Insurance and Freight (운임보험료포함조건)', 
    desc: 'FOB 조건에 더해 도착항까지의 주 운송비와 적하보험료를 매도인이 부담합니다. 해상/내수로에만 사용됩니다.',
    sellerSteps: 6 // Up to Insurance
  },
  { 
    code: 'DAP', 
    name: 'Delivered At Place (도착장소인도조건)', 
    desc: '도착지의 지정된 장소에서 양하 준비가 된 상태로 인도합니다. 수입통관은 수입자가 담당합니다.',
    sellerSteps: 7 // Unloading at dest port or inland, but not import customs (we'll visualize this specially)
  },
  { 
    code: 'DDP', 
    name: 'Delivered Duty Paid (관세지급인도조건)', 
    desc: '매도인이 수입 통관 및 관부가세 납부까지 포함하여 도착지까지 모든 위험과 비용을 부담합니다. 수출자가 거의 모든 책임을 집니다.',
    sellerSteps: 9 // Everything
  },
];

// DAP exception matrix for visual simplicity
const dapMatrix = [true, true, true, true, true, false, true, false, true]; // No insurance, No import customs

const IncotermsGuide: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState(incotermsList[1].code);

  const currentTermInfo = incotermsList.find(t => t.code === selectedTerm);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-jways-blue/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-jways-blue/20 text-blue-300 flex items-center justify-center backdrop-blur-sm border border-white/10">
                <FileText size={16} />
              </span>
              <span className="text-sm font-semibold tracking-wider text-blue-200">INCOTERMS 2020</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2">무역 조건 가이드</h3>
            <p className="text-slate-400 max-w-xl text-sm md:text-base">
              수출자와 수입자 간의 비용 및 위험 분기점을 쉽게 이해할 수 있습니다. 가장 많이 사용되는 5가지 주요 조건을 확인해 보세요.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 md:justify-end">
            {incotermsList.map((term) => (
              <button
                key={term.code}
                onClick={() => setSelectedTerm(term.code)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                  selectedTerm === term.code 
                  ? 'bg-jways-blue border-jways-blue text-white shadow-lg shadow-blue-500/30 -translate-y-0.5' 
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {term.code}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 flex-1 bg-slate-50 dark:bg-slate-950">
        <AnimatePresence mode="wait">
          {currentTermInfo && (
            <motion.div
              key={currentTermInfo.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-jways-blue/10 dark:bg-jways-blue/20 text-jways-blue flex items-center justify-center shrink-0 border border-jways-blue/20">
                    <Info size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      {currentTermInfo.code} <span className="text-base font-medium text-slate-500">({currentTermInfo.name})</span>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
                      {currentTermInfo.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Matrix Visualization */}
              <div className="overflow-x-auto pb-6 custom-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                <div className="min-w-[700px]">
                  <div className="flex items-center justify-between mb-2 px-4">
                    <span className="text-sm font-bold text-jways-blue">수출자 (Seller) 부담구간</span>
                    <span className="text-sm font-bold text-teal-600 dark:text-teal-400">수입자 (Buyer) 부담구간</span>
                  </div>
                  
                  {/* Progress Bar Track */}
                  <div className="relative h-6 bg-slate-200 dark:bg-slate-800 rounded-full flex overflow-hidden mb-6 mx-4">
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-jways-blue transition-all duration-700 ease-in-out z-10"
                      style={{ 
                        width: currentTermInfo.code === 'DAP' 
                          ? '100%' // Visually handle DAP with mixed colors later, or just show blue
                          : `${(currentTermInfo.sellerSteps / steps.length) * 100}%` 
                      }}
                    >
                      {/* Diagonal stripes for seller */}
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff 10px, #ffffff 20px)' }}></div>
                    </div>
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-teal-500 dark:bg-teal-600 transition-all duration-700 ease-in-out"
                      style={{ 
                        width: currentTermInfo.code === 'DAP' 
                          ? '100%' 
                          : `${((steps.length - currentTermInfo.sellerSteps) / steps.length) * 100}%` 
                      }}
                    ></div>
                    
                    {/* Visual trick for DAP mixed state */}
                    {currentTermInfo.code === 'DAP' && (
                       <>
                         <div className="absolute right-0 top-0 bottom-0 w-[22.2%] bg-teal-500 dark:bg-teal-600 z-20"></div> {/* Import customs */}
                         <div className="absolute right-[44.4%] top-0 bottom-0 w-[11.1%] bg-teal-500 dark:bg-teal-600 z-20"></div> {/* Insurance */}
                       </>
                    )}
                  </div>

                  {/* Steps Grid */}
                  <div className="grid grid-cols-9 gap-2">
                    {steps.map((step, idx) => {
                      let isSeller = false;
                      if (currentTermInfo.code === 'DAP') {
                        isSeller = dapMatrix[idx];
                      } else {
                        isSeller = idx < currentTermInfo.sellerSteps;
                      }

                      return (
                        <div key={step.id} className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 z-30 shadow-sm transition-colors duration-500 ${
                            isSeller 
                            ? 'bg-jways-blue text-white ring-4 ring-blue-100 dark:ring-blue-900/30' 
                            : 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 ring-4 ring-teal-50 dark:ring-teal-900/20'
                          }`}>
                            {isSeller ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                          </div>
                          
                          <div className="text-center relative">
                            {idx < steps.length - 1 && (
                              <ChevronRight className="absolute -right-4 top-1 text-slate-300 dark:text-slate-700" size={12} />
                            )}
                            <p className="text-[10px] md:text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 whitespace-pre-wrap">{step.short}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400">
                <ul className="list-disc list-inside space-y-1">
                  <li>실제 거래 시 당사자 간의 합의나 특약에 따라 위험 및 비용의 분기점이 변경될 수 있습니다.</li>
                  <li>본 표는 가장 대표적인 기준을 보여주는 인포그래픽이며 법적 효력을 갖지 않습니다.</li>
                </ul>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IncotermsGuide;
