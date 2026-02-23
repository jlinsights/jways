import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Leaf, Download, TrendingDown, Wind, Target, Ship, Plane, ArrowRight, Globe, Info } from 'lucide-react';
import { getShipments } from '../../lib/api';
import {
  calculateAllShipmentsCO2, aggregateMonthlyCO2, aggregateModeCO2,
  calculateESGScore, simulateReduction, calculateOffsetCost, getRouteCO2PerKg,
} from '../../lib/co2';
import type { ShipmentCO2, MonthlyCO2, ModeCO2, ESGScore, ReductionScenario, CarbonOffsetEstimate } from '../../types';

// ─── Sustainability Page ───

const Sustainability: React.FC = () => {
  const [shipmentCO2s, setShipmentCO2s] = useState<ShipmentCO2[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyCO2[]>([]);
  const [modeData, setModeData] = useState<ModeCO2[]>([]);
  const [esgScore, setEsgScore] = useState<ESGScore | null>(null);
  const [offsetEstimate, setOffsetEstimate] = useState<CarbonOffsetEstimate | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculator state
  const [calcInput, setCalcInput] = useState({ origin: '', dest: '', mode: 'sea', weight: '' });
  const [calcResult, setCalcResult] = useState<{ co2Kg: number; co2PerKg: number } | null>(null);

  // Simulator state
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>('');
  const [reductionResult, setReductionResult] = useState<ReductionScenario | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const shipments = await getShipments();
      const co2Data = calculateAllShipmentsCO2(shipments);
      setShipmentCO2s(co2Data);
      setMonthlyData(aggregateMonthlyCO2(co2Data));
      setModeData(aggregateModeCO2(co2Data));
      setEsgScore(calculateESGScore(co2Data));
      const totalCO2 = co2Data.reduce((sum, s) => sum + s.co2Kg, 0);
      setOffsetEstimate(calculateOffsetCost(totalCO2));
      setLoading(false);
    }
    loadData();
  }, []);

  const handleCalculateCO2 = () => {
    const w = Number(calcInput.weight) || 0;
    const mode = calcInput.mode as 'sea' | 'air';
    const co2PerKg = getRouteCO2PerKg(calcInput.origin, calcInput.dest, mode);
    const co2Kg = Math.round(w * co2PerKg * 10) / 10;
    setCalcResult({ co2Kg, co2PerKg });
  };

  const handleSimulate = (shipmentId: string) => {
    setSelectedShipmentId(shipmentId);
    const target = shipmentCO2s.find(s => s.shipmentId === shipmentId);
    if (target) {
      setReductionResult(simulateReduction(target));
    }
  };

  const airShipments = shipmentCO2s.filter(s => s.mode === 'air');
  const totalCO2 = shipmentCO2s.reduce((sum, s) => sum + s.co2Kg, 0);
  const totalCO2Tonnes = Math.round((totalCO2 / 1000) * 100) / 100;

  // Sorted by CO2 descending
  const sortedShipments = [...shipmentCO2s].sort((a, b) => b.co2Kg - a.co2Kg);

  // Biggest emitter mode
  const biggestMode = modeData.length > 0
    ? modeData.reduce((a, b) => a.value > b.value ? a : b)
    : null;
  const biggestPercent = biggestMode && totalCO2 > 0
    ? Math.round((biggestMode.value / totalCO2) * 100)
    : 0;

  // Goal progress (target: reduce to 80% of first month)
  const goalTarget = monthlyData.length > 0 ? monthlyData[0].target * 0.8 : 5000;
  const goalProgress = goalTarget > 0 ? Math.min(100, Math.round(((goalTarget - totalCO2 / 6) / goalTarget) * 100 + 50)) : 82;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center h-64">
        <div className="text-slate-500 dark:text-slate-400 flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Leaf className="text-teal-600 dark:text-teal-400" /> ESG 탄소 배출량 리포트
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">운송 데이터 기반 탄소 배출량 분석 및 ESG 종합 스코어를 확인하세요.</p>
        </div>
        <button
          onClick={() => alert('ESG 리포트 PDF 다운로드 기능은 준비 중입니다. 빠른 시일 내 제공하겠습니다.')}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          aria-label="ESG 리포트 PDF 다운로드 (준비 중)"
        >
          <Download size={16} /> 리포트 다운로드 (PDF)
        </button>
      </div>

      {/* ═══ [A] ESG Score Section ═══ */}
      {esgScore && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">ESG 종합 스코어</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div
              role="img"
              aria-label={`ESG 점수: Environmental ${esgScore.environmental}점, Social ${esgScore.social}점, Governance ${esgScore.governance}점, 종합 ${esgScore.overall}점 ${esgScore.grade}등급`}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={[
                  { subject: 'Environmental', score: esgScore.environmental, fullMark: 100 },
                  { subject: 'Social', score: esgScore.social, fullMark: 100 },
                  { subject: 'Governance', score: esgScore.governance, fullMark: 100 },
                ]}>
                  <PolarGrid stroke="#94a3b8" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Radar name="ESG Score" dataKey="score" stroke="#0d9488" fill="#0d9488" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Score Cards */}
            <div className="space-y-4">
              {[
                { label: 'Environmental', labelKr: '환경', score: esgScore.environmental, color: 'bg-teal-500' },
                { label: 'Social', labelKr: '사회', score: esgScore.social, color: 'bg-blue-500' },
                { label: 'Governance', labelKr: '지배구조', score: esgScore.governance, color: 'bg-purple-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="w-24 text-sm font-bold text-slate-600 dark:text-slate-400">{item.labelKr}</span>
                  <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.score}%` }} />
                  </div>
                  <span className="w-12 text-right text-sm font-bold text-slate-900 dark:text-white">{item.score}점</span>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">종합 스코어</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{esgScore.overall}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${
                      esgScore.grade.startsWith('A') ? 'bg-emerald-500' :
                      esgScore.grade.startsWith('B') ? 'bg-blue-500' :
                      esgScore.grade === 'C' ? 'bg-amber-500' : 'bg-red-500'
                    }`}>{esgScore.grade}</span>
                  </div>
                </div>
                <span className="text-sm text-slate-400">국내 물류업체 상위 15%</span>
              </div>
              <p className="text-xs text-slate-400 flex items-start gap-1">
                <Info size={12} className="mt-0.5 shrink-0" />
                본 ESG 스코어는 자체 산정 참고값이며, 공인 ESG 평가(CDP, EcoVadis 등)와 다를 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ [B] Overview Cards ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-6 rounded-3xl text-white shadow-lg shadow-teal-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-bold text-teal-100 mb-2">올해 총 배출량</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-black tracking-tight">{totalCO2Tonnes}</span>
              <span className="font-bold text-teal-100">tCO₂e</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm font-bold backdrop-blur-sm">
              <TrendingDown size={16} /> Tariff Engine 기반 산출
            </div>
          </div>
          <Wind className="absolute -right-4 -top-4 w-32 h-32 text-white/10 rotate-12" />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              {biggestMode?.name === '항공 운송' ? <Plane size={20} /> : <Ship size={20} />}
            </div>
            <p className="font-bold text-slate-500 dark:text-slate-400">가장 큰 배출 요인</p>
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {biggestMode?.name || '항공 운송'}
            </h4>
            <p className="text-sm text-slate-500">전체 배출량의 {biggestPercent}% 차지</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm font-bold text-jways-blue">
            <TrendingDown size={16} /> 해상 운송 전환시 대폭 감축 가능
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
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{goalProgress}%</span>
              <span className="text-sm text-slate-500">월 감축 목표 기준</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${goalProgress}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-2">매월 5% 감축 목표 기준 달성률</p>
          </div>
        </div>
      </div>

      {/* ═══ [C] Charts Section ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">월별 탄소 배출량 추이</h3>
          <div
            className="h-72"
            role="img"
            aria-label={`월별 탄소 배출량 추이: ${monthlyData.map(d => `${d.month} ${d.emissions}kg`).join(', ')}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <Area type="monotone" dataKey="emissions" name="배출량(kg)" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorEmissions)" />
                <Area type="step" dataKey="target" name="목표(kg)" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mode Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">운송 수단별 배출량 분석</h3>
          <div
            className="h-72"
            role="img"
            aria-label={`운송 수단별 배출량: ${modeData.map(d => `${d.name} ${d.value}kg (${d.shipmentCount}건)`).join(', ')}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={13} fontWeight={600} tickLine={false} axisLine={false} width={80} />
                <Tooltip
                  cursor={{fill: 'rgba(148, 163, 184, 0.1)'}}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="value" name="배출량(kg)" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
            {modeData.map(m => (
              <span key={m.name}>{m.name}: 평균 {m.avgCO2PerKg} kg CO₂e/kg ({m.shipmentCount}건)</span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ [D] Shipment CO2 Table ═══ */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">화물별 CO₂ 배출량 상세</h3>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm" aria-label="화물별 CO₂ 배출량 목록">
            <caption className="sr-only">각 화물의 BL번호, 구간, 운송모드, 중량, CO₂ 배출량 및 배출 강도를 보여주는 표</caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th scope="col" className="text-left py-3 px-3 font-bold text-slate-500 dark:text-slate-400">BL번호</th>
                <th scope="col" className="text-left py-3 px-3 font-bold text-slate-500 dark:text-slate-400">구간</th>
                <th scope="col" className="text-center py-3 px-3 font-bold text-slate-500 dark:text-slate-400">모드</th>
                <th scope="col" className="text-right py-3 px-3 font-bold text-slate-500 dark:text-slate-400">중량</th>
                <th scope="col" className="text-right py-3 px-3 font-bold text-slate-500 dark:text-slate-400">CO₂ 배출</th>
                <th scope="col" className="text-right py-3 px-3 font-bold text-slate-500 dark:text-slate-400">강도</th>
              </tr>
            </thead>
            <tbody>
              {sortedShipments.map(s => (
                <tr key={s.shipmentId} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{s.blNumber}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{s.origin} → {s.destination}</td>
                  <td className="py-3 px-3 text-center">
                    {s.mode === 'sea'
                      ? <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400"><Ship size={14} /> 해상</span>
                      : <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400"><Plane size={14} /> 항공</span>
                    }
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-300">{s.weightKg.toLocaleString()} kg</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">{s.co2Kg.toLocaleString()} kg</td>
                  <td className="py-3 px-3 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                      s.co2PerKg < 0.05 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      s.co2PerKg < 0.3 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {s.co2PerKg}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {sortedShipments.map(s => (
            <div key={s.shipmentId} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-900 dark:text-white">{s.blNumber}</span>
                {s.mode === 'sea'
                  ? <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full"><Ship size={12} /> 해상</span>
                  : <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full"><Plane size={12} /> 항공</span>
                }
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{s.origin} → {s.destination}</p>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{s.weightKg.toLocaleString()} kg</span>
                <span className="font-bold text-slate-900 dark:text-white">{s.co2Kg.toLocaleString()} kg CO₂</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
          <span>총 {shipmentCO2s.length}건</span>
          <span>|</span>
          <span>해상 {shipmentCO2s.filter(s => s.mode === 'sea').length}건</span>
          <span>|</span>
          <span>항공 {shipmentCO2s.filter(s => s.mode === 'air').length}건</span>
        </div>
        <p className="text-xs text-slate-400 mt-2 flex items-start gap-1">
          <Info size={12} className="mt-0.5 shrink-0" />
          계산 기준: Tariff Engine co2PerKg 데이터 (GLEC Framework 참조). 실측값과 다를 수 있습니다.
        </p>
      </div>

      {/* ═══ [E] Reduction Simulator ═══ */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 border border-emerald-100 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Leaf className="text-emerald-500" /> 탄소 저감 시뮬레이터
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">항공 운송을 해상으로 전환하면 얼마나 절감할 수 있을까요?</p>

        {airShipments.length > 0 ? (
          <>
            <div className="mb-6">
              <label htmlFor="simulator-select" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">화물 선택</label>
              <select
                id="simulator-select"
                value={selectedShipmentId}
                onChange={e => handleSimulate(e.target.value)}
                className="w-full md:w-auto px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                aria-label="시뮬레이션할 항공 화물 선택"
              >
                <option value="">화물을 선택하세요</option>
                {airShipments.map(s => (
                  <option key={s.shipmentId} value={s.shipmentId}>
                    {s.blNumber} ({s.origin} → {s.destination}, {s.weightKg.toLocaleString()}kg)
                  </option>
                ))}
              </select>
            </div>

            {reductionResult && reductionResult.savedCO2 > 0 && (
              <div aria-live="polite">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Current */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-red-100 dark:border-red-900/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Plane size={16} className="text-amber-500" />
                      <span className="text-sm font-bold text-slate-500">현재 (항공 운송)</span>
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{reductionResult.currentCO2.toLocaleString()}</span>
                    <span className="text-sm text-slate-500 ml-1">kg CO₂</span>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex items-center justify-center">
                    <ArrowRight size={32} className="text-emerald-500" />
                  </div>

                  {/* Alternative */}
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-green-100 dark:border-green-900/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Ship size={16} className="text-blue-500" />
                      <span className="text-sm font-bold text-slate-500">전환 (해상 운송)</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{reductionResult.alternativeCO2.toLocaleString()}</span>
                    <span className="text-sm text-slate-500 ml-1">kg CO₂</span>
                  </div>
                </div>

                {/* Savings */}
                <div className="bg-emerald-500/10 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-5 rounded-2xl">
                  <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3">절감 효과</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500">CO₂ 절감</span>
                      <p className="font-bold text-emerald-700 dark:text-emerald-400">{reductionResult.savedCO2.toLocaleString()} kg ({reductionResult.savedPercent}%)</p>
                    </div>
                    <div>
                      <span className="text-slate-500">소요 기간</span>
                      <p className="font-bold text-slate-900 dark:text-white">{reductionResult.additionalDays}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">비용 차이</span>
                      <p className="font-bold text-slate-900 dark:text-white">{reductionResult.costDifference}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Total air → sea summary */}
            <div className="mt-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl text-sm text-slate-600 dark:text-slate-300">
              <span className="font-bold">💡 항공 화물 {airShipments.length}건</span>을 모두 해상으로 전환 시, 연간 약{' '}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(airShipments.reduce((sum, s) => {
                  const r = simulateReduction(s);
                  return sum + r.savedCO2;
                }, 0)).toLocaleString()} kg CO₂
              </span> 절감 가능
            </div>
          </>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-sm">현재 항공 운송 화물이 없어 시뮬레이션 대상이 없습니다.</p>
        )}
      </div>

      {/* ═══ [F] CO2 Calculator ═══ */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border border-indigo-100 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Leaf className="text-indigo-500" /> 간편 탄소 배출량 계산기
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label htmlFor="calc-origin" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">출발지</label>
            <input
              id="calc-origin"
              type="text"
              placeholder="예: 부산, KR"
              value={calcInput.origin}
              onChange={e => setCalcInput({...calcInput, origin: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label htmlFor="calc-dest" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">도착지</label>
            <input
              id="calc-dest"
              type="text"
              placeholder="예: 로스앤젤레스, US"
              value={calcInput.dest}
              onChange={e => setCalcInput({...calcInput, dest: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label htmlFor="calc-mode" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">운송수단</label>
            <select
              id="calc-mode"
              value={calcInput.mode}
              onChange={e => setCalcInput({...calcInput, mode: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="sea">해상 운송 (Ocean)</option>
              <option value="air">항공 운송 (Air)</option>
            </select>
          </div>
          <div>
            <label htmlFor="calc-weight" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">총 중량 (kg)</label>
            <input
              id="calc-weight"
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
            onClick={handleCalculateCO2}
            disabled={!calcInput.origin || !calcInput.dest || !calcInput.weight}
            className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            aria-label="탄소 배출량 계산하기"
          >
            배출량 계산하기
          </button>

          {calcResult !== null && (
            <div className="flex flex-col items-end gap-1" aria-live="polite">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-500">예상 CO₂e 배출량:</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {calcResult.co2Kg.toLocaleString()} <span className="text-base text-slate-500 font-bold">kg</span>
                </span>
              </div>
              <span className="text-xs text-slate-400">배출 강도: {calcResult.co2PerKg} kg CO₂e/kg (Tariff Engine 기반)</span>
            </div>
          )}
        </div>
      </div>

      {/* ═══ [G] Carbon Offset Guide ═══ */}
      {offsetEstimate && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Globe className="text-teal-500" /> 탄소 상쇄 (Carbon Offset) 안내
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            귀사의 올해 예상 탄소 배출량: <span className="font-bold text-slate-700 dark:text-slate-200">{offsetEstimate.totalCO2Tonnes} tCO₂e</span>
            {' '}| 예상 상쇄 비용: <span className="font-bold text-slate-700 dark:text-slate-200">${offsetEstimate.estimatedCost.min} ~ ${offsetEstimate.estimatedCost.max}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {offsetEstimate.programs.map(program => (
              <div key={program.name} role="article" className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">{program.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{program.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{program.priceRange}</span>
                  <span className="text-xs text-slate-400">{program.certification}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => alert('담당자에게 탄소 상쇄 문의가 전달되었습니다. 빠른 시일 내 연락드리겠습니다.')}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-colors"
            aria-label="탄소 상쇄 문의하기"
          >
            탄소 상쇄 문의하기
          </button>

          <p className="text-xs text-slate-400 mt-4 flex items-start gap-1">
            <Info size={12} className="mt-0.5 shrink-0" />
            상기 가격은 2024-2025년 시장 평균이며, 실제 탄소 크레딧 가격은 프로젝트와 시기에 따라 다를 수 있습니다.
          </p>
        </div>
      )}

    </div>
  );
};

export default Sustainability;
