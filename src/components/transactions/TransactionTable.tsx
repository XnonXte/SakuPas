import React, { useState, useMemo } from 'react';
import { Search, Trash2, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import { useFinance } from '../../context';
import type { Transaction, CategoryId } from '../../types/finance';
import { CATEGORIES } from '../../data/categories';
import { formatIDR, formatIndonesianDate } from '../../utils/formatters';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const TransactionTable: React.FC = () => {
  const { transactions, deleteTransaction } = useFinance();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Deletion modal state
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

  // Available months extracted from transactions
  const availableMonths = useMemo(() => {
    const monthMap = new Map<string, string>();
    transactions.forEach((tx: Transaction) => {
      const d = new Date(tx.date);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = formatIndonesianDate(tx.date, { shortMonth: false })
          .split(' ')
          .slice(1)
          .join(' ');
        monthMap.set(key, label);
      }
    });
    return Array.from(monthMap.entries()).map(([key, label]) => ({ key, label }));
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx: Transaction) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cat = CATEGORIES[tx.category as CategoryId]?.name.toLowerCase() || '';
        const desc = tx.description.toLowerCase();
        const method = (tx.paymentMethod || '').toLowerCase();
        if (!desc.includes(q) && !cat.includes(q) && !method.includes(q)) {
          return false;
        }
      }

      // Month
      if (selectedMonth !== 'all') {
        const txMonth = tx.date.substring(0, 7); // "YYYY-MM"
        if (txMonth !== selectedMonth) return false;
      }

      // Category
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
        return false;
      }

      // Type
      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }

      return true;
    });
  }, [transactions, searchQuery, selectedMonth, selectedCategory, selectedType]);

  const handleConfirmDelete = () => {
    if (deletingTxId) {
      deleteTransaction(deletingTxId);
      setDeletingTxId(null);
    }
  };

  const activeFiltersCount =
    (selectedMonth !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedType !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedMonth('all');
    setSelectedCategory('all');
    setSelectedType('all');
  };

  return (
    <section className="py-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-5">
        <div>
          <h2 className="font-['Univers',sans-serif] text-[24px] font-semibold text-[#343F56]">
            Riwayat Transaksi
          </h2>
          <p className="font-['Shandon_Slab',serif] text-[15px] text-[#747B83] mt-1 leading-relaxed">
            Menampilkan {filteredTransactions.length} dari {transactions.length} total transaksi tercatat.
          </p>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-[14px] font-['Shandon_Slab',serif] text-[#E9896A] hover:underline"
          >
            <X size={14} />
            <span>Reset {activeFiltersCount} filter</span>
          </button>
        )}
      </div>

      {/* Filter Controls Bar - Target Inputs 14px */}
      <div className="p-3.5 bg-[#EFEBE6]/60 rounded-[8px] mb-5 space-y-3 font-['Shandon_Slab',serif]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747B83]"
            />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-[6px] border border-[#E6E1DB] bg-[#FFFFFF] text-[#343F56] text-[14px] focus:outline-none focus:border-[#343F56]"
            />
          </div>

          {/* Month Selector */}
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3.5 py-2 rounded-[6px] border border-[#E6E1DB] bg-[#FFFFFF] text-[#343F56] text-[14px] focus:outline-none focus:border-[#343F56]"
            >
              <option value="all">Semua Bulan</option>
              {availableMonths.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-[6px] border border-[#E6E1DB] bg-[#FFFFFF] text-[#343F56] text-[14px] focus:outline-none focus:border-[#343F56]"
            >
              <option value="all">Semua Kategori</option>
              {Object.values(CATEGORIES).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3.5 py-2 rounded-[6px] border border-[#E6E1DB] bg-[#FFFFFF] text-[#343F56] text-[14px] focus:outline-none focus:border-[#343F56]"
            >
              <option value="all">Semua Tipe</option>
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Table - Target Table Content 15px */}
      {filteredTransactions.length === 0 ? (
        <div className="py-14 text-center border-t border-[#E6E1DB]">
          <p className="font-['Univers',sans-serif] text-[16px] font-semibold text-[#343F56]">
            Tidak ada transaksi ditemukan
          </p>
          <p className="font-['Shandon_Slab',serif] text-[14px] text-[#747B83] mt-1.5">
            Coba sesuaikan kata kunci pencarian atau ubah filter di atas.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6E1DB] text-[13px] font-['Univers',sans-serif] uppercase tracking-wider text-[#747B83]">
                <th className="py-3 pr-4 font-semibold">Tanggal</th>
                <th className="py-3 px-4 font-semibold">Deskripsi</th>
                <th className="py-3 px-4 font-semibold hidden sm:table-cell">Kategori</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">Metode</th>
                <th className="py-3 pl-4 text-right font-semibold">Nominal</th>
                <th className="py-3 pl-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1DB] font-['Shandon_Slab',serif] text-[15px]">
              {filteredTransactions.map((tx: Transaction) => {
                const isIncome = tx.type === 'income';
                const cat = CATEGORIES[tx.category as CategoryId] || CATEGORIES.other;

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#EFEBE6]/40 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3.5 pr-4 text-[#747B83] whitespace-nowrap text-[14px]">
                      {formatIndonesianDate(tx.date, { shortMonth: true })}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-[5px] flex items-center justify-center flex-shrink-0 ${
                            isIncome
                              ? 'bg-[#e5f0ed] text-[#387C6D]'
                              : 'bg-[#faeae4] text-[#E9896A]'
                          }`}
                        >
                          {isIncome ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                        </span>
                        <div>
                          <p className="text-[#343F56] font-medium leading-normal">
                            {tx.description}
                          </p>
                          <span className="sm:hidden text-[13px] text-[#747B83]">
                            {cat.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 hidden sm:table-cell text-[#747B83] whitespace-nowrap text-[13px]">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-[4px] bg-[#EFEBE6] text-[#343F56]">
                        {cat.name}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4 hidden md:table-cell text-[#747B83] whitespace-nowrap text-[13px]">
                      {tx.paymentMethod || '—'}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                      <span
                        className={`font-['Univers',sans-serif] font-bold tabular-nums text-[16px] ${
                          isIncome ? 'text-[#387C6D]' : 'text-[#343F56]'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatIDR(tx.amount)}
                      </span>
                    </td>

                    {/* Delete Action */}
                    <td className="py-3.5 pl-3 text-right">
                      <button
                        onClick={() => setDeletingTxId(tx.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-[#747B83] hover:text-[#C84F4F] transition-all rounded-[4px]"
                        title="Hapus transaksi"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal for deletion */}
      <ConfirmationModal
        isOpen={Boolean(deletingTxId)}
        onClose={() => setDeletingTxId(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Transaksi?"
        description="Transaksi ini akan dihapus dari riwayat dan perhitungan Safe-to-Spend akan diperbarui."
        confirmLabel="Hapus"
        cancelLabel="Batal"
        isDestructive={true}
      />
    </section>
  );
};
