import { MonthlyFinanceData } from '@/types';

export function getStarterData(monthYear: string): MonthlyFinanceData {
  const yearMonthStr = monthYear || '2026-06';
  
  return {
    monthYear: yearMonthStr,
    income: 30000,
    categories: [
      { id: 'rent-housing', name: 'Rent & Housing', budget: 12000, type: 'Needs', color: '#a855f7' },
      { id: 'groceries-essentials', name: 'Groceries & Essentials', budget: 5000, type: 'Needs', color: '#3b82f6' },
      { id: 'dining-entertainment', name: 'Dining & Entertainment', budget: 4000, type: 'Flexible', color: '#f43f5e' },
      { id: 'emergency-savings', name: 'Emergency Savings', budget: 6000, type: 'Savings', color: '#22c55e' },
      { id: 'misc-buffer', name: 'Miscellaneous Buffer', budget: 3000, type: 'Flexible', color: '#f97316' }
    ],
    expenses: [],
    funds: [
      { id: 'fund-emergency', name: 'Emergency Fund', target: 60000, current: 0 },
      { id: 'fund-vacation', name: 'Vacation Fund', target: 24000, current: 0 }
    ]
  };
}
