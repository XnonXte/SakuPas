import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useFinance } from '../../context';

export const Toast: React.FC = () => {
  const { toastMessage } = useFinance();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-16 md:bottom-6 right-6 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="bg-[#343F56] text-[#F8F5F1] text-[14px] font-['Shandon_Slab',serif] px-4.5 py-3 rounded-[6px] shadow-sm flex items-center gap-3 border border-[#343F56]">
        <CheckCircle2 size={16} className="text-[#387C6D]" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
