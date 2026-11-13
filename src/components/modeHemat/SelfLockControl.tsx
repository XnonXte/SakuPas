import React, { useState } from 'react';
import { Lock, Unlock, EyeOff, Ban } from 'lucide-react';
import { useFinance } from '../../context';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const SelfLockControl: React.FC = () => {
  const { isSelfLockActive, setSelfLockActive, showToast } = useFinance();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingActiveState, setPendingActiveState] = useState(false);

  const handleToggleClick = () => {
    setPendingActiveState(!isSelfLockActive);
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    setSelfLockActive(pendingActiveState);
    if (pendingActiveState) {
      showToast('Penguncian Mandiri diaktifkan. Belanja lifestyle dibatasi.');
    } else {
      showToast('Penguncian Mandiri dinonaktifkan.');
    }
  };

  return (
    <section className="py-7 border-b border-[#E6E1DB]">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h2 className="font-['Univers',sans-serif] text-[24px] font-semibold text-[#343F56]">
              Penguncian Mandiri
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[13px] font-['Shandon_Slab',serif] font-medium ${
                isSelfLockActive
                  ? 'bg-[#faeae4] text-[#E9896A]'
                  : 'bg-[#EFEBE6] text-[#747B83]'
              }`}
            >
              {isSelfLockActive ? <Lock size={13} /> : <Unlock size={13} />}
              <span>Status: {isSelfLockActive ? 'Aktif' : 'Tidak Aktif'}</span>
            </span>
          </div>
          <p className="font-['Shandon_Slab',serif] text-[15px] text-[#747B83] max-w-2xl leading-relaxed">
            Batasi dorongan belanja sementara agar kamu bisa lebih fokus pada kebutuhan utama. Fitur ini sepenuhnya berada di bawah kendalimu dan dapat dibuka kembali kapan saja.
          </p>
        </div>

        {/* Toggle Button - Target 14-15px */}
        <button
          type="button"
          onClick={handleToggleClick}
          className={`px-4.5 py-2.5 rounded-[6px] text-[14px] font-['Shandon_Slab',serif] font-medium transition-colors flex items-center gap-2 flex-shrink-0 ${
            isSelfLockActive
              ? 'bg-[#EFEBE6] text-[#343F56] hover:bg-[#E6E1DB]'
              : 'bg-[#E9896A] text-white hover:bg-[#dc7656]'
          }`}
        >
          {isSelfLockActive ? (
            <>
              <Unlock size={16} />
              <span>Matikan Penguncian</span>
            </>
          ) : (
            <>
              <Lock size={16} />
              <span>Aktifkan Penguncian</span>
            </>
          )}
        </button>
      </div>

      {/* Explanation of Restrictions - Target Title 16px, Text 14px */}
      <div className="bg-[#FFFFFF] border border-[#E6E1DB] rounded-[8px] divide-y divide-[#E6E1DB]">
        <div className="p-4.5 flex items-start gap-4">
          <div className="w-8 h-8 rounded-[6px] bg-[#EFEBE6] text-[#343F56] flex items-center justify-center flex-shrink-0 mt-0.5">
            <EyeOff size={17} />
          </div>
          <div>
            <h3 className="font-['Univers',sans-serif] text-[16px] font-medium text-[#343F56]">
              1. Menyembunyikan Rekomendasi Belanja
            </h3>
            <p className="font-['Shandon_Slab',serif] text-[14px] text-[#747B83] mt-1 leading-relaxed">
              Menghilangkan notifikasi impulsif, diskon flash sale, dan rekomendasi etalase e-commerce serta TikTok Shop selama masa penghematan.
            </p>
          </div>
        </div>

        <div className="p-4.5 flex items-start gap-4">
          <div className="w-8 h-8 rounded-[6px] bg-[#EFEBE6] text-[#343F56] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Ban size={17} />
          </div>
          <div>
            <h3 className="font-['Univers',sans-serif] text-[16px] font-medium text-[#343F56]">
              2. Membatasi Alokasi Budget Lifestyle
            </h3>
            <p className="font-['Shandon_Slab',serif] text-[14px] text-[#747B83] mt-1 leading-relaxed">
              Mengunci batas pengeluaran kategori hiburan & nongkrong ke alokasi darurat (maksimal Rp100.000/minggu) agar sisa uang saku aman hingga akhir bulan.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        title={pendingActiveState ? 'Aktifkan Penguncian Mandiri?' : 'Matikan Penguncian Mandiri?'}
        description={
          pendingActiveState
            ? 'Penguncian akan membatasi alokasi pengeluaran non-esensial dan membantu fokus pada kebutuhan pokok hingga saldo kembali stabil.'
            : 'Pembatasan budget lifestyle akan dikembalikan ke batas normal. Pastikan pengeluaranmu tetap terkontrol.'
        }
        confirmLabel={pendingActiveState ? 'Ya, Aktifkan' : 'Ya, Matikan'}
        cancelLabel="Batal"
      />
    </section>
  );
};
