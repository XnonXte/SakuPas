/**
 * SakuPas — Mode Hemat View Module (Modular ES6 + jQuery)
 * Mode Hemat settings, self-lock controls and budget allocation
 */

import { api } from './api.js';
import { formatIDR, renderIcon, showToast, escapeHtml } from './utils.js';

export async function renderModeHemat(container) {
  container.innerHTML = `
    <div class="view-loading">
      <div class="spinner"></div>
      <p>Memuat pengaturan Mode Hemat...</p>
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
    const isSelfLockActive = Boolean(modeHemat?.is_active);

    container.innerHTML = `
      <!-- Mode Hemat View Header -->
      <div class="view-header">
        <div class="view-header-main">
          <div class="view-title-group">
            <h1 class="view-title">Mode Hemat</h1>
            <span class="status-pill ${isSelfLockActive ? 'badge-warning' : 'badge-safe'}">
              ${renderIcon(isSelfLockActive ? 'Lock' : 'Unlock', 13)}
              <span>${isSelfLockActive ? 'Status: Sedang Aktif' : 'Status: Standby'}</span>
            </span>
          </div>
          <p class="view-subtitle">Atur anggaran dan kendali belanja.</p>
        </div>
      </div>

      <!-- Financial Health Diagnostic Panel -->
      <section class="ledger-panel ${isSelfLockActive ? 'border-terracotta' : ''}">
        <div class="panel-inner">
          <div class="diagnostic-banner">
            <div class="diagnostic-icon-box text-terracotta">
              ${renderIcon('ShieldAlert', 22)}
            </div>
            <div class="diagnostic-text">
              <div class="diagnostic-title-row">
                <h2 class="diagnostic-title">Kondisi anggaran</h2>
                <span class="status-pill ${safeToSpend.status === 'safe' ? 'badge-safe' : 'badge-warning'}">
                  ${safeToSpend.status_label || 'Perlu Waspada'}
                </span>
              </div>
              <p class="diagnostic-desc">
                ${isSelfLockActive
                  ? 'Mode Hemat aktif. Batas belanja gaya hidup sedang diterapkan.'
                  : 'Aktifkan Mode Hemat jika kamu ingin membatasi belanja gaya hidup.'}
              </p>
            </div>
          </div>

          <!-- 4 Core Metrics Grid -->
          <div class="diagnostic-metrics-grid">
            <div class="diagnostic-metric-cell">
              <span class="metric-label">Anggaran aman tersisa</span>
              <span class="metric-val tabular-nums">${formatIDR(safeToSpend.remaining_amount)}</span>
              <span class="metric-note">${safeToSpend.percentage}% dari batas aman</span>
            </div>

            <div class="diagnostic-metric-cell">
              <span class="metric-label">Total Saldo Kas</span>
              <span class="metric-val tabular-nums">${formatIDR(totalBalance)}</span>
              <span class="metric-note">Seluruh rekening & dompet</span>
            </div>

            <div class="diagnostic-metric-cell">
              <span class="metric-label">Status anggaran</span>
              <span class="metric-val ${safeToSpend.status === 'safe' ? 'text-sage' : 'text-terracotta'}">
                ${safeToSpend.status_label || 'Kondisi Aman'}
              </span>
              <span class="metric-note">Evaluasi kesehatan kas</span>
            </div>

            <div class="diagnostic-metric-cell">
              <span class="metric-label">Batas Hidup Harian</span>
              <span class="metric-val tabular-nums">${formatIDR(safeToSpend.daily_safe_spend)}</span>
              <span class="metric-note">per hari (${safeToSpend.days_remaining} hari sisa)</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Self-Lock Control Feature -->
      <section class="content-block">
        <div class="block-header">
          <div>
            <h2 class="block-title">Penguncian mandiri</h2>
            <p class="block-subtitle">Batasi belanja gaya hidup saat dibutuhkan.</p>
          </div>
          <div>
            <button id="btn-toggle-self-lock" class="btn ${isSelfLockActive ? 'btn-secondary' : 'btn-primary'}">
              ${renderIcon(isSelfLockActive ? 'Unlock' : 'Lock', 15)}
              <span>${isSelfLockActive ? 'Matikan Penguncian' : 'Aktifkan Penguncian'}</span>
            </button>
          </div>
        </div>

        <!-- Restrictions Card Grid -->
        <div class="restrictions-grid">
          <div class="restriction-box ${isSelfLockActive ? 'restriction-active' : ''}">
            <div class="restriction-header">
              <div class="restriction-icon text-terracotta">
                ${renderIcon('EyeOff', 18)}
              </div>
              <h3 class="restriction-name">Pengingat belanja online</h3>
            </div>
            <p class="restriction-text">
              Mode Hemat membantu kamu menghindari belanja impulsif saat anggaran sedang dibatasi.
            </p>
            <div class="restriction-footer">
              <span class="status-pill ${isSelfLockActive ? 'badge-safe' : 'badge-neutral'}">
                ${isSelfLockActive ? renderIcon('Check', 12) : ''}
                <span>${isSelfLockActive ? 'Aktif Melindungi' : 'Standby'}</span>
              </span>
            </div>
          </div>

          <div class="restriction-box ${isSelfLockActive ? 'restriction-active' : ''}">
            <div class="restriction-header">
              <div class="restriction-icon text-terracotta">
                ${renderIcon('Ban', 18)}
              </div>
              <h3 class="restriction-name">Batas anggaran gaya hidup</h3>
            </div>
            <p class="restriction-text">
              Anggaran gaya hidup dibatasi maksimal Rp100.000 selama Mode Hemat aktif.
            </p>
            <div class="restriction-footer">
              <span class="status-pill ${isSelfLockActive ? 'badge-safe' : 'badge-neutral'}">
                ${isSelfLockActive ? renderIcon('Lock', 12) : ''}
                <span>${isSelfLockActive ? 'Terkunci Maks. Rp100k' : 'Standby'}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Budget Allocation Guide -->
      <section class="content-block">
        <div class="block-header">
          <div>
            <h2 class="block-title">Anggaran bulanan</h2>
            <p class="block-subtitle">Atur batas pengeluaran untuk setiap kategori.</p>
          </div>
          <div class="total-budget-badge">
            <span class="total-label">Total Alokasi:</span>
            <span class="total-val tabular-nums">${formatIDR(totalAllocated)}</span>
          </div>
        </div>

        <div class="budget-items-ledger" id="budget-ledger-rows">
          ${renderBudgetRows(budgets, isSelfLockActive)}
        </div>
      </section>

      <!-- Confirmation Modal Container -->
      <div id="selflock-modal-container"></div>
    `;

    // Attach interaction handlers
    attachModeHematEvents(container, isSelfLockActive);

  } catch (err) {
    console.error('Mode Hemat render error:', err);
    container.innerHTML = `
      <div class="error-panel">
        <div class="error-icon">${renderIcon('AlertCircle', 24)}</div>
        <div class="error-content">
          <h3>Gagal memuat Mode Hemat</h3>
          <p>${err.message || 'Terjadi gangguan saat mengambil data.'}</p>
          <button id="btn-retry-mh" class="btn btn-secondary btn-sm" style="margin-top: 12px;">
            ${renderIcon('RotateCcw', 14)} Coba Lagi
          </button>
        </div>
      </div>
    `;

    const retryBtn = container.querySelector('#btn-retry-mh');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => renderModeHemat(container));
    }
  }
}

function renderBudgetRows(budgets, isSelfLockActive) {
  if (!budgets || budgets.length === 0) {
    return `
      <div class="empty-ledger">
        <p class="empty-title">Belum ada alokasi budget terdaftar</p>
      </div>
    `;
  }

  return budgets.map(b => {
    const isOver = b.spent > b.allocated;
    const isLifestyleLocked = isSelfLockActive && b.category_slug === 'lifestyle';

    let barColor = 'var(--sage)';
    if (b.percent_used >= 90) barColor = 'var(--danger)';
    else if (b.percent_used >= 70) barColor = 'var(--terracotta)';

    return `
      <div class="budget-row" data-id="${b.id}" data-cat-id="${b.category_id}">
        <div class="budget-row-main">
          <div class="budget-cat-info">
            <div class="budget-title-line">
              <span class="budget-cat-title">${escapeHtml(b.category_name)}</span>
              <span class="badge-tag">${b.percent_of_total}% porsi</span>
              ${isLifestyleLocked ? `
                <span class="status-pill badge-warning">
                  ${renderIcon('Lock', 12)}
                  <span>Terkunci Mode Hemat</span>
                </span>
              ` : ''}
            </div>
            <span class="budget-cat-desc">${escapeHtml(b.category_sublabel || 'Pengeluaran bulanan')}</span>
          </div>

          <div class="budget-cat-stats">
            <div class="budget-numbers">
              <div class="budget-remaining-line">
                <span class="rem-label">Sisa:</span>
                <span class="rem-val tabular-nums ${isOver ? 'text-danger' : 'text-navy'}">
                  ${formatIDR(b.remaining)}
                </span>
              </div>
              <span class="budget-allocated-note">dari alokasi ${formatIDR(b.allocated)}</span>
            </div>

            ${!isLifestyleLocked ? `
              <button class="btn btn-secondary btn-icon-only btn-adjust-budget" data-cat-id="${b.category_id}" data-amount="${b.allocated}" title="Sesuaikan alokasi budget" aria-label="Sesuaikan alokasi">
                ${renderIcon('Sliders', 15)}
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Inline Slider Drawer Slot -->
        <div class="slider-drawer" id="slider-drawer-${b.category_id}"></div>

        <!-- Gauge Bar -->
        <div class="budget-progress-track">
          <div class="budget-progress-fill" style="width: ${Math.min(100, Math.max(2, b.percent_used))}%; background-color: ${barColor};"></div>
        </div>

        <div class="budget-progress-labels">
          <span>Terpakai ${formatIDR(b.spent)}</span>
          <span class="tabular-nums">${b.percent_used}% dari alokasi</span>
        </div>
      </div>
    `;
  }).join('');
}

function attachModeHematEvents(container, isCurrentlyActive) {
  // Toggle Self-Lock
  const btnToggle = container.querySelector('#btn-toggle-self-lock');
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      openSelfLockConfirmModal(container, !isCurrentlyActive);
    });
  }

  // Adjust Budget sliders
  const adjustButtons = container.querySelectorAll('.btn-adjust-budget');
  adjustButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.dataset.catId;
      const currentAmount = parseInt(btn.dataset.amount, 10);
      toggleBudgetSlider(container, catId, currentAmount);
    });
  });
}

function toggleBudgetSlider(container, catId, currentAmount) {
  const drawer = container.querySelector(`#slider-drawer-${catId}`);
  if (!drawer) return;

  if (drawer.innerHTML.trim()) {
    drawer.innerHTML = '';
    return;
  }

  let tempValue = currentAmount;

  drawer.innerHTML = `
    <div class="slider-controls-card">
      <div class="slider-display-row">
        <span class="slider-label">Pagu Alokasi Baru:</span>
        <span class="slider-val tabular-nums" id="slider-display-${catId}">${formatIDR(tempValue)}</span>
      </div>
      <input type="range" class="form-range" min="50000" max="1500000" step="25000" value="${tempValue}" id="range-slider-${catId}">
      <div class="slider-actions">
        <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-slider-${catId}">Batal</button>
        <button type="button" class="btn btn-primary btn-sm" id="btn-save-slider-${catId}">Terapkan</button>
      </div>
    </div>
  `;

  const slider = drawer.querySelector(`#range-slider-${catId}`);
  const display = drawer.querySelector(`#slider-display-${catId}`);
  slider.addEventListener('input', (e) => {
    tempValue = parseInt(e.target.value, 10);
    display.textContent = formatIDR(tempValue);
  });

  drawer.querySelector(`#btn-cancel-slider-${catId}`).addEventListener('click', () => {
    drawer.innerHTML = '';
  });

  drawer.querySelector(`#btn-save-slider-${catId}`).addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';

    try {
      await api.saveBudget({
        category_id: catId,
        amount: tempValue,
      });

      showToast('Alokasi budget berhasil diperbarui.');
      renderModeHemat(container);
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan alokasi budget.', false);
      btn.disabled = false;
      btn.textContent = 'Terapkan';
    }
  });
}

function openSelfLockConfirmModal(container, activate) {
  const modalContainer = container.querySelector('#selflock-modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop open">
      <div class="modal-dialog modal-dialog-sm">
        <div class="modal-confirm-body">
          <div class="confirm-icon-box text-terracotta">
            ${renderIcon('Lock', 22)}
          </div>
          <div>
            <h3 class="modal-title">
              ${activate ? 'Aktifkan Penguncian Mandiri?' : 'Matikan Penguncian Mandiri?'}
            </h3>
            <p class="modal-subtitle" style="margin-top: 6px;">
              ${activate
                ? 'Sistem akan membatasi pengeluaran non-esensial dan menyembunyikan etalase belanja online agar sisa uang saku aman hingga akhir bulan.'
                : 'Batasan pos lifestyle akan dinormalkan kembali. Pastikan pengeluaran harianmu tetap terkontrol.'}
            </p>
          </div>
        </div>

        <div class="modal-actions" style="margin-top: 20px;">
          <button type="button" class="btn btn-secondary" id="btn-cancel-lock-modal">Batal</button>
          <button type="button" class="btn btn-primary" id="btn-confirm-lock-modal">
            ${activate ? 'Ya, Aktifkan' : 'Ya, Matikan'}
          </button>
        </div>
      </div>
    </div>
  `;

  const closeModal = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#btn-cancel-lock-modal').addEventListener('click', closeModal);

  modalContainer.querySelector('#btn-confirm-lock-modal').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.textContent = 'Memproses...';

    try {
      if (activate) {
        await api.activateModeHemat();
        showToast('Penguncian Mandiri berhasil diaktifkan.');
      } else {
        await api.deactivateModeHemat();
        showToast('Penguncian Mandiri dinonaktifkan.');
      }
      window.dispatchEvent(new Event('sakupas:mode-hemat-updated'));
      closeModal();
      renderModeHemat(container);
    } catch (err) {
      showToast(err.message || 'Gagal mengubah status Mode Hemat.', false);
      btn.disabled = false;
      btn.textContent = activate ? 'Ya, Aktifkan' : 'Ya, Matikan';
    }
  });
}
