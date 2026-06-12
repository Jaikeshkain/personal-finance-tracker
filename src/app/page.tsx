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
  Settings as SettingsIcon,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { MonthlyFinanceData, Expense, Fund } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currency, setCurrency] = useState<string>('₹');
  
  // User Authentication States
  const [user, setUser] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
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
 
    // Quick connection check to determine isLocalMode and session status
    const checkConnectionAndSession = async () => {
      let isLocal = true;
      let sessionUser: string | null = null;
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check' })
        });
        const data = await res.json();
        isLocal = !!data.isLocalMode;
        setIsLocalMode(isLocal);
        sessionUser = data.sessionUser || null;
      } catch (e) {
        setIsLocalMode(true);
      }
 
      // Check persisted user session
      const cachedUser = localStorage.getItem('auth_user_session');
      if (isLocal) {
        if (cachedUser) {
          setUser(cachedUser);
        }
      } else {
        if (sessionUser) {
          setUser(sessionUser);
          localStorage.setItem('auth_user_session', sessionUser);
        } else {
          // Stale session or cookie expired: force logout on client
          setUser(null);
          localStorage.removeItem('auth_user_session');
        }
      }
      setIsCheckingAuth(false);
    };
 
    checkConnectionAndSession();
 
    // Register service worker only in production mode
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
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
    } else if ('serviceWorker' in navigator) {
      // In development mode, unregister any active service worker to prevent infinite caching loops
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success) {
              console.log('Stale PWA ServiceWorker unregistered successfully.');
            }
          });
        }
      });
    }
  }, []);

  // Fetch data whenever monthYear or user changes
  useEffect(() => {
    if (!user) return; // Wait until authenticated

    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/finance?monthYear=${activeMonthYear}&username=${user}&_t=${Date.now()}`);
        
        if (res.status === 401) {
          // HTTP-Only session expired or is invalid! Clear client session
          localStorage.removeItem('auth_user_session');
          setUser(null);
          showToast("Session expired. Please log in again.", "error");
          return;
        }

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
            // Find the most recent record for this user in local storage to carry over
            const userPrefix = `${user}_`;
            let prevKeys = Object.keys(currentDb)
              .filter(k => k.startsWith(userPrefix))
              .map(k => k.substring(userPrefix.length)) // gets YYYY-MM
              .filter(m => m < activeMonthYear)
              .sort((a, b) => b.localeCompare(a)); // sort descending

            let starter;
            if (prevKeys.length > 0) {
              const prevData = currentDb[`${user}_${prevKeys[0]}`];
              starter = {
                username: user,
                monthYear: activeMonthYear,
                income: prevData.income,
                categories: prevData.categories.map(c => ({
                  id: c.id,
                  name: c.name,
                  budget: c.budget,
                  type: c.type,
                  color: c.color
                })),
                expenses: [],
                funds: prevData.funds ? prevData.funds.map(f => ({
                  id: f.id,
                  name: f.name,
                  target: f.target,
                  current: f.current
                })) : []
              };
            } else {
              // Try to fallback to non-prefixed legacy keys (e.g. YYYY-MM)
              const fallbackKeys = Object.keys(currentDb)
                .filter(k => /^\d{4}-\d{2}$/.test(k))
                .filter(m => m < activeMonthYear)
                .sort((a, b) => b.localeCompare(a));

              if (fallbackKeys.length > 0) {
                const prevData = currentDb[fallbackKeys[0]];
                starter = {
                  username: user,
                  monthYear: activeMonthYear,
                  income: prevData.income,
                  categories: prevData.categories.map(c => ({
                    id: c.id,
                    name: c.name,
                    budget: c.budget,
                    type: c.type,
                    color: c.color
                  })),
                  expenses: [],
                  funds: prevData.funds ? prevData.funds.map(f => ({
                    id: f.id,
                    name: f.name,
                    target: f.target,
                    current: f.current
                  })) : []
                };
              } else {
                starter = { ...getStarterData(activeMonthYear), username: user };
              }
            }
            
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
        
        let cached = currentDb[cacheKey];
        if (!cached) {
          const userPrefix = `${user}_`;
          let prevKeys = Object.keys(currentDb)
            .filter(k => k.startsWith(userPrefix))
            .map(k => k.substring(userPrefix.length))
            .filter(m => m < activeMonthYear)
            .sort((a, b) => b.localeCompare(a));

          if (prevKeys.length > 0) {
            const prevData = currentDb[`${user}_${prevKeys[0]}`];
            cached = {
              username: user,
              monthYear: activeMonthYear,
              income: prevData.income,
              categories: prevData.categories.map(c => ({
                id: c.id,
                name: c.name,
                budget: c.budget,
                type: c.type,
                color: c.color
              })),
              expenses: [],
              funds: prevData.funds ? prevData.funds.map(f => ({
                id: f.id,
                name: f.name,
                target: f.target,
                current: f.current
              })) : []
            };
          } else {
            // Try to fallback to non-prefixed legacy keys (e.g. YYYY-MM)
            const fallbackKeys = Object.keys(currentDb)
              .filter(k => /^\d{4}-\d{2}$/.test(k))
              .filter(m => m < activeMonthYear)
              .sort((a, b) => b.localeCompare(a));

            if (fallbackKeys.length > 0) {
              const prevData = currentDb[fallbackKeys[0]];
              cached = {
                username: user,
                monthYear: activeMonthYear,
                income: prevData.income,
                categories: prevData.categories.map(c => ({
                  id: c.id,
                  name: c.name,
                  budget: c.budget,
                  type: c.type,
                  color: c.color
                })),
                expenses: [],
                funds: prevData.funds ? prevData.funds.map(f => ({
                  id: f.id,
                  name: f.name,
                  target: f.target,
                  current: f.current
                })) : []
              };
            } else {
              cached = { ...getStarterData(activeMonthYear), username: user };
            }
          }
        }
        setActiveData(cached);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMonthYear, user]);

  // Save changes (from children controllers)
  const handleSaveData = async (updatedFields: Partial<MonthlyFinanceData>, silent = false) => {
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

    if (!silent) {
      if ('categories' in updatedFields) {
        const oldCategories = activeData.categories || [];
        const newCategories = updatedFields.categories || [];
        if (newCategories.length > oldCategories.length) {
          showToast("Category added successfully!", "success");
        } else if (newCategories.length < oldCategories.length) {
          showToast("Category deleted successfully!", "success");
        } else {
          showToast("Categories updated successfully!", "success");
        }
      } else if ('expenses' in updatedFields) {
        const oldExpenses = activeData.expenses || [];
        const newExpenses = updatedFields.expenses || [];
        if (newExpenses.length > oldExpenses.length) {
          showToast("Expense logged successfully!", "success");
        } else if (newExpenses.length < oldExpenses.length) {
          showToast("Expense deleted successfully!", "success");
        } else {
          showToast("Expenses updated successfully!", "success");
        }
      } else if ('funds' in updatedFields) {
        showToast("Savings goals updated successfully!", "success");
      } else if ('income' in updatedFields) {
        showToast("Salary updated successfully!", "success");
      } else {
        showToast("Changes saved successfully!", "success");
      }
    }

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
        showToast("Database offline. Saved locally.", "info");
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
    handleSaveData(starter, true);
    showToast(`Sample mock data populated for ${activeMonthYear}!`, "success");
  };

  // Utilities: Hard Reset Database
  const handleResetData = async () => {
    if (confirm('CRITICAL WARNING: This will permanently wipe all local database records! This action cannot be undone. Proceed?')) {
      localStorage.removeItem('local_finance_db');
      setLocalDatabase({});
      
      const starter = { ...getStarterData(activeMonthYear), username: user || 'guest' };
      setActiveData(starter);
      
      // Save blank starter using Cache Key
      const cacheKey = `${user || 'guest'}_${activeMonthYear}`;
      const db = { [cacheKey]: starter };
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

      showToast("Database reset successful.", "success");
    }
  };

  // Utilities: Restore JSON Backup
  const handleImportBackup = (backupObj: Record<string, MonthlyFinanceData>) => {
    setLocalDatabase(backupObj);
    localStorage.setItem('local_finance_db', JSON.stringify(backupObj));
    
    // Set active month data if found in uploader (check cache key with user, or fallback)
    const cacheKey = `${user || 'guest'}_${activeMonthYear}`;
    if (backupObj[cacheKey]) {
      setActiveData(backupObj[cacheKey]);
    } else if (backupObj[activeMonthYear]) {
      setActiveData(backupObj[activeMonthYear]);
    } else {
      // Pick first available month from backup
      const keys = Object.keys(backupObj);
      if (keys.length > 0) {
        const firstKey = keys[0];
        const monthYearPart = firstKey.includes('_') ? firstKey.split('_')[1] : firstKey;
        const parts = monthYearPart.split('-');
        if (parts.length === 2) {
          const [bYear, bMonth] = parts;
          setYear(bYear);
          setMonth(bMonth);
        }
        setActiveData(backupObj[firstKey]);
      }
    }
    showToast("Backup imported successfully!", "success");
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
        className="main-content flex-1 relative overflow-x-hidden"
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

      {/* Dynamic Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-md shadow-lg shadow-black/60 animate-fade-in-up transition-all duration-300 font-outfit ${
          toast.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : toast.type === 'error'
            ? 'bg-red-500/10 border-red-500/20 text-red-400'
            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
        }`}>
          {toast.type === 'success' && <CheckCircle size={16} />}
          {toast.type === 'error' && <AlertTriangle size={16} />}
          {toast.type === 'info' && <Info size={16} />}
          <span className="text-xs font-bold uppercase tracking-wider">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
