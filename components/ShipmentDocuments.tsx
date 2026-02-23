import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Receipt, ClipboardList, Award } from 'lucide-react';
import { ShipmentDocument } from '../types';
import type { LucideIcon } from 'lucide-react';

interface ShipmentDocumentsProps {
  documents: ShipmentDocument[];
}

const DOC_TYPE_CONFIG: Record<ShipmentDocument['type'], { icon: LucideIcon; label: string }> = {
  bl: { icon: FileText, label: 'B/L' },
  invoice: { icon: Receipt, label: 'Invoice' },
  'packing-list': { icon: ClipboardList, label: 'Packing List' },
  certificate: { icon: Award, label: 'Certificate' },
};

const STATUS_STYLES: Record<ShipmentDocument['status'], { label: string; color: string }> = {
  issued: { label: '발행 완료', color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' },
  pending: { label: '발행 대기', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800' },
  draft: { label: '초안', color: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
};

const ShipmentDocuments: React.FC<ShipmentDocumentsProps> = ({ documents }) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-400">
        등록된 문서가 없습니다
      </div>
    );
  }

  return (
    <div role="list" aria-label="관련 문서 목록" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {documents.map((doc, idx) => {
        const typeConfig = DOC_TYPE_CONFIG[doc.type];
        const statusStyle = STATUS_STYLES[doc.status];
        const Icon = typeConfig.icon;

        return (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            role="listitem"
            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <Icon size={18} className="text-slate-500 dark:text-slate-400" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {doc.date && <span className="text-[10px] text-slate-400">{doc.date}</span>}
                {doc.fileSize && <span className="text-[10px] text-slate-400">{doc.fileSize}</span>}
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${statusStyle.color}`}
              aria-label={`${doc.name} - ${statusStyle.label}`}
            >
              {statusStyle.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ShipmentDocuments;
