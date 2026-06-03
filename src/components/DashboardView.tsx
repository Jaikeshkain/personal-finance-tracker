'use client';

import React from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  TooltipItem
} from 'chart.js';
import { Doughnut, Pie, Bar } from 'react-chartjs-2';
import { 
  Wallet, 
  PiggyBank, 
  Target, 
  ShoppingBag, 
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { MonthlyFinanceData } from '@/types';
import ScrollReveal from './ScrollReveal';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface DashboardViewProps {
  data: MonthlyFinanceData;
  month: string;
  setMonth: (month: string) => void;
  year: string;
  setYear: (year: string) => void;
  currencySymbol: string;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  data, 
  month, 
  setMonth, 
  year, 
  setYear, 
  currencySymbol = '₹' 
}) => {
  
  const { income = 0, categories = [], expenses = [], funds = [] } = data || {};

  // Formats currency nicely
  const formatCurrency = (val: number) => {
    return `${currencySymbol}${Number(val).toLocaleString('en-IN')}`;
  };

  // Calculations
  const totalAllocated = categories.reduce((sum, c) => sum + c.budget, 0);
  const allocationPercentage = income > 0 ? Math.min(100, Math.round((totalAllocated / income) * 100)) : 0;
  
  // Categorize budgets by type
  const needsBudget = categories.filter(c => c.type === 'Needs').reduce((sum, c) => sum + c.budget, 0);
  const savingsBudget = categories.filter(c => c.type === 'Savings').reduce((sum, c) => sum + c.budget, 0);
  const futureBudget = categories.filter(c => c.type === 'Future').reduce((sum, c) => sum + c.budget, 0);
  const flexibleBudget = categories.filter(c => c.type === 'Flexible').reduce((sum, c) => sum + c.budget, 0);

  const needsPercentage = income > 0 ? ((needsBudget / income) * 100).toFixed(2) : '0';
  const savingsPercentage = income > 0 ? ((savingsBudget / income) * 100).toFixed(2) : '0';
  const futurePercentage = income > 0 ? ((futureBudget / income) * 100).toFixed(2) : '0';
  const flexiblePercentage = income > 0 ? ((flexibleBudget / income) * 100).toFixed(2) : '0';

  // Calculate actual expenses per category
  const actualExpensesByCategory = categories.reduce((acc: Record<string, number>, cat) => {
    const totalSpent = expenses
      .filter(e => e.categoryId === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);
    acc[cat.id] = totalSpent;
    return acc;
  }, {});

  // Calculate total expenses
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Calculate unexpected expenses
  const unexpectedSpent = expenses
    .filter(e => e.isUnexpected)
    .reduce((sum, e) => sum + e.amount, 0);

  // Months lists
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];

  // Chart 1: Monthly Budget Breakdown (Doughnut Chart)
  const doughnutData = {
    labels: categories.map(c => c.name),
    datasets: [{
      data: categories.map(c => c.budget),
      backgroundColor: categories.map(c => c.color || '#a855f7'),
      borderWidth: 1,
      borderColor: '#0e1322',
      hoverOffset: 4
    }]
  };

  const doughnutOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'doughnut'>) => {
            const val = context.raw as number;
            const pct = income > 0 ? ((val / income) * 100).toFixed(1) : '0';
            return ` ${context.label}: ${formatCurrency(val)} (${pct}%)`;
          }
        }
      }
    },
    cutout: '70%',
    responsive: true,
    maintainAspectRatio: false
  };

  // Chart 2: Budget Allocation Overview (Pie Chart)
  const pieData = {
    labels: ['Needs (Fixed)', 'Savings', 'Future Funds', 'Flexible / Lifestyle'],
    datasets: [{
      data: [needsBudget, savingsBudget, futureBudget, flexibleBudget],
      backgroundColor: ['#a855f7', '#22c55e', '#3b82f6', '#f97316'],
      borderWidth: 1,
      borderColor: '#0e1322'
    }]
  };

  const pieOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'pie'>) => {
            const val = context.raw as number;
            const pct = income > 0 ? ((val / income) * 100).toFixed(1) : '0';
            return ` ${context.label}: ${formatCurrency(val)} (${pct}%)`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  // Chart 3: Expense Category Share (Bar Chart)
  const barData = {
    labels: categories.map(c => c.name.length > 12 ? c.name.substring(0, 12) + '...' : c.name),
    datasets: [
      {
        label: 'Budgeted',
        data: categories.map(c => c.budget),
        backgroundColor: 'rgba(168, 85, 247, 0.4)',
        borderColor: '#a855f7',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Spent',
        data: categories.map(c => actualExpensesByCategory[c.id] || 0),
        backgroundColor: 'rgba(6, 182, 212, 0.8)',
        borderColor: '#06b6d4',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const barOptions = {
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Outfit' } }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b' }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Hi! 👋</h1>
          <h2 className="text-xl text-slate-400 font-normal mt-1">
            Here's Your Monthly Financial Dashboard
          </h2>
          <p className="text-slate-500 text-[0.88rem] mt-1 font-inter">
            Stay disciplined. Save consistently. Invest in your future.
          </p>
        </div>

        {/* Filters and Income Info */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          {/* Month/Year Dropdowns */}
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-bg-card border border-white/5 px-3.5 py-2.5 rounded-xl shadow-lg shadow-black/20 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-purple-400" />
              <select 
                value={month} 
                onChange={(e) => setMonth(e.target.value)}
                className="bg-transparent border-none text-[0.9rem] font-medium font-outfit text-slate-200 outline-none w-[110px] cursor-pointer"
              >
                {months.map(m => <option key={m.value} value={m.value} className="bg-bg-card text-slate-200">{m.label}</option>)}
              </select>
            </div>
            <select 
              value={year} 
              onChange={(e) => setYear(e.target.value)}
              className="bg-transparent border-none text-[0.9rem] font-medium font-outfit text-slate-200 outline-none w-[80px] cursor-pointer text-right sm:text-left"
            >
              {years.map(y => <option key={y} value={y} className="bg-bg-card text-slate-200">{y}</option>)}
            </select>
          </div>

          {/* Salary Card */}
          <div className="bg-bg-card border border-white/5 rounded-2xl px-6 py-3 flex items-center justify-between sm:justify-start gap-5 shadow-2xl transition-all duration-300 hover:border-emerald-500/20 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial">
              <span className="text-[0.7rem] text-slate-400 font-bold uppercase tracking-wider font-outfit">
                In-Hand Salary
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-0.5 font-outfit">
                {formatCurrency(income)}
              </div>
              <span className="text-[0.7rem] text-slate-500 font-inter">
                Monthly Income
              </span>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-3 flex items-center justify-center shadow-md shadow-emerald-500/5">
              <Wallet size={22} className="text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <ScrollReveal delay={0}>
          <div className="glass-card p-5 flex flex-col gap-2.5 transition-transform duration-300 hover:scale-[1.02] h-full">
            <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-slate-400 uppercase">
              <span>TOTAL ALLOCATED</span>
              <span className="text-purple-400 font-bold">{allocationPercentage}%</span>
            </div>
            <div className="text-2xl font-black text-slate-100">{formatCurrency(totalAllocated)}</div>
            <div className="progress-container">
              <div className="progress-fill" style={{ width: `${allocationPercentage}%`, backgroundColor: 'var(--color-purple)' }}></div>
            </div>
            <span className="text-[0.75rem] text-slate-500 font-inter">
              {income - totalAllocated > 0 
                ? `${formatCurrency(income - totalAllocated)} remaining buffer` 
                : 'All categories budgeted'}
            </span>
          </div>
        </ScrollReveal>

        {/* Metric 2 */}
        <ScrollReveal delay={100}>
          <div className="glass-card p-5 flex flex-col gap-2.5 transition-transform duration-300 hover:scale-[1.02] h-full">
            <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-slate-400 uppercase">
              <span>TOTAL SAVINGS</span>
              <PiggyBank size={18} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-slate-100">{formatCurrency(savingsBudget)}</div>
            <div className="text-emerald-400 text-[0.82rem] font-bold font-inter">
              {savingsPercentage}% of income
            </div>
            <span className="text-[0.75rem] text-slate-500 font-inter">Towards long term savings</span>
          </div>
        </ScrollReveal>

        {/* Metric 3 */}
        <ScrollReveal delay={200}>
          <div className="glass-card p-5 flex flex-col gap-2.5 transition-transform duration-300 hover:scale-[1.02] h-full">
            <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-slate-400 uppercase">
              <span>TOTAL FOR FUTURE</span>
              <Target size={18} className="text-blue-400" />
            </div>
            <div className="text-2xl font-black text-slate-100">{formatCurrency(futureBudget)}</div>
            <div className="text-blue-400 text-[0.82rem] font-bold font-inter">
              {futurePercentage}% of income
            </div>
            <span className="text-[0.75rem] text-slate-500 font-inter">Travel, insurance & buffers</span>
          </div>
        </ScrollReveal>

        {/* Metric 4 */}
        <ScrollReveal delay={300}>
          <div className="glass-card p-5 flex flex-col gap-2.5 transition-transform duration-300 hover:scale-[1.02] h-full">
            <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-slate-400 uppercase">
              <span>FLEXIBLE SPENDING</span>
              <ShoppingBag size={18} className="text-orange-400" />
            </div>
            <div className="text-2xl font-black text-slate-100">{formatCurrency(flexibleBudget)}</div>
            <div className="text-orange-400 text-[0.82rem] font-bold font-inter">
              {flexiblePercentage}% of income
            </div>
            <span className="text-[0.75rem] text-slate-500 font-inter">Shopping, fun & buffer</span>
          </div>
        </ScrollReveal>
      </div>

      {/* Row 3: Donut & Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Monthly Budget Breakdown */}
        <ScrollReveal delay={100}>
          <div className="glass-card p-6 flex flex-col gap-4 h-full">
            <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3">
              MONTHLY BUDGET BREAKDOWN
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-6 h-auto sm:h-[240px]">
              {/* Chart Container */}
              <div className="w-full sm:w-[45%] h-[180px] sm:h-full relative flex items-center justify-center flex-shrink-0">
                {categories.length > 0 ? (
                  <>
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                    <div className="absolute text-center pointer-events-none">
                      <div className="text-[0.7rem] text-slate-500 uppercase font-bold tracking-wider">Total</div>
                      <div className="text-lg font-black text-slate-200 mt-0.5">
                        {formatCurrency(totalAllocated)}
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-slate-500 text-[0.88rem] font-inter">No categories created</span>
                )}
              </div>
   
              {/* List Table Container */}
              <div className="w-full sm:w-[55%] h-auto sm:h-full overflow-y-auto pr-1">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 text-left font-bold">
                      <th className="pb-2 font-medium">CATEGORY</th>
                      <th className="pb-2 text-right font-medium">AMOUNT ({currencySymbol})</th>
                      <th className="pb-2 text-right font-medium">% OF INC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/2">
                    {categories.map((c) => {
                      const percentage = income > 0 ? ((c.budget / income) * 100).toFixed(2) : '0';
                      return (
                        <tr key={c.id} className="text-slate-300 hover:bg-white/1">
                          <td className="py-2.5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full flex-shrink-0 shadow-md" style={{ backgroundColor: c.color }}></span>
                            <span className="truncate max-w-[110px]" title={c.name}>
                              {c.name}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-semibold">
                            {Number(c.budget).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 text-right text-slate-400 font-inter">
                            {percentage}%
                          </td>
                        </tr>
                      );
                    })}
                    {categories.length > 0 && (
                      <tr className="font-bold text-emerald-400">
                        <td className="py-2.5">TOTAL</td>
                        <td className="py-2.5 text-right">{Number(totalAllocated).toLocaleString('en-IN')}</td>
                        <td className="py-2.5 text-right font-inter">{allocationPercentage}%</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ScrollReveal>
 
        {/* Card 2: Budget Allocation Overview */}
        <ScrollReveal delay={200}>
          <div className="glass-card p-6 flex flex-col gap-4 h-full">
            <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3">
              BUDGET ALLOCATION OVERVIEW
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-6 h-auto sm:h-[180px]">
              {/* Chart */}
              <div className="w-full sm:w-[45%] h-[150px] sm:h-full relative flex items-center justify-center flex-shrink-0">
                {categories.length > 0 ? (
                  <Pie data={pieData} options={pieOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500 font-inter">
                    No data
                  </div>
                )}
              </div>
   
              {/* Legend info */}
              <div className="w-full sm:w-[55%] flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-md shadow-purple-500/20"></span>
                    Needs (Fixed)
                  </span>
                  <span className="font-bold text-slate-200">{needsPercentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/20"></span>
                    Savings
                  </span>
                  <span className="font-bold text-slate-200">{savingsPercentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-md shadow-blue-500/20"></span>
                    Future Funds
                  </span>
                  <span className="font-bold text-slate-200">{futurePercentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-md shadow-orange-500/20"></span>
                    Flexible / Lifestyle
                  </span>
                  <span className="font-bold text-slate-200">{flexiblePercentage}%</span>
                </div>
              </div>
            </div>
   
            {/* Dynamic Advisory Info */}
            <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3 flex items-center gap-3 text-[0.82rem] font-inter mt-auto">
              <AlertCircle size={18} className="text-blue-400 flex-shrink-0" />
              <div className="text-slate-300 leading-normal">
                You are allocating <span className="font-bold text-emerald-400">{savingsPercentage}%</span> towards savings. 
                {Number(savingsPercentage) >= 10 ? ' Excellent discipline! You are exceeding standard guidelines.' : ' Try increasing this to 10% to secure your emergency buffer.'}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Row 4: Fund Accumulation & Category Expenses Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Left Card: Fund Accumulation */}
        <ScrollReveal delay={150} className="lg:col-span-2">
          <div className="glass-card p-6 flex flex-col gap-4 h-full">
            <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3">
              FUND ACCUMULATION (MONTHLY CONTRIBUTION)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {funds.map((fund) => {
                // Find matching budget category to display monthly contribution
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
 
                const fundProgressPct = Math.min(100, fund.target > 0 ? Math.round((fund.current / fund.target) * 100) : 0);
 
                let fundColor = '#22c55e'; // green
                if (fund.id === 'fund-shopping') fundColor = '#f97316'; // orange
                if (fund.id === 'fund-travel') fundColor = '#3b82f6'; // blue
                if (fund.id === 'fund-unexpected') fundColor = '#a855f7'; // purple
 
                return (
                  <div key={fund.id} className="bg-slate-950/40 border border-white/5 rounded-xl p-4 flex flex-col gap-2.5 transition-all duration-300 hover:border-white/10 hover:bg-slate-950/60">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[0.88rem]" style={{ color: fundColor }}>{fund.name}</span>
                    </div>
                    <div>
                      <span className="text-xl font-extrabold text-slate-100">{formatCurrency(monthlyContribution)}</span>
                      <span className="text-[0.72rem] text-slate-500 font-inter"> / month</span>
                    </div>
                    <div className="text-[0.72rem] text-slate-400 font-inter">
                      Goal: Build {fund.id === 'fund-emergency' ? '6 months of expenses' : 'funds over time'}
                    </div>
                    <div className="progress-container my-1">
                      <div className="progress-fill" style={{ width: `${fundProgressPct}%`, backgroundColor: fundColor }}></div>
                    </div>
                    <div className="flex justify-between text-[0.72rem] text-slate-500 font-inter">
                      <span>Target: {formatCurrency(fund.target)}</span>
                      <span className="font-semibold text-slate-400">Current: {formatCurrency(fund.current)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
 
        {/* Right Card: Expenses Vs Budgeted */}
        <ScrollReveal delay={250}>
          <div className="glass-card p-6 flex flex-col gap-4 h-full">
            <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3">
              EXPENSE CATEGORY SHARE
            </h3>
            <div className="h-[220px] w-full">
              {categories.length > 0 ? (
                <Bar data={barData} options={barOptions} />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500 font-inter">
                  No category data
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Row 5: Notes & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Key Notes */}
        <ScrollReveal delay={100}>
          <div className="glass-card p-5 flex flex-col gap-3 h-full">
            <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              KEY NOTES
            </h4>
            <ul className="text-[0.82rem] text-slate-400 flex flex-col gap-2.5 font-inter">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✔</span>
                <span>Your fixed expenses (Needs) are {needsPercentage}% of income. This is under control.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✔</span>
                <span>You are saving {savingsPercentage}% of your income. Try to increase it as your income grows.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✔</span>
                <span>Use designated savings funds (Shopping, Travel, Unexpected) only for their specific purpose.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✔</span>
                <span>Avoid borrowing. If you lend, keep it small and only from your Unexpected Buffer.</span>
              </li>
            </ul>
          </div>
        </ScrollReveal>
 
        {/* Financial Tip */}
        <ScrollReveal delay={200}>
          <div className="glass-card p-5 flex flex-col gap-3 h-full">
            <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2">
              <Lightbulb size={16} className="text-yellow-400" />
              FINANCIAL TIP
            </h4>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <p className="text-[0.88rem] text-slate-200 leading-relaxed font-inter">
                  Focus on increasing your skills and income. Your earning potential is your biggest wealth multiplier!
                </p>
                <p className="text-[0.75rem] text-slate-500 mt-2 font-inter">
                  Investing in education, certificates, or side-projects returns significantly higher rates of interest than any savings account.
                </p>
              </div>
              {/* Custom mini rising chart graphic */}
              <div className="w-20 h-16 flex items-end gap-1 flex-shrink-0">
                <div className="w-3 h-[15px] bg-slate-800 rounded-sm"></div>
                <div className="w-3 h-[25px] bg-slate-800 rounded-sm"></div>
                <div className="w-3 h-[35px] bg-slate-800 rounded-sm"></div>
                <div className="w-3 h-[48px] bg-emerald-600 rounded-sm"></div>
                <div className="w-3 h-[60px] bg-emerald-400 rounded-sm shadow-[0_0_8px_#34d399]"></div>
              </div>
            </div>
          </div>
        </ScrollReveal>
 
        {/* At a Glance */}
        <ScrollReveal delay={300}>
          <div className="glass-card p-5 flex flex-col gap-3 h-full">
            <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
              AT A GLANCE
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs font-outfit">
              <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 flex flex-col gap-0.5">
                <div className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider">ESSENTIAL + SAVINGS</div>
                <div className="text-[1.05rem] font-extrabold text-slate-100">
                  {formatCurrency(needsBudget + savingsBudget)}
                </div>
                <div className="text-[0.68rem] text-slate-400 font-inter">
                  {income > 0 ? (((needsBudget + savingsBudget) / income) * 100).toFixed(1) : 0}%
                </div>
              </div>
              
              <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 flex flex-col gap-0.5">
                <div className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider">FLEXIBLE / LIFESTYLE</div>
                <div className="text-[1.05rem] font-extrabold text-slate-100">
                  {formatCurrency(flexibleBudget)}
                </div>
                <div className="text-[0.68rem] text-slate-400 font-inter">
                  {income > 0 ? ((flexibleBudget / income) * 100).toFixed(1) : 0}%
                </div>
              </div>
  
              <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 flex flex-col gap-0.5">
                <div className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider">MONTHLY SAVINGS</div>
                <div className="text-[1.05rem] font-extrabold text-emerald-400">
                  {formatCurrency(savingsBudget)}
                </div>
                <div className="text-[0.68rem] text-slate-400 font-inter">
                  {income > 0 ? ((savingsBudget / income) * 100).toFixed(1) : 0}%
                </div>
              </div>
  
              <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 flex flex-col justify-center">
                <div className="text-[1.1rem] font-extrabold text-purple-400">30 Days</div>
                <div className="text-[0.65rem] text-slate-500 font-inter mt-0.5">New Month, New Discipline</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
      
    </div>
  );
};

export default DashboardView;
