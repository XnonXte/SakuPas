import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#343F56]/20 backdrop-blur-[2px]">
      <div
        className="w-full max-w-md bg-[#FFFFFF] rounded-[10px] border border-[#E6E1DB] p-6 shadow-sm relative animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#747B83] hover:text-[#343F56] transition-colors p-1"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-[8px] flex items-center justify-center flex-shrink-0 ${
              isDestructive ? 'bg-[#faeaea] text-[#C84F4F]' : 'bg-[#faeae4] text-[#E9896A]'
            }`}
          >
            <AlertTriangle size={20} />
          </div>

          <div>
            <h3 className="font-['Univers',sans-serif] text-[20px] font-semibold text-[#343F56]">
              {title}
            </h3>
            <p className="font-['Shandon_Slab',serif] text-[15px] text-[#747B83] mt-2 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-[#E6E1DB]">
          <button
            type="button"
            onClick={onClose}
            className="px-4.5 py-2.5 rounded-[6px] text-[14px] font-['Shandon_Slab',serif] text-[#343F56] bg-[#EFEBE6] hover:bg-[#E6E1DB] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4.5 py-2.5 rounded-[6px] text-[14px] font-['Shandon_Slab',serif] text-white transition-colors ${
              isDestructive
                ? 'bg-[#C84F4F] hover:bg-[#b54242]'
                : 'bg-[#E9896A] hover:bg-[#dc7656]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
