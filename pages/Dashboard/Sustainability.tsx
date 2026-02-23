import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Leaf, Download, ArrowDownRight, Wind, TrendingDown, Target } from 'lucide-react';

const mockMonthlyData = [
  { month: '1월', emissions: 4500, target: 5000 },
  { month: '2월', emissions: 4200, target: 4900 },
  { month: '3월', emissions: 3800, target: 4800 },
  { month: '4월', emissions: 3900, target: 4700 },
  { month: '5월', emissions: 3600, target: 4600 },
  { month: '6월', emissions: 3200, target: 4500 },
];

const mockModeData = [
  { name: '해상 운송', value: 2400 },
  { name: '항공 운송', value: 5600 },
  { name: '내륙 트럭', value: 1200 },
];

const Sustainability: React.FC = () => {
  const [calcInput, setCalcInput] = useState({ origin: '', dest: '', mode: 'sea', weight: '' });
  const [calcResult, setCalcResult] = useState<number | null>(null);

  const calculateCO2 = () => {
    const w = Number(calcInput.weight) || 0;
    const factor = calcInput.mode === 'air' ? 2.5 : calcInput.mode === 'sea' ? 0.4 : 1.2;
    setCalcResult(w * factor);
  };
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Leaf className="text-teal-600 dark:text-teal-400" /> ESG 탄소 배출량 리포트
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">분기별 및 운송수단별 탄소 배출량을 확인하고 저감 목표를 설정하세요.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <Download size={16} /> 리포트 다운로드 (PDF)
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-6 rounded-3xl text-white shadow-lg shadow-teal-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-bold text-teal-100 mb-2">올해 총 배출량</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-black tracking-tight">23.2</span>
              <span className="font-bold text-teal-100">tCO₂e</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm font-bold backdrop-blur-sm">
              <TrendingDown size={16} /> 전년 동기 대비 14% 감소
            </div>
          </div>
          <Wind className="absolute -right-4 -top-4 w-32 h-32 text-white/10 rotate-12" />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <span className="font-bold text-xl">✈️</span>
            </div>
            <p className="font-bold text-slate-500 dark:text-slate-400">가장 큰 배출 요인</p>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">항공 운송 (Air Freight)</h4>
            <p className="text-sm text-slate-500">전체 배출량의 60.8% 차지</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm font-bold text-jways-blue">
            <ArrowDownRight size={16} /> 해상 운송 전환시 -45% 감축 가능
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
              <Target size={20} />
            </div>
            <p className="font-bold text-slate-500 dark:text-slate-400">환경 목표 달성률</p>
          </div>
          <div className="mt-2">
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">82%</span>
              <span className="text-sm text-slate-500">목표 20tCO₂e 이하</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[82%] rounded-full" />
            </div>
            <p className="text-xs text-slate-400 mt-2">이 추세라면 연말까지 목표 조기 달성 가능</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">월별 탄소 배출량 추이</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="emissions" name="배출량(kg)" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorEmissions)" />
                <Area type="step" dataKey="target" name="목표(kg)" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mode Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">운송 수단별 배출량 분석</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockModeData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={13} fontWeight={600} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  cursor={{fill: 'rgba(148, 163, 184, 0.1)'}}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="value" name="배출량(kg)" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={32}>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>

      {/* CO2 Calculator Widget */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border border-indigo-100 dark:border-slate-700 p-6 rounded-3xl shadow-sm mt-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Leaf className="text-indigo-500" /> 간편 탄소 배출량 계산기
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">출발지</label>
            <input 
              type="text" 
              placeholder="예: 부산, KR"
              value={calcInput.origin}
              onChange={e => setCalcInput({...calcInput, origin: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">도착지</label>
            <input 
              type="text" 
              placeholder="예: 로스앤젤레스, US"
              value={calcInput.dest}
              onChange={e => setCalcInput({...calcInput, dest: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">운송수단 (모드)</label>
            <select 
              value={calcInput.mode}
              onChange={e => setCalcInput({...calcInput, mode: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="sea">해상 운송 (Ocean)</option>
              <option value="air">항공 운송 (Air)</option>
              <option value="road">내륙 트럭 (Road)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">총 중량 (kg)</label>
            <input 
              type="number" 
              placeholder="예: 5000"
              value={calcInput.weight}
              onChange={e => setCalcInput({...calcInput, weight: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-100 dark:border-slate-700">
          <button 
            onClick={calculateCO2}
            disabled={!calcInput.origin || !calcInput.dest || !calcInput.weight}
            className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            배출량 계산하기
          </button>
          
          {calcResult !== null && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-500">예상 CO₂e 배출량:</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {calcResult.toLocaleString()} <span className="text-base text-slate-500 font-bold">kg</span>
              </span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Sustainability;
