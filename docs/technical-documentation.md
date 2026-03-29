# Technical Documentation - OnlineShop

## 1. Architecture
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind.
- **Backend**: ASP.NET Core Web API + EF Core + SQL Server.
- **Auth**: JWT Bearer token.

## 2. Database Structure

### Entity Relationship Diagram (ERD)

```
┌─────────────┐
│   User      │
├─────────────┤
│ id (PK)     │
│ name        │
│ email (UQ)  │
│ password    │
│ role        │
│ createdAt   │
└──────┬──────┘
       │
       │ 1:N
       ├──────────────────┬────────────────┐
       │                  │                │
       ▼                  ▼                ▼
┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│   Cart      │  │   Order      │  │  CartItem   │
├─────────────┤  ├──────────────┤  ├─────────────┤
│ id (PK)     │  │ id (PK)      │  │ id (PK)     │
│ userId (FK) │  │ userId (FK)  │  │ cartId (FK) │
│ createdAt   │  │ totalPrice   │  │ productId   │
│ updatedAt   │  │ status       │  │ quantity    │
└─────────────┘  │ createdAt    │  └─────────────┘
                 │ updatedAt    │
                 └──────┬───────┘
                        │
                        │ 1:N
                        ▼
                 ┌──────────────────┐
                 │   OrderProduct   │
                 ├──────────────────┤
                 │ id (PK)          │
                 │ orderId (FK)     │
                 │ productId (FK)   │
                 │ quantity         │
                 │ priceAtTime      │
                 └──────────────────┘
                        ▲
                        │ N:1
                        │
                 ┌──────────────────┐
                 │   Product        │
                 ├──────────────────┤
                 │ id (PK)          │
                 │ categoryId (FK)  │
                 │ name             │
                 │ description      │
                 │ price            │
                 │ stock            │
                 │ image            │
                 │ createdAt        │
                 └──────────────────┘
                        ▲
                        │ N:1
                        │
                 ┌──────────────────┐
                 │   Category       │
                 ├──────────────────┤
                 │ id (PK)          │
                 │ name             │
                 │ description      │
                 │ createdAt        │
                 └──────────────────┘
```

### Tabel Utama
- **User**: Menyimpan informasi pengguna (regular user dan admin).
- **Product**: Daftar produk dengan harga, stok, kategori.
- **Category**: Kategori produk (Headphones, Smartphones, dll).
- **Cart**: Keranjang belanja per user.
- **CartItem**: Item dalam keranjang dengan quantity.
- **Order**: Order/pembelian yang dibuat jika checkout.
- **OrderProduct**: Detail produk yang ada di dalam order, dengan quantity dan harga saat itu.

## 3. Backend Modules
- `Controllers/` untuk HTTP endpoints.
- `Services/` untuk business logic.
- `DTOs/` untuk request/response contracts.
- `Data/AppDbContext.cs` untuk EF Core context.
- `Helpers/JwtHelper.cs` untuk token generation.

## 4. Security Notes
- JWT secret wajib diset lewat konfigurasi `AppSettings:Token`.
- Fallback hardcoded secret sudah dihapus.
- Admin endpoint dilindungi `[Authorize(Roles = "Admin")]`.

## 5. Checkout & Order Flow

### User Journey (Frontend → Backend → Database)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. USER BROWSE & ADD TO CART                                        │
├─────────────────────────────────────────────────────────────────────┤
│ - User visit /products                                              │
│ - Click "Add to Bag" on product card                                │
│ - Product added to Cart (stored in localStorage + Zustand state)    │
│ - Cart icon badge updates with item count                           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. REVIEW CART                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ - User navigate to /cart                                            │
│ - View all items with:                                              │
│   * Product name, image, price                                      │
│   * Quantity (editable)                                             │
│   * Subtotal per item                                               │
│ - Can:                                                              │
│   * Increase/Decrease quantity                                      │
│   * Remove items                                                    │
│   * See total price                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. PROCEED TO CHECKOUT                                              │
├─────────────────────────────────────────────────────────────────────┤
│ - User clicks "Proceed to Checkout"                                 │
│ - System validates:                                                 │
│   ✓ User is authenticated (JWT token valid)                         │
│   ✓ Cart is not empty                                               │
│   ✓ Product stock is sufficient                                     │
│ - On validation pass → Navigate to /checkout                        │
│ - On validation fail → Show error & redirect to login               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. CHECKOUT PAGE                                                    │
├─────────────────────────────────────────────────────────────────────┤
│ - Display order summary:                                            │
│   * All items in order                                              │
│   * Quantity per item                                               │
│   * Price per item & subtotal                                       │
│   * Total price                                                     │
│ - Show payment method selection [Future: Payment Gateway]           │
│ - "Complete Order" button enabled when all validations pass         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. SUBMIT ORDER (API: POST /api/Order/checkout)                    │
├─────────────────────────────────────────────────────────────────────┤
│ Frontend sends:                                                     │
│   cartItems with product IDs & quantities                           │
│                                                                     │
│ Backend validates:                                                  │
│   ✓ User authenticated from JWT                                     │
│   ✓ Each product exists & sufficient stock                          │
│   ✓ Cart not empty                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. ORDER CREATED & PERSISTED                                        │
├─────────────────────────────────────────────────────────────────────┤
│ Backend creates:                                                    │
│   • Order record (userId, status=Pending, totalPrice)               │
│   • OrderProduct records (orderId, productId, quantity, price)      │
│   • Reduces product stock by quantity ordered                       │
│   • Clears user's cart                                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 7. CONFIRMATION SENT TO FRONTEND                                    │
├─────────────────────────────────────────────────────────────────────┤
│ Response includes:                                                  │
│   • Order ID                                                        │
│   • Total price                                                     │
│   • Status (Pending)                                                │
│   • Order items list                                                │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 8. USER SEES CONFIRMATION                                           │
├─────────────────────────────────────────────────────────────────────┤
│ - Order confirmation page with:                                     │
│   * Order ID & date                                                 │
│   * Items & quantities                                              │
│   * Total amount                                                    │
│   * Current status (Pending)                                        │
│ - Options: View in Orders / Continue Shopping                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Order Status Management (Admin)

```
Pending (Initial)
   ↓ [Admin: Process]
Processing
   ↓ [Admin: Complete]
Completed

Alternative:
   → [Admin: Cancel] → Cancelled (at any status)
```

## 6. Key API Endpoints
- Auth: `/api/Auth/*`
- Product: `/api/Product`
- Category: `/api/Category`
- Cart: `/api/Cart`
- Order (user): `GET /api/Order`, `POST /api/Order/checkout`
- Order (admin):
  - `GET /api/Order/admin`
  - `PUT /api/Order/{id}/status`

## 7. Running Locally
### Backend
1. Masuk folder `Backend`.
2. Pastikan koneksi DB valid.
3. Jalankan migration/update DB bila diperlukan.
4. Jalankan `dotnet run`.

### Frontend
1. Masuk folder `frontend`.
2. Jalankan `npm install`.
3. Jalankan `npm run dev`.
4. Akses `http://localhost:3000`.
