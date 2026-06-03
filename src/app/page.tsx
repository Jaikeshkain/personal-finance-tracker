'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardView from '@/components/DashboardView';
import BudgetView from '@/components/BudgetView';
import ExpensesView from '@/components/ExpensesView';
import SavingsView from '@/components/SavingsView';
import ReportsView from '@/components/ReportsView';
import SettingsView from '@/components/SettingsView';
import LoginView from '@/components/LoginView';
import { getStarterData } from '@/lib/initialData';
import { 
  Loader2, 
  Database, 
  LayoutDashboard, 
  PiggyBank, 
  CreditCard, 
  Target, 
  FileText, 
  Settings as SettingsIcon 
} from 'lucide-react';
import { MonthlyFinanceData, Expense, Fund } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currency, setCurrency] = useState<string>('₹');
  
  // User Authentication States
  const [user, setUser] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  
  // Scroll Tracking States
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [showMobileBars, setShowMobileBars] = useState<boolean>(true);
  const [scrollY, setScrollY] = useState<number>(0);
  const lastScrollTop = React.useRef<number>(0);

  // Scroll Event Handler for Parallax Glows, Sticky Blur, and Hide-on-scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const currentScrollTop = target.scrollTop;
    setScrollY(currentScrollTop);

    // Toggle Mobile Header & Bottom bar hide/reveal on scroll direction
    if (currentScrollTop > lastScrollTop.current && currentScrollTop > 80) {
      // Scrolling down - hide bars
      setShowMobileBars(false);
    } else {
      // Scrolling up - show bars
      setShowMobileBars(true);
    }
    lastScrollTop.current = currentScrollTop;

    // Track scroll blur condition
    setIsScrolled(currentScrollTop > 10);

    // Track scroll progress indicator
    const totalHeight = target.scrollHeight - target.clientHeight;
    if (totalHeight > 0) {
      setScrollProgress((currentScrollTop / totalHeight) * 100);
    } else {
      setScrollProgress(0);
    }
  };

  // Reset scroll details when tab changes
  useEffect(() => {
    const mainContainer = document.querySelector('.main-content');
    if (mainContainer) {
      mainContainer.scrollTop = 0;
    }
    setScrollProgress(0);
    setIsScrolled(false);
    setShowMobileBars(true);
    setScrollY(0);
    lastScrollTop.current = 0;
  }, [activeTab]);

  // Date Filters
  const [month, setMonth] = useState<string>('06');
  const [year, setYear] = useState<string>('2026');
  const activeMonthYear = `${year}-${month}`;

  // Application Data States
  const [activeData, setActiveData] = useState<MonthlyFinanceData | null>(null);
  const [isLocalMode, setIsLocalMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Local Database Cache (holding all months)
  const [localDatabase, setLocalDatabase] = useState<Record<string, MonthlyFinanceData>>({});

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User installation prompt selection: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem('auth_user_session');
    setUser(null);

    if (!isLocalMode) {
      try {
        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout' })
        });
      } catch (e) {
        console.error('Failed remote logout:', e);
      }
    }
  };

  // Initialize user auth state and check DB connection
  useEffect(() => {
    // Read local storage settings
    const cachedCurrency = localStorage.getItem('currency_pref');
    if (cachedCurrency) setCurrency(cachedCurrency);
 
    const cachedDB = localStorage.getItem('local_finance_db');
    if (cachedDB) {
      try {
        setLocalDatabase(JSON.parse(cachedDB));
      } catch (e) {
        console.error('Failed to parse local cached DB', e);
      }
    }
 
    // Quick connection check to determine isLocalMode
    const checkConnectionAndSession = async () => {
      let isLocal = true;
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check' })
        });
        const data = await res.json();
        isLocal = !!data.isLocalMode;
        setIsLocalMode(isLocal);
      } catch (e) {
        setIsLocalMode(true);
      }
 
      // Check persisted user session
      const cachedUser = localStorage.getItem('auth_user_session');
      if (cachedUser) {
        setUser(cachedUser);
      }
      setIsCheckingAuth(false);
    };
 
    checkConnectionAndSession();
 
    // Register service worker for Progressive Web App capabilities
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('PWA ServiceWorker registered with scope:', registration.scope);
          },
          (err) => {
            console.error('PWA ServiceWorker registration failed:', err);
          }
        );
      });
    }
  }, []);

  // Fetch data whenever monthYear or user changes
  useEffect(() => {
    if (!user) return; // Wait until authenticated

    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/finance?monthYear=${activeMonthYear}&username=${user}`);
        const result = await res.json();
        
        setIsLocalMode(result.isLocalMode);

        const cacheKey = `${user}_${activeMonthYear}`;

        if (result.isLocalMode) {
          // Local Mode fallback: Read from localStorage or initial template
          const dbStr = localStorage.getItem('local_finance_db');
          let currentDb: Record<string, MonthlyFinanceData> = {};
          if (dbStr) {
            try {
              currentDb = JSON.parse(dbStr);
            } catch (e) {
              console.error(e);
            }
          }
          
          if (currentDb[cacheKey]) {
            setActiveData(currentDb[cacheKey]);
          } else {
            // No record for this month in local storage, use starter template
            const starter = { ...getStarterData(activeMonthYear), username: user };
            setActiveData(starter);
            
            // Save it in local DB
            currentDb[cacheKey] = starter;
            setLocalDatabase(currentDb);
            localStorage.setItem('local_finance_db', JSON.stringify(currentDb));
          }
        } else {
          // Connected Mode: Use API response data
          setActiveData(result.data);
          
          // Mirror in localStorage cache
          const dbStr = localStorage.getItem('local_finance_db');
          let currentDb: Record<string, MonthlyFinanceData> = dbStr ? JSON.parse(dbStr) : {};
          currentDb[cacheKey] = result.data;
          setLocalDatabase(currentDb);
          localStorage.setItem('local_finance_db', JSON.stringify(currentDb));
        }
      } catch (err) {
        console.error('Data fetch error:', err);
        // Fail-safe local fallback
        setIsLocalMode(true);
        const dbStr = localStorage.getItem('local_finance_db');
        let currentDb: Record<string, MonthlyFinanceData> = {};
        if (dbStr) {
          try {
            currentDb = JSON.parse(dbStr);
          } catch (e) {
            console.error(e);
          }
        }
        const cacheKey = `${user}_${activeMonthYear}`;
        const cached = currentDb[cacheKey] || { ...getStarterData(activeMonthYear), username: user };
        setActiveData(cached);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMonthYear, user]);

  // Save changes (from children controllers)
  const handleSaveData = async (updatedFields: Partial<MonthlyFinanceData>) => {
    if (!activeData || !user) return;
    
    const updated = {
      ...activeData,
      ...updatedFields,
      username: user
    } as MonthlyFinanceData;

    // Optimistic local update
    setActiveData(updated);
    const cacheKey = `${user}_${activeMonthYear}`;
    const newDb = {
      ...localDatabase,
      [cacheKey]: updated
    };
    setLocalDatabase(newDb);
    localStorage.setItem('local_finance_db', JSON.stringify(newDb));

    // Save to Remote MongoDB if connected
    if (!isLocalMode) {
      try {
        const res = await fetch('/api/finance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        const result = await res.json();
        if (result.isLocalMode) {
          setIsLocalMode(true);
        }
      } catch (err) {
        console.error('Failed to sync changes with MongoDB:', err);
        setIsLocalMode(true); // Fallback to local indicator
      }
    }
  };

  // Sync currency symbol changes
  const handleCurrencyChange = (newSym: string) => {
    setCurrency(newSym);
    localStorage.setItem('currency_pref', newSym);
  };

  // Utilities: Populate Sample Data
  const handlePopulateMockData = () => {
    const starter = getStarterData(activeMonthYear);
    handleSaveData(starter);
    alert('Mock starter data populated for ' + activeMonthYear);
  };

  // Utilities: Hard Reset Database
  const handleResetData = async () => {
    if (confirm('CRITICAL WARNING: This will permanently wipe all local database records! This action cannot be undone. Proceed?')) {
      localStorage.removeItem('local_finance_db');
      setLocalDatabase({});
      
      const starter = getStarterData(activeMonthYear);
      setActiveData(starter);
      
      // Save blank starter
      const db = { [activeMonthYear]: starter };
      setLocalDatabase(db);
      localStorage.setItem('local_finance_db', JSON.stringify(db));

      // Attempt to clear remote MongoDB if connected
      if (!isLocalMode) {
        try {
          await fetch('/api/finance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(starter)
          });
        } catch (e) {
          console.error(e);
        }
      }

      alert('Database reset successful.');
    }
  };

  // Utilities: Restore JSON Backup
  const handleImportBackup = (backupObj: Record<string, MonthlyFinanceData>) => {
    setLocalDatabase(backupObj);
    localStorage.setItem('local_finance_db', JSON.stringify(backupObj));
    
    // Set active month data if found in uploader
    if (backupObj[activeMonthYear]) {
      setActiveData(backupObj[activeMonthYear]);
    } else {
      // Pick first available month from backup
      const months = Object.keys(backupObj);
      if (months.length > 0) {
        const [bYear, bMonth] = months[0].split('-');
        setYear(bYear);
        setMonth(bMonth);
        setActiveData(backupObj[months[0]]);
      }
    }
  };

  // View Router
  const renderActiveView = () => {
    if (isLoading || !activeData) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 h-[60vh] text-slate-400 gap-3">
          <Loader2 size={36} className="animate-spin text-purple-400" />
          <span className="text-[0.95rem] font-outfit">
            Retrieving financial records...
          </span>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            data={activeData} 
            month={month}
            setMonth={setMonth}
            year={year}
            setYear={setYear}
            currencySymbol={currency}
          />
        );
      case 'budget':
        return (
          <BudgetView 
            data={activeData} 
            onSave={(budgetFields) => handleSaveData(budgetFields)} 
            currencySymbol={currency}
          />
        );
      case 'expenses':
        return (
          <ExpensesView 
            data={activeData} 
            onSaveExpenses={(updatedExpenses: Expense[]) => handleSaveData({ expenses: updatedExpenses })}
            currencySymbol={currency}
          />
        );
      case 'savings':
        return (
          <SavingsView 
            data={activeData} 
            onSaveFunds={(updatedFunds: Fund[]) => handleSaveData({ funds: updatedFunds })}
            currencySymbol={currency}
          />
        );
      case 'reports':
        return (
          <ReportsView 
            data={activeData} 
            fullDB={localDatabase}
            onImportBackup={handleImportBackup}
            currencySymbol={currency}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            user={user}
            onLogout={handleLogout}
            isLocalMode={isLocalMode}
            onPopulateMockData={handlePopulateMockData}
            onResetData={handleResetData}
            currency={currency}
            setCurrency={handleCurrencyChange}
            isInstallable={isInstallable}
            onInstallApp={handleInstallApp}
          />
        );
      default:
        return <div>View not found</div>;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'budget', label: 'Budget', icon: PiggyBank },
    { id: 'expenses', label: 'Expenses', icon: CreditCard },
    { id: 'savings', label: 'Savings', icon: Target },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-bg-app text-slate-400 gap-3 font-outfit z-50">
        <Loader2 size={40} className="animate-spin text-purple-500" />
        <span className="text-[0.95rem] tracking-wide">Checking session authorization...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginView 
        onLoginSuccess={(username) => {
          setUser(username);
          localStorage.setItem('auth_user_session', username);
        }} 
        isLocalMode={isLocalMode} 
      />
    );
  }

  return (
    <div className="app-container flex-col lg:flex-row">
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 z-50 transition-all duration-100 ease-out shadow-[0_0_8px_rgba(168,85,247,0.8)]"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Mobile Top Bar */}
      <header className={`flex lg:hidden items-center justify-between px-5 py-4 z-25 transition-all duration-300 w-full flex-shrink-0 fixed top-0 left-0 right-0 ${
        isScrolled 
          ? 'bg-bg-sidebar/95 border-b border-white/10 shadow-lg shadow-black/40 backdrop-blur-md' 
          : 'bg-bg-sidebar border-b border-white/5 shadow-none'
      } ${
        showMobileBars ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <span className="text-xl font-black bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent font-outfit uppercase tracking-wider">
          My Finance
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
            <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[0.55rem] font-bold text-white uppercase">
              {user.slice(0, 2)}
            </div>
            <span className="text-[0.7rem] font-medium text-slate-300 truncate max-w-[70px]">
              {user}
            </span>
          </div>
          <div className={`flex items-center gap-1.5 text-[0.68rem] font-bold px-2 py-1 rounded-full border ${
            isLocalMode 
              ? 'text-amber-400 bg-amber-500/5 border-amber-500/15' 
              : 'text-emerald-400 bg-emerald-500/5 border-emerald-500/15'
          }`}>
            <Database size={10} />
            <span>{isLocalMode ? 'LOCAL' : 'MONGO'}</span>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />

      {/* Main Panel View */}
      <main 
        onScroll={handleScroll}
        className="main-content flex-1 h-auto lg:h-screen pt-20 lg:pt-8 relative overflow-x-hidden"
      >
        {/* Dynamic Parallax Glow Backgrounds */}
        <div 
          className="absolute w-[300px] h-[300px] rounded-full bg-purple-600/5 blur-[100px] pointer-events-none transition-transform duration-500 ease-out"
          style={{ 
            top: '15%', 
            left: '10%',
            transform: `translateY(${scrollY * -0.1}px)` 
          }}
        />
        <div 
          className="absolute w-[350px] h-[350px] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none transition-transform duration-500 ease-out"
          style={{ 
            bottom: '20%', 
            right: '10%',
            transform: `translateY(${scrollY * 0.05}px)` 
          }}
        />
        
        {/* Sync Indicator Banner - Desktop Only */}
        <div className={`hidden lg:flex items-center gap-1.5 text-[0.72rem] font-bold px-3.5 py-1 rounded-full absolute top-4 right-8 z-5 border transition-all duration-300 ${
          isScrolled ? 'opacity-40 hover:opacity-100' : 'opacity-100'
        } ${
          isLocalMode 
            ? 'text-amber-400 bg-amber-500/5 border-amber-500/15' 
            : 'text-emerald-400 bg-emerald-500/5 border-emerald-500/15'
        }`}>
          <Database size={10} />
          <span>{isLocalMode ? 'LOCAL STORAGE MODE' : 'MONGO ATLAS SYNCED'}</span>
        </div>

        {renderActiveView()}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className={`flex lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg-sidebar border-t border-white/5 items-center justify-around px-2 z-25 shadow-lg shadow-black/80 backdrop-blur-md transition-all duration-300 ${
        showMobileBars ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl transition-all duration-300 ${
                isActive ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={18} className={isActive ? 'scale-110 text-purple-400' : 'text-slate-400'} />
              <span className="text-[0.62rem] font-medium font-outfit truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
