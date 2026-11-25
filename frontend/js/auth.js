/**
 * SakuPas — Authentication View Module (Modular ES6 + jQuery)
 * Login, registration, and quick demo switch for university student session
 */

import { api } from './api.js';
import { renderIcon, showToast } from './utils.js';

export function openAuthModal(onSuccess) {
  let modalContainer = document.getElementById('auth-modal-root');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'auth-modal-root';
    document.body.appendChild(modalContainer);
  }

  let activeTab = 'login'; // 'login' | 'register'

  function renderDialog() {
    modalContainer.innerHTML = `
      <div class="modal-backdrop open">
        <div class="modal-dialog modal-dialog-sm">
          <button class="modal-close" id="btn-close-auth-modal" aria-label="Tutup">
            ${renderIcon('X', 18)}
          </button>

          <div class="modal-header">
            <div class="brand-badge-row">
              <span class="brand-text">SakuPas</span>
              <span class="brand-pill">Mahasiswa</span>
            </div>
            <h3 class="modal-title" style="margin-top: 8px;">
              ${activeTab === 'login' ? 'Masuk ke Akun Finansial' : 'Daftar Akun SakuPas Baru'}
            </h3>
            <p class="modal-subtitle">
              ${activeTab === 'login'
                ? 'Kelola Safe-to-Spend dan mutasi keuangan mahasiswa secara persisten.'
                : 'Mulai kelola keuangan tanpa rasa malu (no-shame financial control).'}
            </p>
          </div>

          <div class="type-segment-control" style="margin-bottom: 20px;">
            <button type="button" class="segment-btn ${activeTab === 'login' ? 'active-neutral' : ''}" id="tab-auth-login">Masuk</button>
            <button type="button" class="segment-btn ${activeTab === 'register' ? 'active-neutral' : ''}" id="tab-auth-register">Daftar</button>
          </div>

          <form id="auth-main-form" class="modal-form">
            ${activeTab === 'register' ? `
              <div class="form-group">
                <label class="form-label">Nama Lengkap</label>
                <input type="text" id="auth-input-name" class="form-input" placeholder="Rian Pratama" required autofocus>
              </div>
            ` : ''}

            <div class="form-group">
              <label class="form-label">Alamat Email</label>
              <input type="email" id="auth-input-email" class="form-input" placeholder="rian@sakupas.id" value="${activeTab === 'login' ? 'rian@sakupas.id' : ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Kata Sandi</label>
              <input type="password" id="auth-input-password" class="form-input" placeholder="••••••••" value="${activeTab === 'login' ? 'password123' : ''}" required>
            </div>

            ${activeTab === 'register' ? `
              <div class="form-group">
                <label class="form-label">Konfirmasi Kata Sandi</label>
                <input type="password" id="auth-input-password-conf" class="form-input" placeholder="••••••••" required>
              </div>
            ` : ''}

            <div style="margin-top: 14px;">
              <button type="submit" class="btn btn-primary btn-block" id="btn-submit-auth">
                ${activeTab === 'login' ? 'Masuk ke Akun' : 'Daftar Sekarang'}
              </button>
            </div>
          </form>

          ${activeTab === 'login' ? `
            <div class="quick-demo-box">
              <span class="quick-demo-label">Atau akses langsung simulasi:</span>
              <button type="button" class="btn btn-secondary btn-sm btn-block" id="btn-quick-demo">
                ${renderIcon('User', 14)}
                <span>Masuk Akun Demo Mahasiswa (Rian Pratama)</span>
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Tab bindings
    modalContainer.querySelector('#tab-auth-login').addEventListener('click', () => {
      activeTab = 'login';
      renderDialog();
    });

    modalContainer.querySelector('#tab-auth-register').addEventListener('click', () => {
      activeTab = 'register';
      renderDialog();
    });

    modalContainer.querySelector('#btn-close-auth-modal').addEventListener('click', () => {
      modalContainer.innerHTML = '';
    });

    // Quick demo button
    const demoBtn = modalContainer.querySelector('#btn-quick-demo');
    if (demoBtn) {
      demoBtn.addEventListener('click', async () => {
        demoBtn.disabled = true;
        demoBtn.textContent = 'Menghubungkan...';
        try {
          await api.login('rian@sakupas.id', 'password123');
          showToast('Berhasil masuk sebagai Rian Pratama.');
          modalContainer.innerHTML = '';
          if (onSuccess) onSuccess();
        } catch (err) {
          showToast(err.message || 'Gagal masuk akun demo.', false);
          demoBtn.disabled = false;
          demoBtn.textContent = 'Masuk Akun Demo Mahasiswa';
        }
      });
    }

    // Submit form
    const form = modalContainer.querySelector('#auth-main-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = modalContainer.querySelector('#btn-submit-auth');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Memproses...';

      const email = modalContainer.querySelector('#auth-input-email').value.trim();
      const password = modalContainer.querySelector('#auth-input-password').value;

      try {
        if (activeTab === 'login') {
          await api.login(email, password);
          showToast('Login berhasil.');
        } else {
          const name = modalContainer.querySelector('#auth-input-name').value.trim();
          const conf = modalContainer.querySelector('#auth-input-password-conf').value;
          await api.register(name, email, password, conf);
          showToast('Pendaftaran akun berhasil.');
        }

        modalContainer.innerHTML = '';
        if (onSuccess) onSuccess();
      } catch (err) {
        showToast(err.message || 'Otentikasi gagal.', false);
        submitBtn.disabled = false;
        submitBtn.textContent = activeTab === 'login' ? 'Masuk ke Akun' : 'Daftar Sekarang';
      }
    });
  }

  renderDialog();
}
