# Technical Documentation — OnlineShop

Dokumentasi teknis lengkap proyek E-Commerce OnlineShop untuk keperluan Uji Kompetensi (Ujikom).

---

## 1. Arsitektur Sistem

```
┌─────────────────┐        HTTP/REST API        ┌──────────────────────┐
│  Frontend       │ ◄─────────────────────────► │  Backend             │
│  Next.js 15     │                             │  ASP.NET Core 8      │
│  TypeScript     │                             │  Entity Framework    │
│  (Port 3000)    │                             │  (Port 5055)         │
└─────────────────┘                             └──────────┬───────────┘
                                                           │
                                              ┌────────────▼────────────┐
                                              │  SQL Server Database    │
                                              │  (OnlineShopDb)         │
                                              └─────────────────────────┘
                                                           │
                                              ┌────────────▼────────────┐
                                              │  Xendit Payment Gateway │
                                              │  (Invoice / Webhook)    │
                                              └─────────────────────────┘
```

- **Frontend**: Next.js (App Router) + TypeScript + Vanilla CSS
- **Backend**: ASP.NET Core 8 Web API + EF Core + SQL Server
- **Auth**: JWT Bearer Token (BCrypt password hashing)
- **Payment**: Xendit Invoice API + Webhook

---

## 2. ERD / Struktur Database

### Entity Relationship Diagram (ERD)

```
┌──────────────────────────────────┐
│              User                │
├──────────────────────────────────┤
│ Id            INT (PK)           │
│ Name          NVARCHAR (wajib)   │
│ Email         NVARCHAR (unique)  │
│ PasswordHash  NVARCHAR           │
│ Role          NVARCHAR           │  ← "Admin" atau "Customer"
│ ProfileImage  NVARCHAR (nullable)│
└──────────────┬───────────────────┘
               │
       ┌───────┴────────┐
       │ 1:N            │ 1:N
       ▼                ▼
┌─────────────┐   ┌────────────────────────────────────┐
│    Cart     │   │              Order                 │
├─────────────┤   ├────────────────────────────────────┤
│ Id   (PK)   │   │ Id          INT (PK)               │
│ UserId (FK) │   │ UserId      INT (FK → User.Id)     │
│ ProductId   │   │ OrderDate   DATETIME               │
│   (FK)      │   │ TotalAmount DECIMAL(18,2)          │
│ Quantity    │   │ Status      NVARCHAR                │
└─────────────┘   │             (Pending/Processing/   │
                  │              Shipped/Completed/     │
                  │              Cancelled/Paid)        │
                  └──────────────┬─────────────────────┘
                                 │
                     ┌───────────┴────────────┐
                     │ 1:1                    │ 1:N
                     ▼                        ▼
          ┌──────────────────┐    ┌───────────────────────────┐
          │     Payment      │    │       OrderProduct        │
          ├──────────────────┤    ├───────────────────────────┤
          │ Id (PK)          │    │ Id          INT (PK)      │
          │ OrderId (FK)     │    │ OrderId     INT (FK)      │
          │ XenditInvoiceId  │    │ ProductId   INT (FK)      │
          │ PaymentUrl       │    │ Quantity    INT           │
          │ Status           │    │ Price       DECIMAL(18,2) │
          │  (PENDING/PAID/  │    └───────────┬───────────────┘
          │   EXPIRED/FAILED)│               │ N:1
          │ Amount           │               ▼
          │ CreatedAt        │    ┌───────────────────────────┐
          │ UpdatedAt        │    │         Product           │
          └──────────────────┘    ├───────────────────────────┤
                                  │ Id          INT (PK)      │
                                  │ CategoryId  INT (FK)      │
                                  │ Name        NVARCHAR      │
                                  │ Description NVARCHAR      │
                                  │ Price       DECIMAL(18,2) │
                                  │ Stock       INT           │
                                  │ ImageUrl    NVARCHAR      │
                                  │ ImageUrl2   NVARCHAR (?)  │
                                  │ ImageUrl3   NVARCHAR (?)  │
                                  │ ImageUrl4   NVARCHAR (?)  │
                                  │ Specifications NVARCHAR(?)│  ← JSON string
                                  └───────────┬───────────────┘
                                              │ N:1
                                              ▼
                                  ┌───────────────────────────┐
                                  │         Category          │
                                  ├───────────────────────────┤
                                  │ Id          INT (PK)      │
                                  │ Name        NVARCHAR      │
                                  │ Description NVARCHAR      │
                                  └───────────────────────────┘
```

### Keterangan Tabel

| Tabel | Peran |
|---|---|
| `Users` | Data pengguna (Customer & Admin), password disimpan sebagai BCrypt hash |
| `Categories` | Kategori produk (contoh: Headphones, Smartphones, Laptop) |
| `Products` | Data produk dengan stok, harga, gambar, dan spesifikasi |
| `Carts` | Item di keranjang belanja per user (bersifat sementara, dihapus setelah checkout) |
| `Orders` | Transaksi pembelian yang sudah di-checkout |
| `OrderProducts` | Detail produk dalam setiap order (nama tabel: `order_items` secara konseptual) |
| `Payments` | Data pembayaran Xendit yang terhubung 1-ke-1 dengan Order |

### Aturan Integritas Data (Foreign Key)
- **Produk yang sudah pernah dipesan tidak bisa dihapus** (`DeleteBehavior.Restrict` pada relasi `OrderProduct → Product`). Ini mencegah rusaknya riwayat pesanan customer.

---

## 3. Modul Backend

```
Backend/
├── Controllers/          # HTTP Endpoint (Auth, Product, Category, Cart, Order, Webhook)
├── Services/             # Business Logic
│   └── Interfaces/       # Kontrak interface untuk setiap service
├── DTOs/                 # Data Transfer Objects (Request & Response)
├── Models/               # Entity / Model database
├── Data/
│   ├── AppDbContext.cs   # EF Core DbContext
│   └── DbSeeder.cs       # Seed data awal
├── Helpers/
│   ├── JwtHelper.cs      # Generate & validasi JWT Token
│   ├── PasswordHasher.cs # BCrypt hashing
│   ├── MappingProfile.cs # AutoMapper mapping
│   └── OrderStatuses.cs  # Konstanta status order
├── Middleware/
│   └── ErrorHandlerMiddleware.cs  # Global error handling
└── Program.cs            # Konfigurasi DI, Middleware, Auth
```

---

## 4. Flow Sistem — Checkout & Payment (Xendit)

### 4.1 Alur Checkout Lengkap

```
CUSTOMER                    FRONTEND                   BACKEND                  XENDIT
   │                            │                          │                       │
   │── Klik "Complete Order" ──►│                          │                       │
   │                            │── POST /api/order/checkout ──────────────────►  │
   │                            │                          │ Validasi:             │
   │                            │                          │  ✓ JWT valid          │
   │                            │                          │  ✓ Cart tidak kosong  │
   │                            │                          │  ✓ Stok cukup         │
   │                            │                          │                       │
   │                            │                          │── POST /v2/invoices ──►│
   │                            │                          │                       │ Buat Invoice
   │                            │                          │◄── invoice_url ───────│
   │                            │                          │                       │
   │                            │                          │ Simpan ke DB:         │
   │                            │                          │  • Order (Pending)    │
   │                            │                          │  • OrderProducts      │
   │                            │                          │  • Payment (PENDING)  │
   │                            │                          │  • Kurangi stok       │
   │                            │                          │  • Kosongkan Cart     │
   │                            │◄── { paymentUrl, orderId } ──────────────────── │
   │◄── Tampil tombol "Bayar" ──│                          │                       │
   │                            │                          │                       │
   │── Klik "Bayar Sekarang" ──►│ (Redirect ke Xendit) ──────────────────────────►│
   │                            │                          │                       │ Customer bayar
   │                            │                          │                       │ (VA/QRIS/dll)
```

### 4.2 Alur Update Status Pembayaran (Webhook)

```
XENDIT                    BACKEND (/api/webhooks/xendit)           DATABASE
   │                                    │                              │
   │ (Setelah customer bayar)           │                              │
   │── POST webhook + x-callback-token ►│                              │
   │                                    │ Verifikasi Token             │
   │                                    │  ✓ Header token cocok        │
   │                                    │  ✗ Reject jika tidak cocok   │
   │                                    │                              │
   │                                    │ Parse payload:               │
   │                                    │  • external_id = "ORDER-{id}-{guid}"
   │                                    │  • status = "PAID" / "SETTLED"
   │                                    │  • id = XenditInvoiceId      │
   │                                    │                              │
   │                                    │── Cek Idempotency ──────────►│
   │                                    │  (Jika sudah PAID → skip)    │
   │                                    │                              │
   │                                    │── Update Payment ───────────►│
   │                                    │  Status: PENDING → PAID       │
   │                                    │                              │
   │                                    │── Update Order ─────────────►│
   │                                    │  Status: "Pending" → "Paid"  │
   │                                    │                              │
   │◄── 200 OK ─────────────────────── │                              │
```

### 4.3 Diagram Perubahan Status Order

```
         ┌──────────────────────────────────────────────────┐
         │                ALUR STATUS ORDER                 │
         └──────────────────────────────────────────────────┘

[Checkout Berhasil]
       ↓
  ┌─────────┐
  │ PENDING │ ← Order dibuat, Invoice Xendit dibuat, menunggu pembayaran
  └────┬────┘
       │ (Otomatis via Webhook Xendit)
       ↓
  ┌──────┐
  │ PAID │ ← Customer selesai bayar, Xendit konfirmasi via Webhook
  └──────┘
       │ (Admin ubah manual)
       ↓
  ┌────────────┐
  │ PROCESSING │ ← Pesanan sedang dikemas
  └─────┬──────┘
        │ (Admin ubah manual)
        ↓
  ┌─────────┐
  │ SHIPPED │ ← Pesanan dalam pengiriman
  └─────┬───┘
        │ (Admin ubah manual)
        ↓
  ┌───────────┐
  │ COMPLETED │ ← Pesanan diterima customer, selesai
  └───────────┘

  Dari status mana pun → CANCELLED (Admin batalkan)
```

---

## 5. Konfigurasi Xendit & Webhook

### 5.1 Mendapatkan API Key Xendit
1. Buat akun di [https://dashboard.xendit.co](https://dashboard.xendit.co)
2. Masuk ke menu **Settings → Developers → API Keys**
3. Buat atau copy **Secret Key** (format: `xnd_development_...` untuk mode test)
4. Masukkan Secret Key ke `appsettings.json` atau variabel environment:
   ```json
   "Xendit": {
     "SecretKey": "xnd_development_XXXXXXXXXXXXXXXXXXXXX"
   }
   ```

### 5.2 Mendapatkan Callback Token
1. Di Xendit Dashboard, masuk ke **Settings → Callbacks**
2. Copy nilai **Callback Token** yang tersedia
3. Masukkan ke konfigurasi backend:
   ```json
   "Xendit": {
     "CallbackToken": "XXXXXXXXXXXXXXXXXXXXXXXX"
   }
   ```

### 5.3 Setup Webhook URL (Localhost dengan ngrok)
Karena Xendit membutuhkan URL publik, gunakan **ngrok** untuk expose localhost:

```bash
# Install ngrok (jika belum ada)
# Download dari https://ngrok.com/download

# Jalankan ngrok untuk expose port backend
ngrok http 5055
```

ngrok akan memberikan URL publik seperti:
`https://abcd-1234.ngrok-free.app`

Daftarkan URL Webhook ke Xendit:
- **Xendit Dashboard → Settings → Callbacks**
- Pilih event: **Invoice Paid**
- Masukkan URL: `https://abcd-1234.ngrok-free.app/api/webhooks/xendit`
- Simpan konfigurasi

Update `appsettings.json`:
```json
"Xendit": {
  "WebhookUrl": "https://abcd-1234.ngrok-free.app/api/webhooks/xendit"
}
```

---

## 6. API Endpoint Utama

| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register user baru |
| `POST` | `/api/auth/login` | ❌ | Login, mendapat JWT token |
| `GET` | `/api/product` | ❌ | Ambil semua produk |
| `GET` | `/api/product/{id}` | ❌ | Detail produk |
| `POST` | `/api/product` | Admin | Buat produk baru |
| `PUT` | `/api/product/{id}` | Admin | Update produk |
| `DELETE` | `/api/product/{id}` | Admin | Hapus produk |
| `GET` | `/api/category` | ❌ | Ambil semua kategori |
| `POST` | `/api/category` | Admin | Buat kategori baru |
| `PUT` | `/api/category/{id}` | Admin | Update kategori |
| `DELETE` | `/api/category/{id}` | Admin | Hapus kategori |
| `GET` | `/api/cart` | Customer | Ambil isi cart |
| `POST` | `/api/cart` | Customer | Tambah item ke cart |
| `DELETE` | `/api/cart/{id}` | Customer | Hapus item dari cart |
| `GET` | `/api/order` | Customer | Riwayat pesanan sendiri |
| `POST` | `/api/order/checkout` | Customer | Buat pesanan baru + Xendit Invoice |
| `GET` | `/api/order/admin` | Admin | Semua pesanan |
| `PUT` | `/api/order/{id}/status` | Admin | Update status pesanan |
| `POST` | `/api/webhooks/xendit` | Xendit | Terima notifikasi pembayaran |

---

## 7. Keamanan Sistem

| Fitur | Implementasi |
|---|---|
| **Password Hashing** | BCrypt (`BCrypt.Net.BCrypt.HashPassword`) — aman terhadap brute force |
| **JWT Authentication** | Token signed dengan secret key, validasi setiap request |
| **Role Authorization** | `[Authorize(Roles = "Admin")]` pada endpoint sensitif |
| **Frontend Route Guard** | `admin/layout.tsx` decode JWT, redirect jika bukan Admin |
| **Webhook Verification** | `x-callback-token` header dicocokkan sebelum proses data |
| **Webhook Idempotency** | Jika status sudah `PAID`, webhook duplikat diabaikan |
| **File Upload Validation** | Hanya ekstensi `.jpg`, `.jpeg`, `.png`, `.webp` yang diterima + validasi MIME type |
| **FK Delete Restriction** | Produk yang sudah dipesan tidak bisa dihapus (`DeleteBehavior.Restrict`) |
| **Global Error Handler** | `ErrorHandlerMiddleware.cs` menangkap semua exception, response format konsisten |

---

## 8. Cara Setup & Menjalankan Proyek

### Prasyarat
- Node.js v18+
- .NET 8 SDK
- SQL Server (Express atau penuh)
- Akun Xendit (untuk fitur pembayaran)
- ngrok (untuk webhook di localhost)

### Langkah 1 — Clone & Konfigurasi
```bash
# Clone repository
git clone <URL_REPOSITORY>
cd OnlineShop
```

### Langkah 2 — Konfigurasi Backend
```bash
cd Backend
```

Edit file `appsettings.json` dan isi semua nilai:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=NAMA_SERVER\\SQLEXPRESS;Database=OnlineShopDb;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "AppSettings": {
    "Token": "KUNCI_RAHASIA_MINIMAL_64_KARAKTER"
  },
  "Xendit": {
    "SecretKey": "xnd_development_XXXXXXXXXXXXXXXXXXXXXXXX",
    "CallbackToken": "XXXXXXXXXXXXXXXXXXXXXXXX",
    "WebhookUrl": "https://URL_NGROK_ANDA/api/webhooks/xendit"
  },
  "FrontendBaseUrl": "http://localhost:3000"
}
```

### Langkah 3 — Migrasi & Jalankan Backend
```bash
# Migrasi database (buat semua tabel)
dotnet ef database update

# Jalankan backend
dotnet run
```

Backend berjalan di: `http://localhost:5055`
Swagger UI tersedia di: `http://localhost:5055/swagger`

### Langkah 4 — Konfigurasi & Jalankan Frontend
```bash
cd ../frontend

# Install dependensi
npm install

# Buat file .env.local
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:5055" > .env.local

# Jalankan frontend
npm run dev
```

Frontend berjalan di: `http://localhost:3000`

### Langkah 5 — Setup Webhook (Opsional, untuk uji pembayaran)
```bash
# Di terminal terpisah, expose port backend
ngrok http 5055
```

Daftarkan URL ngrok ke dashboard Xendit (lihat bagian 5.3).

---

## 9. Troubleshooting

| Masalah | Solusi |
|---|---|
| `Cannot connect to server` | Pastikan backend berjalan (`dotnet run`) dan `NEXT_PUBLIC_API_BASE_URL` sudah benar |
| `Database connection failed` | Periksa connection string di `appsettings.json`, pastikan SQL Server berjalan |
| `Invalid token` | JWT token kedaluwarsa, minta customer login ulang |
| `Xendit invoice not created` | Pastikan `Xendit:SecretKey` sudah diisi di `appsettings.json` |
| `Webhook not received` | Pastikan ngrok berjalan dan URL sudah didaftarkan ke Xendit Dashboard |
| `Cannot upload file` | Pastikan file gambar berekstensi `.jpg`, `.jpeg`, `.png`, atau `.webp` |
