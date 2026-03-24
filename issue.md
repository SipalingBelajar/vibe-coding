# User Registration Feature Implementation Guide

## Objective
Implement a user registration API using ElysiaJS and Drizzle ORM. 

## 1. Database Schema
Ensure the database schema (e.g. `src/db/schema.ts`) includes a `users` table with the following structure:
- `id`: integer, auto-incrementing primary key
- `name`: varchar 255, not null
- `email`: varchar 255, not null, unique
- `password`: varchar 255, not null (Store the **bcrypt hash** of the password, never plain text)
- `created_at`: timestamp, default current timestamp

> **Important**: Always hash the password using `bcrypt` (atau built-in password hasher misal Bun.password jika berjalan di atas Bun) sebelum menyimpan ke database.

## 2. Architecture & Folder Structure
Create and structure the folders inside the `src` directory as follows:
- `src/routes/`: Contains Elysia.js routing logic handlers. File naming convention: `[feature]-route.ts` (e.g., `user-route.ts`).
- `src/services/`: Contains independent business logic algorithms and DB operations. File naming convention: `[feature]-service.ts` (e.g., `user-service.ts`).

## 3. API Specification

Implement the user registration endpoint exactly as specified below.

**Endpoint:** `POST /api/users`

**Request Body:**
```json
{
	"name": "Eko",
	"email": "eko@localhost",
	"password": "rahasia"
}
```

**Response Body (Success):**
*HTTP Status 200/201*
```json
{
	"data": "OK"
}
```

**Response Body (Error - Validation/Conflict):**
*HTTP Status 400*
```json
{
	"error": "Email sudah terdaftar"
}
```

---

## 4. Implementation Steps (Step-by-Step for Junior Developer/AI)

Agar implementasinya rapi dan sesuai standar, ikuti urutan pengerjaan berikut:

### **Tahap 1: Setup Schema & Migration Database**
1. Buka atau buat file schema Drizzle (biasanya `src/db/schema.ts`).
2. Tambahkan definisi tabel `users` yang memiliki kolom: `id`, `name`, `email`, `password`, dan `created_at` menggunakan Drizzle MySQL Builder.
3. Pastikan kolom `email` ditandai sebagai `unique()` agar tidak ada duplikasi email di database.
4. Jalankan perintah migration Drizzle (seperti `drizzle-kit generate` dan `drizzle-kit push`) untuk menerapkan tabel ini ke database lokal.

### **Tahap 2: Buat User Service (`src/services/user-service.ts`)**
1. Buat folder `src/services` dan file `user-service.ts`.
2. Buat fungsi `registerUser(payload)` untuk menangani logika registrasi.
3. Di dalam fungsi tersebut, **lakukan pengecekan email**: query ke database menggunakan Drizzle untuk mencari apakah ada tabel `users` dengan email yang di-request.
4. Jika email sudah ada, langsung _throw_ error spesifik alias lemparkan exception/error yang memberitahu bahwa email sudah terdaftar.
5. Jika email belum ada, hash field `password` dari request tersebut (gunakan library `bcrypt` atau hasher bawaan).
6. Insert data user baru (`name`, `email`, `hashed_password`) ke tabel `users` di database.
7. Return hasil sukses atau balikan nilai yang sesuai.

### **Tahap 3: Buat User Route (`src/routes/user-route.ts`)**
1. Buat folder `src/routes` dan file `user-route.ts`.
2. Inisiasi instance router Elysia baru untuk scope user.
3. Buat endpoint `POST /api/users`.
4. Ambil data dari `body` request. *(Gunakan plugin type validation ElysiaJS / Typebox untuk memastikan body berisi name, email, dan password).*
5. Panggil fungsi `registerUser` dari `user-service.ts` yang sudah dibuat di Tahap 2, passing data dari `body` tersebut.
6. **Error Handling**: Gunakan `try-catch` atau mekanisme error handler Elysia. Jika proses gagal dengan error email terdaftar, kembalikan response json `{"error": "Email sudah terdaftar"}` dengan HTTP Code 400.
7. **Success Handling**: Jika fungsi service mengembalikan sukses, kembalikan json `{"data": "OK"}`.

### **Tahap 4: Integrasi Route ke Aplikasi Utama**
1. Buka file utama script server (biasanya `src/index.ts`).
2. Import route dari `user-route.ts`.
3. Register rute ini ke main instance Elysia menggunakan fungsi `.use()`.

### **Tahap 5: Testing (Verifikasi Akhir)**
- **Test Skenario Sukses**: Kirim POST HTTP request ke `/api/users` menggunakan Postman/Bruno/cURL dengan body dummy di atas. Pastikan response `"data": "OK"`.
- **Test Skenario Insert**: Bebaskan memastikan database benar-benar menyimpan password dalam format hash (tidak plain text).
- **Test Skenario Gagal**: Kirim POST HTTP request lagi dengan email yang sama persis. Pastikan response menghasilkan `{"error": "Email sudah terdaftar"}`.
