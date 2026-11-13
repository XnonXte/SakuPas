import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { ExpenseDistributionChart } from '../components/transactions/ExpenseDistributionChart';
import { TransactionFormModal } from '../components/transactions/TransactionFormModal';

export const TransactionsView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Page Header - Target Heading 34px, Subtitle 16px, Button 15px */}
      <header className="pb-6 border-b border-[#E6E1DB]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-['Univers',sans-serif] text-[28px] sm:text-[34px] font-bold tracking-tight text-[#343F56]">
              Transaksi
            </h1>
            <p className="font-['Shandon_Slab',serif] text-[16px] text-[#747B83] mt-1.5 leading-relaxed">
              Pantau ke mana uangmu pergi.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#E9896A] hover:bg-[#dc7656] text-white font-['Shandon_Slab',serif] text-[15px] font-medium transition-colors shadow-none"
          >
            <Plus size={17} strokeWidth={2.5} />
            <span>Tambah Transaksi</span>
          </button>
        </div>
      </header>

      {/* Expense Distribution Donut Chart */}
      <ExpenseDistributionChart />

      {/* Transaction History Table */}
      <TransactionTable />

      {/* Quick Transaction Input Modal */}
      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
