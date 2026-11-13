import React from 'react';
import { LayoutDashboard, ArrowLeftRight, ShieldAlert } from 'lucide-react';
import { useFinance } from '../../context';

export const MobileNav: React.FC = () => {
  const { currentView, setCurrentView, isSelfLockActive } = useFinance();

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
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#F8F5F1] border-t border-[#E6E1DB] z-30 px-3 py-2.5">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative font-['Shandon_Slab',serif] text-[13px] transition-colors ${
                isActive ? 'text-[#343F56] font-semibold' : 'text-[#747B83]'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.75}
                  className={isActive ? 'text-[#343F56]' : 'text-[#747B83]'}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#E9896A]" />
                )}
              </div>
              <span className="mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
