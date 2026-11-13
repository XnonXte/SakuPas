import React from 'react';
import { useFinance } from '../../context';
import { formatIDR } from '../../utils/formatters';
import { ShieldAlert } from 'lucide-react';

export const WarningHero: React.FC = () => {
  const { safeToSpend, mainBalance } = useFinance();

  return (
    <section className="py-7 border-b border-[#E6E1DB]">
      {/* Alert Header Box - Restrained & Serious */}
      <div className="p-6 rounded-[8px] bg-[#EFEBE6] border border-[#E6E1DB] mb-7">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-[6px] bg-[#faeae4] text-[#E9896A] flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldAlert size={20} strokeWidth={2.2} />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-['Univers',sans-serif] text-[22px] font-bold text-[#343F56]">
                Pengeluaranmu perlu dikendalikan.
              </h2>
              <span className="px-2.5 py-1 rounded-[4px] text-[13px] font-['Shandon_Slab',serif] font-medium bg-[#faeae4] text-[#E9896A]">
                {safeToSpend.statusLabel}
              </span>
            </div>
            <p className="font-['Shandon_Slab',serif] text-[15px] text-[#747B83] mt-2 leading-relaxed">
              Yuk, atur kembali pengeluaran agar kebutuhanmu tetap terpenuhi hingga akhir bulan tanpa berutang.
            </p>
          </div>
        </div>
      </div>

      {/* Financial Health Diagnostic Metrics - Target Metric 24px */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E6E1DB]">
        {/* Current Safe-to-Spend */}
        <div className="pr-5 pb-4 sm:pb-0">
          <p className="font-['Univers',sans-serif] text-[13px] uppercase tracking-wider text-[#747B83] mb-1.5 font-semibold">
            Safe to Spend
          </p>
          <p className="font-['Univers',sans-serif] text-[24px] font-bold text-[#343F56] tabular-nums">
            {formatIDR(safeToSpend.remainingAmount)}
          </p>
          <p className="font-['Shandon_Slab',serif] text-[13px] text-[#747B83] mt-1">
            Sisa batas aman
          </p>
        </div>

        {/* Sisa Saldo Utama */}
        <div className="px-5 pb-4 sm:pb-0">
          <p className="font-['Univers',sans-serif] text-[13px] uppercase tracking-wider text-[#747B83] mb-1.5 font-semibold">
            Saldo Rekening
          </p>
          <p className="font-['Univers',sans-serif] text-[24px] font-bold text-[#343F56] tabular-nums">
            {formatIDR(mainBalance)}
          </p>
          <p className="font-['Shandon_Slab',serif] text-[13px] text-[#747B83] mt-1">
            Total kas tersedia
          </p>
        </div>

        {/* Status Risiko */}
        <div className="px-5 pt-4 sm:pt-0">
          <p className="font-['Univers',sans-serif] text-[13px] uppercase tracking-wider text-[#747B83] mb-1.5 font-semibold">
            Status Risiko
          </p>
          <p className="font-['Univers',sans-serif] text-[24px] font-bold text-[#E9896A]">
            {safeToSpend.statusLabel}
          </p>
          <p className="font-['Shandon_Slab',serif] text-[13px] text-[#747B83] mt-1">
            {safeToSpend.percentage}% budget aman
          </p>
        </div>

        {/* Estimasi Pengeluaran Harian */}
        <div className="pl-5 pt-4 sm:pt-0">
          <p className="font-['Univers',sans-serif] text-[13px] uppercase tracking-wider text-[#747B83] mb-1.5 font-semibold">
            Estimasi Hidup
          </p>
          <p className="font-['Univers',sans-serif] text-[24px] font-bold text-[#343F56] tabular-nums">
            {formatIDR(safeToSpend.dailySafeSpend)}
          </p>
          <p className="font-['Shandon_Slab',serif] text-[13px] text-[#747B83] mt-1">
            per hari ({safeToSpend.daysRemaining} hari)
          </p>
        </div>
      </div>
    </section>
  );
};
