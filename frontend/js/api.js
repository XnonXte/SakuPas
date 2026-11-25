/**
 * SakuPas — Centralized API Client with jQuery & Native Fetch Support
 * Fully integrated with Laravel 13 Sanctum REST API + Seamless Local Simulation Fallback
 */

const API_BASE_URL = window.SAKUPAS_API_URL || '/api/v1';
const DEMO_TOKEN = 'mock-bearer-token-student-rian';

// Initial fallback mock data for offline resilience
const DEFAULT_USER = {
  id: 1,
  name: 'Rian Pratama',
  email: 'rian@sakupas.id',
  role: 'S1 Fasilkom UI',
};

const DEFAULT_ACCOUNTS = [
  { id: 1, name: 'Rekening Utama BCA', account_type: 'bank', balance: 2100000, description: 'Rekening transfer ortu' },
  { id: 2, name: 'GoPay', account_type: 'ewallet', balance: 250000, description: 'Dompet digital harian' },
  { id: 3, name: 'Tunai / Cash', account_type: 'cash', balance: 150000, description: 'Uang tunai dompet' },
];

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Kebutuhan Pokok & Makan', slug: 'groceries', type: 'expense', sublabel: 'Warteg, Makan Harian & Kos', icon: 'UtensilsCrossed', color: '#0D9488', is_system: true },
  { id: 2, name: 'Transportasi On-Demand', slug: 'transportation', type: 'expense', sublabel: 'Grab, Gojek & Bensin', icon: 'Navigation', color: '#1E293B', is_system: true },
  { id: 3, name: 'Lifestyle & Hiburan', slug: 'lifestyle', type: 'expense', sublabel: 'TikTok Shop, Kafe & Jajan', icon: 'Sparkles', color: '#E9896A', is_system: true },
  { id: 4, name: 'Kuliah & Akademik', slug: 'education', type: 'expense', sublabel: 'Fotokopi, Buku & Print', icon: 'BookOpen', color: '#64748B', is_system: true },
  { id: 5, name: 'Belanja Online', slug: 'online-shopping', type: 'expense', sublabel: 'Shopee, Tokopedia, TikTok', icon: 'ShoppingBag', color: '#E9896A', is_system: true },
  { id: 6, name: 'Uang Saku', slug: 'uang-saku', type: 'income', sublabel: 'Transfer Orang Tua', icon: 'ArrowDownLeft', color: '#0D9488', is_system: true },
  { id: 7, name: 'Part-time & Freelance', slug: 'part-time', type: 'income', sublabel: 'Gaji Sampingan & Asdos', icon: 'Briefcase', color: '#0D9488', is_system: true },
  { id: 8, name: 'Lain-lain', slug: 'other', type: 'expense', sublabel: 'Pengeluaran Tak Terduga', icon: 'CircleDot', color: '#64748B', is_system: true },
];

const DEFAULT_TRANSACTIONS = [
  { id: 1, account_id: 1, category_id: 1, type: 'expense', amount: 18000, description: 'Warteg Bahari — Nasi ayam orek es teh', transaction_date: '2026-11-24', payment_method: 'QRIS BCA' },
  { id: 2, account_id: 2, category_id: 2, type: 'expense', amount: 14000, description: 'GrabBike — Kos ke Gedung Kuliah Bersama', transaction_date: '2026-11-24', payment_method: 'GoPay' },
  { id: 3, account_id: 2, category_id: 3, type: 'expense', amount: 68000, description: 'TikTok Shop — Tumbler stainless & stiker', transaction_date: '2026-11-23', payment_method: 'GoPay' },
  { id: 4, account_id: 1, category_id: 3, type: 'expense', amount: 22000, description: 'Kopi Kenangan — Kopi Kenangan Mantan', transaction_date: '2026-11-22', payment_method: 'QRIS BCA' },
  { id: 5, account_id: 3, category_id: 4, type: 'expense', amount: 15000, description: 'Fotokopi modul Statistika & jilid laporan', transaction_date: '2026-11-20', payment_method: 'Tunai' },
  { id: 6, account_id: 1, category_id: 1, type: 'expense', amount: 25000, description: 'Makan malam Warung Padang Murah', transaction_date: '2026-11-19', payment_method: 'QRIS BCA' },
  { id: 7, account_id: 2, category_id: 2, type: 'expense', amount: 16000, description: 'GrabBike — Pulang praktikum kampus', transaction_date: '2026-11-18', payment_method: 'GoPay' },
  { id: 8, account_id: 3, category_id: 1, type: 'expense', amount: 45000, description: 'Refill galon Aqua & deterjen kos', transaction_date: '2026-11-17', payment_method: 'Tunai' },
  { id: 9, account_id: 2, category_id: 3, type: 'expense', amount: 35000, description: 'Jajan camilan Indomaret bareng teman', transaction_date: '2026-11-16', payment_method: 'GoPay' },
  { id: 10, account_id: 1, category_id: 6, type: 'income', amount: 2500000, description: 'Uang saku bulanan dari Orang Tua', transaction_date: '2026-11-01', payment_method: 'Transfer BCA' },
  { id: 11, account_id: 1, category_id: 7, type: 'income', amount: 350000, description: 'Honor asisten laboratorium gelombang 1', transaction_date: '2026-11-05', payment_method: 'Transfer Bank Mandiri' },
];

const DEFAULT_PAYLATER = [
  { id: 1, provider_name: 'Atome Finance', description: 'Cicilan Sepatu Kuliah', total_amount: 150000, paid_amount: 0, outstanding_amount: 150000, due_date: '2026-11-28', status: 'pending', installment_info: 'Cicilan 2 dari 3 (Sepatu Kuliah)' },
  { id: 2, provider_name: 'TikTok Shop PayLater', description: 'Cicilan Tas Ransel & Hoodie', total_amount: 300000, paid_amount: 0, outstanding_amount: 300000, due_date: '2026-12-05', status: 'pending', installment_info: 'Cicilan 1 dari 2 (Tas Ransel & Hoodie)' },
];

const DEFAULT_BUDGETS = [
  { id: 1, category_id: 1, category_name: 'Kebutuhan Pokok & Makan', category_slug: 'groceries', category_sublabel: 'Makan harian warteg, air galon, kos', allocated: 800000, spent: 450000, remaining: 350000, percent_used: 56, percent_of_total: 46 },
  { id: 2, category_id: 2, category_name: 'Transportasi On-Demand', category_slug: 'transportation', category_sublabel: 'GrabBike / Gojek ke kampus, KRL', allocated: 300000, spent: 190000, remaining: 110000, percent_used: 63, percent_of_total: 17 },
  { id: 3, category_id: 3, category_name: 'Lifestyle & Hiburan', category_slug: 'lifestyle', category_sublabel: 'Kopi, jajan sore, checkout TikTok', allocated: 400000, spent: 230000, remaining: 170000, percent_used: 58, percent_of_total: 23 },
  { id: 4, category_id: 4, category_name: 'Kuliah & Akademik', category_slug: 'education', category_sublabel: 'Print modul tugas, jilid, fotokopi', allocated: 250000, spent: 95000, remaining: 155000, percent_used: 38, percent_of_total: 14 },
];

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('sakupas_token') || null;
    this.isOfflineDemo = this.token === DEMO_TOKEN;
    this.useOfflineMock = false;
    this.initLocalStorage();
  }

  initLocalStorage() {
    if (!localStorage.getItem('sakupas_mock_accounts')) {
      localStorage.setItem('sakupas_mock_accounts', JSON.stringify(DEFAULT_ACCOUNTS));
    }
    if (!localStorage.getItem('sakupas_mock_categories')) {
      localStorage.setItem('sakupas_mock_categories', JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem('sakupas_mock_transactions')) {
      localStorage.setItem('sakupas_mock_transactions', JSON.stringify(DEFAULT_TRANSACTIONS));
    }
    if (!localStorage.getItem('sakupas_mock_paylater')) {
      localStorage.setItem('sakupas_mock_paylater', JSON.stringify(DEFAULT_PAYLATER));
    }
    if (!localStorage.getItem('sakupas_mock_budgets')) {
      localStorage.setItem('sakupas_mock_budgets', JSON.stringify(DEFAULT_BUDGETS));
    }
    if (!localStorage.getItem('sakupas_mock_selflock')) {
      localStorage.setItem('sakupas_mock_selflock', JSON.stringify({ is_active: false, activated_at: null }));
    }
  }

  resetLocalSimulation() {
    if (!this.isOfflineDemo) {
      throw new Error('Reset simulasi hanya tersedia saat menggunakan akun demo lokal.');
    }
    localStorage.setItem('sakupas_mock_accounts', JSON.stringify(DEFAULT_ACCOUNTS));
    localStorage.setItem('sakupas_mock_categories', JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem('sakupas_mock_transactions', JSON.stringify(DEFAULT_TRANSACTIONS));
    localStorage.setItem('sakupas_mock_paylater', JSON.stringify(DEFAULT_PAYLATER));
    localStorage.setItem('sakupas_mock_budgets', JSON.stringify(DEFAULT_BUDGETS));
    localStorage.setItem('sakupas_mock_selflock', JSON.stringify({ is_active: false, activated_at: null }));
  }

  setToken(token) {
    this.token = token;
    this.setOfflineDemo(token === DEMO_TOKEN);
    if (token) {
      localStorage.setItem('sakupas_token', token);
    } else {
      localStorage.removeItem('sakupas_token');
    }
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return Boolean(this.token);
  }

  setOfflineDemo(isOfflineDemo) {
    if (this.isOfflineDemo === isOfflineDemo) return;
    this.isOfflineDemo = isOfflineDemo;
    window.dispatchEvent(new Event('sakupas:demo-mode-changed'));
  }

  /**
   * Primary network request with jQuery AJAX / Native fetch and offline fallback
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!this.useOfflineMock) {
      try {
        let responseJson;

        // Use jQuery ajax if available for jQuery compatibility requirement
        if (typeof window.jQuery !== 'undefined') {
          responseJson = await new Promise((resolve, reject) => {
            window.jQuery.ajax({
              url: url,
              type: method,
              headers: headers,
              data: options.body || undefined,
              contentType: 'application/json',
              dataType: 'json',
              timeout: 4000,
              success: (data) => resolve(data),
              error: (xhr) => {
                const err = new Error(xhr.responseJSON?.message || `HTTP error ${xhr.status}`);
                err.status = xhr.status;
                err.errors = xhr.responseJSON?.errors;
                reject(err);
              },
            });
          });
        } else {
          // Native fetch fallback
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          const res = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          const json = await res.json().catch(() => null);

          if (!res.ok) {
            const err = new Error(json?.message || `HTTP error ${res.status}`);
            err.status = res.status;
            err.errors = json?.errors;
            throw err;
          }

          responseJson = json;
        }

        return responseJson?.data !== undefined ? responseJson.data : responseJson;
      } catch (networkError) {
        if (networkError.status === 401) {
          if (!['/login', '/register'].includes(endpoint.split('?')[0])) {
            this.setToken(null);
            window.dispatchEvent(new CustomEvent('sakupas:unauthorized'));
          }
          throw networkError;
        }
        if (networkError.status && ![0, 502, 503, 504].includes(networkError.status)) {
          throw networkError;
        }
        const isStartingDemoSession = endpoint.split('?')[0] === '/login' && !this.token;
        if (!this.isOfflineDemo && !isStartingDemoSession) {
          throw networkError;
        }
        console.warn(`[SakuPas API] Server at ${url} is unavailable (${networkError.message}). Using the local demo data.`);
        return this.handleMockRequest(endpoint, options);
      }
    }

    this.setOfflineDemo(true);
    return this.handleMockRequest(endpoint, options);
  }

  /**
   * Internal Mock Database for seamless offline demo
   */
  handleMockRequest(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const cleanEndpoint = endpoint.split('?')[0];

    // Auth endpoints
    if (cleanEndpoint === '/register') {
      throw new Error('Pendaftaran memerlukan koneksi ke server.');
    }

    if (cleanEndpoint === '/login') {
      const credentials = JSON.parse(options.body || '{}');
      if (credentials.email !== DEFAULT_USER.email || credentials.password !== 'password123') {
        const error = new Error('Email atau kata sandi tidak sesuai untuk akun demo lokal.');
        error.status = 401;
        throw error;
      }
      const token = DEMO_TOKEN;
      this.setToken(token);
      return { user: DEFAULT_USER, token };
    }

    if (cleanEndpoint === '/logout') {
      this.setToken(null);
      return null;
    }

    if (cleanEndpoint === '/user') {
      return DEFAULT_USER;
    }

    // Accounts
    if (cleanEndpoint === '/accounts') {
      const accounts = JSON.parse(localStorage.getItem('sakupas_mock_accounts') || '[]');
      return accounts;
    }

    // Categories
    if (cleanEndpoint === '/categories') {
      const categories = JSON.parse(localStorage.getItem('sakupas_mock_categories') || '[]');
      return categories;
    }

    // Transactions list
    if (cleanEndpoint === '/transactions') {
      const transactions = JSON.parse(localStorage.getItem('sakupas_mock_transactions') || '[]');
      const categories = JSON.parse(localStorage.getItem('sakupas_mock_categories') || '[]');
      const accounts = JSON.parse(localStorage.getItem('sakupas_mock_accounts') || '[]');

      if (method === 'POST') {
        const payload = JSON.parse(options.body || '{}');
        const newTx = {
          id: Date.now(),
          account_id: payload.account_id,
          category_id: payload.category_id,
          type: payload.type || 'expense',
          amount: Number(payload.amount),
          description: payload.description,
          transaction_date: payload.transaction_date || new Date().toISOString().split('T')[0],
          payment_method: payload.payment_method || 'QRIS BCA',
        };
        transactions.unshift(newTx);
        localStorage.setItem('sakupas_mock_transactions', JSON.stringify(transactions));

        // Deduct from account
        const accIdx = accounts.findIndex(a => a.id == payload.account_id);
        if (accIdx !== -1) {
          if (payload.type === 'income') {
            accounts[accIdx].balance += Number(payload.amount);
          } else {
            accounts[accIdx].balance = Math.max(0, accounts[accIdx].balance - Number(payload.amount));
          }
          localStorage.setItem('sakupas_mock_accounts', JSON.stringify(accounts));
        }

        // Update budget spent
        if (payload.type === 'expense') {
          const budgets = JSON.parse(localStorage.getItem('sakupas_mock_budgets') || '[]');
          const bIdx = budgets.findIndex(b => b.category_id == payload.category_id);
          if (bIdx !== -1) {
            budgets[bIdx].spent += Number(payload.amount);
            budgets[bIdx].remaining = Math.max(0, budgets[bIdx].allocated - budgets[bIdx].spent);
            budgets[bIdx].percent_used = Math.round((budgets[bIdx].spent / budgets[bIdx].allocated) * 100);
            localStorage.setItem('sakupas_mock_budgets', JSON.stringify(budgets));
          }
        }

        return newTx;
      }

      // Filter query parameters
      const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const search = (urlParams.get('search') || '').toLowerCase();
      const month = urlParams.get('month') || 'all';
      const catId = urlParams.get('category_id') || 'all';
      const type = urlParams.get('type') || 'all';

      const populated = transactions.map(t => ({
        ...t,
        category: categories.find(c => c.id == t.category_id) || { name: 'Lain-lain', slug: 'other' },
        account: accounts.find(a => a.id == t.account_id) || { name: 'Kas' },
      })).filter(t => {
        if (search && !t.description.toLowerCase().includes(search) && !t.category.name.toLowerCase().includes(search)) {
          return false;
        }
        if (month !== 'all' && !t.transaction_date.startsWith(month)) {
          return false;
        }
        if (catId !== 'all' && t.category_id != catId) {
          return false;
        }
        if (type !== 'all' && t.type !== type) {
          return false;
        }
        return true;
      });

      return {
        items: populated,
        pagination: { current_page: 1, last_page: 1, per_page: 50, total: populated.length }
      };
    }

    // Delete transaction
    if (cleanEndpoint.startsWith('/transactions/') && method === 'DELETE') {
      const id = cleanEndpoint.split('/').pop();
      let transactions = JSON.parse(localStorage.getItem('sakupas_mock_transactions') || '[]');
      const target = transactions.find(t => t.id == id);
      if (target) {
        transactions = transactions.filter(t => t.id != id);
        localStorage.setItem('sakupas_mock_transactions', JSON.stringify(transactions));

        // Revert account balance
        const accounts = JSON.parse(localStorage.getItem('sakupas_mock_accounts') || '[]');
        const accIdx = accounts.findIndex(a => a.id == target.account_id);
        if (accIdx !== -1) {
          if (target.type === 'income') {
            accounts[accIdx].balance = Math.max(0, accounts[accIdx].balance - target.amount);
          } else {
            accounts[accIdx].balance += target.amount;
          }
          localStorage.setItem('sakupas_mock_accounts', JSON.stringify(accounts));
        }

        // Revert budget spent
        if (target.type === 'expense') {
          const budgets = JSON.parse(localStorage.getItem('sakupas_mock_budgets') || '[]');
          const bIdx = budgets.findIndex(b => b.category_id == target.category_id);
          if (bIdx !== -1) {
            budgets[bIdx].spent = Math.max(0, budgets[bIdx].spent - target.amount);
            budgets[bIdx].remaining = Math.max(0, budgets[bIdx].allocated - budgets[bIdx].spent);
            budgets[bIdx].percent_used = Math.round((budgets[bIdx].spent / budgets[bIdx].allocated) * 100);
            localStorage.setItem('sakupas_mock_budgets', JSON.stringify(budgets));
          }
        }
      }
      return { success: true };
    }

    // PayLater
    if (cleanEndpoint === '/paylater') {
      const bills = JSON.parse(localStorage.getItem('sakupas_mock_paylater') || '[]');
      if (method === 'POST') {
        const payload = JSON.parse(options.body || '{}');
        const newBill = {
          id: Date.now(),
          provider_name: payload.provider_name,
          description: payload.description || '',
          total_amount: Number(payload.total_amount),
          paid_amount: 0,
          outstanding_amount: Number(payload.total_amount),
          due_date: payload.due_date,
          status: 'pending',
          installment_info: payload.installment_info || '',
        };
        bills.push(newBill);
        localStorage.setItem('sakupas_mock_paylater', JSON.stringify(bills));
        return newBill;
      }
      return bills;
    }

    if (cleanEndpoint.includes('/toggle-paid') && method === 'POST') {
      const id = cleanEndpoint.split('/')[2];
      const bills = JSON.parse(localStorage.getItem('sakupas_mock_paylater') || '[]');
      const bIdx = bills.findIndex(b => b.id == id);
      if (bIdx !== -1) {
        bills[bIdx].status = bills[bIdx].status === 'paid' ? 'pending' : 'paid';
        bills[bIdx].paid_amount = bills[bIdx].status === 'paid' ? bills[bIdx].total_amount : 0;
        bills[bIdx].outstanding_amount = bills[bIdx].status === 'paid' ? 0 : bills[bIdx].total_amount;
        localStorage.setItem('sakupas_mock_paylater', JSON.stringify(bills));
        return bills[bIdx];
      }
      return null;
    }

    // Budgets
    if (cleanEndpoint === '/budgets') {
      const budgets = JSON.parse(localStorage.getItem('sakupas_mock_budgets') || '[]');
      if (method === 'POST') {
        const payload = JSON.parse(options.body || '{}');
        const bIdx = budgets.findIndex(b => b.category_id == payload.category_id);
        if (bIdx !== -1) {
          budgets[bIdx].allocated = Number(payload.amount);
          budgets[bIdx].remaining = Math.max(0, budgets[bIdx].allocated - budgets[bIdx].spent);
          budgets[bIdx].percent_used = Math.round((budgets[bIdx].spent / budgets[bIdx].allocated) * 100);
          localStorage.setItem('sakupas_mock_budgets', JSON.stringify(budgets));
          return budgets[bIdx];
        }
      }
      return budgets;
    }

    // Mode Hemat
    if (cleanEndpoint === '/mode-hemat') {
      return JSON.parse(localStorage.getItem('sakupas_mock_selflock') || '{"is_active":false}');
    }
    if (cleanEndpoint === '/mode-hemat/activate') {
      const state = { is_active: true, activated_at: new Date().toISOString() };
      localStorage.setItem('sakupas_mock_selflock', JSON.stringify(state));
      return state;
    }
    if (cleanEndpoint === '/mode-hemat/deactivate') {
      const state = { is_active: false, activated_at: null };
      localStorage.setItem('sakupas_mock_selflock', JSON.stringify(state));
      return state;
    }

    // Dashboard & Safe-to-Spend
    if (cleanEndpoint === '/dashboard/safe-to-spend' || cleanEndpoint === '/dashboard') {
      const transactions = JSON.parse(localStorage.getItem('sakupas_mock_transactions') || '[]');
      const accounts = JSON.parse(localStorage.getItem('sakupas_mock_accounts') || '[]');
      const bills = JSON.parse(localStorage.getItem('sakupas_mock_paylater') || '[]');
      const selfLock = JSON.parse(localStorage.getItem('sakupas_mock_selflock') || '{"is_active":false}');

      const mainBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
      const unpaidBills = bills.filter(b => b.status !== 'paid');
      const totalPayLater = unpaidBills.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const upcomingBillAmount = unpaidBills.length > 0 ? unpaidBills[0].total_amount : 0;

      const totalBudget = 1180000;
      const baseSafe = 850000;
      const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const initialExpenseSum = DEFAULT_TRANSACTIONS.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const delta = totalExpenses - initialExpenseSum;
      const remainingAmount = Math.max(0, baseSafe - delta);
      const percentage = Math.min(100, Math.max(0, Math.round((remainingAmount / totalBudget) * 100)));

      let status = 'safe';
      let statusLabel = 'Kondisi Aman';
      if (percentage < 30 || remainingAmount < 250000) {
        status = 'danger';
        statusLabel = 'Batas Bahaya';
      } else if (percentage < 60 || remainingAmount < 500000) {
        status = 'warning';
        statusLabel = 'Perlu Berhati-hati';
      }

      const now = new Date();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysRemaining = Math.max(1, lastDay - now.getDate() + 1);
      const dailySafeSpend = Math.round(remainingAmount / daysRemaining);

      const safeToSpend = {
        remaining_amount: remainingAmount,
        total_budget: totalBudget,
        percentage,
        status,
        status_label: statusLabel,
        daily_safe_spend: dailySafeSpend,
        days_remaining: daysRemaining,
      };

      if (cleanEndpoint === '/dashboard/safe-to-spend') {
        return safeToSpend;
      }

      return {
        financial_summary: {
          main_balance: mainBalance,
          total_paylater: totalPayLater,
          upcoming_bill_amount: upcomingBillAmount,
          monthly_income: transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
          monthly_expenses: totalExpenses,
          transaction_count: transactions.length,
        },
        safe_to_spend: safeToSpend,
        recent_transactions: transactions.slice(0, 5),
        upcoming_bills: bills.slice(0, 5),
        mode_hemat: selfLock,
      };
    }

    if (cleanEndpoint === '/dashboard/cash-flow') {
      return [
        { day: '01 Nov', pemasukan: 2500000, pengeluaran: 450000, saldo_proyeksi: 2050000 },
        { day: '05 Nov', pemasukan: 350000, pengeluaran: 180000, saldo_proyeksi: 2220000 },
        { day: '08 Nov', pemasukan: 0, pengeluaran: 240000, saldo_proyeksi: 1980000 },
        { day: '11 Nov', pemasukan: 0, pengeluaran: 190000, saldo_proyeksi: 1790000 },
        { day: '16 Nov', pemasukan: 0, pengeluaran: 95000, saldo_proyeksi: 1695000 },
        { day: '20 Nov', pemasukan: 0, pengeluaran: 150000, saldo_proyeksi: 1545000 },
        { day: '24 Nov', pemasukan: 0, pengeluaran: 300000, saldo_proyeksi: 1245000 },
        { day: '30 Nov', pemasukan: 0, pengeluaran: 395000, saldo_proyeksi: 850000 },
      ];
    }

    if (cleanEndpoint === '/dashboard/expense-distribution') {
      const transactions = JSON.parse(localStorage.getItem('sakupas_mock_transactions') || '[]');
      const categories = JSON.parse(localStorage.getItem('sakupas_mock_categories') || '[]');
      const expenses = transactions.filter(t => t.type === 'expense');
      const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);

      const catMap = {};
      expenses.forEach(t => {
        catMap[t.category_id] = (catMap[t.category_id] || 0) + t.amount;
      });

      const items = Object.entries(catMap).map(([cid, amt]) => {
        const cat = categories.find(c => c.id == cid) || { name: 'Lainnya', color: '#64748B' };
        return {
          category_id: Number(cid),
          category_name: cat.name,
          category_slug: cat.slug || 'other',
          color: cat.color || '#64748B',
          icon: cat.icon || 'CircleDot',
          amount: amt,
          percentage: totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0,
        };
      }).sort((a, b) => b.amount - a.amount);

      return { total_expense: totalExpense, items };
    }

    return null;
  }

  // Auth Methods
  async register(name, email, password, passwordConfirmation) {
    const data = await this.request('/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      }),
    });
    if (data?.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async login(email, password) {
    const data = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data?.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async logout() {
    try {
      await this.request('/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getUser() {
    return this.request('/user');
  }

  // Dashboard Methods
  async getDashboardSummary() {
    return this.request('/dashboard');
  }

  async getCashFlow(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/dashboard/cash-flow${query}`);
  }

  async getExpenseDistribution(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/dashboard/expense-distribution${query}`);
  }

  async getSafeToSpend() {
    return this.request('/dashboard/safe-to-spend');
  }

  // Accounts & Categories
  async getAccounts() {
    return this.request('/accounts');
  }

  async getCategories() {
    return this.request('/categories');
  }

  // Transactions
  async getTransactions(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'all') {
        params.append(key, val);
      }
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/transactions${query}`);
  }

  async createTransaction(transactionData) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async deleteTransaction(id) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // PayLater
  async getPayLaterBills() {
    return this.request('/paylater');
  }

  async createPayLaterBill(billData) {
    return this.request('/paylater', {
      method: 'POST',
      body: JSON.stringify(billData),
    });
  }

  async togglePayLaterPaid(id, accountId = null) {
    return this.request(`/paylater/${id}/toggle-paid`, {
      method: 'POST',
      body: JSON.stringify({ account_id: accountId }),
    });
  }

  async deletePayLaterBill(id) {
    return this.request(`/paylater/${id}`, {
      method: 'DELETE',
    });
  }

  // Budgets
  async getBudgets(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/budgets${query}`);
  }

  async saveBudget(budgetData) {
    return this.request('/budgets', {
      method: 'POST',
      body: JSON.stringify(budgetData),
    });
  }

  // Mode Hemat
  async getModeHemat() {
    return this.request('/mode-hemat');
  }

  async activateModeHemat() {
    return this.request('/mode-hemat/activate', { method: 'POST' });
  }

  async deactivateModeHemat() {
    return this.request('/mode-hemat/deactivate', { method: 'POST' });
  }
}

export const api = new ApiClient();
