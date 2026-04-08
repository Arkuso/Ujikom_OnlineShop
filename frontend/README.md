# 🛒 OnlineShop — Proyek Ujikom Sertifikasi Kompetensi

Website E-Commerce full-stack dengan integrasi **Xendit Payment Gateway**.

- **Frontend**: Next.js 15 + TypeScript
- **Backend**: ASP.NET Core 8 + Entity Framework + SQL Server
- **Payment**: Xendit Invoice API + Webhook
- **Auth**: JWT Bearer Token + BCrypt

---

## 📋 Daftar Isi

1. [Fitur Utama](#fitur-utama)
2. [Prasyarat](#prasyarat)
3. [Setup Backend](#setup-backend)
4. [Setup Frontend](#setup-frontend)
5. [Setup Xendit & Webhook](#setup-xendit--webhook)
6. [Cara Mendapatkan Akses Admin](#cara-mendapatkan-akses-admin)
7. [Dokumentasi Lengkap](#dokumentasi-lengkap)

---

## 🌟 Fitur Utama

| Fitur | Keterangan |
|---|---|
| **Register & Login** | Autentikasi JWT, password BCrypt, role Admin/Customer |
| **Katalog Produk** | Daftar, search, filter kategori, dan halaman detail produk |
| **Keranjang Belanja** | Tambah, edit qty, hapus item — tersinkron dengan database |
| **Checkout & Pembayaran** | Validasi stok real-time, integrasi Invoice Xendit otomatis |
| **Riwayat Pesanan** | Customer melihat status & link pembayaran di halaman profil |
| **Admin Dashboard** | Ringkasan stok kritis, manajemen produk, kategori, dan status pesanan |
| **Webhook Xendit** | Update status pembayaran otomatis saat customer selesai bayar |

---

## 💻 Prasyarat

Pastikan sudah terinstall:
- **Node.js** v18 atau lebih baru → [nodejs.org](https://nodejs.org)
- **.NET 8 SDK** → [dotnet.microsoft.com](https://dotnet.microsoft.com/download)
- **SQL Server** (Express cukup untuk lokal) → [microsoft.com/sql-server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- **ngrok** (opsional, untuk uji Webhook di localhost) → [ngrok.com](https://ngrok.com/download)
- Akun **Xendit** → [dashboard.xendit.co](https://dashboard.xendit.co)

---

## 🔧 Setup Backend

```bash
cd Backend
```

**1. Konfigurasi `appsettings.json`**

Buka file `Backend/appsettings.json` dan isi semua nilai berikut:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=NAMA_LAPTOP\\SQLEXPRESS;Database=OnlineShopDb;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "AppSettings": {
    "Token": "KUNCI_RAHASIA_MINIMAL_64_KARAKTER_GANTI_INI_SEKARANG"
  },
  "InternalSecurity": {
    "PromoteAdminKey": "KUNCI_INTERNAL_RAHASIA_UNTUK_BUAT_ADMIN"
  },
  "Xendit": {
    "SecretKey": "xnd_development_XXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "CallbackToken": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "WebhookUrl": "https://URL_NGROK_ANDA/api/webhooks/xendit"
  },
  "FrontendBaseUrl": "http://localhost:3000"
}
```

> Lihat `.env.example` di root project untuk panduan lengkap setiap variabel.

**2. Migrasi Database**

```bash
dotnet ef database update
```

**3. Jalankan Backend**

```bash
dotnet run
```

✅ Backend berjalan di: `http://localhost:5055`
✅ Swagger API Docs: `http://localhost:5055/swagger`

---

## 🖥️ Setup Frontend

```bash
cd frontend

# Install semua dependensi
npm install

# Buat file konfigurasi environment
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:5055" > .env.local

# Jalankan development server
npm run dev
```

✅ Frontend berjalan di: `http://localhost:3000`

---

## 💳 Setup Xendit & Webhook

**1. Dapatkan Secret Key:**
- Login ke [dashboard.xendit.co](https://dashboard.xendit.co)
- Buka **Settings → Developers → API Keys**
- Copy **Secret Key** dan masukkan ke `appsettings.json`

**2. Setup Webhook dengan ngrok:**
```bash
# Di terminal baru (biarkan backend tetap berjalan)
ngrok http 5055
```

ngrok akan memberikan URL publik, contoh: `https://abc123.ngrok-free.app`

**3. Daftarkan Webhook ke Xendit:**
- Buka **Xendit Dashboard → Settings → Callbacks**
- Pilih event: **Invoice Paid**
- Masukkan URL: `https://abc123.ngrok-free.app/api/webhooks/xendit`
- Copy **Callback Token** dan masukkan ke `appsettings.json`

---

## 👑 Cara Mendapatkan Akses Admin

Semua akun baru adalah **Customer** secara default. Untuk promosi ke Admin:

Gunakan **Postman** atau **Insomnia**:

```
Method : POST
URL    : http://localhost:5055/api/auth/internal/promote-admin
Headers:
  Content-Type  : application/json
  X-Internal-Key: <nilai InternalSecurity.PromoteAdminKey dari appsettings.json>
Body (JSON):
  { "email": "email_target@domain.com" }
```

---

## 📚 Dokumentasi Lengkap

| Dokumen | Lokasi |
|---|---|
| **User Guide** (cara login, belanja, Admin panel) | [`docs/user-guide.md`](./docs/user-guide.md) |
| **Technical Documentation** (ERD, Flow Sistem, API) | [`docs/technical-documentation.md`](./docs/technical-documentation.md) |
| **Environment Variables** | [`.env.example`](./.env.example) |

---

## 📁 Struktur Proyek

```
OnlineShop/
├── Backend/              # ASP.NET Core 8 API
│   ├── Controllers/      # HTTP Endpoints
│   ├── Services/         # Business Logic
│   ├── Models/           # Database Entities
│   ├── Data/             # EF Core DbContext & Seeder
│   ├── Helpers/          # JWT, BCrypt, AutoMapper
│   ├── Middleware/       # Global Error Handler
│   └── Program.cs        # App Configuration
│
├── frontend/             # Next.js 15 App
│   ├── app/              # Pages (App Router)
│   │   ├── admin/        # Admin Panel
│   │   ├── products/     # Katalog & Detail Produk
│   │   ├── cart/         # Keranjang Belanja
│   │   ├── checkout/     # Halaman Checkout
│   │   └── profile/      # Profil & Riwayat Pesanan
│   ├── components/       # Shared UI Components
│   ├── services/         # API Service Layer
│   └── lib/              # State Management (Zustand)
│
├── docs/
│   ├── user-guide.md           # Panduan Pengguna
│   └── technical-documentation.md  # Dokumentasi Teknis
│
└── .env.example          # Template Variabel Environment
```
