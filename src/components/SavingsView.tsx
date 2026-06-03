'use client';

import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Minus, 
  Award
} from 'lucide-react';
import { MonthlyFinanceData, Fund } from '@/types';

interface SavingsViewProps {
  data: MonthlyFinanceData;
  onSaveFunds: (updatedFunds: Fund[]) => void;
  currencySymbol: string;
}

const SavingsView: React.FC<SavingsViewProps> = ({ 
  data, 
  onSaveFunds, 
  currencySymbol = '₹' 
}) => {
  const { funds = [], categories = [] } = data || {};

  // Contribution/Action state
  const [activeFundId, setActiveFundId] = useState<string>(funds[0]?.id || '');
  const [transactionAmount, setTransactionAmount] = useState<string>('');
  const [transactionType, setTransactionType] = useState<string>('add'); // add, subtract

  // New Fund state
  const [newFundName, setNewFundName] = useState<string>('');
  const [newFundTarget, setNewFundTarget] = useState<number>(10000);

  // Editing target state
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [editingTargetVal, setEditingTargetVal] = useState<string>('');

  // Handle contributed amount (manual adjustments to cumulative fund balance)
  const handleFundTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFundId || !transactionAmount) return;

    const amt = Number(transactionAmount);
    if (amt <= 0) return;

    const updatedFunds = funds.map((f) => {
      if (f.id === activeFundId) {
        const change = transactionType === 'add' ? amt : -amt;
        const newCurrent = Math.max(0, f.current + change);
        return { ...f, current: newCurrent };
      }
      return f;
    });

    onSaveFunds(updatedFunds);
    setTransactionAmount('');
  };

  // Add new savings fund
  const handleAddFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFundName.trim()) return;

    const newFund: Fund = {
      id: `fund-${Date.now()}`,
      name: newFundName.trim(),
      target: Number(newFundTarget) || 0,
      current: 0
    };

    onSaveFunds([...funds, newFund]);
    setNewFundName('');
    setNewFundTarget(10000);
  };

  // Delete savings fund
  const handleDeleteFund = (id: string) => {
    if (confirm('Are you sure you want to delete this savings goal?')) {
      const updated = funds.filter(f => f.id !== id);
      onSaveFunds(updated);
    }
  };

  // Save edited target
  const handleSaveTarget = (id: string) => {
    const updated = funds.map((f) => {
      if (f.id === id) {
        return { ...f, target: Number(editingTargetVal) || 0 };
      }
      return f;
    });
    onSaveFunds(updated);
    setEditingTargetId(null);
  };

  const formatCurrency = (val: number) => {
    return `${currencySymbol}${Number(val).toLocaleString('en-IN')}`;
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white">Savings Goals</h2>
        <p className="text-slate-400 text-[0.88rem] mt-1 font-inter">
          Define target milestones, simulate contributions, and monitor your accumulated savings.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: List of Goals */}
        <div className="flex flex-col gap-5 lg:col-span-7 order-last lg:order-first">
          {funds.map((fund) => {
            const progress = fund.target > 0 ? (fund.current / fund.target) * 100 : 0;
            const progressPercent = Math.min(100, Math.round(progress));
            const isCompleted = fund.current >= fund.target;
 
            // Monthly budget contribution
            let monthlyContribution = 0;
            if (fund.id === 'fund-emergency') {
              monthlyContribution = categories.find(c => c.id === 'emergency-savings')?.budget || 0;
            } else if (fund.id === 'fund-shopping') {
              monthlyContribution = categories.find(c => c.id === 'shopping-fund')?.budget || 0;
            } else if (fund.id === 'fund-travel') {
              monthlyContribution = categories.find(c => c.id === 'travel-fund')?.budget || 0;
            } else if (fund.id === 'fund-unexpected') {
              monthlyContribution = categories.find(c => c.id === 'unexpected-buffer')?.budget || 0;
            }
 
            let themeColor = '#22c55e'; // green
            let dashedBorderClass = 'border-emerald-500/30';
            if (fund.id === 'fund-shopping') {
              themeColor = '#f97316'; // orange
              dashedBorderClass = 'border-orange-500/30';
            }
            if (fund.id === 'fund-travel') {
              themeColor = '#3b82f6'; // blue
              dashedBorderClass = 'border-blue-500/30';
            }
            if (fund.id === 'fund-unexpected') {
              themeColor = '#a855f7'; // purple
              dashedBorderClass = 'border-purple-500/30';
            }
 
            return (
              <div key={fund.id} className="glass-card p-6 flex flex-col gap-5 transition-all duration-300 hover:scale-[1.005]">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="flex gap-3.5 items-center">
                    <div className={`bg-white/2 border border-dashed rounded-xl p-2.5 flex items-center justify-center ${dashedBorderClass}`}>
                      <Target size={22} style={{ color: themeColor }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-100">{fund.name}</span>
                        {isCompleted && (
                          <span className="flex items-center gap-1 bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full text-[0.68rem] font-bold">
                            <Award size={12} /> Achieved
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 mt-1 font-inter">
                        Monthly contribution: {formatCurrency(monthlyContribution)} / month
                      </span>
                    </div>
                  </div>
 
                  {/* Actions (Edit Target / Delete) */}
                  <div className="flex items-center gap-2.5">
                    {editingTargetId === fund.id ? (
                      <div className="flex gap-2 items-center">
                        <input 
                          type="number"
                          value={editingTargetVal}
                          onChange={(e) => setEditingTargetVal(e.target.value)}
                          className="form-input text-xs py-1 px-2 w-[90px]"
                        />
                        <button 
                          onClick={() => handleSaveTarget(fund.id)}
                          className="btn-primary text-xs py-1.5 px-3"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setEditingTargetId(fund.id);
                          setEditingTargetVal(String(fund.target));
                        }}
                        className="bg-white/3 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-300 cursor-pointer font-outfit transition-all hover:bg-white/8 hover:text-white"
                      >
                        Edit Target
                      </button>
                    )}
 
                    {/* Standard delete for user created goals */}
                    {fund.id !== 'fund-emergency' && fund.id !== 'fund-unexpected' && (
                      <button 
                        onClick={() => handleDeleteFund(fund.id)}
                        className="bg-transparent border-none text-red-500 cursor-pointer opacity-70 hover:opacity-100 hover:scale-105 transition-all text-xs font-semibold"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
 
                {/* Progress Indicators */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-baseline">
                    <div className="flex gap-1.5 items-baseline">
                      <span className="text-2xl font-black" style={{ color: themeColor }}>
                        {formatCurrency(fund.current)}
                      </span>
                      <span className="text-xs text-slate-400 font-inter">saved</span>
                    </div>
                    <span className="text-xs text-slate-400 font-inter">
                      Target: {formatCurrency(fund.target)} ({progressPercent}%)
                    </span>
                  </div>
 
                  <div className="progress-container h-2">
                    <div className="progress-fill shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ 
                       width: `${progressPercent}%`, 
                       backgroundColor: themeColor,
                    }}></div>
                  </div>
 
                  {/* Calculations - Months left */}
                  <div className="flex justify-between text-[0.75rem] text-slate-500 font-inter font-medium">
                    <span>
                      {isCompleted 
                        ? 'Milestone complete!' 
                        : `${formatCurrency(fund.target - fund.current)} remaining`}
                    </span>
                    <span>
                      {monthlyContribution > 0 && !isCompleted && (
                        `Est. time left: ${Math.ceil((fund.target - fund.current) / monthlyContribution)} months`
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
 
        {/* Right Column: Manage & Add Goals */}
        <div className="flex flex-col gap-6 lg:col-span-5 order-first lg:order-last w-full">
          
          {/* Quick contribution manager */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3 mb-4">
              Add/Withdraw Accumulated Funds
            </h3>
            
            <form onSubmit={handleFundTransaction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Select Savings Goal</label>
                <select
                  value={activeFundId}
                  onChange={(e) => setActiveFundId(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="" disabled className="bg-bg-card">Select goal...</option>
                  {funds.map(f => <option key={f.id} value={f.id} className="bg-bg-card">{f.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Transaction Type</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    className="form-select"
                  >
                    <option value="add" className="bg-bg-card">Contribute (+)</option>
                    <option value="subtract" className="bg-bg-card">Withdraw (-)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    className="form-input"
                    min="1"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary mt-2 w-full justify-center"
              >
                {transactionType === 'add' ? <Plus size={16} /> : <Minus size={16} />}
                Confirm Contribution
              </button>
            </form>
          </div>

          {/* Add custom savings goal */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3 mb-4">
              Create New Goal
            </h3>
            
            <form onSubmit={handleAddFund} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g., Buy a laptop, Downpayment, Wedding"
                  value={newFundName}
                  onChange={(e) => setNewFundName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Target Amount ({currencySymbol})</label>
                <input
                  type="number"
                  placeholder="10000"
                  value={newFundTarget}
                  onChange={(e) => setNewFundTarget(Number(e.target.value))}
                  className="form-input"
                  min="1"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-secondary mt-2 w-full justify-center bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
              >
                <Plus size={16} />
                Create Savings Goal
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default SavingsView;
