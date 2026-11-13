import { createContext } from 'react';
import type {
  Transaction,
  PayLaterBill,
  BudgetCategory,
  SafeToSpendCalculation,
  CategoryId,
} from '../types/finance';

export interface FinanceContextType {
  currentView: 'dashboard' | 'transactions' | 'mode-hemat';
  setCurrentView: (view: 'dashboard' | 'transactions' | 'mode-hemat') => void;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  payLaterBills: PayLaterBill[];
  togglePayLaterPaid: (id: string) => void;
  isSelfLockActive: boolean;
  setSelfLockActive: (active: boolean) => void;
  budgetCategories: BudgetCategory[];
  updateBudgetAllocation: (id: CategoryId, allocated: number) => void;
  mainBalance: number;
  totalPayLater: number;
  upcomingBillAmount: number;
  safeToSpend: SafeToSpendCalculation;
  resetToDefaultData: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);
