import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Truck, FileCheck, CheckCircle2, TrendingUp, TrendingDown, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getShipments } from '../../lib/api';
import { calculateAllShipmentsCO2, calculateESGScore } from '../../lib/co2';

const mockData = [
  { name: '1월', imports: 4000, exports: 2400 },
  { name: '2월', imports: 3000, exports: 1398 },
  { name: '3월', imports: 2000, exports: 9800 },
  { name: '4월', imports: 2780, exports: 3908 },
  { name: '5월', imports: 1890, exports: 4800 },
  { name: '6월', imports: 2390, exports: 3800 },
];

const DashboardHome: React.FC = () => {
  const [monthlyCO2, setMonthlyCO2] = useState<number>(2450);
  const [esgGrade, setEsgGrade] = useState<string>('A');

  useEffect(() => {
    getShipments().then(shipments => {
      const co2s = calculateAllShipmentsCO2(shipments);
      const total = co2s.reduce((sum, s) => sum + s.co2Kg, 0);
      setMonthlyCO2(Math.round(total));
      const score = calculateESGScore(co2s);
      setEsgGrade(score.grade);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome & Stats */}
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">대시보드 요약</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '진행 중인 화물', value: '12', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: '통관 대기', value: '3', icon: FileCheck, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: '이번 달 완료건', value: '28', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: '새로운 견적 회신', value: '1', icon: Package, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 lg:col-span-2 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">월별 물동량 추이 (TEU)</h3>
            <select className="text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-0 cursor-pointer">
              <option>2024년</option>
              <option>2023년</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorImports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="imports" name="수입" stroke="#3b82f6" fillOpacity={1} fill="url(#colorImports)" />
                <Area type="monotone" dataKey="exports" name="수출" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorExports)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ESG Widget */}
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-teal-100 dark:border-teal-800/50 flex flex-col justify-between shadow-sm">
          <div>
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mb-4">
              <Leaf size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">ESG 탄소 배출량 리포트</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">이번 달 귀사의 화물 운송으로 발생한 예상 탄소 배출량입니다.</p>
            
            <div className="mb-4">
              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-black text-teal-700 dark:text-teal-400">{monthlyCO2.toLocaleString()}</span>
                <span className="text-slate-500 font-bold mb-1">kg CO₂e</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                <TrendingDown size={14} /> Tariff Engine 기반 산출
              </div>
            </div>
            <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-bold">
              ESG 등급: {esgGrade}
            </div>
          </div>

          <Link to="/dashboard/sustainability" className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition-colors text-center">
            상세 리포트 보기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
