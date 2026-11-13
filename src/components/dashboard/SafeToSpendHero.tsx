import React from 'react';
import { useFinance } from '../../context';
import { formatIDR } from '../../utils/formatters';
import type { SafeToSpendStatus } from '../../types/finance';
import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';

export const SafeToSpendHero: React.FC = () => {
  const { safeToSpend, isSelfLockActive, setCurrentView } = useFinance();

  const {
    remainingAmount,
    percentage,
    status,
    statusLabel,
    dailySafeSpend,
    daysRemaining,
  } = safeToSpend;

  // Status visual configurations
  const statusConfig: Record<
    SafeToSpendStatus,
    {
      color: string;
      bgColor: string;
      icon: typeof ShieldCheck;
      badgeText: string;
      barColor: string;
    }
  > = {
    safe: {
      color: '#387C6D',
      bgColor: '#e5f0ed',
      icon: ShieldCheck,
      badgeText: statusLabel,
      barColor: 'bg-[#387C6D]',
    },
    warning: {
      color: '#E9896A',
      bgColor: '#faeae4',
      icon: AlertTriangle,
      badgeText: statusLabel,
      barColor: 'bg-[#E9896A]',
    },
    danger: {
      color: '#C84F4F',
      bgColor: '#faeaea',
      icon: AlertCircle,
      badgeText: statusLabel,
      barColor: 'bg-[#C84F4F]',
    },
  };

  const currentConfig = statusConfig[status];
  const StatusIcon = currentConfig.icon;

  return (
    <section className="py-7 border-b border-[#E6E1DB]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          {/* Label & Status Badge - Target Label 14px, Badge 13px */}
          <div className="flex items-center gap-3 mb-2.5">
            <span className="font-['Univers',sans-serif] text-[14px] font-semibold tracking-wider text-[#747B83] uppercase">
              Safe to Spend
            </span>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-[13px] font-['Shandon_Slab',serif] font-medium"
              style={{ backgroundColor: currentConfig.bgColor, color: currentConfig.color }}
            >
              <StatusIcon size={14} strokeWidth={2.2} />
              <span>{currentConfig.badgeText}</span>
            </div>
          </div>

          {/* Large Financial Hero Metric - Target Size 52px */}
          <div className="flex items-baseline gap-3.5">
            <span className="font-['Univers',sans-serif] text-[40px] sm:text-[52px] font-bold text-[#343F56] tracking-tight tabular-nums leading-none">
              {formatIDR(remainingAmount)}
            </span>
            <span className="font-['Univers',sans-serif] text-[20px] text-[#747B83] font-medium tabular-nums">
              ({percentage}%)
            </span>
          </div>

          {/* Contextual Subtext - Target Size 15px */}
          <p className="font-['Shandon_Slab',serif] text-[15px] text-[#747B83] mt-2.5 leading-relaxed">
            Aman dibelanjakan hingga akhir bulan • Estimasi{' '}
            <span className="font-semibold text-[#343F56] tabular-nums text-[16px]">
              {formatIDR(dailySafeSpend)}
            </span>{' '}
            / hari ({daysRemaining} hari tersisa)
          </p>
        </div>

        {/* Mode Hemat CTA */}
        {(status !== 'safe' || isSelfLockActive) && (
          <div className="flex items-center">
            <button
              onClick={() => setCurrentView('mode-hemat')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] text-[14px] font-['Shandon_Slab',serif] font-medium text-[#343F56] bg-[#EFEBE6] hover:bg-[#E6E1DB] transition-colors"
            >
              <span>{isSelfLockActive ? 'Mode Hemat Aktif' : 'Tinjau di Mode Hemat'}</span>
              <span className="text-[14px]">→</span>
            </button>
          </div>
        )}
      </div>

      {/* Sleek Minimalist Progress Indicator - 8px height */}
      <div className="mt-6">
        <div className="h-2 w-full bg-[#E6E1DB] rounded-full overflow-hidden">
          <div
            className={`h-full ${currentConfig.barColor} transition-all duration-500 rounded-full`}
            style={{ width: `${Math.min(100, Math.max(4, percentage))}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[13px] font-['Shandon_Slab',serif] text-[#747B83] mt-2">
          <span>Rp0 (Habis)</span>
          <span>Batas Aman: Rp1.180.000</span>
        </div>
      </div>
    </section>
  );
};
