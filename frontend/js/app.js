/**
 * SakuPas — Application Root Orchestrator (Pure Vanilla JS)
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
    this.viewContainer = document.getElementById('view-container');
  }

  async init() {
    this.attachNavEvents();
    this.attachGlobalEvents();

    // Check authentication or auto-authenticate with demo user for smooth experience
    await this.checkAuth();

    // Initial render
    this.navigate(this.getViewFromHash() || 'dashboard');
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
        this.updateUserUI();
        return;
      } catch (err) {
        console.warn('Session expired, logging in default account...');
      }
    }

    // Auto-login demo account if not authenticated
    try {
      const loginRes = await api.login('rian@sakupas.id', 'password123');
      this.user = loginRes.user;
      this.updateUserUI();
    } catch (e) {
      console.warn('Could not auto-login demo user, showing guest state.', e);
      this.updateUserUI();
    }
  }

  updateUserUI() {
    const userNameEl = document.getElementById('sidebar-user-name');
    const userRoleEl = document.getElementById('sidebar-user-role');
    const userAvatarEl = document.getElementById('sidebar-user-avatar');
    const authBtn = document.getElementById('btn-auth-toggle');

    if (this.user) {
      if (userNameEl) userNameEl.textContent = this.user.name;
      if (userRoleEl) userRoleEl.textContent = this.user.email;
      if (userAvatarEl) {
        const initials = this.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        userAvatarEl.textContent = initials || 'RP';
      }
      if (authBtn) {
        authBtn.innerHTML = `${renderIcon('LogOut', 14)} <span>Keluar</span>`;
      }
    } else {
      if (userNameEl) userNameEl.textContent = 'Tamu (Guest)';
      if (userRoleEl) userRoleEl.textContent = 'Belum masuk akun';
      if (userAvatarEl) userAvatarEl.textContent = '??';
      if (authBtn) {
        authBtn.innerHTML = `${renderIcon('User', 14)} <span>Masuk / Daftar</span>`;
      }
    }
  }

  attachNavEvents() {
    // Desktop Sidebar buttons
    document.querySelectorAll('.sidebar-nav .nav-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = btn.dataset.view;
        this.navigate(view);
      });
    });

    // Mobile Bottom Nav buttons
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = btn.dataset.view;
        this.navigate(view);
      });
    });

    // Auth Toggle button
    const authBtn = document.getElementById('btn-auth-toggle');
    if (authBtn) {
      authBtn.addEventListener('click', async () => {
        if (api.isAuthenticated()) {
          await api.logout();
          this.user = null;
          this.updateUserUI();
          showToast('Anda telah keluar.');
          openAuthModal(() => {
            this.checkAuth().then(() => this.navigate(this.currentView));
          });
        } else {
          openAuthModal(() => {
            this.checkAuth().then(() => this.navigate(this.currentView));
          });
        }
      });
    }

    // Reset Data Simulation button
    const resetBtn = document.getElementById('btn-reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        if (!confirm('Kembalikan data akun dan transaksi ke kondisi simulasi awal?')) {
          return;
        }
        resetBtn.disabled = true;
        try {
          // Re-login demo user to refresh state
          await api.login('rian@sakupas.id', 'password123');
          showToast('Data simulasi berhasil dimuat ulang.');
          this.navigate(this.currentView);
        } catch (err) {
          showToast('Gagal memuat ulang data.', false);
        } finally {
          resetBtn.disabled = false;
        }
      });
    }
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
  }

  async navigate(view, updateHash = true) {
    this.currentView = view;
    if (updateHash) {
      window.location.hash = `#${view}`;
    }

    // Update active nav styles
    document.querySelectorAll('.sidebar-nav .nav-item-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Update mobile topbar view tag
    const viewTag = document.getElementById('mobile-view-tag');
    if (viewTag) {
      viewTag.textContent = view === 'mode-hemat' ? 'Mode Hemat' : (view.charAt(0).toUpperCase() + view.slice(1));
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Render corresponding view
    if (view === 'dashboard') {
      await renderDashboard(this.viewContainer);
    } else if (view === 'transactions') {
      await renderTransactions(this.viewContainer);
    } else if (view === 'mode-hemat') {
      await renderModeHemat(this.viewContainer);
    }

    // Update Mode Hemat badge in sidebar
    this.updateModeHematIndicator();
  }

  async updateModeHematIndicator() {
    try {
      const mh = await api.getModeHemat();
      const isActive = Boolean(mh?.is_active);

      const sidebarBadge = document.getElementById('sidebar-mode-hemat-badge');
      if (sidebarBadge) {
        sidebarBadge.style.display = isActive ? 'inline-block' : 'none';
      }

      const mobileBadge = document.getElementById('mobile-mode-hemat-dot');
      if (mobileBadge) {
        mobileBadge.style.display = isActive ? 'block' : 'none';
      }

      const statusLabel = document.getElementById('sidebar-mh-status-label');
      if (statusLabel) {
        statusLabel.className = `status-label ${isActive ? 'active' : 'standby'}`;
        statusLabel.textContent = isActive ? 'Sedang Aktif' : 'Standby';
      }
    } catch (e) {
      // quiet fail on indicator update
    }
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new SakuPasApp();
  app.init();
});
