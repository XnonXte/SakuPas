/**
 * SakuPas — Authentication View Module (Pure Vanilla JS)
 */

import { api } from './api.js';
import { renderIcon, showToast } from './utils.js';

export function openAuthModal(onSuccess) {
  let modalContainer = document.getElementById('auth-modal-container');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'auth-modal-container';
    document.body.appendChild(modalContainer);
  }

  let activeTab = 'login'; // 'login' or 'register'

  function renderForm() {
    modalContainer.innerHTML = `
      <div class="modal-overlay open" id="modal-auth">
        <div class="modal-content" style="max-width: 440px;">
          <button class="modal-close-btn" id="btn-close-auth">${renderIcon('X', 20)}</button>

          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-family: var(--font-heading); font-size: 24px; font-weight: 700; color: var(--navy);">SakuPas</span>
            <span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--terracotta);"></span>
          </div>

          <p class="modal-desc" style="margin-bottom: 20px;">
            ${activeTab === 'login' ? 'Masuk untuk mengakses data finansial mahasiswa.' : 'Daftar akun baru untuk mulai mencatat keuangan.'}
          </p>

          <div class="toggle-group" style="margin-bottom: 20px;">
            <button type="button" class="toggle-btn ${activeTab === 'login' ? 'active expense' : ''}" id="tab-login">Masuk</button>
            <button type="button" class="toggle-btn ${activeTab === 'register' ? 'active expense' : ''}" id="tab-register">Daftar</button>
          </div>

          <form id="auth-form">
            ${activeTab === 'register' ? `
              <div class="form-group">
                <label class="form-label">Nama Lengkap</label>
                <input type="text" id="auth-name" class="input-control" placeholder="Rian Pratama" required>
              </div>
            ` : ''}

            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="auth-email" class="input-control" placeholder="rian@sakupas.id" value="${activeTab === 'login' ? 'rian@sakupas.id' : ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" id="auth-password" class="input-control" placeholder="••••••••" value="${activeTab === 'login' ? 'password123' : ''}" required>
            </div>

            ${activeTab === 'register' ? `
              <div class="form-group">
                <label class="form-label">Konfirmasi Password</label>
                <input type="password" id="auth-password-conf" class="input-control" placeholder="••••••••" required>
              </div>
            ` : ''}

            <button type="submit" class="btn btn-primary" id="btn-submit-auth" style="width: 100%; margin-top: 10px; padding: 12px;">
              ${activeTab === 'login' ? 'Masuk ke Akun' : 'Daftar Sekarang'}
            </button>
          </form>

          ${activeTab === 'login' ? `
            <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--divider); text-align: center;">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-demo-login" style="width: 100%;">
                Masuk Cepat: Akun Demo Mahasiswa (Rian Pratama)
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Tab clicks
    modalContainer.querySelector('#tab-login').addEventListener('click', () => {
      activeTab = 'login';
      renderForm();
    });

    modalContainer.querySelector('#tab-register').addEventListener('click', () => {
      activeTab = 'register';
      renderForm();
    });

    modalContainer.querySelector('#btn-close-auth').addEventListener('click', () => {
      modalContainer.innerHTML = '';
    });

    const demoBtn = modalContainer.querySelector('#btn-demo-login');
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
          demoBtn.textContent = 'Masuk Cepat: Akun Demo Mahasiswa';
        }
      });
    }

    const form = modalContainer.querySelector('#auth-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = modalContainer.querySelector('#btn-submit-auth');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Memproses...';

      const email = modalContainer.querySelector('#auth-email').value.trim();
      const password = modalContainer.querySelector('#auth-password').value;

      try {
        if (activeTab === 'login') {
          await api.login(email, password);
          showToast('Login berhasil.');
        } else {
          const name = modalContainer.querySelector('#auth-name').value.trim();
          const conf = modalContainer.querySelector('#auth-password-conf').value;
          await api.register(name, email, password, conf);
          showToast('Registrasi berhasil.');
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

  renderForm();
}
