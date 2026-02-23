import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plane, Ship, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { ShipmentData, MilestoneCategory } from '../types';

interface ShipmentCompareProps {
  shipments: ShipmentData[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<MilestoneCategory, string> = {
  departure: '출발',
  transit: '운송',
  customs: '통관',
  arrival: '도착',
};

const ShipmentCompare: React.FC<ShipmentCompareProps> = ({ shipments, onRemove, onClose }) => {
  if (shipments.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white dark:bg-slate-900"
      role="region"
      aria-label="화물 비교"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-slate-900 dark:text-white">비교 모드</span>
          {shipments.map(s => (
            <motion.span
              key={s.id}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-jways-blue/10 text-jways-blue border border-jways-blue/20"
            >
              {s.mode === 'air' ? <Plane size={10} aria-hidden="true" /> : <Ship size={10} aria-hidden="true" />}
              {s.id}
              <button
                onClick={() => onRemove(s.id)}
                className="ml-1 hover:bg-jways-blue/20 rounded-full p-0.5 transition-colors"
                aria-label={`${s.id} 비교에서 제거`}
              >
                <X size={10} />
              </button>
            </motion.span>
          ))}
        </div>
        <button
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
        >
          닫기
        </button>
      </div>

      {/* Compare Grid */}
      <div className={`grid gap-4 p-4 md:p-6 ${
        shipments.length === 1 ? 'grid-cols-1' :
        shipments.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        <AnimatePresence>
          {shipments.map(shipment => (
            <motion.div
              key={shipment.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              aria-label={`${shipment.id} 추적 정보`}
            >
              {/* Shipment Header */}
              <div className={`p-3 flex items-center justify-between ${
                shipment.mode === 'air'
                  ? 'bg-sky-50 dark:bg-sky-900/20 border-b border-sky-200 dark:border-sky-800'
                  : 'bg-teal-50 dark:bg-teal-900/20 border-b border-teal-200 dark:border-teal-800'
              }`}>
                <div className="flex items-center gap-2">
                  {shipment.mode === 'air' ? <Plane size={14} aria-hidden="true" /> : <Ship size={14} aria-hidden="true" />}
                  <span className="font-mono font-bold text-sm">{shipment.id}</span>
                </div>
                <span className="text-xs font-bold">{shipment.totalProgress ?? 0}%</span>
              </div>

              {/* Summary */}
              <div className="p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">ETA</span>
                  <span className="font-bold text-slate-900 dark:text-white">{shipment.estimatedDelivery}</span>
                </div>
                {shipment.eta?.delayDays && shipment.eta.delayDays > 0 && (
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                    +{shipment.eta.delayDays}일 지연
                  </div>
                )}

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${shipment.totalProgress ?? 0}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-jways-accent rounded-full"
                  />
                </div>

                {/* Category Summary */}
                <div className="space-y-1.5 pt-2">
                  {(shipment.categories ?? []).map(group => {
                    const completed = group.steps.filter(s => s.status === 'completed').length;
                    const current = group.steps.find(s => s.status === 'current');
                    const allDone = completed === group.steps.length;

                    return (
                      <div key={group.category} className="flex items-center gap-2 text-xs">
                        {allDone ? (
                          <CheckCircle2 size={12} className="text-green-500 shrink-0" aria-hidden="true" />
                        ) : current ? (
                          <Loader2 size={12} className="text-jways-blue animate-spin shrink-0" aria-hidden="true" />
                        ) : (
                          <Clock size={12} className="text-slate-400 shrink-0" aria-hidden="true" />
                        )}
                        <span className={`${current ? 'text-jways-blue font-bold' : allDone ? 'text-slate-500 line-through' : 'text-slate-400'}`}>
                          {CATEGORY_LABELS[group.category]}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-auto">{completed}/{group.steps.length}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ShipmentCompare;
