import React from 'react';
import { useFinance } from '../../context';

export const Header: React.FC = () => {
  const { currentView } = useFinance();

  return (
    <header className="md:hidden flex items-center justify-between px-5 py-4 bg-[#F8F5F1] border-b border-[#E6E1DB] sticky top-0 z-20">
      <div className="flex items-center gap-1.5">
        <span className="font-['Univers',sans-serif] text-[24px] font-bold tracking-tight text-[#343F56]">
          SakuPas
        </span>
        <span className="w-2 h-2 rounded-full bg-[#E9896A]" />
      </div>

      <div className="text-[14px] font-['Shandon_Slab',serif] text-[#747B83] font-medium capitalize">
        {currentView === 'mode-hemat' ? 'Mode Hemat' : currentView}
      </div>
    </header>
  );
};
