import React, { useState } from 'react';
import { SafeToSpendHero } from '../components/dashboard/SafeToSpendHero';
import { FinancialSummary } from '../components/dashboard/FinancialSummary';
import { PayLaterMonitor } from '../components/dashboard/PayLaterMonitor';
import { CashFlowChart } from '../components/dashboard/CashFlowChart';
import { formatIndonesianDate } from '../utils/formatters';

export const DashboardView: React.FC = () => {
  // Store today's formatted date and greeting once at initialization
  const [formattedToday] = useState<string>(() => {
    return formatIndonesianDate(new Date().toISOString(), { showDay: true });
  });

  const [greeting] = useState<string>(() => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi!';
    if (hour < 15) return 'Selamat siang!';
    if (hour < 18) return 'Selamat sore!';
    return 'Selamat malam!';
  });

  return (
    <div className="space-y-4">
      {/* Page Introduction - Target Heading 34px, Subtitle 16px */}
      <header className="pb-6 border-b border-[#E6E1DB]">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <div>
            <h1 className="font-['Univers',sans-serif] text-[28px] sm:text-[34px] font-bold tracking-tight text-[#343F56]">
              {greeting}
            </h1>
            <p className="font-['Shandon_Slab',serif] text-[16px] text-[#747B83] mt-1.5 leading-relaxed">
              Berikut ringkasan kondisi keuanganmu.
            </p>
          </div>
          <p className="font-['Shandon_Slab',serif] text-[14px] text-[#747B83]">
            {formattedToday}
          </p>
        </div>
      </header>

      {/* Safe-to-Spend Hero */}
      <SafeToSpendHero />

      {/* Financial Summary */}
      <FinancialSummary />

      {/* PayLater Obligations Monitor */}
      <PayLaterMonitor />

      {/* Monthly Cash Flow Minimalist Chart */}
      <CashFlowChart />
    </div>
  );
};
