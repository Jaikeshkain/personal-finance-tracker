'use client';

import React from 'react';
import { 
  FileText, 
  Download, 
  Upload, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { MonthlyFinanceData } from '@/types';

interface ReportsViewProps {
  data: MonthlyFinanceData;
  fullDB: Record<string, MonthlyFinanceData>;
  onImportBackup: (backup: Record<string, MonthlyFinanceData>) => void;
  currencySymbol: string;
}

const ReportsView: React.FC<ReportsViewProps> = ({ 
  data, 
  fullDB, 
  onImportBackup, 
  currencySymbol = '₹' 
}) => {
  const { monthYear = '', income = 0, categories = [], expenses = [] } = data || {};

  // Calculations
  const totalBudget = categories.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const unexpectedSpent = expenses.filter(e => e.isUnexpected).reduce((sum, e) => sum + e.amount, 0);
  const normalSpent = totalSpent - unexpectedSpent;
  const savingsAllocated = categories.filter(c => c.type === 'Savings').reduce((sum, c) => sum + c.budget, 0);

  const formattedMonth = () => {
    if (!monthYear) return '';
    const [year, month] = monthYear.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const formatCurrency = (val: number) => {
    return `${currencySymbol}${Number(val).toLocaleString('en-IN')}`;
  };

  // Export Transactions as CSV
  const exportTransactionsCSV = () => {
    if (expenses.length === 0) {
      alert('No transactions to export for this month.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Date,Description,Category,Amount,Is Unexpected\n';

    expenses.forEach((e) => {
      const cat = categories.find(c => c.id === e.categoryId)?.name || 'Deleted Category';
      const escapedDesc = e.description.replace(/"/g, '""');
      csvContent += `${e.date},"${escapedDesc}","${cat}",${e.amount},${e.isUnexpected ? 'Yes' : 'No'}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_${monthYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Full DB as JSON
  const exportFullDBJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullDB, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', 'finance_tracker_backup.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import JSON uploader trigger
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const fileReader = new FileReader();
    const file = files[0];

    fileReader.onload = (event) => {
      try {
        if (!event.target?.result) return;
        const parsed = JSON.parse(event.target.result as string);
        if (typeof parsed === 'object') {
          onImportBackup(parsed);
          alert('Backup data successfully imported and synced!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err: any) {
        alert('Failed to parse backup file: ' + err.message);
      }
    };
    fileReader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white">Reports & Analytics</h2>
        <p className="text-slate-400 text-[0.88rem] mt-1 font-inter">
          Analyze spending statistics, export csv logs, or backup dashboard databases.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-9 gap-6 items-start">
        
        {/* Left Card: Monthly Financial Summary */}
        <div className="glass-card p-6 flex flex-col gap-5 lg:col-span-5">
          <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3 flex items-center gap-2">
            <FileText size={18} className="text-purple-400" />
            Financial Report for {formattedMonth()}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 transition-all hover:bg-slate-950/60">
              <div className="text-slate-400 text-[0.78rem] font-bold uppercase tracking-wider flex items-center gap-1">
                <ArrowUpRight size={14} className="text-emerald-400" />
                Total Monthly Salary
              </div>
              <div className="text-2xl font-black mt-2 text-emerald-400">
                {formatCurrency(income)}
              </div>
            </div>

            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 transition-all hover:bg-slate-950/60">
              <div className="text-slate-400 text-[0.78rem] font-bold uppercase tracking-wider flex items-center gap-1">
                <ArrowDownRight size={14} className="text-red-400" />
                Total Monthly Spent
              </div>
              <div className="text-2xl font-black mt-2 text-red-400">
                {formatCurrency(totalSpent)}
              </div>
            </div>
          </div>

          {/* Breakdown Stats */}
          <div className="flex flex-col gap-2.5 text-[0.85rem] font-inter mt-3">
            <div className="flex justify-between border-b border-white/2 pb-2 text-slate-400">
              <span>Budget Allocated:</span>
              <span className="font-semibold text-slate-200">{formatCurrency(totalBudget)} ({income > 0 ? ((totalBudget/income)*100).toFixed(1) : 0}%)</span>
            </div>
            
            <div className="flex justify-between border-b border-white/2 pb-2 text-slate-400">
              <span>Standard Expenses:</span>
              <span className="font-semibold text-slate-200">{formatCurrency(normalSpent)}</span>
            </div>

            <div className="flex justify-between border-b border-white/2 pb-2 text-slate-400">
              <span className="text-red-400">Unexpected Expenses:</span>
              <span className="font-semibold text-red-400">{formatCurrency(unexpectedSpent)}</span>
            </div>

            <div className="flex justify-between border-b border-white/2 pb-2 text-slate-400">
              <span>Monthly Net Savings (from budget):</span>
              <span className="font-semibold text-emerald-400">{formatCurrency(savingsAllocated)}</span>
            </div>

            <div className="flex justify-between border-b border-white/2 pb-2 text-slate-400">
              <span>Remaining Unspent Balance:</span>
              <span className={`font-black ${income - totalSpent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(income - totalSpent)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Data Management (Export & Import) */}
        <div className="glass-card p-6 lg:col-span-4">
          <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3">
            Data Import & Export
          </h3>

          <div className="flex flex-col gap-5 mt-4">
            {/* Export CSV Button */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Export Current Month Log</span>
              <button 
                onClick={exportTransactionsCSV}
                className="btn-secondary justify-center gap-2"
              >
                <Download size={16} />
                Download Transactions (.CSV)
              </button>
            </div>

            {/* Export Backup JSON Button */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Export Complete Database</span>
              <button 
                onClick={exportFullDBJSON}
                className="btn-primary justify-center gap-2"
              >
                <Download size={16} />
                Download Database Backup (.JSON)
              </button>
            </div>

            {/* Import Backup JSON */}
            <div className="border-t border-white/5 pt-4 flex flex-col gap-2">
              <span className="text-[0.85rem] font-bold text-slate-200">
                Restore Database Backup
              </span>
              <p className="text-[0.72rem] text-slate-500 font-inter leading-relaxed">
                Upload a previously saved `.json` file to restore all months, salaries, categories, expenses, and savings goals.
              </p>
              
              <div className="relative flex items-center justify-center border border-dashed border-purple-500/30 rounded-xl p-5 cursor-pointer bg-purple-500/2 mt-2 transition-all duration-300 hover:border-purple-500/50 hover:bg-purple-500/5">
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleImportFile}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  id="import-db-input"
                />
                <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
                  <Upload size={16} />
                  <span>Choose Backup File (.json)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ReportsView;
