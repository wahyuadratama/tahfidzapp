# Tahfidz App - Sistem Pencatatan Setoran Tahfidz

Aplikasi web untuk mencatat setoran hafalan Al-Qur'an dengan laporan mingguan dan bulanan untuk Pondok Pesantren Modern Darul Mukhlisin.

## 🚀 Fitur

- ✅ **Multi-User Authentication** - Setiap ustadz dapat membuat akun sendiri
- 📋 **Manajemen Data Santri** - CRUD data santri dengan kelas/halaqah
- ✍️ **Input Setoran Harian** - Catat setoran dengan detail juz, surat, dan ayat
- 📊 **Laporan Otomatis** - Generate laporan mingguan/bulanan
- 📄 **Export PDF** - Laporan siap cetak format A4
- 📊 **Export Excel** - Download laporan dalam format .xlsx
- 🎨 **Modern UI** - Desain responsif dengan gradient dan animasi

## 🛠️ Teknologi

- **Backend:** Node.js + Express.js
- **Storage:** JSON file-based (no database)
- **PDF Generation:** Puppeteer
- **Excel Export:** xlsx
- **Frontend:** Vanilla HTML/CSS/JavaScript

## 📦 Instalasi

### Development (Local)

1. Clone repository:
```bash
git clone <repository-url>
cd tahfidzapp
```

2. Install dependencies:
```bash
npm install
```

3. Jalankan server:
```bash
npm start
```

4. Buka browser: `http://localhost:3000`

### Production (Tencent Cloud VPS)

**Quick Deploy (~20 menit):**

1. **Setup VPS:**
```bash
ssh root@YOUR_VPS_IP
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs git
sudo npm install -g pm2
```

2. **Upload & Run:**
```bash
cd /var/www
sudo mkdir -p tahfidzapp && sudo chown -R $USER:$USER tahfidzapp
cd tahfidzapp
git clone <repository-url> .
npm install --production
chmod -R 755 data/ reports/
pm2 start server.js --name tahfidz-app
pm2 startup && pm2 save
```

3. **Setup Nginx:**
```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/tahfidz-app
# Paste config (lihat TENCENT_CLOUD_DEPLOY.md)
sudo ln -s /etc/nginx/sites-available/tahfidz-app /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

4. **Setup Firewall:**
```bash
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw enable
```

5. **Install Puppeteer Dependencies:**
```bash
sudo apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0
pm2 restart tahfidz-app
```

**Akses:** `http://YOUR_VPS_IP`

📖 **Panduan Lengkap:** Lihat `TENCENT_CLOUD_DEPLOY.md`  
⚡ **Quick Reference:** Lihat `TENCENT_QUICK.md`

## 🔐 Login Default

- **Username:** `ustadz`
- **Password:** `tahfidz123`

## 📁 Struktur Project

```
tahfidzapp/
├── data/                  # JSON data storage
│   ├── santri.json       # Data santri
│   ├── setoran.json      # Data setoran
│   └── users.json        # Data ustadz/user
├── public/               # Frontend files
│   ├── assets/           # Logo dan gambar
│   ├── index.html        # Login page
│   ├── register.html     # Registrasi ustadz
│   ├── dashboard.html    # Dashboard utama
│   ├── santri.html       # Manajemen santri
│   ├── setoran.html      # Input setoran
│   └── laporan.html      # Generate laporan
├── reports/              # Generated reports
│   ├── pdf/             # PDF files
│   └── excel/           # Excel files
├── server.js            # Express server
├── dataUtils.js         # JSON file utilities
├── reportLogic.js       # Report calculation
├── pdfGenerator.js      # PDF generation
├── excelGenerator.js    # Excel generation
└── package.json
```

## 💾 Struktur Data

### santri.json
```json
[
  {
    "id": 1,
    "nama": "Ahmad Fauzi",
    "kelas": "Halaqah A",
    "aktif": true
  }
]
```

### setoran.json
```json
[
  {
    "id": 1,
    "santri_id": 1,
    "ustadz": "Ustadz Ali",
    "juz": 2,
    "nama_surat": "Al-Baqarah",
    "ayat_awal": 1,
    "ayat_akhir": 10,
    "total_ayat": 10,
    "tanggal": "2026-01-05"
  }
]
```

### users.json
```json
[
  {
    "id": 1,
    "username": "ustadz",
    "password": "tahfidz123",
    "nama": "Ustadz Ali"
  }
]
```

## 📊 Logika Laporan

Untuk periode tertentu, sistem menghitung per santri:
- **Total Ayat:** Jumlah semua ayat yang disetorkan
- **Capaian Juz:** Juz tertinggi yang dicapai
- **Ustadz Pendamping:** Nama ustadz yang login dan generate laporan

## 🎨 Fitur UI

- Gradient background dengan primary color `#00B7B5` (Tosca)
- Logo pondok di navbar dan favicon
- Animasi smooth pada card dan form
- Responsive design untuk mobile dan desktop
- Modern form dengan icon dan placeholder

## 📝 Catatan

- Data disimpan dalam file JSON (tidak menggunakan database)
- Cocok untuk skala kecil hingga menengah (internal lembaga)
- Password tidak terenkripsi (untuk internal use)
- File PDF dan Excel di-generate on-demand

## 🔒 Keamanan

⚠️ **Penting:** Aplikasi ini dirancang untuk penggunaan internal. Untuk production:
- Gunakan database yang proper (PostgreSQL/MySQL)
- Implementasi enkripsi password (bcrypt)
- Tambahkan JWT untuk session management
- Implementasi HTTPS
- Validasi input yang lebih ketat

## 📄 License

MIT License - Free to use for educational purposes

## 👨‍💻 Developer

Developed for Pondok Pesantren Modern Darul Mukhlisin

---

**Barakallahu fiikum** 🤲
