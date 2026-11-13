import React, { useState } from 'react';
import { useFinance } from '../../context';
import { formatIDR } from '../../utils/formatters';
import type { CategoryId, BudgetCategory } from '../../types/finance';
import { Lock, Sliders, Check } from 'lucide-react';

export const BudgetAllocationGuide: React.FC = () => {
  const { budgetCategories, updateBudgetAllocation, isSelfLockActive } = useFinance();
  const [editingId, setEditingId] = useState<CategoryId | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const totalAllocated = budgetCategories.reduce((sum: number, cat: BudgetCategory) => sum + cat.allocated, 0);

  const handleStartEdit = (catId: CategoryId, currentAllocated: number) => {
    // If self-lock is active and editing lifestyle, restrict
    if (isSelfLockActive && catId === 'lifestyle') {
      return;
    }
    setEditingId(catId);
    setEditValue(currentAllocated);
  };

  const handleSaveEdit = (catId: CategoryId) => {
    updateBudgetAllocation(catId, editValue);
    setEditingId(null);
  };

  return (
    <section className="py-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-6">
        <div>
          <h2 className="font-['Univers',sans-serif] text-[24px] font-semibold text-[#343F56]">
            Panduan Alokasi Budget
          </h2>
          <p className="font-['Shandon_Slab',serif] text-[15px] text-[#747B83] mt-1 leading-relaxed">
            Atur sisa uangmu untuk kebutuhan sampai akhir bulan.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="font-['Univers',sans-serif] text-[13px] uppercase tracking-wider text-[#747B83] font-semibold">
            Total Alokasi
          </span>
          <p className="font-['Univers',sans-serif] text-[18px] font-bold text-[#343F56] tabular-nums">
            {formatIDR(totalAllocated)}
          </p>
        </div>
      </div>

      {/* Clean rows separated by subtle dividers (NO CARDS) */}
      <div className="divide-y divide-[#E6E1DB]">
        {budgetCategories.map((cat: BudgetCategory) => {
          const remaining = Math.max(0, cat.allocated - cat.spent);
          const percentUsed = cat.allocated > 0 ? Math.min(100, Math.round((cat.spent / cat.allocated) * 100)) : 0;
          const percentOfTotal = totalAllocated > 0 ? Math.round((cat.allocated / totalAllocated) * 100) : 0;
          const isOverBudget = cat.spent > cat.allocated;
          const isLifestyleLocked = isSelfLockActive && cat.id === 'lifestyle';
          const isEditing = editingId === cat.id;

          return (
            <div key={cat.id} className="py-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                {/* Category Title & Description - Target 16px title, 14px desc */}
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-['Univers',sans-serif] text-[16px] font-medium text-[#343F56]">
                      {cat.name}
                    </h3>
                    <span className="text-[12px] font-['Univers',sans-serif] font-medium text-[#747B83] px-2 py-0.5 bg-[#EFEBE6] rounded-[4px]">
                      {percentOfTotal}% porsi
                    </span>
                    {isLifestyleLocked && (
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-['Shandon_Slab',serif] px-2 py-0.5 rounded-[4px] bg-[#faeae4] text-[#E9896A]">
                        <Lock size={12} />
                        Terkunci Mode Hemat
                      </span>
                    )}
                  </div>
                  <p className="font-['Shandon_Slab',serif] text-[14px] text-[#747B83] mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Numbers & Adjust Action */}
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="sm:text-right">
                    <div className="flex items-baseline gap-2">
                      <span className="font-['Shandon_Slab',serif] text-[14px] text-[#747B83]">
                        Sisa:
                      </span>
                      <span
                        className={`font-['Univers',sans-serif] text-[16px] font-bold tabular-nums ${
                          isOverBudget ? 'text-[#C84F4F]' : 'text-[#343F56]'
                        }`}
                      >
                        {formatIDR(remaining)}
                      </span>
                    </div>
                    <p className="font-['Shandon_Slab',serif] text-[13px] text-[#747B83]">
                      dari alokasi {formatIDR(cat.allocated)}
                    </p>
                  </div>

                  {!isLifestyleLocked && (
                    <button
                      type="button"
                      onClick={() =>
                        isEditing ? handleSaveEdit(cat.id) : handleStartEdit(cat.id, cat.allocated)
                      }
                      className="p-2 text-[#747B83] hover:text-[#343F56] hover:bg-[#EFEBE6] rounded-[4px] transition-colors"
                      title={isEditing ? 'Simpan Alokasi' : 'Sesuaikan Alokasi'}
                    >
                      {isEditing ? <Check size={18} className="text-[#387C6D]" /> : <Sliders size={17} />}
                    </button>
                  )}
                </div>
              </div>

              {/* In-line Slider when adjusting allocation */}
              {isEditing && (
                <div className="my-3.5 p-3.5 bg-[#EFEBE6]/60 rounded-[6px] flex flex-col sm:flex-row sm:items-center gap-3.5">
                  <span className="text-[14px] font-['Shandon_Slab',serif] text-[#343F56] min-w-[140px]">
                    Alokasi baru: <strong className="font-['Univers',sans-serif] text-[15px]">{formatIDR(editValue)}</strong>
                  </span>
                  <input
                    type="range"
                    min={100000}
                    max={1500000}
                    step={25000}
                    value={editValue}
                    onChange={(e) => setEditValue(Number(e.target.value))}
                    className="flex-1 accent-[#E9896A]"
                  />
                  <button
                    onClick={() => handleSaveEdit(cat.id)}
                    className="px-4 py-1.5 bg-[#343F56] text-white rounded-[4px] text-[13px] font-['Shandon_Slab',serif] font-medium"
                  >
                    Terapkan
                  </button>
                </div>
              )}

              {/* Clean Horizontal Progress Indicator - 8px */}
              <div className="h-2 w-full bg-[#E6E1DB] rounded-full overflow-hidden mt-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    percentUsed >= 90
                      ? 'bg-[#C84F4F]'
                      : percentUsed >= 70
                      ? 'bg-[#E9896A]'
                      : 'bg-[#387C6D]'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(2, percentUsed))}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[13px] font-['Shandon_Slab',serif] text-[#747B83] mt-1.5">
                <span>Terpakai {formatIDR(cat.spent)}</span>
                <span>{percentUsed}% dari batas</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
