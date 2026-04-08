# User Guide — OnlineShop

Panduan lengkap penggunaan aplikasi E-Commerce OnlineShop untuk peran **Customer** dan **Admin**.

---

## 📸 Screenshot Halaman Utama

| Halaman | Tampilan |
|---|---|
| **Beranda (Home)** | ![Beranda](../docs/screenshots/home.png) |
| **Katalog Produk** | ![Katalog](../docs/screenshots/products.png) |
| **Keranjang Belanja** | ![Cart](../docs/screenshots/cart.png) |
| **Halaman Checkout** | ![Checkout](../docs/screenshots/checkout.png) |
| **Admin Dashboard** | ![Admin](../docs/screenshots/admin-dashboard.png) |
| **Admin — Kelola Produk** | ![Admin Produk](../docs/screenshots/admin-products.png) |
| **Admin — Kelola Pesanan** | ![Admin Orders](../docs/screenshots/admin-orders.png) |

> *Letakkan file screenshot di folder `docs/screenshots/` dengan nama sesuai tabel di atas.*

---

## 1. 🔐 Cara Login & Register

### Register Akun Baru (Customer)
1. Buka browser dan akses: `http://localhost:3000`
2. Klik tombol **"Register"** atau navigasi ke `http://localhost:3000/register`
3. Isi formulir registrasi:
   - **Name**: Nama lengkap Anda
   - **Email**: Alamat email valid (digunakan untuk login)
   - **Password**: Minimal 6 karakter
4. Klik tombol **"Create Account"**
5. Jika berhasil, Anda akan otomatis diarahkan ke halaman utama dan sudah dalam kondisi logged in sebagai **Customer**

### Login ke Akun yang Sudah Ada
1. Navigasi ke `http://localhost:3000/login`
2. Masukkan **Email** dan **Password** yang sudah terdaftar
3. Klik tombol **"Sign In"**
4. Jika berhasil:
   - **Customer** → diarahkan ke halaman utama (`/`)
   - **Admin** → dapat mengakses panel Admin di `/admin`

> **Catatan:** Semua akun baru secara default memiliki role **Customer**. Untuk mendapatkan akses Admin, lihat bagian [Cara Login sebagai Admin](#cara-login-sebagai-admin) di bawah.

### Cara Login sebagai Admin
Akun Admin tidak bisa mendaftar sendiri. Admin dibuat melalui proses promosi oleh Developer menggunakan endpoint internal.

**Akun Admin Default untuk Demo/Testing:**
```
Email   : admin@onlineshop.com
Password: (tanyakan kepada penguji / developer)
```

**Cara membuat Admin baru (Developer):**
Gunakan Postman atau tool sejenis:
- `POST http://localhost:5055/api/auth/internal/promote-admin`
- Header: `X-Internal-Key: <nilai dari InternalSecurity__PromoteAdminKey>`
- Body JSON: `{ "email": "email_target@domain.com" }`

---

## 2. 🛍️ Cara Belanja & Pembayaran (Customer)

### Langkah 1 — Jelajahi Produk
1. Dari halaman utama, klik menu **"Products"** atau navigasi ke `/products`
2. Gunakan **Search Bar** di navbar untuk mencari produk berdasarkan nama
3. Klik kartu produk untuk membuka **Halaman Detail Produk** yang menampilkan:
   - Foto produk (hingga 4 foto)
   - Deskripsi lengkap
   - Spesifikasi teknis
   - Harga dan stok yang tersedia

### Langkah 2 — Tambah ke Keranjang
1. Pada halaman detail produk, klik tombol **"Add to Bag"**
2. Ikon keranjang di navbar akan menunjukkan jumlah item
3. Navigasi ke `/cart` untuk melihat isi keranjang
4. Di halaman Cart, Anda bisa:
   - Menambah atau mengurangi **Quantity** setiap item
   - Menekan tombol **Hapus (×)** untuk menghapus item dari keranjang
   - Melihat **Subtotal** dan **Total Harga** secara real-time

> **Penting:** Anda harus **login** terlebih dahulu untuk menambah produk ke keranjang. Jika belum login, sistem akan mengarahkan ke halaman `/login`.

### Langkah 3 — Checkout
1. Dari halaman Cart, klik tombol **"Proceed to Checkout"**
2. Sistem otomatis memvalidasi:
   - Token login masih valid
   - Keranjang tidak kosong
   - Stok produk mencukupi (divalidasi di backend)
3. Pada halaman Checkout (`/checkout`), tinjau ulang ringkasan pesanan Anda

### Langkah 4 — Pembayaran via Xendit
1. Klik tombol **"Complete Order"** untuk membuat pesanan
2. Sistem backend akan:
   - Membuat record **Order** di database (status: `Pending`)
   - Mengurangi stok produk yang dipesan
   - Mengosongkan keranjang belanja
   - Membuat **Invoice** di Xendit secara otomatis
3. Anda akan mendapatkan **URL Pembayaran** yang diberikan oleh Xendit
4. Klik link/tombol **"Bayar Sekarang"** untuk menyelesaikan pembayaran di halaman Xendit
5. Pilih metode pembayaran yang tersedia (Virtual Account, QRIS, dll.)
6. Setelah pembayaran berhasil, Xendit akan mengirimkan notifikasi otomatis (Webhook) ke sistem kami
7. Status Order otomatis berubah dari `Pending` → `Paid`

### Langkah 5 — Lihat Riwayat Pesanan
1. Navigasi ke `/profile` atau klik ikon profil di navbar
2. Halaman profil menampilkan semua riwayat pesanan Anda dengan:
   - Nomor Order & tanggal pembuatan
   - Status pesanan terkini
   - Daftar produk yang dipesan
   - Total harga
   - Tombol **"Lanjutkan Pembayaran"** jika order belum dibayar

---

## 3. 👨‍💼 Cara Menggunakan Fitur Admin

> **Prasyarat:** Akun harus memiliki role **Admin**. Pastikan sudah login dengan akun Admin.

### Mengakses Panel Admin
- Navigasi ke `http://localhost:3000/admin`
- Jika bukan Admin, sistem otomatis redirect ke halaman login atau beranda

---

### 3.1 Dashboard Overview (`/admin`)

Dashboard menampilkan ringkasan status toko:

| Kartu Statistik | Keterangan |
|---|---|
| **Product Available** | Total jumlah produk yang terdaftar |
| **Critical Stock** | Produk dengan stok antara 1–9 unit (perlu restock segera) |
| **Depleted Stock** | Produk dengan stok = 0 (habis total) |

Bagian bawah dashboard menampilkan **daftar peringatan stok** (produk yang kritis atau habis) beserta nama kategori dan sisa stok agar Admin bisa bertindak cepat.

---

### 3.2 Manajemen Produk (`/admin/products`)

**Melihat Daftar Produk:**
1. Klik menu **"Products"** dari navbar Admin
2. Semua produk ditampilkan dalam tabel/daftar dengan info: nama, harga, stok, kategori

**Menambah Produk Baru (`/admin/products/add`):**
1. Klik tombol **"Add Asset"** atau navigasi ke `/admin/products/add`
2. Isi formulir:
   - **Nama Produk** *(wajib)*
   - **Kategori** — pilih dari daftar kategori yang ada *(wajib)*
   - **Harga** (dalam Rupiah) *(wajib)*
   - **Stok Awal** *(wajib)*
   - **Deskripsi** — keterangan produk
   - **Spesifikasi** — spesifikasi teknis (opsional)
   - **Upload Gambar** — dapat mengunggah hingga **4 foto** (format: `.jpg`, `.jpeg`, `.png`, `.webp`)
3. Klik tombol **"Save / Create Product"** untuk menyimpan
4. Produk langsung muncul di katalog

**Mengedit Produk:**
1. Dari daftar produk, klik produk yang ingin diedit
2. Navigasi otomatis ke `/admin/products/[id]`
3. Ubah data yang diperlukan (nama, harga, stok, gambar, dll.)
4. Klik **"Save Changes"** untuk menyimpan

**Menghapus Produk:**
1. Dari halaman detail produk Admin, klik tombol **"Delete"**
2. Konfirmasi penghapusan
3. **Catatan:** Produk yang sudah ada di riwayat pesanan Customer **tidak dapat dihapus** untuk menjaga integritas data

---

### 3.3 Manajemen Kategori (`/admin/categories`)

**Melihat Kategori:**
1. Klik menu **"Categories"** dari navbar Admin

**Menambah Kategori Baru:**
1. Isi field nama dan deskripsi kategori
2. Klik tombol **"Add Category"**

**Mengedit / Menghapus Kategori:**
- Setiap baris kategori memiliki tombol **Edit** dan **Delete**
- Kategori yang masih memiliki produk terdaftar disarankan tidak dihapus

---

### 3.4 Manajemen Pesanan (`/admin/orders`)

Halaman ini menampilkan **seluruh pesanan dari semua Customer**.

**Update Status Pesanan:**
1. Klik menu **"Orders"** dari navbar Admin
2. Setiap pesanan ditampilkan dengan info: Nomor Order, tanggal, User, total, dan status
3. Gunakan **dropdown status** pada setiap pesanan untuk mengubah statusnya:

| Status | Arti |
|---|---|
| **Pending** | Pesanan baru dibuat, menunggu pembayaran |
| **Processing** | Pesanan sedang diproses / dikemas |
| **Shipped** | Pesanan dalam pengiriman |
| **Completed** | Pesanan selesai diterima Customer |
| **Cancelled** | Pesanan dibatalkan |

> **Catatan:** Status `Pending` → `Paid` berubah **otomatis** saat Xendit mengirimkan Webhook konfirmasi pembayaran. Status lainnya diubah manual oleh Admin.

---

## 4. 📋 Status Order & Alur Pembayaran

```
[Customer Checkout]
       ↓
   PENDING  ←─── Order baru dibuat, stok dikurangi, Invoice Xendit dibuat
       ↓
  (Customer bayar di halaman Xendit)
       ↓
    PAID  ←─── Xendit kirim Webhook → sistem update otomatis
       ↓
  PROCESSING  ←─── Admin ubah manual (sedang dikemas)
       ↓
   SHIPPED  ←─── Admin ubah manual (dalam pengiriman)
       ↓
  COMPLETED  ←─── Admin ubah manual (pesanan diterima)

  CANCELLED  ←─── Admin bisa batalkan kapan saja
```
