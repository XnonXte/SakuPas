import React, { useState, useEffect, useMemo } from 'react';
import type {
  Transaction,
  PayLaterBill,
  BudgetCategory,
  SafeToSpendCalculation,
  SafeToSpendStatus,
  CategoryId,
} from '../types/finance';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_PAYLATER_BILLS,
  INITIAL_BUDGET_CATEGORIES,
} from '../data/mockData';
import { getDaysRemainingInMonth } from '../utils/formatters';
import { FinanceContext } from './financeContextInstance';

const STORAGE_KEYS = {
  TRANSACTIONS: 'sakupas_transactions_v1',
  PAYLATER: 'sakupas_paylater_v1',
  SELFLOCK: 'sakupas_selflock_v1',
  BUDGETS: 'sakupas_budgets_v1',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'transactions' | 'mode-hemat'>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize transactions with localStorage
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load transactions from localStorage', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  // Initialize PayLater bills
  const [payLaterBills, setPayLaterBills] = useState<PayLaterBill[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAYLATER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load PayLater from localStorage', e);
    }
    return INITIAL_PAYLATER_BILLS;
  });

  // Initialize SelfLock
  const [isSelfLockActive, setIsSelfLockActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELFLOCK);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load SelfLock from localStorage', e);
    }
    return false;
  });

  // Initialize Budget Categories
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load Budgets from localStorage', e);
    }
    return INITIAL_BUDGET_CATEGORIES;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Save transactions failed', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYLATER, JSON.stringify(payLaterBills));
    } catch (e) {
      console.error('Save PayLater failed', e);
    }
  }, [payLaterBills]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELFLOCK, JSON.stringify(isSelfLockActive));
    } catch (e) {
      console.error('Save SelfLock failed', e);
    }
  }, [isSelfLockActive]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgetCategories));
    } catch (e) {
      console.error('Save Budgets failed', e);
    }
  }, [budgetCategories]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Update spent in budget category if it's an expense
    if (tx.type === 'expense') {
      setBudgetCategories((prev) =>
        prev.map((cat) =>
          cat.id === tx.category ? { ...cat, spent: cat.spent + tx.amount } : cat
        )
      );
    }

    showToast(`Transaksi ${tx.type === 'income' ? 'pemasukan' : 'pengeluaran'} berhasil dicatat.`);
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (target.type === 'expense') {
      setBudgetCategories((prev) =>
        prev.map((cat) =>
          cat.id === target.category ? { ...cat, spent: Math.max(0, cat.spent - target.amount) } : cat
        )
      );
    }
    showToast('Transaksi berhasil dihapus.');
  };

  const togglePayLaterPaid = (id: string) => {
    setPayLaterBills((prev) =>
      prev.map((bill) => {
        if (bill.id === id) {
          const nextStatus = bill.status === 'paid' ? 'unpaid' : 'paid';
          return { ...bill, status: nextStatus };
        }
        return bill;
      })
    );
    showToast('Status tagihan diperbarui.');
  };

  const updateBudgetAllocation = (id: CategoryId, allocated: number) => {
    setBudgetCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, allocated } : cat))
    );
    showToast('Alokasi budget berhasil disesuaikan.');
  };

  const resetToDefaultData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setPayLaterBills(INITIAL_PAYLATER_BILLS);
    setIsSelfLockActive(false);
    setBudgetCategories(INITIAL_BUDGET_CATEGORIES);
    showToast('Data dikembalikan ke data simulasi awal.');
  };

  // Calculations
  const totalPayLater = useMemo(() => {
    return payLaterBills
      .filter((b) => b.status !== 'paid')
      .reduce((acc, curr) => acc + curr.totalAmount, 0);
  }, [payLaterBills]);

  const upcomingBillAmount = useMemo(() => {
    const unpaid = payLaterBills.filter((b) => b.status !== 'paid');
    if (unpaid.length === 0) return 0;
    // Sort by due date
    const sorted = [...unpaid].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    return sorted[0].totalAmount;
  }, [payLaterBills]);

  // Main balance calculation: base 2.500.000 + differential of income & expenses
  const mainBalance = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const baseSaldo = 2500000;
    const initialNet = INITIAL_TRANSACTIONS.reduce(
      (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
      0
    );
    const currentNet = totalIncome - totalExpense;
    const computed = baseSaldo + (currentNet - initialNet);
    return Math.max(0, computed);
  }, [transactions]);

  const safeToSpend = useMemo<SafeToSpendCalculation>(() => {
    const totalBudget = 1180000;
    const baseSafe = 850000;
    const currentExpenseSum = transactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const initialExpenseSum = INITIAL_TRANSACTIONS
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const deltaExpense = currentExpenseSum - initialExpenseSum;
    const remainingAmount = Math.max(0, baseSafe - deltaExpense);
    const percentage = Math.min(100, Math.max(0, Math.round((remainingAmount / totalBudget) * 100)));

    let status: SafeToSpendStatus = 'safe';
    let statusLabel = 'Kondisi Aman';

    if (percentage < 30 || remainingAmount < 250000) {
      status = 'danger';
      statusLabel = 'Batas Bahaya';
    } else if (percentage < 60 || remainingAmount < 500000) {
      status = 'warning';
      statusLabel = 'Perlu Berhati-hati';
    }

    const daysRemaining = getDaysRemainingInMonth();
    const dailySafeSpend = Math.round(remainingAmount / daysRemaining);

    return {
      remainingAmount,
      totalBudget,
      percentage,
      status,
      statusLabel,
      dailySafeSpend,
      daysRemaining,
    };
  }, [transactions]);

  return (
    <FinanceContext.Provider
      value={{
        currentView,
        setCurrentView,
        transactions,
        addTransaction,
        deleteTransaction,
        payLaterBills,
        togglePayLaterPaid,
        isSelfLockActive,
        setSelfLockActive: setIsSelfLockActive,
        budgetCategories,
        updateBudgetAllocation,
        mainBalance,
        totalPayLater,
        upcomingBillAmount,
        safeToSpend,
        resetToDefaultData,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};
