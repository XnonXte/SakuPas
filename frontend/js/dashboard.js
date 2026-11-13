/**
 * SakuPas — Dashboard View Module (Pure Vanilla JS)
 */

import { api } from './api.js';
import { formatIDR, formatDateID, formatRelativeDueDate, renderIcon, showToast } from './utils.js';

export async function renderDashboard(container) {
  container.innerHTML = `
    <div class="loading-indicator">
      ${renderIcon('RotateCcw', 18)} Memuat data dashboard...
    </div>
  `;

  try {
    const [summary, cashFlow] = await Promise.all([
      api.getDashboardSummary(),
      api.getCashFlow(),
    ]);

    const { financial_summary, safe_to_spend, upcoming_bills, mode_hemat } = summary;

    // Greeting calculation
    const hour = new Date().getHours();
    let greeting = 'Selamat pagi!';
    if (hour >= 11 && hour < 15) greeting = 'Selamat siang!';
    else if (hour >= 15 && hour < 18) greeting = 'Selamat sore!';
    else if (hour >= 18) greeting = 'Selamat malam!';

    const todayFormatted = formatDateID(new Date().toISOString(), { showDay: true });

    // Safe-to-Spend status styling
    const statusConfig = {
      safe: {
        color: '#387C6D',
        bgColor: '#e5f0ed',
        icon: 'ShieldCheck',
        barClass: 'safe',
      },
      warning: {
        color: '#E9896A',
        bgColor: '#faeae4',
        icon: 'AlertTriangle',
        barClass: 'warning',
      },
      danger: {
        color: '#C84F4F',
        bgColor: '#faeaea',
        icon: 'AlertCircle',
        barClass: 'danger',
      },
    }[safe_to_spend.status] || {
      color: '#387C6D',
      bgColor: '#e5f0ed',
      icon: 'ShieldCheck',
      barClass: 'safe',
    };

    container.innerHTML = `
      <!-- Page Header -->
      <header class="page-header">
        <div class="page-header-row">
          <div>
            <h1 class="page-title">${greeting}</h1>
            <p class="page-description">Berikut ringkasan kondisi keuanganmu dari database.</p>
          </div>
          <p class="page-date">${todayFormatted}</p>
        </div>
      </header>

      <!-- Safe-to-Spend Hero Section -->
      <section class="section-block">
        <div class="safe-to-spend-container">
          <div>
            <div class="safe-label-row">
              <span class="eyebrow-label">Safe to Spend</span>
              <div class="status-badge ${safe_to_spend.status}">
                ${renderIcon(statusConfig.icon, 14, statusConfig.color)}
                <span>${safe_to_spend.status_label}</span>
              </div>
            </div>

            <div class="hero-number-row">
              <span class="hero-number tabular-nums">${formatIDR(safe_to_spend.remaining_amount)}</span>
              <span class="hero-secondary-metric tabular-nums">(${safe_to_spend.percentage}%)</span>
            </div>

            <p class="hero-subtext">
              Aman dibelanjakan hingga akhir bulan • Estimasi
              <strong class="tabular-nums">${formatIDR(safe_to_spend.daily_safe_spend)}</strong> / hari (${safe_to_spend.days_remaining} hari tersisa)
            </p>
          </div>

          ${(safe_to_spend.status !== 'safe' || mode_hemat.is_active) ? `
            <div>
              <button id="btn-goto-mode-hemat" class="btn btn-secondary">
                <span>${mode_hemat.is_active ? 'Mode Hemat Aktif' : 'Tinjau di Mode Hemat'}</span>
                <span>→</span>
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Progress Indicator -->
        <div class="progress-bar-track">
          <div class="progress-bar-fill ${statusConfig.barClass}" style="width: ${Math.min(100, Math.max(4, safe_to_spend.percentage))}%"></div>
        </div>
        <div class="progress-labels">
          <span>Rp0 (Habis)</span>
          <span>Batas Aman: ${formatIDR(safe_to_spend.total_budget)}</span>
        </div>
      </section>

      <!-- Financial Summary (Modular 3-column horizontal) -->
      <section class="section-block">
        <div class="summary-grid">
          <div class="summary-col">
            <p class="summary-label">Saldo Utama</p>
            <p class="summary-value tabular-nums" style="color: var(--navy)">
              ${formatIDR(financial_summary.main_balance)}
            </p>
            <p class="summary-note">Total kas rekening & dompet</p>
          </div>

          <div class="summary-col">
            <p class="summary-label">Total PayLater</p>
            <p class="summary-value tabular-nums" style="color: ${financial_summary.total_paylater > 0 ? 'var(--terracotta)' : 'var(--sage)'}">
              ${formatIDR(financial_summary.total_paylater)}
            </p>
            <p class="summary-note">Total kewajiban belum lunas</p>
          </div>

          <div class="summary-col">
            <p class="summary-label">Tagihan Terdekat</p>
            <p class="summary-value tabular-nums" style="color: ${financial_summary.upcoming_bill_amount > 0 ? 'var(--navy)' : 'var(--text-secondary)'}">
              ${formatIDR(financial_summary.upcoming_bill_amount)}
            </p>
            <p class="summary-note">Jatuh tempo terdekat</p>
          </div>
        </div>
      </section>

      <!-- PayLater Monitor List -->
      <section class="section-block">
        <div class="page-header-row" style="margin-bottom: 16px;">
          <div>
            <h2 class="section-heading">Tagihan Mendatang</h2>
            <p class="section-description">Pantau jatuh tempo PayLater agar tidak terkena denda keterlambatan.</p>
          </div>
        </div>

        <div class="paylater-list" id="dashboard-paylater-list">
          ${renderPayLaterList(upcoming_bills)}
        </div>
      </section>

      <!-- Monthly Cash Flow SVG Line Chart -->
      <section class="section-block no-border">
        <div class="chart-header">
          <div>
            <h2 class="section-heading">Arus Kas Bulanan</h2>
            <p class="section-description">Pemasukan vs pengeluaran riil dari database transaksi.</p>
          </div>

          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-swatch" style="background-color: var(--sage)"></span>
              <span>Pemasukan</span>
            </div>
            <div class="legend-item">
              <span class="legend-swatch" style="background-color: var(--terracotta)"></span>
              <span>Pengeluaran</span>
            </div>
          </div>
        </div>

        <div class="chart-svg-container" id="cashflow-chart-container">
          ${renderCashFlowSvgChart(cashFlow)}
        </div>
      </section>
    `;

    // Attach interactions
    const btnGotoModeHemat = container.querySelector('#btn-goto-mode-hemat');
    if (btnGotoModeHemat) {
      btnGotoModeHemat.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('sakupas:navigate', { detail: 'mode-hemat' }));
      });
    }

    attachPayLaterEvents(container);

  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-title" style="color: var(--danger)">Gagal memuat data dari backend</p>
        <p class="empty-state-desc">${err.message || 'Pastikan server backend Laravel berjalan di http://localhost:8000.'}</p>
        <button id="btn-retry-dashboard" class="btn btn-secondary" style="margin-top: 16px;">
          ${renderIcon('RotateCcw', 14)} Coba Lagi
        </button>
      </div>
    `;

    const retryBtn = container.querySelector('#btn-retry-dashboard');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => renderDashboard(container));
    }
  }
}

function renderPayLaterList(bills) {
  if (!bills || bills.length === 0) {
    return `
      <div class="empty-state" style="padding: 24px 0;">
        <p class="empty-state-title">Tidak ada tagihan PayLater aktif</p>
        <p class="empty-state-desc">Semua kewajiban telah lunas atau belum ada tagihan terdaftar.</p>
      </div>
    `;
  }

  return bills.map(bill => {
    const isPaid = bill.status === 'paid';
    const relative = formatRelativeDueDate(bill.due_date);

    return `
      <div class="paylater-item ${isPaid ? 'is-paid' : ''}" data-id="${bill.id}">
        <div class="paylater-left">
          <div class="provider-avatar">${(bill.provider_name || 'P').charAt(0)}</div>
          <div>
            <div class="provider-name-row">
              <h3 class="provider-name">${bill.provider_name}</h3>
              ${isPaid ? `
                <span class="status-badge safe">
                  ${renderIcon('CheckCircle2', 12)} Lunas
                </span>
              ` : `
                <span class="status-badge ${relative.isUrgent ? 'warning' : 'safe'}">
                  ${renderIcon('Clock', 12)} ${relative.label}
                </span>
              `}
            </div>
            ${bill.installment_info ? `<p class="paylater-desc">${bill.installment_info}</p>` : ''}
          </div>
        </div>

        <div class="paylater-right">
          <div class="paylater-amount-box">
            <p class="paylater-amount tabular-nums">${formatIDR(bill.total_amount)}</p>
            <p class="paylater-due">Jatuh tempo: ${formatDateID(bill.due_date, { shortMonth: true })}</p>
          </div>

          <button class="btn btn-secondary btn-sm btn-toggle-bill" data-id="${bill.id}">
            ${isPaid ? 'Batal Lunas' : 'Tandai Lunas'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function attachPayLaterEvents(container) {
  const toggleButtons = container.querySelectorAll('.btn-toggle-bill');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      btn.disabled = true;
      try {
        await api.togglePayLaterPaid(id);
        showToast('Status tagihan berhasil diperbarui.');
        // Re-render dashboard seamlessly
        const main = document.getElementById('view-container');
        if (main) renderDashboard(main);
      } catch (err) {
        showToast(err.message || 'Gagal memperbarui status tagihan.', false);
      } finally {
        btn.disabled = false;
      }
    });
  });
}

/**
 * Render High Quality Native SVG Cash Flow Chart
 */
function renderCashFlowSvgChart(data) {
  if (!data || data.length === 0) {
    return `<div class="empty-state"><p class="empty-state-title">Belum ada data arus kas.</p></div>`;
  }

  const width = 1000;
  const height = 260;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Find max value for scaling
  let maxVal = 0;
  data.forEach(d => {
    if (d.pemasukan > maxVal) maxVal = d.pemasukan;
    if (d.pengeluaran > maxVal) maxVal = d.pengeluaran;
  });
  maxVal = Math.max(500000, Math.ceil(maxVal * 1.15 / 500000) * 500000);

  // Y-Scale helper
  const getY = (val) => paddingTop + chartH - (val / maxVal) * chartH;
  // X-Scale helper
  const getX = (idx) => paddingLeft + (idx / (data.length - 1)) * chartW;

  // Build gridlines and y-ticks
  const yTicks = [0, maxVal / 2, maxVal];
  let gridSvg = '';
  yTicks.forEach(tick => {
    const y = getY(tick);
    const label = `Rp${Math.round(tick / 1000)}k`;
    gridSvg += `
      <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="var(--divider-chart)" stroke-dasharray="3 3" stroke-width="1" />
      <text x="${paddingLeft - 10}" y="${y + 4}" font-family="Univers, sans-serif" font-size="12" fill="var(--text-secondary)" text-anchor="end">${label}</text>
    `;
  });

  // Build points & paths
  let incomePoints = [];
  let expensePoints = [];
  let xLabelsSvg = '';

  data.forEach((d, i) => {
    const x = getX(i);
    const yIncome = getY(d.pemasukan);
    const yExpense = getY(d.pengeluaran);

    incomePoints.push(`${x},${yIncome}`);
    expensePoints.push(`${x},${yExpense}`);

    xLabelsSvg += `
      <text x="${x}" y="${height - 12}" font-family="Shandon Slab, serif" font-size="12" fill="var(--text-secondary)" text-anchor="middle">${d.day}</text>
    `;
  });

  const incomePath = `M ${incomePoints.join(' L ')}`;
  const expensePath = `M ${expensePoints.join(' L ')}`;

  // Interactive dots with SVG tooltips
  let dotsSvg = '';
  data.forEach((d, i) => {
    const x = getX(i);
    const yIncome = getY(d.pemasukan);
    const yExpense = getY(d.pengeluaran);

    dotsSvg += `
      <circle cx="${x}" cy="${yIncome}" r="4" fill="var(--sage)">
        <title>${d.day}: Pemasukan ${formatIDR(d.pemasukan)}</title>
      </circle>
      <circle cx="${x}" cy="${yExpense}" r="4" fill="var(--terracotta)">
        <title>${d.day}: Pengeluaran ${formatIDR(d.pengeluaran)}</title>
      </circle>
    `;
  });

  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" preserveAspectRatio="none">
      ${gridSvg}
      <path d="${incomePath}" fill="none" stroke="var(--sage)" stroke-width="2.5" stroke-linejoin="round" />
      <path d="${expensePath}" fill="none" stroke="var(--terracotta)" stroke-width="2.5" stroke-linejoin="round" />
      ${dotsSvg}
      ${xLabelsSvg}
    </svg>
  `;
}
