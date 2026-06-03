'use client';

import React from 'react';
import { 
  Settings, 
  Database, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Layers,
  Download,
  User,
  LogOut
} from 'lucide-react';

interface SettingsViewProps {
  user: string | null;
  onLogout: () => void;
  isLocalMode: boolean;
  onPopulateMockData: () => void;
  onResetData: () => void;
  currency: string;
  setCurrency: (sym: string) => void;
  isInstallable?: boolean;
  onInstallApp?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  user,
  onLogout,
  isLocalMode, 
  onPopulateMockData, 
  onResetData, 
  currency, 
  setCurrency,
  isInstallable = false,
  onInstallApp
}) => {
  
  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in-up">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white">Settings</h2>
        <p className="text-slate-400 text-[0.88rem] mt-1 font-inter">
          Configure application variables, manage database states, and customize local preference defaults.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        
        {/* Card: User Session details */}
        {user && (
          <div className="glass-card p-6 flex flex-col gap-5 animate-fade-in-up">
            <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3 flex items-center gap-2">
              <User size={18} className="text-purple-400" />
              Account Session
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3.5 bg-white/3 border border-white/5 rounded-xl p-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20 uppercase text-lg">
                  {user.slice(0, 2)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[1.05rem] font-bold text-slate-100 truncate font-outfit">
                    {user}
                  </span>
                  <span className="text-xs text-slate-400 font-inter">
                    Logged in as member
                  </span>
                </div>
              </div>

              <div className="text-[0.72rem] text-slate-500 font-inter leading-relaxed">
                You are currently signed in. Rest assured, your data is securely isolated under your personal profile identifier.
              </div>

              <button 
                onClick={onLogout}
                className="btn-danger w-full justify-center gap-2 py-3 mt-1 hover:shadow-[0_4px_15px_rgba(239,68,68,0.25)]"
              >
                <LogOut size={16} />
                Sign Out of Session
              </button>
            </div>
          </div>
        )}

        {/* Card 1: Configuration Preferences */}
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3 flex items-center gap-2">
            <Settings size={18} className="text-purple-400" />
            General Preferences
          </h3>

          {/* Currency selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Active Currency Symbol</label>
            <p className="text-[0.72rem] text-slate-500 font-inter mb-1 leading-normal">
              Select the prefix symbol used across all cards, sliders, and charts.
            </p>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="form-select text-[0.9rem] bg-slate-950"
            >
              <option value="₹" className="bg-bg-card">₹ (INR - Indian Rupee)</option>
              <option value="$" className="bg-bg-card">$ (USD - United States Dollar)</option>
              <option value="€" className="bg-bg-card">€ (EUR - Euro)</option>
              <option value="£" className="bg-bg-card">£ (GBP - British Pound)</option>
              <option value="¥" className="bg-bg-card">¥ (JPY - Japanese Yen)</option>
            </select>
          </div>

          <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4 text-[0.82rem] leading-relaxed text-slate-300 font-inter">
            <div className="flex gap-2.5 items-start">
              <Info size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Aesthetic Mode: Deep Dark Glassmorphism</strong><br />
                The application UI is styled automatically with responsive cards, glossy gradients, and glowing indicators. Contrast is optimized for night tracking.
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Database Connection Status */}
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3 flex items-center gap-2">
            <Database size={18} className={isLocalMode ? 'text-amber-400' : 'text-emerald-400'} />
            Database Connection
          </h3>

          <div className="flex flex-col gap-3">
            <span className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Status:</span>
            
            {!isLocalMode ? (
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 flex items-center gap-3.5 transition-all duration-300 hover:border-emerald-500/25">
                <CheckCircle size={22} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-[0.88rem] font-bold text-emerald-400">
                    MongoDB Atlas Connected
                  </div>
                  <div className="text-[0.72rem] text-slate-400 mt-1 font-inter leading-normal">
                    Data is securely synced with your remote MongoDB Atlas Cluster database.
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3.5 transition-all duration-300 hover:border-amber-500/25">
                <AlertTriangle size={22} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[0.88rem] font-bold text-amber-400">
                    Running in Local Mode
                  </div>
                  <div className="text-[0.72rem] text-slate-400 mt-1 font-inter leading-relaxed">
                    No database connection string detected. The app is falling back to your browser's local storage.
                  </div>
                  <div className="text-[0.68rem] text-slate-500 mt-2.5 border-t border-white/5 pt-2.5 font-inter">
                    <strong>To connect MongoDB:</strong> Create a <code className="text-purple-400 font-bold">.env.local</code> file in the project root and add:<br />
                    <code className="block p-2 bg-slate-950/80 border border-white/5 rounded-lg mt-1.5 overflow-x-auto text-[0.62rem] text-slate-300">
                      MONGODB_URI=mongodb+srv://...
                    </code>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: System Utilities */}
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3 flex items-center gap-2">
            <Layers size={18} className="text-orange-400" />
            Database Utilities
          </h3>

          <div className="flex flex-col gap-4">
            {/* Populate mock data button */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Pre-populate Database</span>
              <p className="text-[0.72rem] text-slate-500 font-inter leading-normal">
                Quickly populate the current month with sample data (matching the ₹28,200 mockup layout) for instant testing.
              </p>
              <button 
                onClick={onPopulateMockData}
                className="btn-secondary justify-center gap-2 mt-1 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40"
              >
                <RefreshCw size={14} />
                Populate Starter Mock Data
              </button>
            </div>

            {/* Clear Database button */}
            <div className="border-t border-white/5 pt-4 flex flex-col gap-1.5">
              <span className="text-[0.78rem] text-red-500 font-bold uppercase tracking-wide">Danger Zone</span>
              <p className="text-[0.72rem] text-slate-500 font-inter leading-normal">
                Irreversibly erase all stored monthly budgets, customized categories, logged transaction histories, and savings goals.
              </p>
              <button 
                onClick={onResetData}
                className="btn-danger justify-center gap-2 mt-1"
              >
                <Trash2 size={14} />
                Hard Reset Application Data
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: PWA App Installation */}
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3 flex items-center gap-2">
            <Download size={18} className="text-purple-400" />
            Install App on Device
          </h3>

          <div className="flex flex-col gap-4">
            <p className="text-[0.72rem] text-slate-500 font-inter leading-relaxed">
              Run My Finance Tracker as a standalone native application on your phone, tablet, or PC. This removes browser headers, enables local offline speed, and adds an app icon to your home screen.
            </p>

            {isInstallable ? (
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 flex flex-col gap-3 transition-all duration-300 hover:border-emerald-500/25">
                <div className="text-[0.88rem] font-bold text-emerald-400 flex items-center gap-1.5 font-outfit">
                  <CheckCircle size={16} /> App Install Ready
                </div>
                <button
                  onClick={onInstallApp}
                  className="btn-primary justify-center gap-2 w-full hover:shadow-[0_4px_20px_rgba(168,85,247,0.35)]"
                >
                  <Download size={16} />
                  Install App Natively
                </button>
              </div>
            ) : (
              <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 flex flex-col gap-2 font-inter">
                <span className="text-[0.78rem] font-bold text-slate-300">How to Install manually:</span>
                <ul className="text-[0.72rem] text-slate-400 list-disc pl-4 flex flex-col gap-1.5 leading-normal">
                  <li><strong>On Chrome/Edge:</strong> Click the <strong className="text-purple-400">Install icon</strong> in your browser address bar.</li>
                  <li><strong>On Android (Chrome):</strong> Open the menu and select <strong className="text-purple-400">"Install app"</strong>.</li>
                  <li><strong>On iOS (Safari):</strong> Tap the share icon <strong className="text-purple-400">"Share"</strong> and select <strong className="text-purple-400">"Add to Home Screen"</strong>.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default SettingsView;
