# Laporan Implementasi Tugas Smart Library API

Dokumen ini merangkum implementasi teknis sesuai ketentuan tugas.

## 1) Implementasi CRUD Lengkap (Full Methods)

### Implementasi yang dilakukan
- Authors:
  - GET /api/authors
  - GET /api/authors/:id
  - POST /api/authors
  - PUT /api/authors/:id
  - DELETE /api/authors/:id
- Categories:
  - GET /api/categories
  - GET /api/categories/:id
  - POST /api/categories
  - PUT /api/categories/:id
  - DELETE /api/categories/:id
- Books:
  - GET /api/books
  - GET /api/books/:id
  - POST /api/books
  - PUT /api/books/:id
  - DELETE /api/books/:id
- Members:
  - GET /api/members
  - GET /api/members/:id
  - POST /api/members
  - PUT /api/members/:id
  - DELETE /api/members/:id

### Analisis mendalam
- Semua ID pada database menggunakan UUID, sehingga controller menambahkan validasi format UUID sebelum query database.
- Update endpoint menggunakan pendekatan partial update pada layer model agar field yang tidak dikirim tetap mempertahankan nilai lama.
- Validasi member_type disesuaikan dengan constraint database (`STUDENT`, `FACULTY`, `STAFF`) untuk mencegah error constraint check.
- Error database dipetakan menjadi respons API yang lebih informatif (contoh duplikat data, foreign key, UUID tidak valid).
- Delete pada entitas yang masih direferensikan oleh foreign key akan menghasilkan konflik (HTTP 409), ini menjaga integritas data.

## 2) Fitur Pencarian Global (Authors, Categories, Books)

### Implementasi yang dilakukan
- GET /api/authors mendukung query parameter `name`
- GET /api/categories mendukung query parameter `name`
- GET /api/books mendukung query parameter `title`
- Jika query kosong, endpoint kembali ke perilaku default (mengembalikan seluruh data)

### Analisis mendalam
- Pencarian menggunakan SQL `ILIKE` dengan parameterized query (`$1`) untuk keamanan dari SQL injection.
- Pencarian bersifat case-insensitive dan partial matching (`%keyword%`) sehingga lebih fleksibel untuk user.
- Efek performa: pattern `%keyword%` dapat kurang optimal pada dataset sangat besar. Untuk skala lebih besar, disarankan index tambahan atau full-text search.

## 3) Endpoint Khusus Pengembalian Buku (Return Logic)

### Implementasi yang dilakukan
- Endpoint baru: PATCH /api/loans/:id/return
- Alur:
  1. Validasi ID loan
  2. Transaction BEGIN
  3. Lock row loan + buku terkait (FOR UPDATE)
  4. Validasi status loan harus `BORROWED`
  5. Update stok buku (`available_copies = available_copies + 1`) dengan guard agar tidak melebihi total
  6. Update loan (`status = RETURNED`, `return_date = CURRENT_DATE`)
  7. COMMIT bila sukses seluruh langkah
  8. ROLLBACK bila ada kegagalan

### Analisis mendalam
- Atomicity dijaga dengan transaction sehingga tidak ada kondisi setengah sukses (misal status berubah tetapi stok gagal update).
- Guard stok mencegah over-count pada available_copies.
- Endpoint mengembalikan sukses hanya setelah update status loan dan update stok buku sama-sama berhasil.

## 4) Endpoint Laporan Statistik Perpustakaan

### Implementasi yang dilakukan
- Endpoint baru: GET /api/reports/stats
- Data yang dikembalikan:
  - total_books
  - total_authors
  - total_categories
  - total_borrowed_loans (status = BORROWED)
  - generated_at (timestamp response)

### Analisis mendalam
- Query agregasi dibuat dalam satu eksekusi SQL untuk konsistensi snapshot data.
- Status `BORROWED` dipakai sebagai sumber utama hitung peminjaman aktif, sesuai requirement.
- Endpoint ini dapat dijadikan dasar dashboard monitoring perpustakaan.

## 5) Pengujian Endpoint dan Deployment

### Deployment
- API sudah dideploy ke Vercel.
- Base URL production: https://smart-library-api-kel17.vercel.app

### Hasil uji teknis otomatis (lokal dan live)
- Smoke test lokal: semua endpoint utama status sukses (200/201)
- Verifikasi live di Vercel: endpoint utama berhasil dipanggil dan return status sesuai

### Analisis mendalam pengujian
- Pengujian mencakup skenario create, read, update, delete, search, loan create, loan return, dan reports stats.
- Pada data relasional, penghapusan entitas yang sudah direferensikan loan memang menghasilkan konflik FK, ini sesuai prinsip integritas relasi.
- Untuk kebutuhan laporan tugas, bukti visual tetap disiapkan melalui screenshot Postman.

## Catatan Integrasi GitHub ke Vercel
- Project lokal sudah linked ke Vercel project `smart-library-api-kel17`.
- Repository GitHub sudah terhubung ke project Vercel.
- Setelah commit dan push ke branch terhubung, deployment akan berjalan otomatis (auto deploy).
