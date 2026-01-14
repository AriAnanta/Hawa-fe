# Dokumentasi Fitur Prediksi AQI (ISPU) 48 Jam

Fitur Prediksi AQI (Air Quality Index) atau ISPU (Indeks Standar Pencemar Udara) adalah komponen cerdas yang menggunakan teknologi **Machine Learning** untuk memprediksi kualitas udara di masa depan berdasarkan data historis.

## 🚀 Fungsi Utama
Komponen ini memberikan wawasan proaktif kepada pengguna mengenai tren kualitas udara selama 48 jam ke depan, sehingga pengguna dapat merencanakan aktivitas luar ruangan dengan lebih aman.

## 🛠️ Cara Kerja Teknis
Fitur ini beroperasi melalui beberapa tahapan integrasi data:

1.  **Pengambilan Data Historis**: Mengambil data kualitas udara (PM2.5) dari backend selama 72 jam terakhir.
2.  **Analisis Machine Learning**: Data tersebut dikirim ke API Machine Learning khusus (`VITE_ML_API_URL`) untuk diproses menggunakan model prediksi.
3.  **Visualisasi Real-time**: Hasil prediksi ditampilkan dalam bentuk grafik garis interaktif dan ringkasan waktu yang mudah dibaca.

## 📊 Fitur Visual & Antarmuka

### 1. Grafik Tren Interaktif
*   **Visualisasi Garis**: Menampilkan naik turunnya nilai AQI selama 48 jam.
*   **Tooltip Detail**: Saat kursor diarahkan ke grafik, muncul informasi spesifik mengenai waktu dan prediksi nilai AQI pada jam tersebut.
*   **Indikator Statistik**: Menampilkan nilai **AQI Saat Ini**, **Rata-rata**, dan **Puncak (Peak)** prediksi.

### 2. Timely Insight (Ringkasan Waktu)
Menampilkan ringkasan kondisi udara pada interval waktu tertentu:
*   **Sekarang (Now)**
*   **+6 Jam** hingga **+48 Jam**
Setiap interval dilengkapi dengan status kualitas udara (Baik, Sedang, Tidak Sehat, dll.) dan kode warna yang sesuai.

### 3. Sistem Kode Warna (Standardisasi)
Warna berubah secara dinamis berdasarkan tingkat polusi:
*   🟢 **Hijau (0-50)**: Baik
*   🟡 **Kuning (51-100)**: Sedang
*   🟠 **Oranye (101-150)**: Tidak Sehat (Sensitif)
*   🔴 **Merah (151-200)**: Tidak Sehat
*   🟣 **Ungu (>200)**: Sangat Tidak Sehat / Berbahaya


## 💻 Lokasi File
*   Komponen UI: [AQIPrediction.jsx](file:///c:/Users/user/Downloads/Hawa/hawa-fe-sl2/src/components/AQIPrediction.jsx)
*   Integrasi Dashboard: [Dashboard.jsx](file:///c:/Users/user/Downloads/Hawa/hawa-fe-sl2/src/pages/Dashboard.jsx)
