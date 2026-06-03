'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Save, 
  CheckCircle 
} from 'lucide-react';
import { MonthlyFinanceData, Category } from '@/types';

interface BudgetViewProps {
  data: MonthlyFinanceData;
  onSave: (updatedData: { income: number; categories: Category[] }) => void;
  currencySymbol: string;
}

const BudgetView: React.FC<BudgetViewProps> = ({ 
  data, 
  onSave, 
  currencySymbol = '₹' 
}) => {
  const { income: initialIncome = 0, categories: initialCategories = [] } = data || {};

  const [income, setIncome] = useState<number>(initialIncome);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  
  // Form state for new category
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatBudget, setNewCatBudget] = useState<number>(1000);
  const [newCatType, setNewCatType] = useState<Category['type']>('Needs');
  const [newCatColor, setNewCatColor] = useState<string>('#a855f7');

  // Sync state with props
  useEffect(() => {
    setIncome(initialIncome);
    setCategories(initialCategories);
  }, [initialIncome, initialCategories]);

  // Color options
  const defaultColors = [
    '#a855f7', // purple
    '#22c55e', // green
    '#3b82f6', // blue
    '#eab308', // yellow
    '#f43f5e', // rose
    '#06b6d4', // cyan
    '#f97316', // orange
    '#ec4899', // pink
    '#6366f1', // indigo
    '#64748b'  // gray
  ];

  // Calculations
  const totalAllocated = categories.reduce((sum, c) => sum + Number(c.budget), 0);
  const remainingBuffer = income - totalAllocated;
  const isOverBudget = remainingBuffer < 0;

  // Handlers
  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setIncome(val >= 0 ? val : 0);
  };

  const handleBudgetChange = (id: string, newBudget: string) => {
    const budgetVal = Number(newBudget);
    setCategories(prev => prev.map(c => 
      c.id === id ? { ...c, budget: budgetVal >= 0 ? budgetVal : 0 } : c
    ));
  };

  const handleTypeChange = (id: string, newType: string) => {
    setCategories(prev => prev.map(c => 
      c.id === id ? { ...c, type: newType as Category['type'] } : c
    ));
  };

  const handleDeleteCategory = (id: string) => {
    const updatedCats = categories.filter(c => c.id !== id);
    setCategories(updatedCats);
    onSave({
      income,
      categories: updatedCats
    });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newId = `cat-${Date.now()}`;
    const newCategory: Category = {
      id: newId,
      name: newCatName.trim(),
      budget: Number(newCatBudget) || 0,
      type: newCatType,
      color: newCatColor
    };

    const updatedCats = [...categories, newCategory];
    setCategories(updatedCats);
    
    // Automatically sync changes to parent (and database) immediately
    onSave({
      income,
      categories: updatedCats
    });
    
    // Reset form
    setNewCatName('');
    setNewCatBudget(1000);
    // Auto-select a different color for the next category
    const currentIndex = defaultColors.indexOf(newCatColor);
    const nextColor = defaultColors[(currentIndex + 1) % defaultColors.length];
    setNewCatColor(nextColor);
  };

  const handleSaveAll = () => {
    onSave({
      income,
      categories
    });
  };

  const formatCurrency = (val: number) => {
    return `${currencySymbol}${Number(val).toLocaleString('en-IN')}`;
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-outfit">Set & Allocate Budget</h2>
          <p className="text-slate-400 text-[0.88rem] mt-1 font-inter">
            Modify your monthly income and distribute it across spending and savings categories.
          </p>
        </div>
        
        <button 
          onClick={handleSaveAll}
          className="btn-primary px-6 py-3 text-[0.95rem] w-full sm:w-auto justify-center"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      {/* Main Budget Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Left Column: Categories List */}
        <div className="glass-card p-6 flex flex-col gap-5 lg:col-span-3 order-last lg:order-first">
          <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3">
            Budget Categories Allocation
          </h3>

          <div className="flex flex-col gap-4">
            {categories.map((cat) => {
              const allocationPct = income > 0 ? ((cat.budget / income) * 100).toFixed(1) : '0';
              return (
                <div key={cat.id} className="bg-white/1 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 relative transition-all duration-300 hover:border-white/10">
                  {/* Category Head Info */}
                  <div className="flex justify-between items-start flex-wrap gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full shadow-md" style={{ backgroundColor: cat.color, boxShadow: `0 0 8px ${cat.color}` }}></span>
                      <span className="font-bold text-[0.95rem] text-slate-200">{cat.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Type Select */}
                      <select
                        value={cat.type}
                        onChange={(e) => handleTypeChange(cat.id, e.target.value)}
                        className="bg-slate-950 border border-white/5 text-slate-300 px-2 py-1 rounded-lg text-xs font-outfit outline-none cursor-pointer focus:border-purple-500"
                      >
                        <option value="Needs">Needs</option>
                        <option value="Savings">Savings</option>
                        <option value="Future">Future</option>
                        <option value="Flexible">Flexible</option>
                      </select>

                      {/* Delete Button */}
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="bg-transparent border-none text-red-500 cursor-pointer opacity-70 hover:opacity-100 hover:scale-105 transition-all duration-300"
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Budget Slider & Input Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="flex-1 flex items-center gap-3">
                      <input 
                        type="range"
                        min="0"
                        max={income > 0 ? income : 50000}
                        step="100"
                        value={cat.budget}
                        onChange={(e) => handleBudgetChange(cat.id, e.target.value)}
                        className="flex-1 h-1 rounded-full cursor-pointer"
                        style={{ accentColor: cat.color }}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 justify-between sm:justify-end">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 text-[0.88rem] font-bold">{currencySymbol}</span>
                        <input 
                          type="number"
                          value={cat.budget}
                          onChange={(e) => handleBudgetChange(cat.id, e.target.value)}
                          className="form-input text-right font-semibold text-xs py-1 px-2 w-[85px]"
                        />
                      </div>
                      <span className="text-[0.72rem] text-slate-400 font-inter font-medium min-w-[38px] text-right">
                        ({allocationPct}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {categories.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-inter">
                No budget categories defined yet. Use the form on the right to add some!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Salary Setter & Add Category */}
        <div className="flex flex-col gap-6 lg:col-span-2 order-first lg:order-last w-full">
          
          {/* Salary Card */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3">
              Monthly Salary
            </h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide font-outfit">Set monthly income ({currencySymbol})</label>
              <input 
                type="number"
                value={income}
                onChange={handleIncomeChange}
                className="form-input text-2xl font-black px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-100"
              />
            </div>

            {/* Allocated Info & Warnings */}
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3 text-[0.88rem] font-inter">
              <div className="flex justify-between text-slate-400">
                <span>Total Allocated:</span>
                <span className="font-semibold text-slate-200">{formatCurrency(totalAllocated)}</span>
              </div>
              <div className="flex justify-between border-t border-white/2 pt-2.5 text-slate-400">
                <span>Remaining Buffer:</span>
                <span className={`font-black ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                  {formatCurrency(remainingBuffer)}
                </span>
              </div>
              
              {isOverBudget && (
                <div className="bg-red-500/10 border border-red-500/15 text-red-400 p-3 rounded-lg flex gap-2.5 items-start text-xs leading-normal">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Warning: Total allocated exceeds monthly salary! Reduce budgets to stay within limits.</span>
                </div>
              )}
              
              {!isOverBudget && remainingBuffer > 0 && (
                <div className="bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 p-3 rounded-lg flex gap-2.5 items-center text-xs font-inter">
                  <CheckCircle size={16} className="flex-shrink-0" />
                  <span>You have unallocated funds. They will accumulate as a "Remaining Buffer" or general savings.</span>
                </div>
              )}
            </div>
          </div>

          {/* Add Category Form */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase border-b border-white/5 pb-3 mb-4">
              Add New Category
            </h3>
            <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Category Name</label>
                <input 
                  type="text"
                  placeholder="e.g., Electricity, Gym, Groceries"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Budget ({currencySymbol})</label>
                  <input 
                    type="number"
                    value={newCatBudget}
                    onChange={(e) => setNewCatBudget(Number(e.target.value))}
                    className="form-input"
                    min="0"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Category Type</label>
                  <select
                    value={newCatType}
                    onChange={(e) => setNewCatType(e.target.value as Category['type'])}
                    className="form-select"
                  >
                    <option value="Needs">Needs (Fixed)</option>
                    <option value="Savings">Savings</option>
                    <option value="Future">Future Funds</option>
                    <option value="Flexible">Flexible Spending</option>
                  </select>
                </div>
              </div>

              {/* Color Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-[0.78rem] text-slate-400 font-bold uppercase tracking-wide">Select Theme Color</label>
                <div className="flex flex-wrap gap-2.5 items-center">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCatColor(color)}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-all duration-300 ${
                        newCatColor === color ? 'border-2 border-white scale-110' : 'border border-transparent'
                      }`}
                      style={{ 
                        backgroundColor: color,
                        boxShadow: newCatColor === color ? `0 0 8px ${color}` : 'none'
                      }}
                    />
                  ))}
                  
                  {/* Native Color Picker for custom colors */}
                  <input 
                    type="color" 
                    value={newCatColor} 
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-7 h-7 border-none rounded-full cursor-pointer bg-transparent p-0"
                    title="Custom color picker"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-secondary mt-2 w-full justify-center bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500 hover:text-white"
              >
                <Plus size={16} />
                Add Category
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};

export default BudgetView;
