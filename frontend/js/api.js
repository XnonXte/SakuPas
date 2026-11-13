/**
 * SakuPas — Centralized API Client (Native Fetch API)
 */

const API_BASE_URL = window.SAKUPAS_API_URL || (
  window.location.port === '8000' || window.location.origin.endsWith(':8000')
    ? '/api/v1'
    : 'http://localhost:8000/api/v1'
);

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('sakupas_token') || null;
  }

  setToken(token) {
    this.token = token;
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

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const json = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or unauthenticated
          this.setToken(null);
          window.dispatchEvent(new CustomEvent('sakupas:unauthorized'));
        }

        const errorMessage = json?.message || `HTTP error ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.errors = json?.errors || null;
        throw error;
      }

      return json?.data !== undefined ? json.data : json;
    } catch (err) {
      console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err);
      throw err;
    }
  }

  // Auth Endpoints
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

  async updateProfile(name, email) {
    return this.request('/user', {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    });
  }

  // Dashboard Endpoints
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

  // Transactions Endpoints
  async getTransactions(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
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

  async updateTransaction(id, transactionData) {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
  }

  async deleteTransaction(id) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // PayLater Endpoints
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

  async recordPayLaterRepayment(id, repaymentData) {
    return this.request(`/paylater/${id}/repayments`, {
      method: 'POST',
      body: JSON.stringify(repaymentData),
    });
  }

  async deletePayLaterBill(id) {
    return this.request(`/paylater/${id}`, {
      method: 'DELETE',
    });
  }

  // Budgets Endpoints
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

  // Mode Hemat Endpoints
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
