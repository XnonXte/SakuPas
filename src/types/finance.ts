export type TransactionType = 'expense' | 'income';

export type CategoryId =
  | 'lifestyle'
  | 'transportation'
  | 'groceries'
  | 'education'
  | 'allowance'
  | 'other';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  sublabel: string; // e.g. "TikTok / Hiburan", "Grab / Transport", "Warteg / Kebutuhan Pokok"
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: CategoryId;
  description: string;
  date: string; // ISO string or YYYY-MM-DD
  paymentMethod?: string; // e.g., 'QRIS BCA', 'GoPay', 'ShopeePay', 'Cash'
}

export interface PayLaterBill {
  id: string;
  provider: string; // e.g., "TikTok Shop PayLater", "Atome Finance", "SPayLater"
  totalAmount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'unpaid' | 'paid' | 'due_soon';
  installmentInfo?: string; // e.g., "Cicilan 2 dari 3"
}

export interface BudgetCategory {
  id: CategoryId;
  name: string;
  allocated: number;
  spent: number;
  description: string;
}

export type SafeToSpendStatus = 'safe' | 'warning' | 'danger';

export interface SafeToSpendCalculation {
  remainingAmount: number;
  totalBudget: number;
  percentage: number;
  status: SafeToSpendStatus;
  statusLabel: string;
  dailySafeSpend: number;
  daysRemaining: number;
}
