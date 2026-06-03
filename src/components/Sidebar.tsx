'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  PiggyBank, 
  TrendingUp, 
  FileText, 
  Settings, 
  CreditCard,
  Target
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'budget', label: 'Budget', icon: PiggyBank },
    { id: 'expenses', label: 'Expenses', icon: CreditCard },
    { id: 'savings', label: 'Savings Goals', icon: Target },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex w-[260px] h-screen bg-bg-sidebar border-r border-white/5 flex-col justify-between p-6 flex-shrink-0 z-10">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3 py-2 mb-8">
          <div className="bg-gradient-to-br from-purple-600 to-violet-500 rounded-xl p-2 flex items-center justify-center shadow-lg shadow-purple-500/25 transition-transform duration-300 hover:scale-105">
            <TrendingUp size={20} color="#ffffff" />
          </div>
          <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent uppercase font-outfit">
            My Finance
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-none cursor-pointer text-[0.95rem] text-left transition-all duration-300 font-outfit ${
                  isActive 
                    ? 'bg-purple-500/15 text-slate-50 font-semibold shadow-[inset_0_0_0_1px_rgba(168,85,247,0.25)]' 
                    : 'text-slate-400 hover:bg-white/3 hover:text-slate-100 hover:translate-x-1'
                }`}
              >
                <Icon 
                  size={18} 
                  className={`transition-colors duration-300 ${
                    isActive ? 'text-purple-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Promotional Card */}
      <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/40 border border-purple-500/15 rounded-2xl p-5 flex flex-col gap-3 shadow-[inset_0_0_20px_rgba(124,58,237,0.05)] transition-all duration-300 hover:border-purple-500/25">
        <div className="text-[0.9rem] font-medium leading-relaxed text-slate-100 font-outfit">
          Discipline Today<br />
          Freedom Tomorrow.
        </div>
        <div className="text-emerald-400 text-[0.85rem] font-semibold flex items-center gap-2 font-outfit">
          <span className="inline-block width-[6px] height-[6px] rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse w-1.5 h-1.5"></span>
          Stay consistent!
        </div>
        <div className="self-center mt-2 opacity-80 hover:opacity-100 transition-opacity duration-300">
          {/* A plant leaf shape SVG */}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3C12 3 8 7 8 11C8 13.2091 9.79086 15 12 15C14.2091 15 16 13.2091 16 11C16 7 12 3 12 3Z" fill="#34d399" fillOpacity="0.2"/>
            <path d="M12 3V21" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M12 11C13.5 9.5 16.5 9 18 10C18 10 17 12 14.5 12.5C13.5 12.7 12 12 12 12" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 14C10.5 12.5 7.5 12 6 13C6 13 7 15 9.5 15.5C10.5 15.7 12 15 12 15" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 7.5C13.2 6.5 15.5 6.2 16.5 7C16.5 7 15.8 8.5 14 8.8C13.2 9 12 8.5 12 8.5" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
