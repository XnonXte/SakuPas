import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useFinance } from '../../context';
import type { Transaction } from '../../types/finance';
import { CATEGORIES } from '../../data/categories';
import { formatIDR } from '../../utils/formatters';

const BRAND_PIE_COLORS = [
  '#E9896A', // Terracotta
  '#387C6D', // Sage Green
  '#343F56', // Slate Navy
  '#747B83', // Secondary Slate
  '#d68f77', // Soft warm terracotta
  '#599587', // Soft sage
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    payload: {
      name: string;
      value: number;
      percentage: number;
      color: string;
    };
  }[];
}

const CustomDonutTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#FFFFFF] border border-[#E6E1DB] px-3.5 py-2.5 rounded-[6px] shadow-sm font-['Shandon_Slab',serif] text-[13px]">
        <p className="font-['Univers',sans-serif] font-semibold text-[#343F56] text-[14px]">
          {data.name}
        </p>
        <p className="text-[#747B83] mt-1">
          {formatIDR(data.value)} ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export const ExpenseDistributionChart: React.FC = () => {
  const { transactions } = useFinance();

  const chartData = useMemo(() => {
    const expenses = transactions.filter((t: Transaction) => t.type === 'expense');
    const totalExpense = expenses.reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const categoryTotals: Record<string, number> = {};
    expenses.forEach((t: Transaction) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const items = Object.entries(categoryTotals).map(([catId, amount], idx) => {
      const cat = CATEGORIES[catId as keyof typeof CATEGORIES];
      const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
      return {
        name: cat ? cat.name : catId,
        value: amount,
        percentage,
        color: BRAND_PIE_COLORS[idx % BRAND_PIE_COLORS.length],
      };
    });

    return {
      items: items.sort((a, b) => b.value - a.value),
      totalExpense,
    };
  }, [transactions]);

  if (chartData.items.length === 0) {
    return (
      <section className="py-7 border-b border-[#E6E1DB]">
        <h2 className="font-['Univers',sans-serif] text-[24px] font-semibold text-[#343F56]">
          Distribusi Pengeluaran
        </h2>
        <p className="font-['Shandon_Slab',serif] text-[15px] text-[#747B83] mt-2">
          Belum ada catatan pengeluaran bulan ini.
        </p>
      </section>
    );
  }

  return (
    <section className="py-7 border-b border-[#E6E1DB]">
      <div className="mb-5">
        <h2 className="font-['Univers',sans-serif] text-[24px] font-semibold text-[#343F56]">
          Distribusi Pengeluaran
        </h2>
        <p className="font-['Shandon_Slab',serif] text-[15px] text-[#747B83] mt-1 leading-relaxed">
          Proporsi pos pengeluaran berdasarkan kategori mikro.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Donut Chart with Total in Center - 220px size */}
        <div className="relative w-[220px] h-[220px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomDonutTooltip />} />
              <Pie
                data={chartData.items}
                cx="50%"
                cy="50%"
                innerRadius={66}
                outerRadius={96}
                paddingAngle={2.5}
                dataKey="value"
                stroke="#F8F5F1"
                strokeWidth={2}
              >
                {chartData.items.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-['Univers',sans-serif] text-[12px] uppercase tracking-wider text-[#747B83] font-semibold">
              Total
            </span>
            <span className="font-['Univers',sans-serif] text-[16px] font-bold text-[#343F56] tabular-nums mt-0.5">
              {formatIDR(chartData.totalExpense)}
            </span>
          </div>
        </div>

        {/* Minimalist Legend & Percentage Breakdown - Target Text 15px, Amount 16px */}
        <div className="flex-1 w-full divide-y divide-[#E6E1DB]">
          {chartData.items.map((item) => (
            <div key={item.name} className="py-3 flex items-center justify-between text-[15px]">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-['Shandon_Slab',serif] text-[#343F56] truncate">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-5">
                <span className="font-['Univers',sans-serif] text-[16px] font-bold text-[#343F56] tabular-nums">
                  {formatIDR(item.value)}
                </span>
                <span className="font-['Univers',sans-serif] text-[14px] text-[#747B83] w-10 text-right tabular-nums">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
