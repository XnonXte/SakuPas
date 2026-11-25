/**
 * SakuPas — Dashboard View Module (Modular ES6 + jQuery)
 * Dashboard summary and financial activity
 */

import { api } from './api.js';
import { formatIDR, formatDateID, formatRelativeDueDate, renderIcon, showToast } from './utils.js';

export async function renderDashboard(container) {
  container.innerHTML = `
    <div class="view-loading">
      <div class="spinner"></div>
      <p>Menghubungkan ke catatan finansial...</p>
    </div>
  `;

  try {
    const [summary, cashFlow] = await Promise.all([
      api.getDashboardSummary(),
      api.getCashFlow(),
    ]);

    const { financial_summary, safe_to_spend, upcoming_bills, mode_hemat } = summary;

    const todayFormatted = formatDateID(new Date(), { showDay: true });
    const spentPercentage = safe_to_spend.total_budget > 0
      ? Math.min(100, Math.max(0, Math.round((safe_to_spend.current_month_expenses / safe_to_spend.total_budget) * 100)))
      : 0;
    const spentBarClass = spentPercentage >= 80
      ? 'progress-fill-danger'
      : spentPercentage >= 60
        ? 'progress-fill-warning'
        : 'progress-fill-safe';

    // Status styling configuration
    const statusMap = {
      safe: {
        badgeClass: 'badge-safe',
        icon: 'ShieldCheck',
        label: safe_to_spend.status_label || 'Kondisi Aman',
      },
      warning: {
        badgeClass: 'badge-warning',
        icon: 'AlertTriangle',
        label: safe_to_spend.status_label || 'Perlu Waspada',
      },
      danger: {
        badgeClass: 'badge-danger',
        icon: 'AlertCircle',
        label: safe_to_spend.status_label || 'Batas Kritis',
      },
    };

    const currentStatus = statusMap[safe_to_spend.status] || statusMap.safe;

    container.innerHTML = `
      <!-- Dashboard View Header -->
      <div class="view-header">
        <div class="view-header-main">
          <div class="view-title-group">
            <h1 class="view-title">Ringkasan keuangan</h1>
          </div>
        </div>
        <div class="view-header-date">
          <span>${todayFormatted}</span>
        </div>
      </div>

      <!-- Safe-to-Spend Hero Ledger -->
      <section class="ledger-panel safe-spend-panel">
        <div class="panel-inner">
          <div class="safe-spend-columns">
            <!-- Left: Primary Safe-to-Spend Gauge -->
            <div class="safe-spend-primary">
              <div class="meta-label-row">
                <span class="meta-label">Anggaran aman bulan ini</span>
                <span class="status-pill ${currentStatus.badgeClass}">
                  ${renderIcon(currentStatus.icon, 13)}
                  <span>${currentStatus.label}</span>
                </span>
              </div>

              <div class="metric-hero-row">
                <span class="metric-hero-val tabular-nums">${formatIDR(safe_to_spend.remaining_amount)}</span>
                <span class="metric-hero-ratio tabular-nums">${safe_to_spend.percentage}% batas tersisa</span>
              </div>

              <p class="safe-spend-guidance">
                Sisa anggaran yang bisa digunakan bulan ini. Saran pengeluaran harian:
                <strong class="tabular-nums">${formatIDR(safe_to_spend.daily_safe_spend)}</strong> / hari
                <span class="guidance-muted">(${safe_to_spend.days_remaining} hari tersisa)</span>
              </p>

              <!-- Progress Track -->
              <div class="gauge-track-wrapper">
                <div class="gauge-track" role="progressbar" aria-label="Anggaran bulanan terpakai" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${spentPercentage}">
                  <div class="gauge-fill ${spentBarClass}" style="width: ${spentPercentage}%;"></div>
                </div>
                <div class="gauge-milestones">
                  <span>${formatIDR(safe_to_spend.current_month_expenses)} terpakai (${spentPercentage}%)</span>
                  <span>Anggaran ${formatIDR(safe_to_spend.total_budget)}</span>
                </div>
              </div>
            </div>

            <!-- Right: Health Status & Quick Action -->
            <div class="safe-spend-aside">
              <div class="aside-stat-box">
                <span class="aside-stat-label">Tagihan belum lunas</span>
                <span class="aside-stat-val tabular-nums ${financial_summary.total_paylater > 0 ? 'text-terracotta' : 'text-sage'}">
                  ${formatIDR(financial_summary.total_paylater)}
                </span>
                <span class="aside-stat-note">
                  ${financial_summary.total_paylater > 0 ? 'Kewajiban aktif yang harus dibayar' : 'Semua tagihan lunas'}
                </span>
              </div>

              ${(safe_to_spend.status !== 'safe' || mode_hemat.is_active) ? `
                <div class="aside-action-box">
                  <button id="btn-dashboard-mode-hemat" class="btn btn-warning-outline btn-block">
                    ${renderIcon('ShieldAlert', 15)}
                    <span>${mode_hemat.is_active ? 'Kelola Mode Hemat (Aktif)' : 'Buka Mode Hemat'}</span>
                  </button>
                </div>
              ` : `
                <div class="aside-action-box">
                  <button id="btn-dashboard-mode-hemat" class="btn btn-secondary btn-block">
                    ${renderIcon('ShieldCheck', 15)}
                    <span>Tinjau Mode Hemat</span>
                  </button>
                </div>
              `}
            </div>
          </div>
        </div>
      </section>

      <!-- Monthly financial overview -->
      <section class="summary-strip">
        <div class="summary-tile">
          <div class="tile-content">
            <span class="tile-label">Saldo tersedia</span>
            <span class="tile-value tabular-nums ${financial_summary.main_balance < 0 ? 'text-danger' : ''}">${formatIDR(financial_summary.main_balance)}</span>
            <span class="tile-meta">Seluruh rekening dan dompet</span>
          </div>
        </div>

        <div class="summary-tile">
          <div class="tile-content">
            <span class="tile-label">Pemasukan bulan ini</span>
            <span class="tile-value tabular-nums text-sage">${formatIDR(financial_summary.monthly_income)}</span>
            <span class="tile-meta">Dari transaksi tercatat</span>
          </div>
        </div>

        <div class="summary-tile">
          <div class="tile-content">
            <span class="tile-label">Pengeluaran bulan ini</span>
            <span class="tile-value tabular-nums">${formatIDR(financial_summary.monthly_expenses)}</span>
            <span class="tile-meta">Dari transaksi tercatat</span>
          </div>
        </div>

        <div class="summary-tile">
          <div class="tile-content">
            <span class="tile-label">PayLater belum lunas</span>
            <span class="tile-value tabular-nums ${financial_summary.total_paylater > 0 ? 'text-terracotta' : 'text-sage'}">
              ${formatIDR(financial_summary.total_paylater)}
            </span>
            <span class="tile-meta">${upcoming_bills.filter(b => b.status !== 'paid').length} tagihan</span>
          </div>
        </div>

        <div class="summary-tile">
          <div class="tile-content">
            <span class="tile-label">Tagihan terdekat</span>
            <span class="tile-value tabular-nums">
              ${formatIDR(financial_summary.upcoming_bill_amount)}
            </span>
            <span class="tile-meta">Jumlah yang segera jatuh tempo</span>
          </div>
        </div>
      </section>

      <!-- PayLater Obligations Ledger -->
      <section class="content-block">
        <div class="block-header">
          <div>
            <h2 class="block-title">Kewajiban PayLater</h2>
            <p class="block-subtitle">Pantau tagihan dan jadwal pembayaranmu.</p>
          </div>
          <button id="btn-open-add-bill-modal" class="btn btn-secondary btn-sm">
            ${renderIcon('Plus', 14)}
            <span>Tambah Tagihan</span>
          </button>
        </div>

        <div class="paylater-ledger" id="dashboard-paylater-list">
          ${renderPayLaterRows(upcoming_bills)}
        </div>
      </section>

      <!-- Cash Flow Analysis Section -->
      <section class="content-block">
        <div class="block-header">
          <div>
            <h2 class="block-title">Arus Kas Bulanan</h2>
            <p class="block-subtitle">Pemasukan dan pengeluaran berdasarkan transaksi tercatat.</p>
          </div>
          <div class="chart-legend-wrapper">
            <div class="legend-chip">
              <span class="swatch bg-sage"></span>
              <span>Pemasukan</span>
            </div>
            <div class="legend-chip">
              <span class="swatch bg-terracotta"></span>
              <span>Pengeluaran</span>
            </div>
          </div>
        </div>

        <div class="chart-canvas-box" id="dashboard-cashflow-container">
          ${renderCashFlowSvg(cashFlow)}
        </div>
      </section>

      <!-- PayLater Add Modal Container -->
      <div id="add-bill-modal-container"></div>
    `;

    // Bind event handlers with jQuery or native
    attachDashboardEvents(container);

  } catch (err) {
    console.error('Dashboard render error:', err);
    container.innerHTML = `
      <div class="error-panel">
        <div class="error-icon">${renderIcon('AlertCircle', 24)}</div>
        <div class="error-content">
          <h3>Gagal memuat data dashboard</h3>
          <p>${err.message || 'Koneksi ke backend bermasalah.'}</p>
          <button id="btn-retry-dashboard" class="btn btn-secondary btn-sm" style="margin-top: 12px;">
            ${renderIcon('RotateCcw', 14)} Coba Lagi
          </button>
        </div>
      </div>
    `;

    const retryBtn = container.querySelector('#btn-retry-dashboard');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => renderDashboard(container));
    }
  }
}

function renderPayLaterRows(bills) {
  if (!bills || bills.length === 0) {
    return `
      <div class="empty-ledger">
        <div class="empty-icon">${renderIcon('CheckCircle2', 20, 'var(--sage)')}</div>
        <p class="empty-title">Tidak ada tagihan PayLater aktif</p>
        <p class="empty-desc">Keren! Seluruh kewajiban telah lunas atau belum ada cicilan yang didaftarkan.</p>
      </div>
    `;
  }

  return bills.map(bill => {
    const isPaid = bill.status === 'paid';
    const relative = formatRelativeDueDate(bill.due_date);
    const initial = (bill.provider_name || 'P').charAt(0).toUpperCase();

    let statusPillClass = 'badge-neutral';
    let statusLabel = 'Belum lunas';
    if (isPaid) {
      statusPillClass = 'badge-safe';
      statusLabel = 'Lunas';
    } else if (relative.isOverdue) {
      statusPillClass = 'badge-danger';
      statusLabel = 'Terlambat';
    } else if (relative.isUrgent) {
      statusPillClass = 'badge-warning';
    }

    return `
      <div class="bill-row ${isPaid ? 'bill-row-paid' : ''}" data-id="${bill.id}">
        <div class="bill-meta-group">
          <div class="bill-avatar ${isPaid ? 'avatar-paid' : ''}">${initial}</div>
          <div class="bill-info">
            <div class="bill-title-row">
              <span class="bill-provider">${escapeHtml(bill.provider_name)}</span>
              <span class="status-pill ${statusPillClass}">
                ${isPaid ? renderIcon('CheckCircle2', 12) : renderIcon('Clock', 12)}
                <span>${statusLabel}</span>
              </span>
            </div>
            ${bill.installment_info ? `<span class="bill-desc">${escapeHtml(bill.installment_info)}</span>` : (bill.description ? `<span class="bill-desc">${escapeHtml(bill.description)}</span>` : '')}
          </div>
        </div>

        <div class="bill-action-group">
          <div class="bill-amount-box">
            <span class="bill-amount tabular-nums">${formatIDR(bill.total_amount)}</span>
            <span class="bill-due-date">Jatuh tempo ${formatDateID(bill.due_date, { shortMonth: true })}${isPaid ? '' : ` · ${relative.label}`}</span>
          </div>

          <button class="btn btn-sm ${isPaid ? 'btn-secondary' : 'btn-outline-terracotta'} btn-toggle-bill" data-id="${bill.id}">
            ${isPaid ? 'Tandai belum lunas' : 'Tandai lunas'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function attachDashboardEvents(container) {
  // Navigation to Mode Hemat
  const btnModeHemat = container.querySelector('#btn-dashboard-mode-hemat');
  if (btnModeHemat) {
    btnModeHemat.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('sakupas:navigate', { detail: 'mode-hemat' }));
    });
  }

  // Toggle PayLater bill status
  const toggleButtons = container.querySelectorAll('.btn-toggle-bill');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      btn.disabled = true;
      btn.textContent = 'Memproses...';

      try {
        await api.togglePayLaterPaid(id);
        showToast('Status tagihan PayLater diperbarui.');
        renderDashboard(container);
      } catch (err) {
        showToast(err.message || 'Gagal memperbarui status tagihan.', false);
        btn.disabled = false;
        btn.textContent = 'Coba Lagi';
      }
    });
  });

  // Open add bill modal
  const btnAddBill = container.querySelector('#btn-open-add-bill-modal');
  if (btnAddBill) {
    btnAddBill.addEventListener('click', () => {
      openAddBillModal(container);
    });
  }
}

function openAddBillModal(container) {
  const modalContainer = container.querySelector('#add-bill-modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop open">
      <div class="modal-dialog">
        <button class="modal-close" id="btn-close-bill-modal" aria-label="Tutup">
          ${renderIcon('X', 18)}
        </button>

        <div class="modal-header">
          <h3 class="modal-title">Daftarkan Tagihan PayLater</h3>
          <p class="modal-subtitle">Pantau cicilan PayLater baru agar tidak terlewat tanggal jatuh temponya.</p>
        </div>

        <form id="form-add-bill" class="modal-form">
          <div class="form-group">
            <label class="form-label">Penyedia PayLater</label>
            <input type="text" id="bill-provider" class="form-input" placeholder="Misal: TikTok Shop PayLater, SPayLater, Atome" required autofocus>
          </div>

          <div class="form-group">
            <label class="form-label">Total Tagihan (Rp)</label>
            <input type="number" id="bill-amount" class="form-input tabular-nums" placeholder="Contoh: 150000" min="1000" step="1000" required>
          </div>

          <div class="form-group">
            <label class="form-label">Keterangan / Rincian Cicilan</label>
            <input type="text" id="bill-installment" class="form-input" placeholder="Contoh: Cicilan 1 dari 3 (Sepatu Kuliah)">
          </div>

          <div class="form-group">
            <label class="form-label">Tanggal Jatuh Tempo</label>
            <input type="date" id="bill-due-date" class="form-input" value="${new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]}" required>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" id="btn-cancel-bill-modal">Batal</button>
            <button type="submit" class="btn btn-primary" id="btn-submit-bill">Simpan Tagihan</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const closeModal = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#btn-close-bill-modal').addEventListener('click', closeModal);
  modalContainer.querySelector('#btn-cancel-bill-modal').addEventListener('click', closeModal);

  const form = modalContainer.querySelector('#form-add-bill');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const provider = modalContainer.querySelector('#bill-provider').value.trim();
    const amount = parseInt(modalContainer.querySelector('#bill-amount').value, 10);
    const installment = modalContainer.querySelector('#bill-installment').value.trim();
    const dueDate = modalContainer.querySelector('#bill-due-date').value;

    if (!provider || !amount || !dueDate) {
      showToast('Lengkapi seluruh field wajib.', false);
      return;
    }

    const submitBtn = modalContainer.querySelector('#btn-submit-bill');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    try {
      await api.createPayLaterBill({
        provider_name: provider,
        total_amount: amount,
        installment_info: installment,
        due_date: dueDate,
      });

      showToast('Tagihan PayLater berhasil didaftarkan.');
      closeModal();
      renderDashboard(container);
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan tagihan.', false);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Simpan Tagihan';
    }
  });
}

/**
 * Native Responsive SVG Cash Flow Chart
 */
function renderCashFlowSvg(data) {
  if (!data || data.length === 0 || data.every(d => !Number(d.pemasukan) && !Number(d.pengeluaran))) {
    return `<div class="empty-chart"><p>Belum ada transaksi pemasukan atau pengeluaran bulan ini.</p></div>`;
  }

  const width = 1000;
  const height = 300;
  const padLeft = 65;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 40;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  let maxVal = 0;
  data.forEach(d => {
    if (d.pemasukan > maxVal) maxVal = d.pemasukan;
    if (d.pengeluaran > maxVal) maxVal = d.pengeluaran;
  });
  maxVal = Math.max(500000, Math.ceil(maxVal * 1.15 / 500000) * 500000);

  const getY = (val) => padTop + chartH - (val / maxVal) * chartH;
  const getX = (idx) => padLeft + (idx / Math.max(1, data.length - 1)) * chartW;

  // Horizontal Grid Lines & Y Labels
  const ticks = [0, maxVal * 0.5, maxVal];
  let gridSvg = '';
  ticks.forEach(t => {
    const y = getY(t);
    const label = `Rp${Math.round(t / 1000)}k`;
    gridSvg += `
      <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="var(--border-subtle)" stroke-width="1" />
      <text x="${padLeft - 10}" y="${y + 4}" font-size="11" fill="var(--text-muted)" text-anchor="end" class="tabular-nums">${label}</text>
    `;
  });

  // Coordinates
  const incomePoints = [];
  const expensePoints = [];
  let xLabelsSvg = '';

  data.forEach((d, i) => {
    const x = getX(i);
    const yInc = getY(d.pemasukan);
    const yExp = getY(d.pengeluaran);

    incomePoints.push(`${x},${yInc}`);
    expensePoints.push(`${x},${yExp}`);

    xLabelsSvg += `
      <text x="${x}" y="${height - 12}" font-size="11" fill="var(--text-muted)" text-anchor="middle">${d.day}</text>
    `;
  });

  const incomeLine = `M ${incomePoints.join(' L ')}`;
  const expenseLine = `M ${expensePoints.join(' L ')}`;

  // Interactive markers with SVG tooltips
  let dotsSvg = '';
  data.forEach((d, i) => {
    const x = getX(i);
    const yInc = getY(d.pemasukan);
    const yExp = getY(d.pengeluaran);

    dotsSvg += `
      <g class="chart-point">
        <circle cx="${x}" cy="${yInc}" r="4" fill="var(--sage)" stroke="#FFFFFF" stroke-width="2">
          <title>${d.day} • Pemasukan: ${formatIDR(d.pemasukan)}</title>
        </circle>
      </g>
      <g class="chart-point">
        <circle cx="${x}" cy="${yExp}" r="4" fill="var(--terracotta)" stroke="#FFFFFF" stroke-width="2">
          <title>${d.day} • Pengeluaran: ${formatIDR(d.pengeluaran)}</title>
        </circle>
      </g>
    `;
  });

  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Grafik arus kas harian">
      ${gridSvg}
      <path d="${incomeLine}" fill="none" stroke="var(--sage)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="${expenseLine}" fill="none" stroke="var(--terracotta)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      ${dotsSvg}
      ${xLabelsSvg}
    </svg>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
