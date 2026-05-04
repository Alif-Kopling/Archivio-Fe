# 📁 Archivio — Frontend (Project 2: E-Arsip Dokumen Kantor)

> Antarmuka modern untuk sistem manajemen dokumen digital **E-Arsip** berbasis peran (Role-Based). Aplikasi ini dirancang untuk menyimpan, mencari, dan memantau dokumen kantor secara efisien.

---

## 🧩 Tech Stack

| Teknologi | Versi | Keterangan |
|---|---|---|
| [React](https://react.dev/) | 19.0.0 | UI Library utama |
| [TypeScript](https://www.typescriptlang.org/) | 5.6.3 | Static typing untuk keamanan kode |
| [Vite](https://vitejs.dev/) | 6.4.2 | Build tool & dev server super cepat |
| [HeroUI](https://www.heroui.com/) | 3.0.0 | Library komponen UI modern |
| [TailwindCSS](https://tailwindcss.com/) | 4.1.11 | Utility-first styling engine |
| [React Router DOM](https://reactrouter.com/) | 6.30.3 | Routing aplikasi client-side |
| [Recharts](https://recharts.org/) | 3.8.1 | Visualisasi data & statistik (Charts) |
| [Lucide React](https://lucide.dev/) | 1.8.0 | Library icon vektor |
| [Axios](https://axios-http.com/) | 1.15.2 | HTTP Client untuk integrasi API |

---

## 👥 Peran Pengguna (Roles)

Aplikasi ini mendukung dua aktor utama dengan hak akses yang berbeda:

1.  **Admin**:
    *   Kelola semua arsip (Surat Masuk, Surat Keluar, Sertifikat).
    *   Verifikasi (Approve/Reject) dokumen yang diupload Staff.
    *   Kelola Master Data (Manajemen User & Pengaturan Sistem).
    *   Monitor statistik keseluruhan via Dashboard.
2.  **Staff**:
    *   Cari dan Download dokumen yang sudah diverifikasi.
    *   Upload draf arsip baru (menunggu persetujuan Admin).
    *   Dashboard personal untuk memantau status upload.

---

## 📂 Struktur Direktori

```
Frontend/
├── public/                  # Aset statis (Logo, favicon)
├── src/
│   ├── assets/              # Aset gambar/logo aplikasi
│   ├── components/          # Komponen reusable
│   │   ├── DocumentUploadDialog.tsx # Dialog upload dokumen universal
│   │   ├── ProtectedRoute.tsx   # Guard route berbasis role
│   │   ├── sidebar.tsx          # Navigasi samping (Admin/Archives)
│   │   ├── navbar.tsx           # Navigasi atas
│   │   ├── theme-switch.tsx     # Toggle Dark/Light mode
│   │   └── icons.tsx            # Kumpulan icon Lucide
│   ├── config/              # Konfigurasi situs (site.ts)
│   ├── layouts/             # Wrapper tata letak
│   │   ├── admin.tsx            # Layout khusus area Admin
│   │   ├── archive.tsx          # Layout khusus area Arsip
│   │   └── default.tsx          # Layout umum
│   ├── lib/                 # Utilitas & Client (Axios, Auth helper)
│   ├── pages/
│   │   ├── Home.tsx             # Landing page utama
│   │   ├── auth/
│   │   │   └── Login.tsx        # Halaman autentikasi
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx    # Statistik & Approval pending
│   │   │   ├── Users.tsx        # Kelola akun Admin/Staff
│   │   │   └── Settings.tsx     # Pengaturan sistem
│   │   ├── staff/
│   │   │   └── Dashboard.tsx    # Dashboard khusus Staff
│   │   └── archives/
│   │       ├── SuratMasuk.tsx   # Manajemen Surat Masuk
│   │       ├── SuratKeluar.tsx  # Manajemen Surat Keluar
│   │       └── Sertifikat.tsx   # Manajemen Sertifikat
│   ├── services/            # Integrasi API per modul
│   ├── styles/              # CSS Global (Tailwind)
│   ├── types/               # Definisi Type/Interface TypeScript
│   ├── App.tsx              # Konfigurasi Router Utama
│   └── main.tsx             # Entry point React
```

---

## 🚀 Cara Menjalankan

### Instalasi Dependencies

```bash
npm install
```

### Menjalankan Mode Development

```bash
npm run dev
```

---

## 🎨 Fitur Utama

- 🌗 **Dark / Light Mode** — Mendukung tema gelap dan terang secara otomatis.
- 🔒 **Secure Authentication** — Login menggunakan JWT yang tersimpan di LocalStorage dengan auto-decode.
- 📊 **Interactive Dashboard** — Grafik distribusi dokumen menggunakan Recharts.
- 📂 **File Handling** — Upload dokumen (PDF/DOCX) dan Preview langsung di browser.
- 🔍 **Real-time Search** — Filter pencarian dengan sistem debounce untuk performa optimal.
- 📱 **Responsive Design** — Tampilan yang nyaman di berbagai ukuran layar.

---

## 📄 Lisensi
Proyek ini dikembangkan untuk kebutuhan internal.
