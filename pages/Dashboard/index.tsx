import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import DashboardHome from './DashboardHome';
import Sustainability from './Sustainability';
import Shipments from './Shipments';
import Quotes from './Quotes';
import Documents from './Documents';
import Billing from './Billing';
import Settings from './Settings';

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
            <Route path="/documents" element={<Documents />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
