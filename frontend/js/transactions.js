/**
 * SakuPas — Transactions View Module (Pure Vanilla JS)
 */

import { api } from './api.js';
import { formatIDR, formatDateID, parseIDRInput, renderIcon, showToast } from './utils.js';

let currentFilters = {
  search: '',
  month: 'all',
  category_id: 'all',
  type: 'all',
};

let cachedCategories = [];
let cachedAccounts = [];

export async function renderTransactions(container) {
  container.innerHTML = `
    <div class="loading-indicator">
      ${renderIcon('RotateCcw', 18)} Memuat data transaksi...
    </div>
  `;

  try {
    const [distribution, txResult, categories, accounts] = await Promise.all([
      api.getExpenseDistribution(),
      api.getTransactions(currentFilters),
      api.getCategories(),
      api.getAccounts(),
    ]);

    cachedCategories = categories || [];
    cachedAccounts = accounts || [];

    const transactions = txResult?.items || [];

    container.innerHTML = `
      <!-- Page Header -->
      <header class="page-header">
        <div class="page-header-row" style="align-items: center;">
          <div>
            <h1 class="page-title">Transaksi</h1>
            <p class="page-description">Pantau ke mana uangmu pergi dari catatan database riil.</p>
          </div>

          <button id="btn-open-add-tx-modal" class="btn btn-primary" style="font-size: 15px; padding: 10px 20px;">
            ${renderIcon('Plus', 18, '#fff', 2.5)}
            <span>Tambah Transaksi</span>
          </button>
        </div>
      </header>

      <!-- Expense Distribution Donut Chart -->
      <section class="section-block">
        <div style="margin-bottom: 20px;">
          <h2 class="section-heading">Distribusi Pengeluaran</h2>
          <p class="section-description">Proporsi pos pengeluaran berdasarkan kategori mikro bulan ini.</p>
        </div>

        ${renderDonutChartSection(distribution)}
      </section>

      <!-- Transaction History Section -->
      <section class="section-block no-border">
        <div class="page-header-row" style="margin-bottom: 18px;">
          <div>
            <h2 class="section-heading">Riwayat Transaksi</h2>
            <p class="section-description">Menampilkan ${transactions.length} transaksi tercatat.</p>
          </div>

          ${isFilterActive() ? `
            <button id="btn-reset-filters" class="btn btn-secondary btn-sm" style="color: var(--terracotta);">
              ${renderIcon('X', 14)} Reset Filter
            </button>
          ` : ''}
        </div>

        <!-- Filter Controls Bar -->
        <div class="filter-bar">
          <div class="search-input-wrapper">
            <span class="search-icon">${renderIcon('Search', 16)}</span>
            <input type="text" id="filter-search" class="input-control" placeholder="Cari transaksi..." value="${escapeHtml(currentFilters.search)}">
          </div>

          <div>
            <select id="filter-month" class="select-control">
              <option value="all">Semua Bulan</option>
              ${renderMonthOptions()}
            </select>
          </div>

          <div>
            <select id="filter-category" class="select-control">
              <option value="all">Semua Kategori</option>
              ${cachedCategories.map(c => `
                <option value="${c.id}" ${currentFilters.category_id == c.id ? 'selected' : ''}>${c.name}</option>
              `).join('')}
            </select>
          </div>

          <div>
            <select id="filter-type" class="select-control">
              <option value="all" ${currentFilters.type === 'all' ? 'selected' : ''}>Semua Tipe</option>
              <option value="expense" ${currentFilters.type === 'expense' ? 'selected' : ''}>Pengeluaran</option>
              <option value="income" ${currentFilters.type === 'income' ? 'selected' : ''}>Pemasukan</option>
            </select>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="table-responsive">
          ${renderTransactionsTable(transactions)}
        </div>
      </section>

      <!-- Transaction Modal Container -->
      <div id="tx-modal-container"></div>

      <!-- Delete Confirmation Modal Container -->
      <div id="delete-modal-container"></div>
    `;

    // Attach Event Listeners
    attachTransactionEvents(container);

  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-title" style="color: var(--danger)">Gagal memuat data transaksi</p>
        <p class="empty-state-desc">${err.message}</p>
        <button id="btn-retry-tx" class="btn btn-secondary" style="margin-top: 16px;">
          ${renderIcon('RotateCcw', 14)} Coba Lagi
        </button>
      </div>
    `;

    const retryBtn = container.querySelector('#btn-retry-tx');
    if (retryBtn) retryBtn.addEventListener('click', () => renderTransactions(container));
  }
}

function isFilterActive() {
  return currentFilters.search || currentFilters.month !== 'all' || currentFilters.category_id !== 'all' || currentFilters.type !== 'all';
}

function renderMonthOptions() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    months.push({ key, label });
  }

  return months.map(m => `
    <option value="${m.key}" ${currentFilters.month === m.key ? 'selected' : ''}>${m.label}</option>
  `).join('');
}

function renderDonutChartSection(distribution) {
  const total = distribution?.total_expense || 0;
  const items = distribution?.items || [];

  if (items.length === 0 || total === 0) {
    return `
      <div class="empty-state" style="padding: 24px 0;">
        <p class="empty-state-title">Belum ada pengeluaran tercatat bulan ini</p>
        <p class="empty-state-desc">Catat pengeluaran pertamamu dengan tombol Tambah Transaksi.</p>
      </div>
    `;
  }

  // Calculate SVG donut segments
  const size = 220;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const segmentsSvg = items.map(item => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += item.percentage;

    return `
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${radius}"
        fill="transparent"
        stroke="${item.color}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${strokeDasharray}"
        stroke-dashoffset="${strokeDashoffset}"
        transform="rotate(-90 ${size / 2} ${size / 2})"
      >
        <title>${item.category_name}: ${formatIDR(item.amount)} (${item.percentage}%)</title>
      </circle>
    `;
  }).join('');

  return `
    <div class="donut-section">
      <div class="donut-svg-wrapper">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="transparent" stroke="var(--divider)" stroke-width="${strokeWidth}" />
          ${segmentsSvg}
        </svg>

        <div class="donut-center-text">
          <span class="donut-center-label">Total</span>
          <span class="donut-center-amount tabular-nums">${formatIDR(total)}</span>
        </div>
      </div>

      <div class="donut-legend-list">
        ${items.map(item => `
          <div class="donut-legend-row">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="width: 12px; height: 12px; border-radius: 3px; background-color: ${item.color}; flex-shrink: 0;"></span>
              <span style="color: var(--text-primary); font-family: var(--font-body);">${item.category_name}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 18px;">
              <span class="tabular-nums" style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--text-primary);">
                ${formatIDR(item.amount)}
              </span>
              <span class="tabular-nums" style="font-family: var(--font-heading); font-size: 14px; color: var(--text-secondary); width: 44px; text-align: right;">
                ${item.percentage}%
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderTransactionsTable(transactions) {
  if (!transactions || transactions.length === 0) {
    return `
      <div class="empty-state">
        <p class="empty-state-title">Tidak ada transaksi ditemukan</p>
        <p class="empty-state-desc">Sesuaikan kata kunci pencarian atau ubah pilihan filter di atas.</p>
      </div>
    `;
  }

  return `
    <table class="tx-table">
      <thead>
        <tr>
          <th>Tanggal</th>
          <th>Deskripsi</th>
          <th>Kategori</th>
          <th>Metode</th>
          <th style="text-align: right;">Nominal</th>
          <th style="width: 40px;"></th>
        </tr>
      </thead>
      <tbody>
        ${transactions.map(tx => {
          const isIncome = tx.type === 'income';
          const catName = tx.category?.name || 'Lain-lain';
          const method = tx.payment_method || tx.account?.name || '—';

          return `
            <tr data-id="${tx.id}">
              <td class="tx-date-cell">${formatDateID(tx.transaction_date, { shortMonth: true })}</td>
              <td>
                <div class="tx-desc-cell">
                  <span class="tx-type-badge ${isIncome ? 'income' : 'expense'}">
                    ${renderIcon(isIncome ? 'ArrowDownLeft' : 'ArrowUpRight', 14)}
                  </span>
                  <div>
                    <p style="font-weight: 500; color: var(--text-primary); line-height: 1.4;">${escapeHtml(tx.description)}</p>
                  </div>
                </div>
              </td>
              <td><span class="tx-pill">${escapeHtml(catName)}</span></td>
              <td style="color: var(--text-secondary); font-size: 14px;">${escapeHtml(method)}</td>
              <td class="tx-amount-cell ${isIncome ? 'income' : 'expense'} tabular-nums">
                ${isIncome ? '+' : '-'}${formatIDR(tx.amount)}
              </td>
              <td style="text-align: right;">
                <button class="btn-icon-delete" data-id="${tx.id}" title="Hapus transaksi">
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

function attachTransactionEvents(container) {
  // Modal open
  const btnOpenModal = container.querySelector('#btn-open-add-tx-modal');
  if (btnOpenModal) {
    btnOpenModal.addEventListener('click', () => openTransactionModal(container));
  }

  // Filter Search
  const filterSearch = container.querySelector('#filter-search');
  if (filterSearch) {
    filterSearch.addEventListener('input', debounce((e) => {
      currentFilters.search = e.target.value;
      renderTransactions(container);
    }, 300));
  }

  // Filter Month
  const filterMonth = container.querySelector('#filter-month');
  if (filterMonth) {
    filterMonth.addEventListener('change', (e) => {
      currentFilters.month = e.target.value;
      renderTransactions(container);
    });
  }

  // Filter Category
  const filterCat = container.querySelector('#filter-category');
  if (filterCat) {
    filterCat.addEventListener('change', (e) => {
      currentFilters.category_id = e.target.value;
      renderTransactions(container);
    });
  }

  // Filter Type
  const filterType = container.querySelector('#filter-type');
  if (filterType) {
    filterType.addEventListener('change', (e) => {
      currentFilters.type = e.target.value;
      renderTransactions(container);
    });
  }

  // Reset Filters
  const btnReset = container.querySelector('#btn-reset-filters');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      currentFilters = { search: '', month: 'all', category_id: 'all', type: 'all' };
      renderTransactions(container);
    });
  }

  // Delete transaction buttons
  const deleteButtons = container.querySelectorAll('.btn-icon-delete');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      openDeleteConfirmation(container, id);
    });
  });
}

function openTransactionModal(container) {
  const modalContainer = container.querySelector('#tx-modal-container');
  let selectedType = 'expense';
  let selectedCatId = cachedCategories.find(c => c.slug === 'groceries')?.id || cachedCategories[0]?.id;

  modalContainer.innerHTML = `
    <div class="modal-overlay open" id="modal-add-tx">
      <div class="modal-content">
        <button class="modal-close-btn" id="btn-close-modal">
          ${renderIcon('X', 20)}
        </button>

        <h2 class="modal-title">Catat Transaksi Baru</h2>
        <p class="modal-desc">Simpan pengeluaran harian atau uang saku ke database.</p>

        <form id="form-add-tx" style="margin-top: 20px;">
          <div class="form-group">
            <label class="form-label">Jenis Transaksi</label>
            <div class="toggle-group">
              <button type="button" class="toggle-btn active expense" id="btn-type-expense">Pengeluaran</button>
              <button type="button" class="toggle-btn" id="btn-type-income">Pemasukan</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Nominal Transaksi</label>
            <div class="nominal-input-wrapper">
              <span class="nominal-prefix">Rp</span>
              <input type="text" id="tx-amount" class="nominal-input tabular-nums" placeholder="0" inputmode="numeric" required autofocus>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Kategori</label>
            <div class="category-selection-grid" id="cat-selection-grid">
              ${renderCategorySelection(selectedType, selectedCatId)}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Deskripsi Transaksi</label>
            <input type="text" id="tx-description" class="input-control" placeholder="Contoh: Warteg Bahari, GrabBike ke kampus" required>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;">
            <div class="form-group">
              <label class="form-label">Tanggal</label>
              <input type="date" id="tx-date" class="input-control" value="${new Date().toISOString().split('T')[0]}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Sumber Rekening</label>
              <select id="tx-account" class="select-control">
                ${cachedAccounts.map(acc => `
                  <option value="${acc.id}">${acc.name} (${formatIDR(acc.balance)})</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--divider);">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Batal</button>
            <button type="submit" class="btn btn-primary" id="btn-submit-tx">Simpan Transaksi</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Toggle expense / income
  const btnExpense = modalContainer.querySelector('#btn-type-expense');
  const btnIncome = modalContainer.querySelector('#btn-type-income');
  const catGrid = modalContainer.querySelector('#cat-selection-grid');

  function updateType(type) {
    selectedType = type;
    if (type === 'expense') {
      btnExpense.className = 'toggle-btn active expense';
      btnIncome.className = 'toggle-btn';
      selectedCatId = cachedCategories.find(c => c.type === 'expense')?.id || cachedCategories[0]?.id;
    } else {
      btnIncome.className = 'toggle-btn active income';
      btnExpense.className = 'toggle-btn';
      selectedCatId = cachedCategories.find(c => c.type === 'income')?.id || cachedCategories[0]?.id;
    }
    catGrid.innerHTML = renderCategorySelection(selectedType, selectedCatId);
    attachCategoryClicks();
  }

  btnExpense.addEventListener('click', () => updateType('expense'));
  btnIncome.addEventListener('click', () => updateType('income'));

  function attachCategoryClicks() {
    catGrid.querySelectorAll('.category-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        selectedCatId = parseInt(btn.dataset.id, 10);
        catGrid.querySelectorAll('.category-select-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }
  attachCategoryClicks();

  // Nominal formatting on input
  const amountInput = modalContainer.querySelector('#tx-amount');
  amountInput.addEventListener('input', (e) => {
    const numeric = parseIDRInput(e.target.value);
    e.target.value = numeric ? numeric.toLocaleString('id-ID') : '';
  });

  // Close handlers
  const closeModal = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#btn-close-modal').addEventListener('click', closeModal);
  modalContainer.querySelector('#btn-cancel-modal').addEventListener('click', closeModal);

  // Form submit handler
  const form = modalContainer.querySelector('#form-add-tx');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseIDRInput(amountInput.value);
    const description = modalContainer.querySelector('#tx-description').value.trim();
    const date = modalContainer.querySelector('#tx-date').value;
    const accountId = parseInt(modalContainer.querySelector('#tx-account').value, 10);

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
        amount: amount,
        description: description,
        transaction_date: date,
      });

      showToast('Transaksi berhasil disimpan.');
      closeModal();
      renderTransactions(container);
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan transaksi.', false);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Simpan Transaksi';
    }
  });
}

function renderCategorySelection(type, selectedId) {
  const filtered = cachedCategories.filter(c => c.type === type);
  return filtered.map(cat => `
    <button type="button" class="category-select-btn ${cat.id === selectedId ? 'active' : ''}" data-id="${cat.id}">
      <span style="color: var(--text-primary);">${renderIcon(cat.icon || 'CircleDot', 16)}</span>
      <div style="overflow: hidden;">
        <p class="cat-name">${cat.name}</p>
        <p class="cat-sub">${cat.sublabel || ''}</p>
      </div>
    </button>
  `).join('');
}

function openDeleteConfirmation(container, txId) {
  const modalContainer = container.querySelector('#delete-modal-container');
  modalContainer.innerHTML = `
    <div class="modal-overlay open">
      <div class="modal-content" style="max-width: 440px;">
        <div style="display: flex; gap: 14px; align-items: flex-start;">
          <div style="width: 40px; height: 40px; border-radius: 8px; background-color: var(--danger-subtle); color: var(--danger); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${renderIcon('AlertTriangle', 20)}
          </div>
          <div>
            <h3 class="modal-title" style="font-size: 20px;">Hapus Transaksi?</h3>
            <p class="modal-desc" style="font-size: 15px; margin-top: 8px;">
              Transaksi ini akan dihapus dari database dan saldo rekeningmu akan disesuaikan secara otomatis.
            </p>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--divider);">
          <button class="btn btn-secondary" id="btn-cancel-del">Batal</button>
          <button class="btn btn-danger" id="btn-confirm-del">Hapus</button>
        </div>
      </div>
    </div>
  `;

  const closeModal = () => { modalContainer.innerHTML = ''; };
  modalContainer.querySelector('#btn-cancel-del').addEventListener('click', closeModal);

  modalContainer.querySelector('#btn-confirm-del').addEventListener('click', async () => {
    try {
      await api.deleteTransaction(txId);
      showToast('Transaksi berhasil dihapus.');
      closeModal();
      renderTransactions(container);
    } catch (err) {
      showToast(err.message || 'Gagal menghapus transaksi.', false);
    }
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
