import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, RefreshCw, Plus, Trash2, Box } from 'lucide-react';
import { CargoItem, CBMResults, UnitSystem } from '../types';

// ─── Constants ───
const MAX_ITEMS = 20;
const AIR_CBM_FACTOR = 167;
const SEA_CBM_FACTOR = 1000;
const CM_TO_INCH = 2.54;
const KG_TO_LBS = 2.20462;

const round = (value: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

const initialResults: CBMResults = {
  totalCBM: 0,
  totalActualWeight: 0,
  airVolumeWeight: 0,
  airChargeableWeight: 0,
  seaVolumeWeight: 0,
  seaChargeableRT: 0,
};

const createItem = (): CargoItem => ({
  id: Math.random().toString(36).slice(2, 9),
  length: '',
  width: '',
  height: '',
  weight: '',
  quantity: '1',
});

// ─── Pure Calculation Function ───
function calculateAll(items: CargoItem[], unit: UnitSystem): CBMResults {
  let totalCBM = 0;
  let totalActualWeight = 0;

  items.forEach(item => {
    let l = parseFloat(item.length) || 0;
    let w = parseFloat(item.width) || 0;
    let h = parseFloat(item.height) || 0;
    let wt = parseFloat(item.weight) || 0;
    const qty = parseInt(item.quantity) || 0;

    if (unit === 'imperial') {
      l *= CM_TO_INCH;
      w *= CM_TO_INCH;
      h *= CM_TO_INCH;
      wt /= KG_TO_LBS;
    }

    totalCBM += (l * w * h) / 1_000_000 * qty;
    totalActualWeight += wt * qty;
  });

  const airVolumeWeight = totalCBM * AIR_CBM_FACTOR;
  const seaVolumeWeight = totalCBM * SEA_CBM_FACTOR;

  return {
    totalCBM: round(totalCBM, 3),
    totalActualWeight: round(totalActualWeight, 2),
    airVolumeWeight: round(airVolumeWeight, 2),
    airChargeableWeight: round(Math.max(totalActualWeight, airVolumeWeight), 2),
    seaVolumeWeight: round(seaVolumeWeight, 2),
    seaChargeableRT: round(Math.max(totalCBM, totalActualWeight / 1000), 3),
  };
}

// ─── CargoItemRow (Inline Component) ───
interface CargoItemRowProps {
  item: CargoItem;
  index: number;
  unit: UnitSystem;
  onChange: (id: string, field: keyof CargoItem, value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

const inputClass = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-jways-blue/20 focus:border-jways-blue transition-all dark:text-white text-sm";

const CargoItemRow: React.FC<CargoItemRowProps> = ({ item, index, unit, onChange, onRemove, canRemove }) => {
  const dimLabel = unit === 'metric' ? 'cm' : 'in';
  const wtLabel = unit === 'metric' ? 'kg' : 'lbs';

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">#{index + 1}</span>
        {canRemove && (
          <button
            onClick={() => onRemove(item.id)}
            className="p-1.5 text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label={`품목 ${index + 1} 삭제`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label htmlFor={`${item.id}-length`} className="text-xs font-semibold text-slate-600 dark:text-slate-400">가로 (L)</label>
          <div className="relative">
            <input
              id={`${item.id}-length`}
              type="number"
              value={item.length}
              onChange={(e) => onChange(item.id, 'length', e.target.value)}
              placeholder="0"
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{dimLabel}</span>
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor={`${item.id}-width`} className="text-xs font-semibold text-slate-600 dark:text-slate-400">세로 (W)</label>
          <div className="relative">
            <input
              id={`${item.id}-width`}
              type="number"
              value={item.width}
              onChange={(e) => onChange(item.id, 'width', e.target.value)}
              placeholder="0"
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{dimLabel}</span>
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor={`${item.id}-height`} className="text-xs font-semibold text-slate-600 dark:text-slate-400">높이 (H)</label>
          <div className="relative">
            <input
              id={`${item.id}-height`}
              type="number"
              value={item.height}
              onChange={(e) => onChange(item.id, 'height', e.target.value)}
              placeholder="0"
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{dimLabel}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor={`${item.id}-weight`} className="text-xs font-semibold text-slate-600 dark:text-slate-400">중량</label>
          <div className="relative">
            <input
              id={`${item.id}-weight`}
              type="number"
              value={item.weight}
              onChange={(e) => onChange(item.id, 'weight', e.target.value)}
              placeholder="0"
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{wtLabel}</span>
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor={`${item.id}-quantity`} className="text-xs font-semibold text-slate-600 dark:text-slate-400">수량</label>
          <div className="relative">
            <input
              id={`${item.id}-quantity`}
              type="number"
              value={item.quantity}
              onChange={(e) => onChange(item.id, 'quantity', e.target.value)}
              placeholder="1"
              min="1"
              className={`${inputClass} pl-10`}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Box size={16} />
            </div>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">EA</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───
const CBMCalculator: React.FC = () => {
  const [unit, setUnit] = useState<UnitSystem>('metric');
  const [items, setItems] = useState<CargoItem[]>([createItem()]);
  const [results, setResults] = useState<CBMResults>(initialResults);

  useEffect(() => {
    setResults(calculateAll(items, unit));
  }, [items, unit]);

  const handleItemChange = (id: string, field: keyof CargoItem, value: string) => {
    if (field === 'id') return;
    const num = Number(value);
    if (value !== '' && num < 0) return;
    if ((field === 'length' || field === 'width' || field === 'height') && num > 99999) return;
    if (field === 'weight' && num > 999999) return;
    if (field === 'quantity' && num > 9999) return;

    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    if (items.length >= MAX_ITEMS) return;
    setItems(prev => [...prev, createItem()]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleReset = () => {
    setUnit('metric');
    setItems([createItem()]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors duration-300">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-jways-blue to-indigo-600 p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Calculator size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">CBM 계산기</h2>
              <p className="text-blue-100 text-sm">해상/항공 화물 부피 및 운송 중량 계산</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white/10 rounded-full p-0.5" role="radiogroup" aria-label="단위 선택">
              <button
                onClick={() => setUnit('metric')}
                role="radio"
                aria-checked={unit === 'metric'}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  unit === 'metric' ? 'bg-white text-jways-blue' : 'text-blue-100'
                }`}
              >
                cm / kg
              </button>
              <button
                onClick={() => setUnit('imperial')}
                role="radio"
                aria-checked={unit === 'imperial'}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  unit === 'imperial' ? 'bg-white text-jways-blue' : 'text-blue-100'
                }`}
              >
                in / lbs
              </button>
            </div>
            <button
              onClick={handleReset}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Reset Calculator"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content: Items + Results */}
      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Items Area */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CargoItemRow
                  item={item}
                  index={idx}
                  unit={unit}
                  onChange={handleItemChange}
                  onRemove={removeItem}
                  canRemove={items.length > 1}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {items.length < MAX_ITEMS && (
            <motion.button
              onClick={addItem}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-jways-blue hover:border-jways-blue transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              aria-label="품목 추가"
            >
              <Plus size={16} /> 품목 추가
            </motion.button>
          )}
        </div>

        {/* Results Panel */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-6" aria-live="polite">
          {/* Total CBM */}
          <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">총 체적 (Total Volume)</h3>
            <div className="flex items-baseline justify-center gap-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={results.totalCBM}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-5xl font-bold text-jways-blue tabular-nums"
                >
                  {results.totalCBM}
                </motion.span>
              </AnimatePresence>
              <span className="text-xl font-semibold text-slate-500">CBM</span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              총 실제 중량: <span className="font-semibold text-slate-700 dark:text-slate-300">{results.totalActualWeight} kg</span>
            </p>
          </div>

          {/* Air / Sea Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Air Freight */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <h4 className="font-semibold text-slate-800 dark:text-white text-sm">항공 물류 (Air)</h4>
                {results.airChargeableWeight > results.totalActualWeight ? (
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-1.5 py-0.5 rounded-full">
                    부피중량 적용
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded-full">
                    실중량 적용
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">부피 중량</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{results.airVolumeWeight} kg</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-slate-100 dark:border-slate-700 pt-2 mt-2">
                  <span className="text-jways-blue">적용 운임 중량</span>
                  <span className="text-jways-blue">{results.airChargeableWeight} kg</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">* 1 CBM = 167 kg 기준</p>
            </div>

            {/* Sea Freight */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <h4 className="font-semibold text-slate-800 dark:text-white text-sm">해상 물류 (Sea)</h4>
                {results.seaChargeableRT > results.totalCBM ? (
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-1.5 py-0.5 rounded-full">
                    실중량 적용
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded-full">
                    부피 적용
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">운임톤 (RT) 비교</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">CBM vs W/T</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-slate-100 dark:border-slate-700 pt-2 mt-2">
                  <span className="text-indigo-600 dark:text-indigo-400">적용 운임톤</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{results.seaChargeableRT} RT</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">* 1 CBM = 1,000 kg (1 M/T) 기준</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CBMCalculator;
