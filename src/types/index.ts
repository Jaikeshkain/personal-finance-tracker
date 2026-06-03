export interface Category {
  id: string;
  name: string;
  budget: number;
  type: 'Needs' | 'Savings' | 'Future' | 'Flexible';
  color: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  date: string;
  isUnexpected: boolean;
}

export interface Fund {
  id: string;
  name: string;
  target: number;
  current: number;
}

export interface MonthlyFinanceData {
  monthYear: string;
  income: number;
  categories: Category[];
  expenses: Expense[];
  funds: Fund[];
}
