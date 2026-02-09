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
    res.json({ success: true, nama: user.nama });
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
    nama
  };
  
  users.push(newUser);
  writeJSON('users.json', users);
  res.json({ success: true });
});

// Santri CRUD
app.get('/api/santri', (req, res) => {
  const santri = readJSON('santri.json');
  res.json(santri);
});

app.post('/api/santri', (req, res) => {
  const santri = readJSON('santri.json');
  const newSantri = {
    id: getNextId(santri),
    nama: req.body.nama,
    kelas: req.body.kelas,
    aktif: true
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

// Reports
app.post('/api/report', async (req, res) => {
  const { startDate, endDate, format, ustadzName } = req.body;
  const reportData = calculateReport(startDate, endDate, ustadzName);

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
