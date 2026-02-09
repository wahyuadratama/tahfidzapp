const XLSX = require('xlsx');
const path = require('path');

function generateExcel(reportData, startDate, endDate) {
  const worksheetData = [
    ['LEMBAGA TAHFIDZ AL-QUR\'AN'],
    ['PONDOK PESANTREN MODERN DARUL MUKHLISIN'],
    ['LAPORAN SETORAN TAHFIDZ'],
    [`Periode: ${startDate} – ${endDate}`],
    [],
    ['No', 'Nama Santri', 'Ustadz Pendamping', 'Total Ayat', 'Capaian Juz']
  ];

  reportData.forEach((row, idx) => {
    worksheetData.push([
      idx + 1,
      row.nama,
      row.ustadz,
      row.totalAyat,
      row.capaianJuz
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap');

  const filename = `laporan_${Date.now()}.xlsx`;
  const filepath = path.join(__dirname, 'reports', 'excel', filename);
  
  XLSX.writeFile(workbook, filepath);
  return filename;
}

module.exports = { generateExcel };
