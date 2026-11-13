import React from 'react';
import { LayoutDashboard, ArrowLeftRight, ShieldAlert, RotateCcw } from 'lucide-react';
import { useFinance } from '../../context';

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, isSelfLockActive, resetToDefaultData } = useFinance();

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'transactions' as const,
      label: 'Transaksi',
      icon: ArrowLeftRight,
      badge: null,
    },
    {
      id: 'mode-hemat' as const,
      label: 'Mode Hemat',
      icon: ShieldAlert,
      badge: isSelfLockActive ? 'Aktif' : null,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[220px] fixed top-0 bottom-0 left-0 bg-[#F8F5F1] border-r border-[#E6E1DB] z-20 select-none">
      {/* Brand Wordmark - Target Size 26px */}
      <div className="px-6 pt-7 pb-6 border-b border-[#E6E1DB]">
        <div className="flex items-center gap-1.5">
          <span className="font-['Univers',sans-serif] text-[26px] font-bold tracking-tight text-[#343F56]">
            SakuPas
          </span>
          <span className="w-2 h-2 rounded-full bg-[#E9896A]" />
        </div>
        <p className="font-['Shandon_Slab',serif] text-[13px] text-[#747B83] mt-0.5 tracking-wide">
          Finansial Mahasiswa
        </p>
      </div>

      {/* Main Navigation - Target Size 15px */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[6px] text-[15px] font-['Shandon_Slab',serif] transition-colors text-left ${
                isActive
                  ? 'bg-[#EFEBE6] text-[#343F56] font-semibold'
                  : 'text-[#747B83] hover:text-[#343F56] hover:bg-[#F8F5F1]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.2 : 1.75}
                  className={isActive ? 'text-[#343F56]' : 'text-[#747B83]'}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[12px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-[4px] bg-[#E9896A] text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile & Simulation Helper */}
      <div className="p-4 border-t border-[#E6E1DB] space-y-3.5">
        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#343F56] text-white flex items-center justify-center font-['Univers',sans-serif] text-[13px] font-bold flex-shrink-0">
            RP
          </div>
          <div className="overflow-hidden">
            <p className="font-['Univers',sans-serif] text-[14px] font-medium text-[#343F56] truncate">
              Rian Pratama
            </p>
            <p className="font-['Shandon_Slab',serif] text-[13px] text-[#747B83] truncate">
              S1 Fasilkom UI
            </p>
          </div>
        </div>

        {/* Self-Lock quick indicator */}
        <div className="flex items-center justify-between text-[13px] font-['Shandon_Slab',serif] pt-1 text-[#747B83]">
          <span>Mode Hemat</span>
          <span className={`font-medium ${isSelfLockActive ? 'text-[#E9896A]' : 'text-[#387C6D]'}`}>
            {isSelfLockActive ? 'Sedang Aktif' : 'Standby'}
          </span>
        </div>

        {/* Reset Mock Data Action */}
        <button
          onClick={resetToDefaultData}
          title="Reset simulasi ke kondisi awal"
          className="w-full flex items-center justify-center gap-1.5 py-2 text-[13px] font-['Shandon_Slab',serif] text-[#747B83] hover:text-[#343F56] hover:bg-[#EFEBE6] rounded-[6px] transition-colors"
        >
          <RotateCcw size={13} />
          <span>Reset Simulasi Data</span>
        </button>
      </div>
    </aside>
  );
};
