const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { readJSON, writeJSON, getNextId } = require('./dataUtils');
const { calculateReport } = require('./reportLogic');
const { generatePDF } = require('./pdfGenerator');
const { generateExcel } = require('./excelGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Helmet
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for our app
}));

// Security: Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { success: false, message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' }
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100 // 100 requests per minute
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));
app.use('/reports', express.static('reports'));

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Input sanitization helper
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>"']/g, (char) => {
    const entities = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
    return entities[char];
  });
};

// Authentication
app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.json({ success: false, message: 'Username dan password harus diisi' });
    }
    
    const users = readJSON('users.json');
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.json({ success: false, message: 'Username atau password salah' });
    }
    
    // Check if password is hashed or plain text
    let passwordMatch = false;
    if (user.password.startsWith('$2')) {
      // Hashed password
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      // Plain text (for backward compatibility)
      passwordMatch = user.password === password;
    }
    
    if (passwordMatch) {
      res.json({ 
        success: true, 
        nama: sanitizeInput(user.nama), 
        userId: user.id, 
        role: user.role,
        gender: user.gender || 'L',
        kepala_tahfidz: user.kepala_tahfidz ? sanitizeInput(user.kepala_tahfidz) : null
      });
    } else {
      res.json({ success: false, message: 'Username atau password salah' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { nama, gender, username, password } = req.body;
    
    if (!nama || !gender || !username || !password) {
      return res.json({ success: false, message: 'Semua field harus diisi' });
    }
    
    if (username.length < 3 || password.length < 6) {
      return res.json({ success: false, message: 'Username min 3 karakter, password min 6 karakter' });
    }
    
    const users = readJSON('users.json');
    
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.json({ success: false, message: 'Username sudah digunakan' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: getNextId(users),
      username: sanitizeInput(username),
      password: hashedPassword,
      nama: sanitizeInput(nama),
      gender: gender,
      role: 'ustadz'
    };
    
    users.push(newUser);
    writeJSON('users.json', users);
    res.json({ success: true });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

// Reset Password
app.post('/api/reset-password', (req, res) => {
  try {
    const { username, newPassword } = req.body;
    
    if (!username || !newPassword) {
      return res.json({ success: false, message: 'Username dan password baru harus diisi' });
    }
    
    if (newPassword.length < 6) {
      return res.json({ success: false, message: 'Password baru minimal 6 karakter' });
    }
    
    const users = readJSON('users.json');
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex === -1) {
      return res.json({ success: false, message: 'Username tidak ditemukan' });
    }
    
    // Update password
    users[userIndex].password = newPassword;
    writeJSON('users.json', users);
    
    res.json({ success: true, message: 'Password berhasil direset' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

// Santri CRUD
app.get('/api/monitoring', (req, res) => {
  const users = readJSON('users.json');
  const santri = readJSON('santri.json');
  const setoran = readJSON('setoran.json');
  
  const ustadzList = users.filter(u => u.role === 'ustadz');
  
  const monitoring = ustadzList.map(ustadz => {
    const santriCount = santri.filter(s => s.ustadz_id === ustadz.id && s.aktif).length;
    const setoranCount = setoran.filter(set => {
      const santriIds = santri.filter(s => s.ustadz_id === ustadz.id).map(s => s.id);
      return santriIds.includes(set.santri_id);
    }).length;
    
    return {
      id: ustadz.id,
      nama: ustadz.nama,
      jumlahSantri: santriCount,
      totalSetoran: setoranCount
    };
  });
  
  // Sort by total setoran descending
  monitoring.sort((a, b) => b.totalSetoran - a.totalSetoran);
  
  res.json(monitoring);
});

app.get('/api/users', (req, res) => {
  const users = readJSON('users.json');
  // Hapus password dari response untuk keamanan
  const safeUsers = users.map(u => ({
    id: u.id,
    username: u.username,
    nama: u.nama,
    role: u.role,
    gender: u.gender || 'L'
  }));
  res.json(safeUsers);
});

app.delete('/api/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const users = readJSON('users.json');
    const santri = readJSON('santri.json');
    const setoran = readJSON('setoran.json');
    
    // Cek apakah user adalah admin
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin tidak dapat dihapus' });
    }
    
    // Hapus santri yang dibimbing user ini
    const santriToDelete = santri.filter(s => s.ustadz_id === userId);
    const santriIds = santriToDelete.map(s => s.id);
    
    // Hapus setoran dari santri tersebut
    const setoranFiltered = setoran.filter(s => !santriIds.includes(s.santri_id));
    const deletedSetoran = setoran.length - setoranFiltered.length;
    
    // Hapus santri
    const santriFiltered = santri.filter(s => s.ustadz_id !== userId);
    const deletedSantri = santri.length - santriFiltered.length;
    
    // Hapus user
    const usersFiltered = users.filter(u => u.id !== userId);
    
    // Simpan perubahan
    writeJSON('users.json', usersFiltered);
    writeJSON('santri.json', santriFiltered);
    writeJSON('setoran.json', setoranFiltered);
    
    res.json({ 
      success: true, 
      message: 'User berhasil dihapus',
      deletedSantri,
      deletedSetoran
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const users = readJSON('users.json');
    const santri = readJSON('santri.json');
    const setoran = readJSON('setoran.json');
    
    // Cek apakah user adalah admin
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin tidak dapat dihapus' });
    }
    
    // Hapus santri yang dibimbing user ini
    const santriToDelete = santri.filter(s => s.ustadz_id === userId);
    const santriIds = santriToDelete.map(s => s.id);
    
    // Hapus setoran dari santri tersebut
    const setoranFiltered = setoran.filter(s => !santriIds.includes(s.santri_id));
    const deletedSetoran = setoran.length - setoranFiltered.length;
    
    // Hapus santri
    const santriFiltered = santri.filter(s => s.ustadz_id !== userId);
    const deletedSantri = santri.length - santriFiltered.length;
    
    // Hapus user
    const usersFiltered = users.filter(u => u.id !== userId);
    
    // Simpan perubahan
    writeJSON('users.json', usersFiltered);
    writeJSON('santri.json', santriFiltered);
    writeJSON('setoran.json', setoranFiltered);
    
    res.json({ 
      success: true, 
      message: 'User berhasil dihapus',
      deletedSantri,
      deletedSetoran
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

app.get('/api/santri', (req, res) => {
  const { userId, role } = req.query;
  const santri = readJSON('santri.json');
  
  if (role === 'admin') {
    res.json(santri);
  } else {
    const filtered = santri.filter(s => s.ustadz_id === parseInt(userId));
    res.json(filtered);
  }
});

app.post('/api/santri', (req, res) => {
  try {
    const { nama, kelas, ustadz_id } = req.body;
    
    if (!nama || !kelas || !ustadz_id) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }
    
    const santri = readJSON('santri.json');
    const newSantri = {
      id: getNextId(santri),
      nama: sanitizeInput(nama),
      kelas: sanitizeInput(kelas),
      aktif: true,
      ustadz_id: parseInt(ustadz_id)
    };
    santri.push(newSantri);
    writeJSON('santri.json', santri);
    res.json(newSantri);
  } catch (error) {
    console.error('Add santri error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

app.put('/api/santri/:id', (req, res) => {
  const santri = readJSON('santri.json');
  const index = santri.findIndex(s => s.id === parseInt(req.params.id));
  if (index !== -1) {
    santri[index] = { ...santri[index], ...req.body };
    writeJSON('santri.json', santri);
    res.json(santri[index]);
  } else {
    res.status(404).json({ message: 'Santri tidak ditemukan' });
  }
});

app.delete('/api/santri/:id', (req, res) => {
  const santri = readJSON('santri.json');
  const filtered = santri.filter(s => s.id !== parseInt(req.params.id));
  writeJSON('santri.json', filtered);
  res.json({ success: true });
});

// Setoran CRUD
app.get('/api/setoran', (req, res) => {
  const setoran = readJSON('setoran.json');
  res.json(setoran);
});

app.post('/api/setoran', (req, res) => {
  try {
    const { santri_id, ustadz, juz, nama_surat, ayat_awal, ayat_akhir, tanggal } = req.body;
    
    if (!santri_id || !ustadz || !juz || !nama_surat || !ayat_awal || !ayat_akhir || !tanggal) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }
    
    const ayatAwal = parseInt(ayat_awal);
    const ayatAkhir = parseInt(ayat_akhir);
    
    if (ayatAwal > ayatAkhir) {
      return res.status(400).json({ message: 'Ayat awal tidak boleh lebih besar dari ayat akhir' });
    }
    
    const setoran = readJSON('setoran.json');
    const newSetoran = {
      id: getNextId(setoran),
      santri_id: parseInt(santri_id),
      ustadz: sanitizeInput(ustadz),
      juz: parseInt(juz),
      nama_surat: sanitizeInput(nama_surat),
      ayat_awal: ayatAwal,
      ayat_akhir: ayatAkhir,
      total_ayat: ayatAkhir - ayatAwal + 1,
      tanggal
    };
    setoran.push(newSetoran);
    writeJSON('setoran.json', setoran);
    res.json(newSetoran);
  } catch (error) {
    console.error('Add setoran error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

app.put('/api/setoran/:id', (req, res) => {
  try {
    const setoran = readJSON('setoran.json');
    const index = setoran.findIndex(s => s.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ message: 'Setoran tidak ditemukan' });
    }
    
    const { nama_surat, juz, ayat_awal, ayat_akhir, tanggal, total_ayat } = req.body;
    
    setoran[index] = {
      ...setoran[index],
      nama_surat: sanitizeInput(nama_surat),
      juz: parseInt(juz),
      ayat_awal: parseInt(ayat_awal),
      ayat_akhir: parseInt(ayat_akhir),
      total_ayat: parseInt(total_ayat),
      tanggal
    };
    
    writeJSON('setoran.json', setoran);
    res.json(setoran[index]);
  } catch (error) {
    console.error('Update setoran error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

app.delete('/api/setoran/:id', (req, res) => {
  try {
    const setoran = readJSON('setoran.json');
    const filtered = setoran.filter(s => s.id !== parseInt(req.params.id));
    
    if (setoran.length === filtered.length) {
      return res.status(404).json({ message: 'Setoran tidak ditemukan' });
    }
    
    writeJSON('setoran.json', filtered);
    res.json({ success: true, message: 'Setoran berhasil dihapus' });
  } catch (error) {
    console.error('Delete setoran error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Dashboard Statistics for Ustadz
app.get('/api/dashboard-stats', (req, res) => {
  try {
    const { userId, role } = req.query;
    const santri = readJSON('santri.json');
    const setoran = readJSON('setoran.json');
    
    console.log('Dashboard stats - userId:', userId, 'role:', role);
    console.log('Total santri in DB:', santri.length);
    console.log('Total setoran in DB:', setoran.length);
    
    // Filter santri berdasarkan ustadz
    const mySantri = role === 'admin' 
      ? santri.filter(s => s.aktif)
      : santri.filter(s => s.ustadz_id === parseInt(userId) && s.aktif);
    
    console.log('My santri count:', mySantri.length);
    
    // Filter setoran berdasarkan santri ustadz
    const santriIds = mySantri.map(s => s.id);
    const mySetoran = setoran.filter(s => santriIds.includes(s.santri_id));
    
    console.log('My setoran count:', mySetoran.length);
    
    // Setoran bulan ini
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const setoranBulanIni = mySetoran.filter(s => new Date(s.tanggal) >= firstDayOfMonth);
    
    console.log('Setoran bulan ini:', setoranBulanIni.length);
    
    // Setoran terakhir (5 terakhir)
    const recentSetoran = mySetoran
      .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
      .slice(0, 5)
      .map(s => {
        const santriData = santri.find(st => st.id === s.santri_id);
        return {
          ...s,
          nama_santri: santriData ? santriData.nama : 'Unknown'
        };
      });
    
    // Total ayat bulan ini
    const totalAyatBulanIni = setoranBulanIni.reduce((sum, s) => sum + s.total_ayat, 0);
    
    // Capaian juz tertinggi
    const capaianJuzTertinggi = mySetoran.length > 0 ? Math.max(...mySetoran.map(s => s.juz)) : 0;
    
    res.json({
      totalSantri: mySantri.length,
      totalSetoranBulanIni: setoranBulanIni.length,
      totalAyatBulanIni,
      capaianJuzTertinggi,
      recentSetoran
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan server',
      totalSantri: 0,
      totalSetoranBulanIni: 0,
      totalAyatBulanIni: 0,
      capaianJuzTertinggi: 0,
      recentSetoran: []
    });
  }
});

// Leaderboard API
app.get('/api/leaderboard', (req, res) => {
  try {
    const santri = readJSON('santri.json');
    const setoran = readJSON('setoran.json');
    const users = readJSON('users.json');
    
    // Calculate santri leaderboard
    const santriStats = santri.map(s => {
      const santriSetoran = setoran.filter(set => set.santri_id === s.id);
      const totalSetoran = santriSetoran.length;
      const totalAyat = santriSetoran.reduce((sum, set) => sum + set.total_ayat, 0);
      const ustadz = users.find(u => u.id === s.ustadz_id);
      
      return {
        nama: s.nama,
        ustadz: ustadz ? ustadz.nama : 'Unknown',
        totalSetoran,
        totalAyat
      };
    }).sort((a, b) => b.totalAyat - a.totalAyat).slice(0, 5);
    
    // Calculate ustadz leaderboard
    const ustadzList = users.filter(u => u.role === 'ustadz');
    const ustadzStats = ustadzList.map(u => {
      const ustadzSantri = santri.filter(s => s.ustadz_id === u.id);
      const santriIds = ustadzSantri.map(s => s.id);
      const ustadzSetoran = setoran.filter(s => santriIds.includes(s.santri_id));
      
      return {
        nama: u.nama,
        gender: u.gender || 'L',
        totalSantri: ustadzSantri.length,
        totalSetoran: ustadzSetoran.length,
        totalAyat: ustadzSetoran.reduce((sum, s) => sum + s.total_ayat, 0)
      };
    }).sort((a, b) => b.totalSetoran - a.totalSetoran).slice(0, 5);
    
    res.json({
      topSantri: santriStats,
      topUstadz: ustadzStats
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan server',
      topSantri: [],
      topUstadz: []
    });
  }
});

// Reports
app.post('/api/report', async (req, res) => {
  try {
    const { startDate, endDate, format, ustadzName, userId, role } = req.body;
    
    console.log('Report request:', { startDate, endDate, format, userId, role });
    
    const reportData = calculateReport(startDate, endDate, ustadzName, userId, role);
    
    console.log('Report data count:', reportData.length);

    if (format === 'pdf') {
      const filename = await generatePDF(reportData, startDate, endDate);
      res.json({ success: true, file: `/reports/pdf/${filename}` });
    } else if (format === 'excel') {
      const filename = generateExcel(reportData, startDate, endDate);
      res.json({ success: true, file: `/reports/excel/${filename}` });
    } else {
      res.json({ success: true, data: reportData });
    }
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan saat generate laporan' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Terjadi kesalahan server' });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
