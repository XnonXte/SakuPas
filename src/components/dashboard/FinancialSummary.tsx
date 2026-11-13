import React from 'react';
import { useFinance } from '../../context';
import { formatIDR } from '../../utils/formatters';

export const FinancialSummary: React.FC = () => {
  const { mainBalance, totalPayLater, upcomingBillAmount } = useFinance();

  const metrics = [
    {
      label: 'Saldo Utama',
      value: formatIDR(mainBalance),
      note: 'Kas rekening & e-wallet',
      color: '#343F56',
    },
    {
      label: 'Total PayLater',
      value: formatIDR(totalPayLater),
      note: 'Total kewajiban belum lunas',
      color: totalPayLater > 0 ? '#E9896A' : '#387C6D',
    },
    {
      label: 'Tagihan Terdekat',
      value: formatIDR(upcomingBillAmount),
      note: 'Jatuh tempo dlm 7 hari',
      color: upcomingBillAmount > 0 ? '#343F56' : '#747B83',
    },
  ];

  return (
    <section className="py-7 border-b border-[#E6E1DB]">
      {/* Horizontal metric group with subtle vertical hairlines - Target Metric 26px */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E6E1DB]">
        {metrics.map((item, idx) => (
          <div
            key={item.label}
            className={`${
              idx === 0
                ? 'sm:pr-8 pb-5 sm:pb-0'
                : idx === 1
                ? 'sm:px-8 py-5 sm:py-0'
                : 'sm:pl-8 pt-5 sm:pt-0'
            }`}
          >
            <p className="font-['Univers',sans-serif] text-[13px] uppercase tracking-wider text-[#747B83] mb-1.5 font-semibold">
              {item.label}
            </p>
            <p
              className="font-['Univers',sans-serif] text-[26px] font-bold text-[#343F56] tabular-nums tracking-tight leading-tight"
              style={{ color: item.color }}
            >
              {item.value}
            </p>
            <p className="font-['Shandon_Slab',serif] text-[14px] text-[#747B83] mt-1.5">
              {item.note}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
