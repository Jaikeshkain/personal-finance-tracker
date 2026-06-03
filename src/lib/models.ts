import mongoose, { Schema, Document, Model } from 'mongoose';
import { Category, Expense, Fund, MonthlyFinanceData } from '@/types';

export interface IMonthlyFinance extends Document, Omit<MonthlyFinanceData, '_id'> {}

const CategorySchema = new Schema<Category>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  budget: { type: Number, required: true },
  type: { type: String, enum: ['Needs', 'Savings', 'Future', 'Flexible'], required: true },
  color: { type: String, required: true }
});

const ExpenseSchema = new Schema<Expense>({
  id: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  categoryId: { type: String, required: true },
  date: { type: String, required: true }, // Format YYYY-MM-DD
  isUnexpected: { type: Boolean, default: false }
});

const FundSchema = new Schema<Fund>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 }
});

const MonthlyFinanceSchema = new Schema<IMonthlyFinance>({
  monthYear: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  }, // Format: YYYY-MM (e.g. "2026-06")
  income: { type: Number, required: true, default: 0 },
  categories: [CategorySchema],
  expenses: [ExpenseSchema],
  funds: [FundSchema]
}, { timestamps: true });

// Check if model already exists before compilation
const MonthlyFinance: Model<IMonthlyFinance> = 
  mongoose.models.MonthlyFinance || mongoose.model<IMonthlyFinance>('MonthlyFinance', MonthlyFinanceSchema);

export default MonthlyFinance;
export { MonthlyFinance };
