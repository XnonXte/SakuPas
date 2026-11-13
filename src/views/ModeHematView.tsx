import React from 'react';
import { WarningHero } from '../components/modeHemat/WarningHero';
import { SelfLockControl } from '../components/modeHemat/SelfLockControl';
import { BudgetAllocationGuide } from '../components/modeHemat/BudgetAllocationGuide';

export const ModeHematView: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Page Header - Target Heading 34px, Subtitle 16px */}
      <header className="pb-6 border-b border-[#E6E1DB]">
        <div>
          <h1 className="font-['Univers',sans-serif] text-[28px] sm:text-[34px] font-bold tracking-tight text-[#343F56]">
            Mode Hemat
          </h1>
          <p className="font-['Shandon_Slab',serif] text-[16px] text-[#747B83] mt-1.5 leading-relaxed">
            Intervensi finansial dan pemulihan kendali pengeluaran mahasiswa.
          </p>
        </div>
      </header>

      {/* Financial Health Warning & Metrics */}
      <WarningHero />

      {/* Self-Lock Control Feature */}
      <SelfLockControl />

      {/* Budget Allocation Guide */}
      <BudgetAllocationGuide />
    </div>
  );
};
