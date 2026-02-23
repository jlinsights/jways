import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Clock, Truck, Plane, Ship, ChevronDown, Timer, FileCheck, MapPin, Package,
} from 'lucide-react';
import { TrackingStep, MilestoneCategoryGroup, MilestoneCategory, TransportMode } from '../types';
import type { LucideIcon } from 'lucide-react';

// ─── Category Config (shared with Tracking.tsx pattern) ───

const CATEGORY_CONFIG: Record<MilestoneCategory, {
  label: string;
  labelEn: string;
  color: string;
  darkColor: string;
  icon: LucideIcon;
}> = {
  departure: { label: '출발', labelEn: 'Departure', color: 'bg-blue-50 text-blue-700 border-blue-200', darkColor: 'dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800', icon: Package },
  transit: { label: '운송', labelEn: 'Transit', color: 'bg-amber-50 text-amber-700 border-amber-200', darkColor: 'dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800', icon: Truck },
  customs: { label: '통관', labelEn: 'Customs', color: 'bg-purple-50 text-purple-700 border-purple-200', darkColor: 'dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800', icon: FileCheck },
  arrival: { label: '도착', labelEn: 'Arrival', color: 'bg-green-50 text-green-700 border-green-200', darkColor: 'dark:bg-green-900/20 dark:text-green-300 dark:border-green-800', icon: MapPin },
};

// ─── Helpers ───

function getRelativeTime(isoString: string): string {
  const now = new Date();
  const past = new Date(isoString);
  const diffMs = now.getTime() - past.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay > 0) return `${diffDay}일 전`;
  if (diffHour > 0) return `${diffHour}시간 전`;
  if (diffMin > 0) return `${diffMin}분 전`;
  return '방금 전';
}

function getTimeBetween(step1: TrackingStep, step2: TrackingStep): string | null {
  if (!step1.completedAt || !step2.completedAt) return null;
  const diff = new Date(step2.completedAt).getTime() - new Date(step1.completedAt).getTime();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// ─── MilestoneRow (extracted from Tracking.tsx) ───

interface MilestoneRowProps {
  step: TrackingStep;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  mode?: TransportMode;
}

const MilestoneRow: React.FC<MilestoneRowProps> = ({ step, index, isExpanded, onToggle, mode }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); }
  };
  const hasExpandContent = step.detail || step.vessel || step.port;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 + 0.3 }}
      className="relative flex gap-3 md:gap-4 pb-6 last:pb-0"
      role="listitem"
    >
      <div className={`relative z-10 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-4 border-slate-50 dark:border-slate-950 shrink-0 transition-colors ${
        step.status === 'completed' ? 'bg-blue-100 text-blue-600' :
        step.status === 'current' ? 'bg-jways-blue text-white shadow-lg shadow-blue-500/30' :
        'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
      }`}>
        {step.status === 'completed' ? <CheckCircle2 size={16} className="md:w-[18px] md:h-[18px]" aria-hidden="true" /> :
         step.status === 'current' ? (
           mode === 'sea' ? <Ship size={16} className="md:w-[18px] md:h-[18px]" aria-hidden="true" /> :
           mode === 'air' ? <Plane size={16} className="md:w-[18px] md:h-[18px]" aria-hidden="true" /> :
           <Truck size={16} className="md:w-[18px] md:h-[18px]" aria-hidden="true" />
         ) :
         <Clock size={16} className="md:w-[18px] md:h-[18px]" aria-hidden="true" />}
      </div>

      <div
        className={`pt-0.5 md:pt-1 flex-1 min-w-0 ${hasExpandContent ? 'cursor-pointer' : ''}`}
        role={hasExpandContent ? 'button' : undefined}
        tabIndex={hasExpandContent ? 0 : undefined}
        aria-expanded={hasExpandContent ? isExpanded : undefined}
        aria-label={`${step.label} - ${step.status === 'completed' ? '완료' : step.status === 'current' ? '진행중' : '대기중'}`}
        onClick={hasExpandContent ? onToggle : undefined}
        onKeyDown={hasExpandContent ? handleKeyDown : undefined}
      >
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <p className={`font-bold text-sm md:text-base truncate ${
              step.status === 'current' ? 'text-jways-blue' : 'text-slate-900 dark:text-white'
            }`}>{step.label}</p>
            {hasExpandContent && (
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} className="text-slate-400 shrink-0" aria-hidden="true" />
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {step.completedAt && step.status === 'completed' && (
              <span className="text-[10px] text-slate-400 hidden md:inline">{getRelativeTime(step.completedAt)}</span>
            )}
            <span className="text-[10px] md:text-xs text-slate-400 whitespace-nowrap">{step.date}</span>
          </div>
        </div>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-1">{step.location}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[10px] md:text-xs text-slate-400 font-mono">{step.time}</p>
          {step.eta && step.status !== 'completed' && (
            <motion.span whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-1 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
              <Timer size={10} aria-hidden="true" />ETA {step.eta}
            </motion.span>
          )}
          {step.vessel && (
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">{step.vessel}</span>
          )}
        </div>
        <AnimatePresence>
          {isExpanded && hasExpandContent && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden" role="region" aria-label={`${step.label} 상세 정보`}>
              <div className="mt-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                {step.detail && <p>{step.detail}</p>}
                {step.port && <p className="font-mono text-slate-500">Port: {step.port}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── Main EventTimeline ───

interface EventTimelineProps {
  categories: MilestoneCategoryGroup[];
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  mode?: TransportMode;
}

const EventTimeline: React.FC<EventTimelineProps> = ({ categories, expandedIds, onToggle, mode }) => {
  // Flatten all steps for time-between calculation
  const allSteps = categories.flatMap(g => g.steps);

  return (
    <div className="space-y-0 relative" role="list" aria-label="운송 이벤트 타임라인">
      {/* Timeline Line */}
      <div className="absolute top-2 bottom-2 left-[15px] md:left-[19px] w-0.5 bg-slate-200 dark:bg-slate-800" aria-hidden="true" />

      {categories.map((group, groupIdx) => {
        const cfg = CATEGORY_CONFIG[group.category];
        const groupCompleted = group.steps.filter(s => s.status === 'completed').length;
        const groupTotal = group.steps.length;

        return (
          <div key={group.category} role="group" aria-label={`${cfg.label} 마일스톤`}>
            {/* Category Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIdx * 0.15 + 0.2 }}
              className="relative z-10 flex items-center gap-2 mb-3 mt-2 first:mt-0"
            >
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700 border-dashed" aria-hidden="true" />
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.color} ${cfg.darkColor}`} role="heading" aria-level={4}>
                <cfg.icon size={10} aria-hidden="true" />
                {cfg.label} ({cfg.labelEn})
              </span>
              <span className="text-[10px] text-slate-400 font-medium">{groupCompleted}/{groupTotal}</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700 border-dashed" aria-hidden="true" />
            </motion.div>

            {/* Steps with time gaps */}
            {group.steps.map((step, idx) => {
              const globalIdx = allSteps.indexOf(step);
              const prevStep = globalIdx > 0 ? allSteps[globalIdx - 1] : null;
              const timeBetween = prevStep ? getTimeBetween(prevStep, step) : null;

              return (
                <React.Fragment key={step.id}>
                  {timeBetween && idx === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: groupIdx * 0.15 + 0.4 }}
                      className="flex items-center gap-2 ml-[13px] md:ml-[17px] py-1" aria-hidden="true"
                    >
                      <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="text-[9px] text-slate-400 font-mono">{timeBetween}</span>
                    </motion.div>
                  )}
                  <MilestoneRow
                    step={step}
                    index={groupIdx * 3 + idx}
                    isExpanded={expandedIds.has(step.id)}
                    onToggle={() => onToggle(step.id)}
                    mode={mode}
                  />
                  {idx < group.steps.length - 1 && (() => {
                    const nextStep = group.steps[idx + 1];
                    const gap = getTimeBetween(step, nextStep);
                    return gap ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: groupIdx * 0.15 + (idx + 1) * 0.1 + 0.4 }}
                        className="flex items-center gap-2 ml-[13px] md:ml-[17px] py-1" aria-hidden="true"
                      >
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="text-[9px] text-slate-400 font-mono">{gap}</span>
                      </motion.div>
                    ) : null;
                  })()}
                </React.Fragment>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default EventTimeline;
