import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Plane, Ship } from 'lucide-react';
import { ShipmentData } from '../types';

interface TrackingDashboardProps {
  shipment: ShipmentData;
}

const TrackingDashboard: React.FC<TrackingDashboardProps> = ({ shipment }) => {
  const progress = shipment.totalProgress ?? 0;
  const currentStep = shipment.steps.find(s => s.status === 'current');
  const hasDelay = shipment.eta?.delayDays && shipment.eta.delayDays > 0;

  // SVG circle math
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
    >
      <div className="flex items-center gap-4 md:gap-6">
        {/* Circular Progress */}
        <div className="shrink-0" role="img" aria-label={`전체 진행률 ${progress}%`}>
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle
              cx="30" cy="30" r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-slate-200 dark:text-slate-800"
            />
            <motion.circle
              cx="30" cy="30" r={radius}
              fill="none"
              stroke="url(#dashboardGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
              transform="rotate(-90 30 30)"
            />
            <defs>
              <linearGradient id="dashboardGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            <text
              x="30" y="30"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-slate-900 dark:fill-white text-sm font-bold"
            >
              {progress}%
            </text>
          </svg>
        </div>

        {/* Status Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white truncate">
              {currentStep?.label ?? shipment.status}
            </h3>
            {shipment.mode && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                shipment.mode === 'air'
                  ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800'
                  : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800'
              }`} aria-label={shipment.mode === 'air' ? '항공 운송' : '해상 운송'}>
                {shipment.mode === 'air' ? <Plane size={10} aria-hidden="true" /> : <Ship size={10} aria-hidden="true" />}
                {shipment.mode === 'air' ? 'AIR' : 'SEA'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentStep?.location ?? ''}
            {shipment.eta ? ` | ETA: ${shipment.estimatedDelivery}` : ''}
          </p>
        </div>

        {/* Tracking ID */}
        <div className="hidden md:block text-right shrink-0">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Tracking ID</p>
          <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">{shipment.id}</p>
        </div>
      </div>

      {/* Delay Warning Banner */}
      {hasDelay && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.3 }}
          role="alert"
          aria-live="polite"
          className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-medium"
        >
          <AlertTriangle size={14} aria-hidden="true" className="shrink-0" />
          <span>예상 도착일 대비 <strong>{shipment.eta?.delayDays}일 지연</strong>이 감지되었습니다.</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TrackingDashboard;
