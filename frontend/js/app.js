/**
 * SakuPas — Application Root Orchestrator (Modular Vanilla ES6 + jQuery)
 */

import { api } from './api.js';
import { renderDashboard } from './dashboard.js';
import { renderTransactions } from './transactions.js';
import { renderModeHemat } from './mode-hemat.js';
import { openAuthModal } from './auth.js';
import { renderIcon, showToast } from './utils.js';

class SakuPasApp {
  constructor() {
    this.currentView = 'dashboard';
    this.user = null;
    this.viewContainer = document.getElementById('view-content-root');
  }

  async init() {
    this.attachNavigationEvents();
    this.attachGlobalEvents();

    // Authenticate session
    await this.checkAuth();

    // Render initial view based on window hash or default to dashboard
    const initialView = this.getViewFromHash() || 'dashboard';
    this.navigate(initialView);
  }

  getViewFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (['dashboard', 'transactions', 'mode-hemat'].includes(hash)) {
      return hash;
    }
    return null;
  }

  async checkAuth() {
    if (api.isAuthenticated()) {
      try {
        this.user = await api.getUser();
        this.updateProfileUI();
        return;
      } catch (err) {
        console.warn(`Session lookup failed; trying the demo account: ${err.message}`);
      }
    }

    // Auto-login demo student account (Rian Pratama) for zero-friction evaluation
    try {
      const loginRes = await api.login('rian@sakupas.id', 'password123');
      this.user = loginRes.user || { name: 'Rian Pratama', email: 'rian@sakupas.id' };
      this.updateProfileUI();
    } catch (e) {
      console.warn('Could not auto-login demo account:', e);
      this.updateProfileUI();
    }
  }

  updateProfileUI() {
    const userNameEl = document.getElementById('user-profile-name');
    const userRoleEl = document.getElementById('user-profile-role');
    const userAvatarEl = document.getElementById('user-profile-avatar');
    const authBtn = document.getElementById('btn-auth-action');
    const mobileAuthBtn = document.getElementById('mobile-auth-action');
    document.querySelectorAll('[data-action="reset-simulation"]').forEach((button) => {
      button.hidden = !api.isOfflineDemo;
    });

    if (this.user) {
      if (userNameEl) userNameEl.textContent = this.user.name;
      if (userRoleEl) userRoleEl.textContent = this.user.email || 'S1 Fasilkom UI';
      if (userAvatarEl) {
        const initials = (this.user.name || 'RP')
          .split(' ')
          .map(w => w[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();
        userAvatarEl.textContent = initials || 'RP';
      }
      [authBtn, mobileAuthBtn].filter(Boolean).forEach((button) => {
        button.innerHTML = `${renderIcon('LogOut', 14)} <span>Keluar</span>`;
        button.title = 'Keluar dari akun';
      });
    } else {
      if (userNameEl) userNameEl.textContent = 'Tamu (Guest)';
      if (userRoleEl) userRoleEl.textContent = 'Belum terautentikasi';
      if (userAvatarEl) userAvatarEl.textContent = '??';
      [authBtn, mobileAuthBtn].filter(Boolean).forEach((button) => {
        button.innerHTML = `${renderIcon('User', 14)} <span>Masuk / Daftar</span>`;
        button.title = 'Masuk ke akun';
      });
    }
  }

  attachNavigationEvents() {
    // Desktop Sidebar buttons
    document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.navigate(view);
      });
    });

    // Mobile Bottom Nav buttons
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.navigate(view);
      });
    });

    // Auth Button Action
    const authButtons = [
      document.getElementById('btn-auth-action'),
      document.getElementById('mobile-auth-action'),
    ].filter(Boolean);
    authButtons.forEach((authBtn) => {
      authBtn.addEventListener('click', async () => {
        if (api.isAuthenticated()) {
          let logoutError;
          try {
            await api.logout();
            showToast('Anda telah keluar dari akun.');
          } catch (err) {
            logoutError = err;
            showToast(err.message || 'Gagal mengakhiri sesi di server.', false);
          } finally {
            this.user = null;
            this.updateProfileUI();
          }
          if (logoutError) console.warn('Logout request failed:', logoutError);
          openAuthModal(() => {
            this.checkAuth().then(() => this.navigate(this.currentView));
          });
        } else {
          openAuthModal(() => {
            this.checkAuth().then(() => this.navigate(this.currentView));
          });
        }
      });
    });

    // Reset Simulation Data Button
    const resetButtons = document.querySelectorAll('[data-action="reset-simulation"]');
    resetButtons.forEach((resetBtn) => {
      resetBtn.addEventListener('click', async () => {
        if (!confirm('Kembalikan seluruh data akun, transaksi, dan PayLater ke kondisi awal simulasi?')) {
          return;
        }

        resetBtn.disabled = true;
        try {
          api.resetLocalSimulation();
          await api.login('rian@sakupas.id', 'password123');
          showToast('Data simulasi berhasil dimuat ulang ke kondisi awal.');
          await this.checkAuth();
          await this.navigate(this.currentView);
        } catch (err) {
          showToast(err.message || 'Gagal mereset data simulasi.', false);
        } finally {
          resetButtons.forEach((button) => { button.disabled = false; });
        }
      });
    });
  }

  attachGlobalEvents() {
    window.addEventListener('hashchange', () => {
      const view = this.getViewFromHash();
      if (view && view !== this.currentView) {
        this.navigate(view, false);
      }
    });

    window.addEventListener('sakupas:navigate', (e) => {
      if (e.detail) {
        this.navigate(e.detail);
      }
    });

    window.addEventListener('sakupas:unauthorized', () => {
      openAuthModal(() => {
        this.checkAuth().then(() => this.navigate(this.currentView));
      });
    });
    window.addEventListener('sakupas:mode-hemat-updated', () => this.updateModeHematIndicator());
    window.addEventListener('sakupas:demo-mode-changed', () => this.updateProfileUI());

    document.addEventListener('click', (event) => {
      if (event.target.classList?.contains('modal-backdrop')) {
        event.target.parentElement.innerHTML = '';
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
          backdrop.parentElement.innerHTML = '';
        });
      }
    });

    const fontNoticeToggle = document.getElementById('font-notice-toggle');
    const fontNotice = document.getElementById('font-notice');
    if (fontNoticeToggle && fontNotice) {
      fontNoticeToggle.addEventListener('click', () => {
        const isOpen = fontNotice.hidden;
        fontNotice.hidden = !isOpen;
        fontNoticeToggle.setAttribute('aria-expanded', String(isOpen));
      });
    }
  }

  async navigate(view, updateHash = true) {
    this.currentView = view;
    if (updateHash) {
      window.location.hash = `#${view}`;
    }

    // Update active nav styles
    document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
      if (btn.dataset.view === view) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
      if (btn.dataset.view === view) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    // Update mobile topbar view title
    const mobileTitle = document.getElementById('mobile-header-title');
    if (mobileTitle) {
      const labels = {
        'dashboard': 'Dashboard',
        'transactions': 'Transaksi',
        'mode-hemat': 'Mode Hemat',
      };
      mobileTitle.textContent = labels[view] || 'SakuPas';
    }

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Render corresponding screen
    if (view === 'dashboard') {
      await renderDashboard(this.viewContainer);
    } else if (view === 'transactions') {
      await renderTransactions(this.viewContainer);
    } else if (view === 'mode-hemat') {
      await renderModeHemat(this.viewContainer);
    }

    // Refresh Mode Hemat status pill
    this.updateModeHematIndicator();
  }

  async updateModeHematIndicator() {
    try {
      const mh = await api.getModeHemat();
      const isActive = Boolean(mh?.is_active);

      const sidebarBadge = document.getElementById('sidebar-mode-hemat-badge');
      if (sidebarBadge) {
        sidebarBadge.hidden = !isActive;
      }

      const mobileBadge = document.getElementById('mobile-mode-hemat-dot');
      if (mobileBadge) {
        mobileBadge.hidden = !isActive;
      }

      const statusTag = document.getElementById('sidebar-mh-status-tag');
      if (statusTag) {
        statusTag.className = `status-pill ${isActive ? 'badge-warning' : 'badge-safe'}`;
        statusTag.textContent = isActive ? 'Aktif' : 'Standby';
      }
    } catch (e) {
      console.warn('Could not refresh Mode Hemat status:', e.message);
    }
  }
}

// Bootstrap when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new SakuPasApp();
  app.init();
});
