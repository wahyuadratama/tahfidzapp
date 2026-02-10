const express = require('express');
const path = require('path');
const { readJSON, writeJSON, getNextId } = require('./dataUtils');
const { calculateReport } = require('./reportLogic');
const { generatePDF } = require('./pdfGenerator');
const { generateExcel } = require('./excelGenerator');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));
app.use('/reports', express.static('reports'));

// Authentication
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON('users.json');
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({ 
      success: true, 
      nama: user.nama, 
      userId: user.id, 
      role: user.role,
      kepala_tahfidz: user.kepala_tahfidz || null
    });
  } else {
    res.json({ success: false, message: 'Username atau password salah' });
  }
});

app.post('/api/register', (req, res) => {
  const { nama, username, password } = req.body;
  const users = readJSON('users.json');
  
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.json({ success: false, message: 'Username sudah digunakan' });
  }
  
  const newUser = {
    id: getNextId(users),
    username,
    password,
    nama,
    role: 'ustadz'
  };
  
  users.push(newUser);
  writeJSON('users.json', users);
  res.json({ success: true });
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
    role: u.role
  }));
  res.json(safeUsers);
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
  const santri = readJSON('santri.json');
  const newSantri = {
    id: getNextId(santri),
    nama: req.body.nama,
    kelas: req.body.kelas,
    aktif: true,
    ustadz_id: parseInt(req.body.ustadz_id)
  };
  santri.push(newSantri);
  writeJSON('santri.json', santri);
  res.json(newSantri);
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
  const setoran = readJSON('setoran.json');
  const newSetoran = {
    id: getNextId(setoran),
    santri_id: parseInt(req.body.santri_id),
    ustadz: req.body.ustadz,
    juz: parseInt(req.body.juz),
    nama_surat: req.body.nama_surat,
    ayat_awal: parseInt(req.body.ayat_awal),
    ayat_akhir: parseInt(req.body.ayat_akhir),
    total_ayat: parseInt(req.body.ayat_akhir) - parseInt(req.body.ayat_awal) + 1,
    tanggal: req.body.tanggal
  };
  setoran.push(newSetoran);
  writeJSON('setoran.json', setoran);
  res.json(newSetoran);
});

// Dashboard Statistics for Ustadz
app.get('/api/dashboard-stats', (req, res) => {
  const { userId, role } = req.query;
  const santri = readJSON('santri.json');
  const setoran = readJSON('setoran.json');
  
  // Filter santri berdasarkan ustadz
  const mySantri = role === 'admin' ? santri : santri.filter(s => s.ustadz_id === parseInt(userId) && s.aktif);
  
  // Filter setoran berdasarkan santri ustadz
  const santriIds = mySantri.map(s => s.id);
  const mySetoran = setoran.filter(s => santriIds.includes(s.santri_id));
  
  // Setoran bulan ini
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const setoranBulanIni = mySetoran.filter(s => new Date(s.tanggal) >= firstDayOfMonth);
  
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
});

// Reports
app.post('/api/report', async (req, res) => {
  const { startDate, endDate, format, ustadzName, userId, role } = req.body;
  const reportData = calculateReport(startDate, endDate, ustadzName, userId, role);

  if (format === 'pdf') {
    const filename = await generatePDF(reportData, startDate, endDate);
    res.json({ success: true, file: `/reports/pdf/${filename}` });
  } else if (format === 'excel') {
    const filename = generateExcel(reportData, startDate, endDate);
    res.json({ success: true, file: `/reports/excel/${filename}` });
  } else {
    res.json({ success: true, data: reportData });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
