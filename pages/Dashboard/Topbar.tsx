import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Topbar: React.FC = () => {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0">
      <div className="flex-1 max-w-md hidden md:flex items-center gap-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="화물 번호 검색..." 
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-jways-blue/20"
          />
        </div>
      </div>
      <div className="flex-1 md:hidden">
        <span className="font-bold text-lg text-slate-900 dark:text-white">화주 포털</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:text-jways-blue transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-slate-900 dark:text-white">홍길동 고객님</p>
            <p className="text-xs text-slate-500">삼성전자 (주)</p>
          </div>
          <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/40 text-jways-blue rounded-full flex items-center justify-center font-bold">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
