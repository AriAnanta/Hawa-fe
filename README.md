# Hawa - Panduan Lokal Singkat
Dokumen ini menjelaskan cara menyiapkan dan menjalankan frontend (Vite React) dan backend (FastAPI) secara lokal, termasuk perintah untuk membuat admin dan mengirim notifikasi WhatsApp.

## Prasyarat
- Node.js 18+ dan npm
- Python 3.13 + Poetry
- PostgreSQL berjalan lokal
- WhatsApp Web sudah login di browser default (untuk kirim notif WA)

## Konfigurasi Environment
Buat dua berkas environment.

### Frontend (`Hawa-fe/.env`)
```
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (`hawa-be/.env`)
```
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/hawa
SECRET_KEY=change-me
ADMIN_SECRET_KEY=change-admin
GROQ_API_KEY=isi-jika-pakai-ai
OPENWEATHER_API_KEY=isi-kunci-openweather
GOOGLE_SHEETS_ID=1Cv0PPUtZjIFlVSprD-FfvQDkUV4thy5qsH4IOMl3cyA
```

## Menjalankan Frontend
```
cd Hawa-fe
npm install
npm run dev -- --host
```
Frontend akan tersedia di `http://localhost:5173` (atau port yang dicetak oleh Vite).

## Menjalankan Backend
```
cd hawa-be
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Alternatif: `poetry run start` (menggunakan skrip di pyproject).

## Perintah Utilitas
- Buat admin baru:
  ```
  cd hawa-be
  poetry run python scripts/create_admin.py --email admin@example.com --password secret123 --full-name "Admin Hawa" --phone +6281234567890
  ```
- Kirim notifikasi WhatsApp manual:
  ```
  cd hawa-be
  poetry run python scripts/send_whatsapp_warnings.py --min-risk medium --worksheet Sheet1 --verbose
  ```
  Pastikan browser sudah login WhatsApp Web dan nomor pengguna tersimpan di database (`phone_e164`).

