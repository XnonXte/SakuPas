import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

export const FontNotice: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFontAssetPresent] = useState<boolean>(() => {
    if (typeof document !== 'undefined' && document.fonts && document.fonts.check) {
      return document.fonts.check('16px Univers') && document.fonts.check('16px "Shandon Slab"');
    }
    return false;
  });

  return (
    <footer className="mt-16 pt-8 pb-16 md:pb-8 border-t border-[#E6E1DB] text-[13px] font-['Shandon_Slab',serif] text-[#747B83] flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span>SakuPas © 2026</span>
        <span>•</span>
        <span>Tipografi: Univers (Heading & Metrik) • Shandon Slab (Body)</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 hover:text-[#343F56] transition-colors underline underline-offset-2"
        >
          <Info size={14} />
          <span>Status Aset Font Web</span>
        </button>
      </div>

      {isOpen && (
        <div className="w-full mt-3 p-4 bg-[#EFEBE6] rounded-[6px] border border-[#E6E1DB] text-[13px] text-[#343F56] space-y-1.5 relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 text-[#747B83] hover:text-[#343F56]"
          >
            <X size={16} />
          </button>
          <p className="font-['Univers',sans-serif] font-semibold text-[14px]">
            Konfigurasi Tipografi SakuPas
          </p>
          <p className="text-[#747B83] leading-relaxed">
            Sistem telah mengonfigurasi aturan CSS font-family <code>Univers</code> untuk judul & metrik serta <code>Shandon Slab</code> untuk isi.
          </p>
          <p className="text-[#747B83] leading-relaxed">
            Status file aset lokal:{' '}
            {isFontAssetPresent ? (
              <span className="text-[#387C6D] font-medium">Font kustom aktif termuat.</span>
            ) : (
              <span className="text-[#E9896A] font-medium">
                File .woff2 belum disertakan di <code>/public/fonts/</code>. Sistem saat ini menggunakan fallback sistem sans-serif/serif terstruktur sesuai spesifikasi.
              </span>
            )}
          </p>
        </div>
      )}
    </footer>
  );
};
