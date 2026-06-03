import { MonthlyFinanceData } from '@/types';

export function getStarterData(monthYear: string): MonthlyFinanceData {
  // Extract year and month to generate proper dates for mock expenses
  const yearMonthStr = monthYear || '2026-06';
  
  return {
    monthYear: yearMonthStr,
    income: 28200,
    categories: [
      { id: 'pg-rent', name: 'PG Rent (food included)', budget: 12000, type: 'Needs', color: '#a855f7' },
      { id: 'send-home', name: 'Send Home', budget: 6000, type: 'Needs', color: '#22c55e' },
      { id: 'travel-commute', name: 'Travel/Commute', budget: 1000, type: 'Needs', color: '#3b82f6' },
      { id: 'mobile-essentials', name: 'Mobile + Essentials', budget: 1000, type: 'Needs', color: '#eab308' },
      { id: 'cravings-fun', name: 'Cravings/Fun', budget: 2000, type: 'Flexible', color: '#f43f5e' },
      { id: 'emergency-savings', name: 'Emergency Savings', budget: 2500, type: 'Savings', color: '#059669' },
      { id: 'shopping-fund', name: 'Shopping Fund', budget: 1000, type: 'Flexible', color: '#f97316' },
      { id: 'travel-fund', name: 'Travel Fund', budget: 1500, type: 'Future', color: '#06b6d4' },
      { id: 'unexpected-buffer', name: 'Unexpected/Lending Buffer', budget: 1500, type: 'Future', color: '#6366f1' },
      { id: 'remaining-buffer', name: 'Remaining Buffer', budget: 700, type: 'Flexible', color: '#71717a' }
    ],
    expenses: [
      { id: 'exp-1', description: 'Monthly PG Rent', amount: 12000, categoryId: 'pg-rent', date: `${yearMonthStr}-01`, isUnexpected: false },
      { id: 'exp-2', description: 'Sent money home', amount: 6000, categoryId: 'send-home', date: `${yearMonthStr}-01`, isUnexpected: false },
      { id: 'exp-3', description: 'Train pass renewal', amount: 800, categoryId: 'travel-commute', date: `${yearMonthStr}-02`, isUnexpected: false },
      { id: 'exp-4', description: 'Dinner with friends', amount: 1250, categoryId: 'cravings-fun', date: `${yearMonthStr}-02`, isUnexpected: false },
      { id: 'exp-5', description: 'Mobile Recharge', amount: 399, categoryId: 'mobile-essentials', date: `${yearMonthStr}-03`, isUnexpected: false },
      { id: 'exp-6', description: 'Emergency medical consultation', amount: 1500, categoryId: 'unexpected-buffer', date: `${yearMonthStr}-03`, isUnexpected: true }
    ],
    funds: [
      { id: 'fund-emergency', name: 'Emergency Fund', target: 80000, current: 2500 },
      { id: 'fund-shopping', name: 'Shopping Fund', target: 6000, current: 0 },
      { id: 'fund-travel', name: 'Travel Fund', target: 8000, current: 0 },
      { id: 'fund-unexpected', name: 'Unexpected Fund', target: 9000, current: 0 }
    ]
  };
}
