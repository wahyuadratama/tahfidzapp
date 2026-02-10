const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

function groupByUstadz(reportData) {
  const grouped = {};
  reportData.forEach(row => {
    if (!grouped[row.ustadz]) {
      grouped[row.ustadz] = [];
    }
    grouped[row.ustadz].push(row);
  });
  return grouped;
}

function generateExcel(reportData, startDate, endDate) {
  // Get Kepala Tahfidz name from admin user
  const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf8'));
  const admin = usersData.find(u => u.role === 'admin');
  const kepalaNama = admin && admin.kepala_tahfidz ? admin.kepala_tahfidz : 'Kepala Lembaga Tahfidz';
  
  const grouped = groupByUstadz(reportData);
  const worksheetData = [
    ['LEMBAGA TAHFIDZ AL-QUR\'AN'],
    ['PONDOK PESANTREN MODERN DARUL MUKHLISIN'],
    ['LAPORAN SETORAN TAHFIDZ'],
    [`Periode: ${startDate} – ${endDate}`],
    []
  ];

  let globalNo = 1;
  Object.keys(grouped).sort().forEach(ustadzName => {
    const santriList = grouped[ustadzName];
    
    worksheetData.push([`Ustadz Pendamping: ${ustadzName}`]);
    worksheetData.push(['No', 'Nama Santri', 'Nama Surat', 'Ayat', 'Total Ayat', 'Capaian Juz']);
    
    santriList.forEach((row) => {
      worksheetData.push([
        globalNo++,
        row.nama,
        row.namaSurat,
        row.ayatRange,
        row.totalAyat,
        row.capaianJuz
      ]);
    });
    
    worksheetData.push([]);
  });
  
  // Add footer
  worksheetData.push([]);
  worksheetData.push(['Mengetahui,']);
  worksheetData.push(['Kepala Lembaga Tahfidz']);
  worksheetData.push([]);
  worksheetData.push([kepalaNama]);

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap');

  const filename = `laporan_${Date.now()}.xlsx`;
  const filepath = path.join(__dirname, 'reports', 'excel', filename);
  
  XLSX.writeFile(workbook, filepath);
  return filename;
}

module.exports = { generateExcel };
