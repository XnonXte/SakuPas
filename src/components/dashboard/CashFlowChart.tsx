import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { MONTHLY_CASH_FLOW_DATA } from '../../data/mockData';
import { formatIDR } from '../../utils/formatters';

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E6E1DB] px-4 py-3 rounded-[6px] shadow-sm font-['Shandon_Slab',serif] text-[13px]">
        <p className="font-['Univers',sans-serif] font-semibold text-[#343F56] text-[14px] mb-2 border-b border-[#E6E1DB] pb-1.5">
          {label} 2026
        </p>
        <div className="space-y-1.5">
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-5">
              <span className="flex items-center gap-2 text-[#747B83]">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-['Univers',sans-serif] font-bold text-[#343F56] tabular-nums">
                {formatIDR(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const CashFlowChart: React.FC = () => {
  return (
    <section className="py-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-6">
        <div>
          <h2 className="font-['Univers',sans-serif] text-[24px] font-semibold text-[#343F56]">
            Arus Kas Bulanan
          </h2>
          <p className="font-['Shandon_Slab',serif] text-[15px] text-[#747B83] mt-1 leading-relaxed">
            Pemasukan vs pengeluaran riil dan proyeksi hingga akhir bulan berjalan.
          </p>
        </div>

        {/* Minimalist Legend - Target Size 14px */}
        <div className="flex items-center gap-5 text-[14px] font-['Shandon_Slab',serif] text-[#747B83]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#387C6D]" />
            <span>Pemasukan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#E9896A]" />
            <span>Pengeluaran</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas - Height 280px */}
      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={MONTHLY_CASH_FLOW_DATA}
            margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
          >
            <CartesianGrid stroke="#DBD5CC" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#747B83"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#E6E1DB' }}
              tick={{ fill: '#747B83', fontFamily: 'Shandon Slab' }}
            />
            <YAxis
              stroke="#747B83"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `Rp${v / 1000}k`}
              tick={{ fill: '#747B83', fontFamily: 'Univers' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="pemasukan"
              name="Pemasukan"
              stroke="#387C6D"
              strokeWidth={2.2}
              dot={{ r: 3.5, fill: '#387C6D', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#387C6D' }}
            />
            <Line
              type="monotone"
              dataKey="pengeluaran"
              name="Pengeluaran"
              stroke="#E9896A"
              strokeWidth={2.2}
              dot={{ r: 3.5, fill: '#E9896A', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#E9896A' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
