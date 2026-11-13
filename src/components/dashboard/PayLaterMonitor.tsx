import React from 'react';
import { useFinance } from '../../context';
import type { PayLaterBill } from '../../types/finance';
import { formatIDR, formatIndonesianDate, formatRelativeDueDate } from '../../utils/formatters';
import { CheckCircle2, Clock } from 'lucide-react';

export const PayLaterMonitor: React.FC = () => {
  const { payLaterBills, togglePayLaterPaid } = useFinance();

  return (
    <section className="py-7 border-b border-[#E6E1DB]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-['Univers',sans-serif] text-[24px] font-semibold text-[#343F56]">
            Tagihan Mendatang
          </h2>
          <p className="font-['Shandon_Slab',serif] text-[15px] text-[#747B83] mt-1 leading-relaxed">
            Pantau jatuh tempo PayLater agar tidak terkena denda keterlambatan.
          </p>
        </div>
      </div>

      {/* Clean list with horizontal dividers */}
      <div className="divide-y divide-[#E6E1DB]">
        {payLaterBills.map((bill: PayLaterBill) => {
          const isPaid = bill.status === 'paid';
          const relative = formatRelativeDueDate(bill.dueDate);

          return (
            <div
              key={bill.id}
              className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-colors ${
                isPaid ? 'opacity-50' : ''
              }`}
            >
              {/* Provider & Details */}
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5">
                  <div
                    className={`w-8 h-8 rounded-[6px] flex items-center justify-center text-[13px] font-['Univers',sans-serif] font-bold ${
                      isPaid
                        ? 'bg-[#EFEBE6] text-[#747B83]'
                        : relative.isUrgent
                        ? 'bg-[#faeae4] text-[#E9896A]'
                        : 'bg-[#EFEBE6] text-[#343F56]'
                    }`}
                  >
                    {bill.provider.charAt(0)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-['Univers',sans-serif] text-[16px] font-medium text-[#343F56]">
                      {bill.provider}
                    </h3>
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[13px] font-['Shandon_Slab',serif] text-[#387C6D] bg-[#e5f0ed] px-2 py-0.5 rounded-[4px]">
                        <CheckCircle2 size={13} />
                        Lunas
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 text-[13px] font-['Shandon_Slab',serif] px-2 py-0.5 rounded-[4px] ${
                          relative.isUrgent
                            ? 'text-[#E9896A] bg-[#faeae4]'
                            : 'text-[#747B83] bg-[#EFEBE6]'
                        }`}
                      >
                        <Clock size={13} />
                        {relative.label}
                      </span>
                    )}
                  </div>

                  {bill.installmentInfo && (
                    <p className="font-['Shandon_Slab',serif] text-[13px] text-[#747B83] mt-0.5">
                      {bill.installmentInfo}
                    </p>
                  )}
                </div>
              </div>

              {/* Amount, Due Date & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-6">
                <div className="sm:text-right">
                  <p className="font-['Univers',sans-serif] text-[18px] font-bold text-[#343F56] tabular-nums">
                    {formatIDR(bill.totalAmount)}
                  </p>
                  <p className="font-['Shandon_Slab',serif] text-[13px] text-[#747B83]">
                    Jatuh tempo: {formatIndonesianDate(bill.dueDate, { shortMonth: true })}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => togglePayLaterPaid(bill.id)}
                  className={`px-3.5 py-2 rounded-[6px] text-[14px] font-['Shandon_Slab',serif] transition-colors ${
                    isPaid
                      ? 'text-[#747B83] hover:text-[#343F56] hover:bg-[#EFEBE6]'
                      : 'bg-[#EFEBE6] text-[#343F56] hover:bg-[#E6E1DB]'
                  }`}
                >
                  {isPaid ? 'Batal Lunas' : 'Tandai Lunas'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
