# User Guide - OnlineShop

## 1. Akun dan Login
- Register akun baru dari halaman `/register`.
- Login dari halaman `/login`.
- Setelah login, pengguna bisa melihat produk, menambah ke cart, checkout, dan melihat riwayat order.

## 2. Belanja Produk
- Buka halaman `/products` untuk melihat seluruh produk.
- Gunakan search pada navbar untuk filter produk.
- Klik kartu produk untuk melihat detail.

## 3. Cart dan Checkout
### Keranjang (Cart)
- Tambahkan produk melalui tombol "Add to Bag" di kartu produk atau halaman detail.
- Hanya user yang sudah login bisa menambah produk ke cart.
- Buka `/cart` untuk:
  - Melihat semua item di keranjang dengan harga dan total.
  - Ubah quantity (jumlah) item.
  - Hapus item dari keranjang.
  - Melihat subtotal dan total harga.

### Checkout
- Klik tombol "Proceed to Checkout" di halaman cart.
- Hanya user yang sudah login bisa melakukan checkout.
- Pada halaman checkout (`/checkout`):
  - Tinjau ulang semua item dan jumlahnya.
  - Lihat ringkasan biaya (subtotal, pajak jika ada).
  - Pilih metode pembayaran.
  - Klik "Complete Order" untuk membuat order baru.
- Setelah order berhasil, user akan diarahkan ke halaman konfirmasi.

## 4. Riwayat Order
- Buka `/orders` untuk melihat daftar order milik akun yang login.
- Setiap order menampilkan status, total, tanggal, dan item.

## 5. Admin Panel
Admin (role `Admin`) dapat membuka `/admin` untuk:
- Dashboard ringkas produk,
- Kelola produk (`/admin/products`),
- Kelola kategori (`/admin/categories`),
- Kelola status order (`/admin/orders`).

## 6. Status Order
Status yang digunakan:
- `Pending`
- `Processing`
- `Completed`
- `Cancelled`
