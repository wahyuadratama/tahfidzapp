# 📖 DOKUMENTASI TAHFIDZ APP

## Deskripsi Project
Aplikasi web untuk mencatat setoran hafalan Al-Qur'an dengan sistem multi-user, laporan otomatis, dan export PDF/Excel untuk Pondok Pesantren Modern Darul Mukhlisin.

---

## 🎯 Fitur Utama

### 1. **Multi-User System**
- Setiap ustadz memiliki akun terpisah
- Data santri terpisah per ustadz
- Admin dapat melihat semua data
- Registrasi mandiri untuk ustadz baru

### 2. **Manajemen Data Santri**
- CRUD (Create, Read, Update, Delete) data santri
- Setiap santri terhubung dengan ustadz pembimbingnya
- Filter otomatis berdasarkan ustadz yang login

### 3. **Input Setoran Harian**
- Catat setoran dengan detail:
  - Juz
  - Nama Surat
  - Ayat Awal dan Akhir
  - Tanggal
  - Ustadz Pendamping
- Auto-calculate total ayat

### 4. **Laporan Otomatis**
- Generate laporan mingguan/bulanan
- Data terkelompok per ustadz pendamping
- Menampilkan:
  - Nama Santri
  - Nama Surat terakhir
  - Range Ayat
  - Total Ayat
  - Capaian Juz

### 5. **Export Laporan**
- **PDF**: Format A4, siap cetak, dengan tanda tangan Kepala Tahfidz
- **Excel**: Format .xlsx, mudah diedit
- **View**: Tampilan di browser dengan grouping per ustadz

### 6. **Dashboard Admin**
- Daftar semua user terdaftar
- Monitoring aktivitas ustadz (ranking berdasarkan setoran)
- Statistik lengkap
- Informasi Kepala Tahfidz

---

## 🛠️ Teknologi

### Backend
- **Node.js** v18+
- **Express.js** v4.18.2
- **Puppeteer** v24.15.0 (PDF Generation)
- **xlsx** v0.18.5 (Excel Export)

### Frontend
- **HTML5**
- **CSS3** (Vanilla, dengan Gradient & Animasi)
- **JavaScript** (Vanilla, ES6+)

### Storage
- **JSON Files** (No Database)
- File-based storage untuk kemudahan deployment

---

## 📁 Struktur Project

```
tahfidzapp/
├── data/                      # JSON Data Storage
│   ├── santri.json           # Data santri (linked to ustadz_id)
│   ├── setoran.json          # Data setoran harian
│   └── users.json            # Data user (admin & ustadz)
│
├── public/                    # Frontend Files
│   ├── assets/               # Logo & Images
│   │   └── logopondok.png
│   ├── index.html            # Login Page
│   ├── register.html         # Registrasi Ustadz
│   ├── dashboard.html        # Dashboard Utama
│   ├── santri.html           # Manajemen Santri
│   ├── setoran.html          # Input Setoran
│   ├── laporan.html          # Generate Laporan
│   ├── users.html            # Daftar User (Admin Only)
│   └── monitoring.html       # Monitoring Ustadz (Admin Only)
│
├── reports/                   # Generated Reports
│   ├── pdf/                  # PDF Files
│   └── excel/                # Excel Files
│
├── server.js                  # Express Server & API Routes
├── dataUtils.js              # JSON File Utilities
├── reportLogic.js            # Report Calculation Logic
├── pdfGenerator.js           # PDF Generation
├── excelGenerator.js         # Excel Generation
├── package.json              # Dependencies
├── vercel.json               # Vercel Deployment Config
├── .gitignore                # Git Ignore Rules
└── DOKUMENTASI.md            # This file
```

---

## 🔐 User Roles & Access

### 1. **Admin**
- **Username:** `admin`
- **Password:** `admin123`
- **Akses:**
  - Lihat semua data santri dari semua ustadz
  - Generate laporan semua santri (terkelompok per ustadz)
  - Lihat daftar user terdaftar
  - Monitoring aktivitas ustadz
  - Informasi Kepala Tahfidz ditampilkan di dashboard

### 2. **Ustadz**
- **Registrasi:** Buat akun sendiri via halaman registrasi
- **Akses:**
  - Kelola santri mereka sendiri
  - Input setoran untuk santri mereka
  - Generate laporan santri mereka saja
  - Tidak bisa lihat data ustadz lain

---

## 💾 Struktur Data

### users.json
```json
[
  {
    "id": 1,
    "username": "admin",
    "password": "admin123",
    "nama": "Administrator",
    "role": "admin",
    "kepala_tahfidz": "Al-Ustadz Aflah Gusman, S.E"
  },
  {
    "id": 2,
    "username": "ustadz1",
    "password": "password123",
    "nama": "Ustadz Ahmad",
    "role": "ustadz"
  }
]
```

### santri.json
```json
[
  {
    "id": 1,
    "nama": "Ahmad Fauzi",
    "kelas": "Halaqah A",
    "aktif": true,
    "ustadz_id": 2
  }
]
```

### setoran.json
```json
[
  {
    "id": 1,
    "santri_id": 1,
    "ustadz": "Ustadz Ahmad",
    "juz": 2,
    "nama_surat": "Al-Baqarah",
    "ayat_awal": 1,
    "ayat_akhir": 10,
    "total_ayat": 10,
    "tanggal": "2026-02-09"
  }
]
```

---

## 🚀 Instalasi & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd tahfidzapp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Jalankan Server
```bash
npm start
```

### 4. Akses Aplikasi
Buka browser: `http://localhost:3000`

---

## 📊 API Endpoints

### Authentication
- `POST /api/login` - Login user
- `POST /api/register` - Registrasi ustadz baru

### Santri Management
- `GET /api/santri?userId={id}&role={role}` - Get santri (filtered by user)
- `POST /api/santri` - Tambah santri baru
- `PUT /api/santri/:id` - Update santri
- `DELETE /api/santri/:id` - Hapus santri

### Setoran Management
- `GET /api/setoran` - Get semua setoran
- `POST /api/setoran` - Tambah setoran baru

### Reports
- `POST /api/report` - Generate laporan (view/pdf/excel)

### Admin Only
- `GET /api/users` - Get daftar user (tanpa password)
- `GET /api/monitoring` - Get statistik aktivitas ustadz

---

## 📝 Cara Penggunaan

### Untuk Admin

1. **Login**
   - Username: `admin`
   - Password: `admin123`

2. **Dashboard Admin**
   - Lihat informasi Kepala Tahfidz
   - Akses menu admin (Daftar User, Monitoring Ustadz)

3. **Generate Laporan**
   - Pilih periode tanggal
   - Klik "Lihat Laporan" untuk preview
   - Klik "Download PDF" untuk cetak
   - Klik "Download Excel" untuk analisis
   - Laporan otomatis terkelompok per ustadz

4. **Monitoring Ustadz**
   - Lihat ranking ustadz berdasarkan aktivitas
   - Pantau jumlah santri per ustadz
   - Lihat total setoran per ustadz

### Untuk Ustadz

1. **Registrasi**
   - Klik "Daftar di sini" di halaman login
   - Isi nama lengkap, username, password
   - Login dengan akun baru

2. **Kelola Santri**
   - Tambah santri baru (otomatis ter-link ke ustadz)
   - Lihat daftar santri sendiri
   - Hapus santri jika diperlukan

3. **Input Setoran**
   - Pilih santri
   - Isi detail setoran (juz, surat, ayat, tanggal)
   - Nama ustadz otomatis terisi
   - Simpan setoran

4. **Generate Laporan**
   - Pilih periode tanggal
   - Generate laporan santri sendiri
   - Export ke PDF/Excel

---

## 🎨 Desain & UI

### Color Scheme
- **Primary:** `#00B7B5` (Tosca/Teal)
- **Secondary:** `#008f8d` (Dark Teal)
- **Background:** Gradient `#f5f7fa` to `#c3cfe2`
- **Text:** `#333` (Dark Gray)

### Features
- Gradient backgrounds
- Smooth animations (fadeIn, slideUp)
- Responsive design (Mobile, Tablet, Desktop)
- Modern card design dengan shadow
- Icon emoji untuk visual appeal

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1023px
- Desktop: ≥ 1024px

---

## 📄 Format Laporan

### PDF
- **Header:**
  - LEMBAGA TAHFIDZ AL-QUR'AN
  - PONDOK PESANTREN MODERN DARUL MUKHLISIN
  - Kulliyatul Mu'allimin Al-Islamiyah
  - Periode laporan

- **Body:**
  - Terkelompok per ustadz (header berwarna tosca)
  - Tabel: No, Nama Santri, Nama Surat, Ayat, Total Ayat, Capaian Juz

- **Footer:**
  - Mengetahui, Kepala Lembaga Tahfidz
  - Nama Kepala (dari database)
  - Tanggal cetak

### Excel
- Sheet "Rekap"
- Format sama dengan PDF
- Mudah diedit dan dianalisis

---

## 🔒 Keamanan

### Current Implementation (Internal Use)
- Password plain text (tidak terenkripsi)
- Session menggunakan localStorage
- Tidak ada JWT/token
- Cocok untuk internal lembaga

### Rekomendasi untuk Production
- ✅ Gunakan database (PostgreSQL/MySQL)
- ✅ Enkripsi password dengan bcrypt
- ✅ Implementasi JWT untuk session
- ✅ HTTPS/SSL
- ✅ Input validation & sanitization
- ✅ Rate limiting
- ✅ CORS configuration

---

## 🚢 Deployment

### Recommended Platforms

1. **Render.com** (Recommended)
   - Free tier available
   - Auto-deploy from GitHub
   - No configuration needed

2. **Railway.app**
   - Free tier available
   - Simple deployment

3. **Vercel** (dengan vercel.json)
   - Serverless functions
   - Fast deployment

### Deployment Steps (Render.com)
1. Push code ke GitHub
2. Buat akun di render.com
3. New → Web Service
4. Connect repository
5. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Deploy

---

## 🐛 Troubleshooting

### Server tidak jalan
```bash
# Cek port 3000 sudah digunakan atau belum
netstat -ano | findstr :3000

# Ganti port di server.js jika perlu
const PORT = 3001;
```

### PDF tidak generate
```bash
# Install ulang puppeteer
npm uninstall puppeteer
npm install puppeteer@24.15.0
```

### Data tidak muncul
- Cek file JSON di folder `data/`
- Pastikan format JSON valid
- Restart server

---

## 📞 Support & Maintenance

### Update Kepala Tahfidz
Edit file `data/users.json`:
```json
{
  "id": 1,
  "role": "admin",
  "kepala_tahfidz": "Nama Baru Kepala Tahfidz"
}
```

### Backup Data
```bash
# Backup folder data
cp -r data/ backup/data_$(date +%Y%m%d)/
```

### Reset Password User
Edit langsung di `data/users.json`

---

## 📜 License

MIT License - Free to use for educational purposes

---

## 👨‍💻 Developer

Developed for **Pondok Pesantren Modern Darul Mukhlisin**

**Barakallahu fiikum** 🤲

---

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Multi-user authentication
- ✅ Data santri terpisah per ustadz
- ✅ Input setoran dengan detail lengkap
- ✅ Laporan terkelompok per ustadz
- ✅ Export PDF & Excel
- ✅ Admin dashboard dengan monitoring
- ✅ Responsive design
- ✅ Nama Kepala Tahfidz di laporan

---

## 🔮 Future Enhancements

- [ ] Database integration (PostgreSQL)
- [ ] Password encryption
- [ ] JWT authentication
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Backup otomatis
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced analytics
- [ ] Bulk import santri (Excel)

---

**Last Updated:** February 2026
