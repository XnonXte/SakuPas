/**
 * SakuPas — Mode Hemat View Module (Pure Vanilla JS)
 */

import { api } from './api.js';
import { formatIDR, renderIcon, showToast } from './utils.js';

export async function renderModeHemat(container) {
  container.innerHTML = `
    <div class="loading-indicator">
      ${renderIcon('RotateCcw', 18)} Memuat data Mode Hemat...
    </div>
  `;

  try {
    const [modeHemat, safeToSpend, accounts, budgets] = await Promise.all([
      api.getModeHemat(),
      api.getSafeToSpend(),
      api.getAccounts(),
      api.getBudgets(),
    ]);

    const totalBalance = (accounts || []).reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const totalAllocated = (budgets || []).reduce((sum, b) => sum + (b.allocated || 0), 0);
    const isActive = Boolean(modeHemat?.is_active);

    container.innerHTML = `
      <!-- Page Header -->
      <header class="page-header">
        <div>
          <h1 class="page-title">Mode Hemat</h1>
          <p class="page-description">Intervensi finansial dan pemulihan kendali pengeluaran mahasiswa.</p>
        </div>
      </header>

      <!-- Financial Warning & Diagnostic Box -->
      <section class="section-block">
        <div class="warning-box">
          <div class="warning-icon-box">
            ${renderIcon('ShieldAlert', 20, 'var(--terracotta)', 2.2)}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <h2 class="warning-title">Pengeluaranmu perlu dikendalikan.</h2>
              <span class="status-badge warning">${safeToSpend.status_label}</span>
            </div>
            <p class="section-description" style="margin-top: 8px;">
              Yuk, atur kembali pengeluaran agar kebutuhanmu tetap terpenuhi hingga akhir bulan tanpa berutang.
            </p>
          </div>
        </div>

        <!-- 4 Diagnostic Metrics -->
        <div class="diagnostic-grid">
          <div class="diagnostic-col">
            <p class="diagnostic-label">Safe to Spend</p>
            <p class="diagnostic-value tabular-nums">${formatIDR(safeToSpend.remaining_amount)}</p>
            <p class="diagnostic-note">Sisa batas aman</p>
          </div>

          <div class="diagnostic-col">
            <p class="diagnostic-label">Saldo Rekening</p>
            <p class="diagnostic-value tabular-nums">${formatIDR(totalBalance)}</p>
            <p class="diagnostic-note">Total kas tersedia</p>
          </div>

          <div class="diagnostic-col">
            <p class="diagnostic-label">Status Risiko</p>
            <p class="diagnostic-value warning">${safeToSpend.status_label}</p>
            <p class="diagnostic-note">${safeToSpend.percentage}% budget aman</p>
          </div>

          <div class="diagnostic-col">
            <p class="diagnostic-label">Estimasi Hidup</p>
            <p class="diagnostic-value tabular-nums">${formatIDR(safeToSpend.daily_safe_spend)}</p>
            <p class="diagnostic-note">per hari (${safeToSpend.days_remaining} hari)</p>
          </div>
        </div>
      </section>

      <!-- Self-Lock Control Feature -->
      <section class="section-block">
        <div class="page-header-row" style="margin-bottom: 24px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <h2 class="section-heading">Penguncian Mandiri</h2>
              <span class="status-badge ${isActive ? 'warning' : 'safe'}">
                ${renderIcon(isActive ? 'Lock' : 'Unlock', 13)}
                Status: ${isActive ? 'Aktif' : 'Tidak Aktif'}
              </span>
            </div>
            <p class="section-description" style="max-width: 680px;">
              Batasi dorongan belanja sementara agar kamu bisa lebih fokus pada kebutuhan utama. Fitur ini sepenuhnya berada di bawah kendalimu dan dapat dibuka kembali kapan saja.
            </p>
          </div>

          <div>
            <button id="btn-toggle-selflock" class="btn ${isActive ? 'btn-secondary' : 'btn-primary'}" style="white-space: nowrap;">
              ${renderIcon(isActive ? 'Unlock' : 'Lock', 16)}
              <span>${isActive ? 'Matikan Penguncian' : 'Aktifkan Penguncian'}</span>
            </button>
          </div>
        </div>

        <!-- Restrictions List -->
        <div class="restrictions-card">
          <div class="restriction-row">
            <div class="restriction-icon">${renderIcon('EyeOff', 17)}</div>
            <div>
              <h3 class="restriction-title">1. Menyembunyikan Rekomendasi Belanja</h3>
              <p class="restriction-desc">Menghilangkan etalase flash sale, notifikasi promo, dan diskon impulsif di dalam aplikasi selama masa penghematan.</p>
            </div>
          </div>

          <div class="restriction-row">
            <div class="restriction-icon">${renderIcon('Ban', 17)}</div>
            <div>
              <h3 class="restriction-title">2. Membatasi Alokasi Budget Lifestyle</h3>
              <p class="restriction-desc">Mengunci batas pengeluaran kategori hiburan & nongkrong ke alokasi darurat (maksimal Rp100.000) agar sisa uang saku aman hingga akhir bulan.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Budget Allocation Guide -->
      <section class="section-block no-border">
        <div class="page-header-row" style="margin-bottom: 24px;">
          <div>
            <h2 class="section-heading">Panduan Alokasi Budget</h2>
            <p class="section-description">Atur sisa uangmu untuk kebutuhan sampai akhir bulan secara riil.</p>
          </div>

          <div style="text-align: right;">
            <span class="diagnostic-label" style="display: block;">Total Alokasi</span>
            <p class="diagnostic-value tabular-nums" style="font-size: 18px;">${formatIDR(totalAllocated)}</p>
          </div>
        </div>

        <div class="budget-list" id="budget-rows-container">
          ${renderBudgetRows(budgets, isActive)}
        </div>
      </section>

      <!-- Confirmation Modal Container -->
      <div id="mode-hemat-modal-container"></div>
    `;

    // Attach events
    attachModeHematEvents(container, isActive);

  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-title" style="color: var(--danger)">Gagal memuat Mode Hemat</p>
        <p class="empty-state-desc">${err.message}</p>
        <button id="btn-retry-mh" class="btn btn-secondary" style="margin-top: 16px;">
          ${renderIcon('RotateCcw', 14)} Coba Lagi
        </button>
      </div>
    `;

    const retryBtn = container.querySelector('#btn-retry-mh');
    if (retryBtn) retryBtn.addEventListener('click', () => renderModeHemat(container));
  }
}

function renderBudgetRows(budgets, isSelfLockActive) {
  if (!budgets || budgets.length === 0) {
    return `<div class="empty-state"><p class="empty-state-title">Belum ada alokasi budget terdaftar.</p></div>`;
  }

  return budgets.map(b => {
    const isOver = b.spent > b.allocated;
    const isLifestyleLocked = isSelfLockActive && b.category_slug === 'lifestyle';

    let barColor = 'var(--sage)';
    if (b.percent_used >= 90) barColor = 'var(--danger)';
    else if (b.percent_used >= 70) barColor = 'var(--terracotta)';

    return `
      <div class="budget-row" data-id="${b.id}" data-cat-id="${b.category_id}" data-cat-slug="${b.category_slug}">
        <div class="budget-row-header">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <h3 class="budget-cat-name">${b.category_name}</h3>
              <span class="tx-pill" style="font-size: 12px; font-weight: 600;">${b.percent_of_total}% porsi</span>
              ${isLifestyleLocked ? `
                <span class="status-badge warning" style="font-size: 12px;">
                  ${renderIcon('Lock', 12)} Terkunci Mode Hemat
                </span>
              ` : ''}
            </div>
            <p class="budget-cat-desc">${b.category_sublabel || 'Pengeluaran bulanan'}</p>
          </div>

          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="text-align: right;">
              <div style="font-size: 14px; color: var(--text-secondary);">
                Sisa: <strong class="tabular-nums" style="font-family: var(--font-heading); font-size: 16px; color: ${isOver ? 'var(--danger)' : 'var(--text-primary)'}">
                  ${formatIDR(b.remaining)}
                </strong>
              </div>
              <p style="font-size: 13px; color: var(--text-secondary);">dari alokasi ${formatIDR(b.allocated)}</p>
            </div>

            ${!isLifestyleLocked ? `
              <button class="btn btn-secondary btn-sm btn-adjust-budget" data-id="${b.id}" data-cat-id="${b.category_id}" data-amount="${b.allocated}" title="Sesuaikan alokasi">
                ${renderIcon('Sliders', 15)}
              </button>
            ` : ''}
          </div>
        </div>

        <div class="slider-slot" id="slider-slot-${b.category_id}"></div>

        <div class="progress-bar-track" style="margin-top: 6px; height: 8px;">
          <div class="progress-bar-fill" style="width: ${Math.min(100, Math.max(2, b.percent_used))}%; background-color: ${barColor}"></div>
        </div>

        <div class="progress-labels" style="margin-top: 6px;">
          <span>Terpakai ${formatIDR(b.spent)}</span>
          <span>${b.percent_used}% dari batas</span>
        </div>
      </div>
    `;
  }).join('');
}

function attachModeHematEvents(container, isCurrentlyActive) {
  // Toggle Self-Lock button
  const btnToggle = container.querySelector('#btn-toggle-selflock');
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      openSelfLockConfirmation(container, !isCurrentlyActive);
    });
  }

  // Budget Adjust buttons
  const adjustButtons = container.querySelectorAll('.btn-adjust-budget');
  adjustButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const catId = btn.dataset.catId;
      const currentAmount = parseInt(btn.dataset.amount, 10);
      toggleBudgetSlider(container, catId, currentAmount);
    });
  });
}

function toggleBudgetSlider(container, catId, currentAmount) {
  const slot = container.querySelector(`#slider-slot-${catId}`);
  if (!slot) return;

  if (slot.innerHTML.trim()) {
    slot.innerHTML = '';
    return;
  }

  let tempValue = currentAmount;

  slot.innerHTML = `
    <div class="budget-slider-box">
      <span style="font-size: 14px; min-width: 150px; color: var(--text-primary);">
        Alokasi baru: <strong class="tabular-nums" id="slider-display-${catId}" style="font-family: var(--font-heading); font-size: 16px;">${formatIDR(tempValue)}</strong>
      </span>
      <input type="range" class="budget-slider-input" min="50000" max="1500000" step="25000" value="${tempValue}" id="range-slider-${catId}">
      <button class="btn btn-primary btn-sm btn-save-slider" id="btn-save-slider-${catId}">Terapkan</button>
      <button class="btn btn-secondary btn-sm" id="btn-cancel-slider-${catId}">Batal</button>
    </div>
  `;

  const slider = slot.querySelector(`#range-slider-${catId}`);
  const display = slot.querySelector(`#slider-display-${catId}`);
  slider.addEventListener('input', (e) => {
    tempValue = parseInt(e.target.value, 10);
    display.textContent = formatIDR(tempValue);
  });

  slot.querySelector(`#btn-cancel-slider-${catId}`).addEventListener('click', () => {
    slot.innerHTML = '';
  });

  slot.querySelector(`#btn-save-slider-${catId}`).addEventListener('click', async () => {
    try {
      await api.saveBudget({
        category_id: catId,
        amount: tempValue,
      });
      showToast('Alokasi budget berhasil diperbarui.');
      renderModeHemat(container);
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan alokasi budget.', false);
    }
  });
}

function openSelfLockConfirmation(container, activate) {
  const modalContainer = container.querySelector('#mode-hemat-modal-container');
  modalContainer.innerHTML = `
    <div class="modal-overlay open">
      <div class="modal-content" style="max-width: 460px;">
        <div style="display: flex; gap: 14px; align-items: flex-start;">
          <div style="width: 40px; height: 40px; border-radius: 8px; background-color: var(--terracotta-subtle); color: var(--terracotta); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${renderIcon('Lock', 20)}
          </div>
          <div>
            <h3 class="modal-title" style="font-size: 20px;">
              ${activate ? 'Aktifkan Penguncian Mandiri?' : 'Matikan Penguncian Mandiri?'}
            </h3>
            <p class="modal-desc" style="font-size: 15px; margin-top: 8px;">
              ${activate
                ? 'Penguncian akan membatasi alokasi pengeluaran non-esensial dan membantu fokus pada kebutuhan pokok hingga saldo kembali stabil.'
                : 'Pembatasan budget lifestyle akan dikembalikan ke batas normal. Pastikan pengeluaranmu tetap terkontrol.'}
            </p>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--divider);">
          <button class="btn btn-secondary" id="btn-cancel-sl">Batal</button>
          <button class="btn btn-primary" id="btn-confirm-sl">
            ${activate ? 'Ya, Aktifkan' : 'Ya, Matikan'}
          </button>
        </div>
      </div>
    </div>
  `;

  const closeModal = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#btn-cancel-sl').addEventListener('click', closeModal);

  modalContainer.querySelector('#btn-confirm-sl').addEventListener('click', async () => {
    try {
      if (activate) {
        await api.activateModeHemat();
        showToast('Penguncian Mandiri diaktifkan.');
      } else {
        await api.deactivateModeHemat();
        showToast('Penguncian Mandiri dinonaktifkan.');
      }
      closeModal();
      renderModeHemat(container);
    } catch (err) {
      showToast(err.message || 'Gagal mengubah status Mode Hemat.', false);
    }
  });
}
