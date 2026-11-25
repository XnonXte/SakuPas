/**
 * SakuPas — Transactions View Module (Modular ES6 + jQuery)
 * Transaction ledger, expense breakdown, search and filtering
 */

import { api } from './api.js';
import { formatIDR, formatDateID, parseIDRInput, renderIcon, showToast, debounce, escapeHtml } from './utils.js';

let activeFilters = {
  search: '',
  month: 'all',
  category_id: 'all',
  type: 'all',
};

let cachedCategories = [];
let cachedAccounts = [];

export async function renderTransactions(container) {
  container.innerHTML = `
    <div class="view-loading">
      <div class="spinner"></div>
      <p>Memuat catatan transaksi...</p>
    </div>
  `;

  try {
    const [distribution, txResult, categories, accounts] = await Promise.all([
      api.getExpenseDistribution(),
      api.getTransactions(activeFilters),
      api.getCategories(),
      api.getAccounts(),
    ]);

    cachedCategories = categories || [];
    cachedAccounts = accounts || [];

    const transactions = txResult?.items || [];
    const isFiltered = activeFilters.search || activeFilters.month !== 'all' || activeFilters.category_id !== 'all' || activeFilters.type !== 'all';

    container.innerHTML = `
      <!-- Transactions View Header -->
      <div class="view-header">
        <div class="view-header-main">
          <div class="view-title-group">
            <h1 class="view-title">Catatan Transaksi</h1>
            <span class="view-badge">${transactions.length} Transaksi Tercatat</span>
          </div>
          <p class="view-subtitle">Pemasukan dan pengeluaran yang sudah dicatat.</p>
        </div>
        <div>
          <button id="btn-open-tx-modal" class="btn btn-primary">
            ${renderIcon('Plus', 16, '#FFFFFF', 2.5)}
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      <!-- Expense Distribution Donut Section -->
      <section class="content-block">
        <div class="block-header">
          <div>
            <h2 class="block-title">Distribusi Pengeluaran Bulan Ini</h2>
            <p class="block-subtitle">Pengeluaran dikelompokkan menurut kategori.</p>
          </div>
        </div>

        <div class="donut-container" id="distribution-donut-box">
          ${renderDonutSection(distribution)}
        </div>
      </section>

      <!-- Transactions Ledger & Filters -->
      <section class="content-block">
        <div class="block-header">
          <div>
            <h2 class="block-title">Riwayat Mutasi</h2>
            <p class="block-subtitle">Cari dan saring riwayat transaksimu.</p>
          </div>
          ${isFiltered ? `
            <button id="btn-clear-filters" class="btn btn-secondary btn-sm text-terracotta">
              ${renderIcon('X', 13)}
              <span>Reset Filter</span>
            </button>
          ` : ''}
        </div>

        <!-- Filter Controls Toolbar -->
        <div class="filter-toolbar">
          <div class="filter-search-wrap">
            <span class="filter-search-icon">${renderIcon('Search', 15)}</span>
            <input type="text" id="filter-search-input" class="form-input filter-search" placeholder="Cari transaksi (warteg, kopi, bensin)..." value="${escapeHtml(activeFilters.search)}">
          </div>

          <div class="filter-dropdowns">
            <select id="filter-month-select" class="form-select filter-select">
              <option value="all">Semua Bulan</option>
              ${renderMonthFilterOptions()}
            </select>

            <select id="filter-cat-select" class="form-select filter-select">
              <option value="all">Semua Kategori</option>
              ${cachedCategories.map(c => `
                <option value="${c.id}" ${activeFilters.category_id == c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>
              `).join('')}
            </select>

            <select id="filter-type-select" class="form-select filter-select">
              <option value="all" ${activeFilters.type === 'all' ? 'selected' : ''}>Semua Tipe</option>
              <option value="expense" ${activeFilters.type === 'expense' ? 'selected' : ''}>Pengeluaran</option>
              <option value="income" ${activeFilters.type === 'income' ? 'selected' : ''}>Pemasukan</option>
            </select>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="table-frame">
          ${renderTransactionTable(transactions)}
        </div>
      </section>

      <!-- Transaction Modal Containers -->
      <div id="tx-modal-container"></div>
      <div id="tx-delete-modal-container"></div>
    `;

    // Attach listeners
    attachTransactionsEvents(container);

  } catch (err) {
    console.error('Transactions render error:', err);
    container.innerHTML = `
      <div class="error-panel">
        <div class="error-icon">${renderIcon('AlertCircle', 24)}</div>
        <div class="error-content">
          <h3>Gagal memuat catatan transaksi</h3>
          <p>${err.message || 'Terjadi gangguan saat mengambil data.'}</p>
          <button id="btn-retry-tx" class="btn btn-secondary btn-sm" style="margin-top: 12px;">
            ${renderIcon('RotateCcw', 14)} Coba Lagi
          </button>
        </div>
      </div>
    `;

    const retryBtn = container.querySelector('#btn-retry-tx');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => renderTransactions(container));
    }
  }
}

function renderMonthFilterOptions() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    months.push({ key, label });
  }

  return months.map(m => `
    <option value="${m.key}" ${activeFilters.month === m.key ? 'selected' : ''}>${m.label}</option>
  `).join('');
}

function renderDonutSection(distribution) {
  const total = distribution?.total_expense || 0;
  const items = distribution?.items || [];

  if (items.length === 0 || total === 0) {
    return `
      <div class="empty-ledger">
        <div class="empty-icon">${renderIcon('UtensilsCrossed', 20, 'var(--text-muted)')}</div>
        <p class="empty-title">Belum ada pengeluaran tercatat bulan ini</p>
        <p class="empty-desc">Catat pengeluaran pertamamu untuk melihat proporsi alokasi pos.</p>
      </div>
    `;
  }

  // SVG Geometry
  const size = 200;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;
  const segments = items.map(item => {
    const strokeDash = `${(item.percentage / 100) * circumference} ${circumference}`;
    const offset = -((cumulativeOffset / 100) * circumference);
    cumulativeOffset += item.percentage;

    return `
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${radius}"
        fill="transparent"
        stroke="${item.color || 'var(--terracotta)'}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${strokeDash}"
        stroke-dashoffset="${offset}"
        transform="rotate(-90 ${size / 2} ${size / 2})"
        class="donut-segment"
      >
        <title>${escapeHtml(item.category_name)}: ${formatIDR(item.amount)} (${item.percentage}%)</title>
      </circle>
    `;
  }).join('');

  return `
    <div class="donut-layout">
      <!-- Donut Graphic -->
      <div class="donut-visual">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="donut-svg">
          <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="transparent" stroke="var(--border-subtle)" stroke-width="${strokeWidth}" />
          ${segments}
        </svg>
        <div class="donut-center-info">
          <span class="donut-center-sub">Total Belanja</span>
          <span class="donut-center-num tabular-nums">${formatIDR(total)}</span>
        </div>
      </div>

      <!-- Legend Breakdown Table -->
      <div class="donut-legend-grid">
        ${items.map(item => `
          <div class="legend-row">
            <div class="legend-left">
              <span class="legend-dot" style="background-color: ${item.color || 'var(--terracotta)'}"></span>
              <span class="legend-cat-name">${escapeHtml(item.category_name)}</span>
            </div>
            <div class="legend-right">
              <span class="legend-amount tabular-nums">${formatIDR(item.amount)}</span>
              <span class="legend-pct tabular-nums">${item.percentage}%</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderTransactionTable(transactions) {
  if (!transactions || transactions.length === 0) {
    return `
      <div class="empty-ledger">
        <p class="empty-title">Tidak ada transaksi yang cocok</p>
        <p class="empty-desc">Coba sesuaikan kata kunci pencarian atau bersihkan filter di atas.</p>
      </div>
    `;
  }

  return `
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 140px;">Tanggal</th>
          <th>Deskripsi</th>
          <th class="hide-mobile" style="width: 170px;">Kategori</th>
          <th class="hide-mobile" style="width: 150px;">Metode</th>
          <th style="text-align: right; width: 140px;">Nominal</th>
          <th style="width: 48px;"></th>
        </tr>
      </thead>
      <tbody>
        ${transactions.map(tx => {
          const isIncome = tx.type === 'income';
          const catName = tx.category?.name || 'Lain-lain';
          const method = tx.payment_method || tx.account?.name || 'Kas';

          return `
            <tr data-id="${tx.id}">
              <td class="cell-date tabular-nums">
                ${formatDateID(tx.transaction_date, { shortMonth: true })}
              </td>
              <td>
                <div class="cell-desc-group">
                  <div class="tx-direction-badge ${isIncome ? 'income' : 'expense'}">
                    ${renderIcon(isIncome ? 'ArrowDownLeft' : 'ArrowUpRight', 13)}
                  </div>
                  <div>
                    <span class="tx-desc-text">${escapeHtml(tx.description)}</span>
                    <span class="tx-desc-meta show-mobile-only">${escapeHtml(catName)} • ${escapeHtml(method)}</span>
                  </div>
                </div>
              </td>
              <td class="hide-mobile">
                <span class="category-chip">${escapeHtml(catName)}</span>
              </td>
              <td class="hide-mobile cell-method">
                ${escapeHtml(method)}
              </td>
              <td class="cell-amount tabular-nums ${isIncome ? 'amount-income' : 'amount-expense'}">
                ${isIncome ? '+' : '-'}${formatIDR(tx.amount)}
              </td>
              <td class="cell-action">
                <button class="btn-icon btn-delete-tx" data-id="${tx.id}" title="Hapus transaksi" aria-label="Hapus transaksi">
                  ${renderIcon('Trash2', 15)}
                </button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function attachTransactionsEvents(container) {
  // Open add modal
  const btnOpenModal = container.querySelector('#btn-open-tx-modal');
  if (btnOpenModal) {
    btnOpenModal.addEventListener('click', () => openAddTransactionModal(container));
  }

  // Live search
  const searchInput = container.querySelector('#filter-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      activeFilters.search = e.target.value.trim();
      renderTransactions(container);
    }, 250));
  }

  // Month filter
  const monthSelect = container.querySelector('#filter-month-select');
  if (monthSelect) {
    monthSelect.addEventListener('change', (e) => {
      activeFilters.month = e.target.value;
      renderTransactions(container);
    });
  }

  // Category filter
  const catSelect = container.querySelector('#filter-cat-select');
  if (catSelect) {
    catSelect.addEventListener('change', (e) => {
      activeFilters.category_id = e.target.value;
      renderTransactions(container);
    });
  }

  // Type filter
  const typeSelect = container.querySelector('#filter-type-select');
  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      activeFilters.type = e.target.value;
      renderTransactions(container);
    });
  }

  // Clear filters
  const btnClear = container.querySelector('#btn-clear-filters');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      activeFilters = { search: '', month: 'all', category_id: 'all', type: 'all' };
      renderTransactions(container);
    });
  }

  // Delete transaction buttons
  const deleteButtons = container.querySelectorAll('.btn-delete-tx');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      openDeleteConfirmModal(container, id);
    });
  });
}

function openAddTransactionModal(container) {
  const modalContainer = container.querySelector('#tx-modal-container');
  if (!modalContainer) return;

  let selectedType = 'expense';
  let selectedCatId = cachedCategories.find(c => c.type === 'expense')?.id || cachedCategories[0]?.id;

  modalContainer.innerHTML = `
    <div class="modal-backdrop open">
      <div class="modal-dialog modal-dialog-wide">
        <button class="modal-close" id="btn-close-tx-modal" aria-label="Tutup">
          ${renderIcon('X', 18)}
        </button>

        <div class="modal-header">
          <h3 class="modal-title">Catat Transaksi Baru</h3>
          <p class="modal-subtitle">Tambah mutasi pengeluaran harian atau uang saku mahasiswa.</p>
        </div>

        <form id="form-add-tx" class="modal-form">
          <!-- Type Switcher -->
          <div class="form-group">
            <label class="form-label">Jenis Mutasi</label>
            <div class="type-segment-control">
              <button type="button" class="segment-btn active-expense" id="btn-seg-expense">
                ${renderIcon('ArrowUpRight', 14)}
                <span>Pengeluaran</span>
              </button>
              <button type="button" class="segment-btn" id="btn-seg-income">
                ${renderIcon('ArrowDownLeft', 14)}
                <span>Pemasukan</span>
              </button>
            </div>
          </div>

          <!-- Nominal Input with live formatting -->
          <div class="form-group">
            <label class="form-label">Nominal (Rupiah)</label>
            <div class="nominal-box">
              <span class="nominal-currency">Rp</span>
              <input type="text" id="tx-input-nominal" class="nominal-field tabular-nums" placeholder="0" inputmode="numeric" required autofocus>
            </div>
          </div>

          <!-- Category Selection -->
          <div class="form-group">
            <label class="form-label">Kategori</label>
            <div class="cat-pill-grid" id="cat-pill-container">
              ${renderCategoryPills(selectedType, selectedCatId)}
            </div>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label">Deskripsi Transaksi</label>
            <input type="text" id="tx-input-desc" class="form-input" placeholder="Contoh: Warteg Bahari paket ayam telur, GrabBike ke Fasilkom" required>
          </div>

          <!-- Date & Payment Source -->
          <div class="form-row-dual">
            <div class="form-group">
              <label class="form-label">Tanggal</label>
              <input type="date" id="tx-input-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Sumber Rekening / Dompet</label>
              <select id="tx-input-account" class="form-select">
                ${cachedAccounts.map(acc => `
                  <option value="${acc.id}">${escapeHtml(acc.name)} (${formatIDR(acc.balance)})</option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" id="btn-cancel-tx-modal">Batal</button>
            <button type="submit" class="btn btn-primary" id="btn-submit-tx">Simpan Transaksi</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const btnExpense = modalContainer.querySelector('#btn-seg-expense');
  const btnIncome = modalContainer.querySelector('#btn-seg-income');
  const catContainer = modalContainer.querySelector('#cat-pill-container');
  const nominalInput = modalContainer.querySelector('#tx-input-nominal');

  function updateType(type) {
    selectedType = type;
    if (type === 'expense') {
      btnExpense.className = 'segment-btn active-expense';
      btnIncome.className = 'segment-btn';
      selectedCatId = cachedCategories.find(c => c.type === 'expense')?.id || cachedCategories[0]?.id;
    } else {
      btnIncome.className = 'segment-btn active-income';
      btnExpense.className = 'segment-btn';
      selectedCatId = cachedCategories.find(c => c.type === 'income')?.id || cachedCategories[0]?.id;
    }
    catContainer.innerHTML = renderCategoryPills(selectedType, selectedCatId);
    bindCategoryPills();
  }

  btnExpense.addEventListener('click', () => updateType('expense'));
  btnIncome.addEventListener('click', () => updateType('income'));

  function bindCategoryPills() {
    catContainer.querySelectorAll('.cat-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedCatId = parseInt(btn.dataset.id, 10);
        catContainer.querySelectorAll('.cat-pill-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  }
  bindCategoryPills();

  // Nominal live formatting
  nominalInput.addEventListener('input', (e) => {
    const numeric = parseIDRInput(e.target.value);
    e.target.value = numeric ? numeric.toLocaleString('id-ID') : '';
  });

  // Close handlers
  const closeModal = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#btn-close-tx-modal').addEventListener('click', closeModal);
  modalContainer.querySelector('#btn-cancel-tx-modal').addEventListener('click', closeModal);

  // Submit
  const form = modalContainer.querySelector('#form-add-tx');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseIDRInput(nominalInput.value);
    const description = modalContainer.querySelector('#tx-input-desc').value.trim();
    const date = modalContainer.querySelector('#tx-input-date').value;
    const accountId = parseInt(modalContainer.querySelector('#tx-input-account').value, 10);

    if (!amount || amount <= 0) {
      showToast('Masukkan nominal transaksi yang valid.', false);
      return;
    }
    if (!description) {
      showToast('Masukkan deskripsi transaksi.', false);
      return;
    }

    const submitBtn = modalContainer.querySelector('#btn-submit-tx');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    try {
      await api.createTransaction({
        account_id: accountId,
        category_id: selectedCatId,
        type: selectedType,
        amount,
        description,
        transaction_date: date,
      });

      showToast(`Transaksi ${selectedType === 'income' ? 'pemasukan' : 'pengeluaran'} berhasil disimpan.`);
      closeModal();
      renderTransactions(container);
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan transaksi.', false);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Simpan Transaksi';
    }
  });
}

function renderCategoryPills(type, selectedId) {
  const filtered = cachedCategories.filter(c => c.type === type);
  return filtered.map(cat => `
    <button type="button" class="cat-pill-btn ${cat.id === selectedId ? 'selected' : ''}" data-id="${cat.id}">
      <span class="cat-pill-icon">${renderIcon(cat.icon || 'CircleDot', 15)}</span>
      <div class="cat-pill-text">
        <span class="cat-pill-name">${escapeHtml(cat.name)}</span>
        <span class="cat-pill-sub">${escapeHtml(cat.sublabel || '')}</span>
      </div>
    </button>
  `).join('');
}

function openDeleteConfirmModal(container, txId) {
  const modalContainer = container.querySelector('#tx-delete-modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop open">
      <div class="modal-dialog modal-dialog-sm">
        <div class="modal-confirm-body">
          <div class="confirm-icon-box text-danger">
            ${renderIcon('AlertTriangle', 22)}
          </div>
          <div>
            <h3 class="modal-title">Hapus Transaksi?</h3>
            <p class="modal-subtitle" style="margin-top: 6px;">
              Transaksi ini akan dihapus dari riwayat mutasi dan saldo rekening sumber akan disesuaikan secara otomatis.
            </p>
          </div>
        </div>

        <div class="modal-actions" style="margin-top: 20px;">
          <button type="button" class="btn btn-secondary" id="btn-cancel-delete">Batal</button>
          <button type="button" class="btn btn-danger" id="btn-confirm-delete">Hapus Transaksi</button>
        </div>
      </div>
    </div>
  `;

  const closeModal = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#btn-cancel-delete').addEventListener('click', closeModal);

  modalContainer.querySelector('#btn-confirm-delete').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.textContent = 'Menghapus...';

    try {
      await api.deleteTransaction(txId);
      showToast('Transaksi berhasil dihapus.');
      closeModal();
      renderTransactions(container);
    } catch (err) {
      showToast(err.message || 'Gagal menghapus transaksi.', false);
      btn.disabled = false;
      btn.textContent = 'Hapus Transaksi';
    }
  });
}
