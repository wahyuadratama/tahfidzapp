const puppeteer = require('puppeteer');
const path = require('path');

async function generatePDF(reportData, startDate, endDate) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const today = new Date().toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h2 { margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    th { background-color: #f0f0f0; font-weight: bold; }
    .footer { margin-top: 50px; }
    .signature { margin-top: 60px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h2>LEMBAGA TAHFIDZ AL-QUR'AN</h2>
    <h2>PONDOK PESANTREN MODERN DARUL MUKHLISIN</h2>
    <h2> Kulliyatul Mu'allimin Al-Islamiyah</h2>
    <h3>LAPORAN SETORAN TAHFIDZ</h3>
    <p>Periode: ${startDate} – ${endDate}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>No</th>
        <th>Nama Santri</th>
        <th>Ustadz Pendamping</th>
        <th>Total Ayat</th>
        <th>Capaian Juz</th>
      </tr>
    </thead>
    <tbody>
      ${reportData.map((row, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${row.nama}</td>
          <td>${row.ustadz}</td>
          <td>${row.totalAyat}</td>
          <td>${row.capaianJuz}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Mengetahui,<br>Ustadz Pendamping</p>
    <div class="signature">
      <p>(____________________)</p>
    </div>
    <p>Tanggal Cetak: ${today}</p>
  </div>
</body>
</html>
  `;

  await page.setContent(html);
  
  const filename = `laporan_${Date.now()}.pdf`;
  const filepath = path.join(__dirname, 'reports', 'pdf', filename);
  
  await page.pdf({
    path: filepath,
    format: 'A4',
    printBackground: true
  });

  await browser.close();
  return filename;
}

module.exports = { generatePDF };
