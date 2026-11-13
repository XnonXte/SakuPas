import React, { useState } from 'react';
import { X, Sparkles, Navigation, UtensilsCrossed, BookOpen, ArrowDownLeft, CircleDot } from 'lucide-react';
import { useFinance } from '../../context';
import type { CategoryId, TransactionType } from '../../types/finance';
import { CATEGORIES } from '../../data/categories';
import { parseIDRInput } from '../../utils/formatters';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [nominalRaw, setNominalRaw] = useState<string>('');
  const [category, setCategory] = useState<CategoryId>('groceries');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('QRIS BCA');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const numeric = parseIDRInput(raw);
    if (numeric === 0) {
      setNominalRaw('');
    } else {
      setNominalRaw(numeric.toString());
    }
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(nominalRaw, 10);
    if (!amount || amount <= 0) {
      setError('Masukkan nominal transaksi yang valid.');
      return;
    }
    if (!description.trim()) {
      setError('Masukkan deskripsi singkat pengeluaran atau pemasukan.');
      return;
    }

    addTransaction({
      amount,
      type,
      category,
      description: description.trim(),
      date,
      paymentMethod,
    });

    // Reset form & close
    setNominalRaw('');
    setDescription('');
    onClose();
  };

  const getCategoryIcon = (id: CategoryId) => {
    switch (id) {
      case 'lifestyle':
        return <Sparkles size={16} />;
      case 'transportation':
        return <Navigation size={16} />;
      case 'groceries':
        return <UtensilsCrossed size={16} />;
      case 'education':
        return <BookOpen size={16} />;
      case 'allowance':
        return <ArrowDownLeft size={16} />;
      default:
        return <CircleDot size={16} />;
    }
  };

  // Filter available categories based on type
  const availableCategories = Object.values(CATEGORIES).filter((cat) => {
    if (type === 'income') {
      return cat.id === 'allowance' || cat.id === 'other';
    }
    return cat.id !== 'allowance';
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#343F56]/25 backdrop-blur-[2px]">
      <div
        className="w-full max-w-lg bg-[#FFFFFF] rounded-[10px] border border-[#E6E1DB] p-6 sm:p-7 shadow-sm relative animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#747B83] hover:text-[#343F56] transition-colors p-1"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        <h2 className="font-['Univers',sans-serif] text-[22px] font-bold text-[#343F56]">
          Catat Transaksi Baru
        </h2>
        <p className="font-['Shandon_Slab',serif] text-[14px] text-[#747B83] mt-1 leading-relaxed">
          Catat pengeluaran harian atau uang saku dengan cepat.
        </p>

        {error && (
          <div className="mt-3.5 px-3.5 py-2.5 bg-[#faeaea] text-[#C84F4F] text-[13px] font-['Shandon_Slab',serif] rounded-[6px] border border-[#faeaea]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 font-['Shandon_Slab',serif]">
          {/* Jenis Transaksi: Pemasukan / Pengeluaran */}
          <div>
            <label className="block text-[14px] font-medium text-[#747B83] mb-1.5 uppercase tracking-wide">
              Jenis Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory('groceries');
                }}
                className={`py-2.5 px-3.5 rounded-[6px] text-[14px] font-medium transition-colors ${
                  type === 'expense'
                    ? 'bg-[#E9896A] text-white'
                    : 'bg-[#EFEBE6] text-[#343F56] hover:bg-[#E6E1DB]'
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory('allowance');
                }}
                className={`py-2.5 px-3.5 rounded-[6px] text-[14px] font-medium transition-colors ${
                  type === 'income'
                    ? 'bg-[#387C6D] text-white'
                    : 'bg-[#EFEBE6] text-[#343F56] hover:bg-[#E6E1DB]'
                }`}
              >
                Pemasukan
              </button>
            </div>
          </div>

          {/* Nominal Transaksi with live IDR formatting - Target 22px */}
          <div>
            <label className="block text-[14px] font-medium text-[#747B83] mb-1.5 uppercase tracking-wide">
              Nominal Transaksi
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-['Univers',sans-serif] font-bold text-[#343F56] text-[18px]">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={nominalRaw ? parseInt(nominalRaw, 10).toLocaleString('id-ID') : ''}
                onChange={handleAmountChange}
                className="w-full pl-14 pr-4 py-2.5 rounded-[6px] border border-[#E6E1DB] bg-[#FFFFFF] text-[#343F56] font-['Univers',sans-serif] text-[22px] font-bold tabular-nums focus:outline-none focus:border-[#343F56]"
                autoFocus
              />
            </div>
          </div>

          {/* Kategori (Micro-categorization) */}
          <div>
            <label className="block text-[14px] font-medium text-[#747B83] mb-1.5 uppercase tracking-wide">
              Kategori
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {availableCategories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-[6px] text-left text-[13px] border transition-colors ${
                    category === cat.id
                      ? 'border-[#343F56] bg-[#EFEBE6] text-[#343F56] font-medium'
                      : 'border-[#E6E1DB] bg-[#FFFFFF] text-[#747B83] hover:border-[#747B83]'
                  }`}
                >
                  <span className="text-[#343F56]">{getCategoryIcon(cat.id)}</span>
                  <div className="truncate">
                    <p className="truncate text-[#343F56] text-[14px] font-medium">{cat.name}</p>
                    <p className="text-[12px] text-[#747B83] truncate">{cat.sublabel}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-[14px] font-medium text-[#747B83] mb-1.5 uppercase tracking-wide">
              Deskripsi Transaksi
            </label>
            <input
              type="text"
              placeholder="Contoh: Warteg Bahari paket ayam, GrabBike ke kampus"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E6E1DB] bg-[#FFFFFF] text-[#343F56] text-[14px] focus:outline-none focus:border-[#343F56]"
            />
          </div>

          {/* Tanggal & Metode Pembayaran */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[14px] font-medium text-[#747B83] mb-1.5 uppercase tracking-wide">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E6E1DB] bg-[#FFFFFF] text-[#343F56] text-[14px] focus:outline-none focus:border-[#343F56]"
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#747B83] mb-1.5 uppercase tracking-wide">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E6E1DB] bg-[#FFFFFF] text-[#343F56] text-[14px] focus:outline-none focus:border-[#343F56]"
              >
                <option value="QRIS BCA">QRIS BCA</option>
                <option value="GoPay">GoPay</option>
                <option value="OVO">OVO</option>
                <option value="ShopeePay">ShopeePay</option>
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="Tunai">Tunai / Cash</option>
              </select>
            </div>
          </div>

          {/* Form Actions - Target 15px */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6E1DB]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-[6px] text-[14px] text-[#343F56] bg-[#EFEBE6] hover:bg-[#E6E1DB] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-[6px] text-[14px] text-white bg-[#E9896A] hover:bg-[#dc7656] font-medium transition-colors"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
