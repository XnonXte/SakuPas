# SakuPas — Personal Financial Management for Indonesian University Students

> **Full-Stack Implementation: Vanilla HTML5/CSS3/JS × Laravel 13 REST API × Eloquent ORM × SQLite**

**SakuPas** adalah sistem manajemen keuangan pribadi terintegrasi berbasis web yang dirancang khusus untuk mahasiswa di Indonesia. Berfokus pada pengendalian finansial yang sehat dan bertanggung jawab (*no-shame financial control*), SakuPas kini telah ditransformasi menjadi aplikasi full-stack nyata berbasis arsitektur **Vanilla Frontend + Laravel API + SQLite Relational Database**. Seluruh data keuangan, transaksi, kewajiban PayLater, alokasi budget, dan pengaturan Mode Hemat diproses secara riil oleh backend dan tersimpan secara persisten di database SQLite.

---

## 1. Arsitektur Sistem

```text
SakuPas/
│
├── frontend/                     # Pure Vanilla Frontend (No Frameworks)
│   ├── index.html                # Struktur semantik HTML5
│   ├── css/
│   │   └── style.css             # Desain editorial minimalis CSS3 murni
│   ├── js/
│   │   ├── api.js                # Klien API terpusat (Native Fetch API)
│   │   ├── app.js                # Root orchestrator & navigasi
│   │   ├── auth.js               # Manajemen otentikasi pengguna
│   │   ├── dashboard.js          # Layar Dashboard & SVG line chart
│   │   ├── transactions.js       # Layar Transaksi & SVG donut chart
│   │   ├── mode-hemat.js         # Layar Mode Hemat & penguncian mandiri
│   │   └── utils.js              # Pemformat Rupiah, tanggal ID, SVG icons
│   └── assets/
│       └── fonts/                # Aset font Univers & Shandon Slab
│
└── backend/                      # Laravel 13 Application
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/Api/V1/ # REST API Controllers
    │   │   └── Requests/         # Validasi Form Request
    │   ├── Models/               # Eloquent Models & Relasi
    │   └── Services/             # Logika bisnis & kalkulasi finansial
    ├── database/
    │   ├── migrations/           # Skema tabel relasional
    │   ├── seeders/              # Data seeder mahasiswa realistis
    │   └── database.sqlite       # Database lokal persisten
    ├── routes/
    │   ├── api.php               # Endpoint REST API (/api/v1/...)
    │   └── web.php               # Penyajian frontend
    └── tests/
        └── Feature/              # 28 Automated Feature Tests
```

---

## 2. Prasyarat Sistem

- **PHP:** Versi 8.2 atau lebih baru (Diuji pada PHP 8.5)
- **Ekstensi PHP:** `pdo_sqlite`, `mbstring`, `openssl`, `curl`, `json`
- **Composer:** Versi 2.x
- **Browser:** Browser modern apa pun (Chrome, Edge, Firefox, Safari)

---

## 3. Instalasi & Cara Menjalankan

### Langkah 1: Masuk ke folder backend dan instal dependensi
```bash
cd backend
composer install
```

### Langkah 2: Konfigurasi Environment & Key Aplikasi
File `.env` otomatis menggunakan koneksi SQLite lokal:
```bash
cp .env.example .env
php artisan key:generate
```

### Langkah 3: Jalankan Migrasi & Seeder Database
Perintah ini akan membuat seluruh tabel di `database/database.sqlite` dan mengisi data awal simulasi mahasiswa:
```bash
php artisan migrate:fresh --seed
```

### Langkah 4: Jalankan Server Aplikasi
```bash
php artisan serve
```

Server akan aktif di `http://127.0.0.1:8000`.

### Langkah 5: Buka Aplikasi di Browser
Buka tautan berikut di peramban Anda:
👉 **[http://localhost:8000](http://localhost:8000)**

*(Frontend langsung tersaji secara mulus melalui Laravel, atau Anda dapat membuka `frontend/index.html` menggunakan Live Server / web server mandiri).*

---

## 4. Akun Default untuk Pengembangan (Development Account)

Aplikasi telah dilengkapi akun mahasiswa terverifikasi melalui database seeder:

| Parameter | Detail Akun Seeder |
|---|---|
| **Nama Pengguna** | Rian Pratama |
| **Email** | `rian@sakupas.id` |
| **Password** | `password123` |
| **Status Mahasiswa** | S1 Fasilkom UI |
| **Rekening Awal** | • BCA: Rp2.100.000<br>• GoPay: Rp250.000<br>• Tunai: Rp150.000<br>**(Total Saldo: Rp2.500.000)** |
| **Kewajiban PayLater** | • Atome Finance: Rp150.000 (Cicilan Sepatu Kuliah)<br>• TikTok Shop PayLater: Rp300.000 (Cicilan Ransel & Hoodie)<br>**(Total: Rp450.000)** |
| **Safe-to-Spend Awal** | Rp850.000 (Kondisi Aman / 72% dari budget) |

---

## 5. Skema Database Relasional

Database SQLite berlokasi di `backend/database/database.sqlite`.

### Entitas Utama:
1. **`users`**: Informasi akun pengguna (`id`, `name`, `email`, `password`, `timestamps`).
2. **`accounts`**: Rekening kas dan dompet digital (`id`, `user_id`, `name`, `account_type`, `balance`, `description`). Saldo disimpan sebagai integer Rupiah.
3. **`categories`**: Kategori transaksi sistem dan kustom (`id`, `user_id`, `name`, `slug`, `type`, `sublabel`, `icon`, `color`, `is_system`).
4. **`transactions`**: Catatan riil pemasukan dan pengeluaran (`id`, `user_id`, `account_id`, `category_id`, `type`, `amount`, `description`, `transaction_date`, `payment_method`, `notes`).
5. **`pay_later_bills`**: Kewajiban PayLater (`id`, `user_id`, `provider_name`, `description`, `total_amount`, `paid_amount`, `due_date`, `status`, `installment_info`).
6. **`pay_later_repayments`**: Riwayat angsuran/pelunasan PayLater (`id`, `pay_later_bill_id`, `user_id`, `account_id`, `amount`, `repayment_date`, `notes`).
7. **`budgets`**: Anggaran bulanan per kategori (`id`, `user_id`, `category_id`, `amount`, `month`, `year`).
8. **`self_lock_settings`**: Pengaturan Penguncian Mandiri Mode Hemat (`id`, `user_id`, `is_active`, `activated_at`, `lifestyle_budget_cap`, `hide_shopping_recommendations`).

---

## 6. Dokumentasi API Endpoints (`/api/v1`)

Seluruh respon API mengikuti format JSON standar:

```json
{
  "success": true,
  "message": "Transaksi berhasil disimpan.",
  "data": { ... }
}
```

### Otentikasi
| Endpoint | Method | Keterangan |
|---|---|---|
| `/api/v1/register` | POST | Pendaftaran pengguna baru |
| `/api/v1/login` | POST | Masuk & penerbitan Bearer Token Sanctum |
| `/api/v1/logout` | POST | Keluar & pencabutan token (Protected) |
| `/api/v1/user` | GET | Mendapatkan profil pengguna aktif |
| `/api/v1/user` | PUT | Memperbarui profil pengguna |

### Dashboard
| Endpoint | Method | Keterangan |
|---|---|---|
| `/api/v1/dashboard` | GET | Ringkasan finansial, Safe-to-Spend, dan tagihan terdekat |
| `/api/v1/dashboard/cash-flow` | GET | Data deret waktu arus kas bulanan untuk SVG line chart |
| `/api/v1/dashboard/expense-distribution` | GET | Distribusi pengeluaran per kategori untuk SVG donut chart |
| `/api/v1/dashboard/safe-to-spend` | GET | Kalkulasi spesifik kapasitas Safe-to-Spend |

### Transaksi
| Endpoint | Method | Keterangan |
|---|---|---|
| `/api/v1/transactions` | GET | Daftar transaksi dengan filter bulan, kategori, tipe, pencarian, & paginasi |
| `/api/v1/transactions` | POST | Mencatat transaksi baru (otomatis mengubah saldo rekening secara atomik) |
| `/api/v1/transactions/{id}` | GET | Menampilkan detail transaksi |
| `/api/v1/transactions/{id}` | PUT | Memperbarui transaksi (menyesuaikan saldo rekening lama & baru) |
| `/api/v1/transactions/{id}` | DELETE | Menghapus transaksi (mengembalikan saldo rekening) |

### PayLater
| Endpoint | Method | Keterangan |
|---|---|---|
| `/api/v1/paylater` | GET | Daftar kewajiban PayLater dengan status jatuh tempo otomatis |
| `/api/v1/paylater` | POST | Mendaftarkan tagihan PayLater baru |
| `/api/v1/paylater/{id}` | PUT | Mengubah detail tagihan |
| `/api/v1/paylater/{id}` | DELETE | Menghapus tagihan PayLater |
| `/api/v1/paylater/{id}/toggle-paid` | POST | Menandai tagihan telah lunas / belum lunas |
| `/api/v1/paylater/{id}/repayments` | POST | Mencatat pembayaran sebagian/angsuran dengan potong saldo |

### Budgets & Mode Hemat
| Endpoint | Method | Keterangan |
|---|---|---|
| `/api/v1/budgets` | GET | Alokasi anggaran bulanan dengan kalkulasi real pengeluaran |
| `/api/v1/budgets` | POST | Menyimpan / menyesuaikan alokasi budget kategori |
| `/api/v1/mode-hemat` | GET | Status Penguncian Mandiri dan restriksi aktif |
| `/api/v1/mode-hemat/activate` | POST | Mengaktifkan Penguncian Mandiri |
| `/api/v1/mode-hemat/deactivate` | POST | Menonaktifkan Penguncian Mandiri |

---

## 7. Pengujian Otomatis (Automated Testing)

Aplikasi memiliki **28 Feature Tests** lengkap dengan **100 Assertions** yang menguji seluruh endpoint, validasi, integritas saldo, dan isolasi data pengguna:

Untuk menjalankan pengujian:
```bash
cd backend
php artisan test
```

Hasil uji:
```text
   PASS  Tests\Unit\ExampleTest
   PASS  Tests\Feature\AuthTest (6 tests)
   PASS  Tests\Feature\BudgetTest (3 tests)
   PASS  Tests\Feature\DashboardTest (2 tests)
   PASS  Tests\Feature\ModeHematTest (2 tests)
   PASS  Tests\Feature\PayLaterTest (4 tests)
   PASS  Tests\Feature\TransactionTest (6 tests)
   PASS  Tests\Feature\WebFrontendTest (3 tests)
   PASS  Tests\Feature\ExampleTest

  Tests:    28 passed (100 assertions)
  Duration: 1.3s
```
