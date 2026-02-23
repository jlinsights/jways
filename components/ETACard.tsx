import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, RefreshCw } from 'lucide-react';
import { ETAInfo, TransportMode } from '../types';

interface ETACardProps {
  eta: ETAInfo;
  estimatedDelivery: string;
  mode?: TransportMode;
}

function getDDayString(isoDate: string): { text: string; isPast: boolean } {
  const now = new Date();
  const target = new Date(isoDate);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return { text: `D-${diffDays}`, isPast: false };
  if (diffDays === 0) return { text: 'D-Day', isPast: false };
  return { text: `D+${Math.abs(diffDays)}`, isPast: true };
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function getRelativeTime(isoString: string): string {
  const now = new Date();
  const past = new Date(isoString);
  const diffMs = now.getTime() - past.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay > 0) return `${diffDay}일 전 업데이트`;
  if (diffHour > 0) return `${diffHour}시간 전 업데이트`;
  if (diffMin > 0) return `${diffMin}분 전 업데이트`;
  return '방금 업데이트';
}

const CONFIDENCE_STYLES: Record<ETAInfo['confidence'], { label: string; color: string }> = {
  high: { label: '높음', color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' },
  medium: { label: '보통', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800' },
  low: { label: '낮음', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' },
};

const ETACard: React.FC<ETACardProps> = ({ eta, estimatedDelivery, mode }) => {
  const dDay = getDDayString(eta.estimatedArrival);
  const conf = CONFIDENCE_STYLES[eta.confidence];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
      aria-label="예상 도착 정보"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-jways-blue" aria-hidden="true" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">예상 도착</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${conf.color}`}
          aria-label={`예측 신뢰도: ${conf.label}`}
        >
          {conf.label}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <motion.p
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className={`text-2xl font-bold ${dDay.isPast ? 'text-red-500' : 'text-jways-blue'}`}
            aria-live="polite"
          >
            {dDay.text}
          </motion.p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {formatDate(eta.estimatedArrival)}
          </p>
        </div>

        <div className="text-right">
          {eta.delayDays && eta.delayDays > 0 ? (
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Clock size={10} aria-hidden="true" />
              +{eta.delayDays}일 지연
            </p>
          ) : null}
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
            <RefreshCw size={8} aria-hidden="true" />
            {getRelativeTime(eta.lastUpdated)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ETACard;
