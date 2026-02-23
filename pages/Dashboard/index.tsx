import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import DashboardHome from './DashboardHome';
import Sustainability from './Sustainability';

const Shipments: React.FC = () => <div className="p-6">내 화물 관리 (준비 중)</div>;
const Quotes: React.FC = () => <div className="p-6">견적 / 예약 (준비 중)</div>;
const Settings: React.FC = () => <div className="p-6">환경 설정 (준비 중)</div>;

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navigation */}
        <Topbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
