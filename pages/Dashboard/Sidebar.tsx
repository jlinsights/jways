import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, Leaf, Settings, LogOut } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: '대시보드 홈', path: '/dashboard', icon: LayoutDashboard },
    { name: '내 화물 관리', path: '/dashboard/shipments', icon: Package },
    { name: '견적 / 예약', path: '/dashboard/quotes', icon: FileText },
    { name: 'ESG 탄소 리포트', path: '/dashboard/sustainability', icon: Leaf },
    { name: '환경 설정', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col h-full shrink-0">
      <div className="p-6 shrink-0">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-jways-blue to-indigo-600 text-transparent bg-clip-text flex items-center gap-2">
           <div className="w-8 h-8 bg-jways-blue rounded-tr-xl rounded-bl-xl flex items-center justify-center">
             <span className="text-white font-bold text-lg">J</span>
           </div>
           J-Ways
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
             key={item.path}
             to={item.path}
             end={item.path === '/dashboard'}
             className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                     ? 'bg-blue-50 dark:bg-blue-900/20 text-jways-blue dark:text-blue-400' 
                     : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`
             }
          >
             <item.icon size={20} />
             {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 shrink-0 border-t border-slate-200 dark:border-slate-800">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
          <LogOut size={20} />
          로그아웃
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
