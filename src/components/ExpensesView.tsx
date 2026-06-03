'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  AlertTriangle,
  Flame
} from 'lucide-react';
import { MonthlyFinanceData, Expense } from '@/types';

interface ExpensesViewProps {
  data: MonthlyFinanceData;
  onSaveExpenses: (updatedExpenses: Expense[]) => void;
  currencySymbol: string;
}

const ExpensesView: React.FC<ExpensesViewProps> = ({ 
  data, 
  onSaveExpenses, 
  currencySymbol = '₹' 
}) => {
  const { categories = [], expenses = [] } = data || {};

  // Form state
  const [desc, setDesc] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [catId, setCatId] = useState<string>(categories[0]?.id || '');
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [isUnexpected, setIsUnexpected] = useState<boolean>(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterUnexpected, setFilterUnexpected] = useState<string>('all'); // all, normal, unexpected

  // Handle adding expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !amount || !catId) return;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      description: desc.trim(),
      amount: Number(amount) || 0,
      categoryId: catId,
      date,
      isUnexpected: !!isUnexpected
    };

    onSaveExpenses([...expenses, newExpense]);

    // Reset Form
    setDesc('');
    setAmount('');
    setIsUnexpected(false);
  };

  // Handle deleting expense
  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(exp => exp.id !== id);
    onSaveExpenses(updated);
  };

  // Calculations: Spent per category
  const spentByCategory = categories.reduce((acc: Record<string, number>, cat) => {
    acc[cat.id] = expenses
      .filter(e => e.categoryId === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);
    return acc;
  }, {});

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const unexpectedSpent = expenses.filter(e => e.isUnexpected).reduce((sum, e) => sum + e.amount, 0);

  // Filters calculation
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCat === 'all' || exp.categoryId === filterCat;
    
    let matchesUnexpected = true;
    if (filterUnexpected === 'unexpected') matchesUnexpected = exp.isUnexpected;
    else if (filterUnexpected === 'normal') matchesUnexpected = !exp.isUnexpected;

    return matchesSearch && matchesCategory && matchesUnexpected;
  }).sort((a, b) => b.date.localeCompare(a.date)); // Sort newest date first

  const formatCurrency = (val: number) => {
    return `${currencySymbol}${Number(val).toLocaleString('en-IN')}`;
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      
      {/* Header Row */}
      <div>
        <h2 className="text-2xl font-extrabold text-white">Expense Tracker</h2>
        <p className="text-slate-400 text-[0.88rem] mt-1 font-inter">
          Record your daily transactions, monitor category thresholds, and track unexpected expenses.
        </p>
      </div>

      {/* Top Banner for Unexpected Expenses */}
      {unexpectedSpent > 0 && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4 shadow-xl transition-all duration-300 hover:border-red-500/25">
          <div className="flex items-center gap-4">
            <div className="bg-red-500/10 rounded-full p-2.5 flex items-center justify-center shadow-lg shadow-red-500/10">
              <Flame size={20} className="text-red-400 animate-pulse" />
            </div>
            <div>
              <div className="text-[0.95rem] font-bold text-red-400">Unexpected Expenses Alert</div>
              <p className="text-xs text-slate-400 mt-1 font-inter">
                You have spent a total of <span className="font-bold text-red-400">{formatCurrency(unexpectedSpent)}</span> on unexpected transactions this month.
              </p>
            </div>
          </div>
          <div className="text-lg font-black text-red-400 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl">
            {formatCurrency(unexpectedSpent)}
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Area: Category Thresholds & Transaction List */}
        <div className="flex flex-col gap-6 lg:col-span-7 order-last lg:order-first">
          
          {/* Category Budgets & Consumption Progress */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3">
              Category Budget Consumption
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const spent = spentByCategory[cat.id] || 0;
                const progress = cat.budget > 0 ? (spent / cat.budget) * 100 : 0;
                const isOver = spent > cat.budget;
 
                // Color overrides depending on health
                let barColor = cat.color;
                if (progress >= 100) barColor = '#ef4444'; // Red if overspent
                else if (progress >= 85) barColor = '#f59e0b'; // Amber if close
 
                return (
                  <div key={cat.id} className="bg-slate-950/40 border border-white/5 rounded-xl p-4 flex flex-col gap-2.5 transition-all duration-300 hover:border-white/10">
                    <div className="flex justify-between items-center gap-1.5">
                      <span className={`font-bold text-xs truncate ${isOver ? 'text-red-400' : 'text-slate-300'}`}>
                        {cat.name}
                      </span>
                      {isOver && <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />}
                    </div>
                    
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-black text-slate-100">{formatCurrency(spent)}</span>
                      <span className="text-[0.68rem] text-slate-500 font-inter">of {formatCurrency(cat.budget)}</span>
                    </div>
 
                    <div className="progress-container">
                      <div className="progress-fill" style={{ 
                        width: `${Math.min(100, progress)}%`, 
                        backgroundColor: barColor 
                      }}></div>
                    </div>
 
                    <div className="flex justify-between text-[0.68rem] text-slate-500 font-inter">
                      <span>{progress.toFixed(0)}% consumed</span>
                      <span className={isOver ? 'font-semibold text-red-400' : 'text-slate-400'}>
                        {isOver 
                          ? `${formatCurrency(spent - cat.budget)} over` 
                          : `${formatCurrency(cat.budget - spent)} left`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
 
          {/* Transaction History Card */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center flex-wrap gap-3 border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase">Transaction Log</h3>
              <span className="text-[0.75rem] text-slate-500 font-inter">
                Showing {filteredExpenses.length} transactions (Total: {formatCurrency(totalSpent)})
              </span>
            </div>
 
            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input text-xs pl-9 py-2"
                />
              </div>
 
              {/* Category selector */}
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="form-select text-xs py-2"
              >
                <option value="all" className="bg-bg-card">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id} className="bg-bg-card">{c.name}</option>)}
              </select>
 
              {/* Unexpected type selector */}
              <select
                value={filterUnexpected}
                onChange={(e) => setFilterUnexpected(e.target.value)}
                className="form-select text-xs py-2"
              >
                <option value="all" className="bg-bg-card">All Expenses</option>
                <option value="normal" className="bg-bg-card">Normal</option>
                <option value="unexpected" className="bg-bg-card">Unexpected Only</option>
              </select>
            </div>
 
            {/* Desktop Transaction Table */}
            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 text-left font-bold">
                    <th className="p-2 font-medium">DATE</th>
                    <th className="p-2 font-medium">DESCRIPTION</th>
                    <th className="p-2 font-medium">CATEGORY</th>
                    <th className="p-2 text-right font-medium">AMOUNT</th>
                    <th className="p-2 text-center font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/2">
                  {filteredExpenses.map((exp) => {
                    const catObj = categories.find(c => c.id === exp.categoryId);
                    return (
                      <tr key={exp.id} className={`text-slate-300 transition-colors duration-200 hover:bg-white/1 ${
                        exp.isUnexpected ? 'bg-red-500/2' : '' 
                      }`}>
                        <td className="p-3 text-slate-400 whitespace-nowrap font-inter">
                          {exp.date}
                        </td>
                        <td className="p-3 font-semibold text-slate-200">
                          <div className="flex items-center gap-2">
                            {exp.description}
                            {exp.isUnexpected && (
                              <span className="text-[0.62rem] font-black px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded uppercase tracking-wider">
                                Unexpected
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: catObj?.color || '#64748b' }}></span>
                            {catObj?.name || 'Deleted Category'}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-slate-100 font-inter">
                          {formatCurrency(exp.amount)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="bg-transparent border-none text-red-500 cursor-pointer opacity-70 hover:opacity-100 hover:scale-105 transition-all duration-300"
                            title="Delete transaction"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
 
                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500 font-inter">
                        No transactions found for the selected filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Compact Transaction Card List */}
            <div className="block sm:hidden flex flex-col gap-3">
              {filteredExpenses.map((exp) => {
                const catObj = categories.find(c => c.id === exp.categoryId);
                return (
                  <div key={exp.id} className={`bg-slate-950/40 border border-white/5 rounded-xl p-4 flex flex-col gap-2.5 transition-all duration-300 hover:border-white/10 ${
                    exp.isUnexpected ? 'bg-red-500/2 border-red-500/10' : ''
                  }`}>
                    {/* Row 1: Description + Unexpected badge */}
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-[0.88rem] text-slate-200 leading-snug">
                        {exp.description}
                      </span>
                      {exp.isUnexpected && (
                        <span className="text-[0.58rem] font-black px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded uppercase tracking-wider flex-shrink-0">
                          Unexpected
                        </span>
                      )}
                    </div>
 
                    {/* Row 2: Category dot + Date + Amount + Delete */}
                    <div className="flex justify-between items-center text-xs font-inter border-t border-white/2 pt-2.5 mt-0.5">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-slate-400 text-[0.72rem]">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: catObj?.color || '#64748b' }}></span>
                          {catObj?.name || 'Deleted Category'}
                        </span>
                        <span className="text-[0.7rem] text-slate-500">
                          {exp.date}
                        </span>
                      </div>
 
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-slate-100 text-[0.88rem]">
                          {formatCurrency(exp.amount)}
                        </span>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="bg-red-500/10 border border-red-500/15 text-red-400 p-2 rounded-lg cursor-pointer hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center"
                          title="Delete transaction"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredExpenses.length === 0 && (
                <div className="text-center py-6 text-slate-500 font-inter text-xs">
                  No transactions found.
                </div>
              )}
            </div>
 
          </div>
 
        </div>
 
        {/* Right Area: Log Transaction Form */}
        <div className="glass-card p-6 lg:col-span-5 order-first lg:order-last w-full">
          <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3 mb-4">
            Log New Expense
          </h3>
          
          <form onSubmit={handleAddExpense} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Description</label>
              <input
                type="text"
                placeholder="e.g., Uber commute, Coffee, Groceries"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Amount ({currencySymbol})</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="form-input"
                  min="1"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Category</label>
              <select
                value={catId}
                onChange={(e) => setCatId(e.target.value)}
                className="form-select"
                required
              >
                <option value="" disabled className="bg-bg-card">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id} className="bg-bg-card">{c.name}</option>)}
              </select>
            </div>

            {/* Unexpected Expense Checkbox */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 flex items-center justify-between mt-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.85rem] font-bold text-red-400">Unexpected Expense</span>
                <span className="text-[0.72rem] text-slate-400 font-inter leading-normal pr-3">
                  Mark if this is an unexpected or emergency purchase
                </span>
              </div>
              <label className="relative inline-block w-9 h-5 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={isUnexpected}
                  onChange={(e) => setIsUnexpected(e.target.checked)}
                  className="sr-only peer"
                  id="unexpected-toggle"
                />
                <span className="absolute inset-0 bg-slate-800 rounded-full transition-all duration-300 peer-checked:bg-red-500">
                  <span className="absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-300 peer-checked:translate-x-4"></span>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary mt-3 w-full justify-center"
            >
              <Plus size={18} />
              Log Transaction
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};

export default ExpensesView;
