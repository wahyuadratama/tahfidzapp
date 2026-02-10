const puppeteer = require('puppeteer');
const path = require('path');

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

function generateGroupedTables(reportData) {
  const grouped = groupByUstadz(reportData);
  let html = '';
  let globalNo = 1;
  
  Object.keys(grouped).sort().forEach(ustadzName => {
    const santriList = grouped[ustadzName];
    html += `
      <div class="ustadz-section">
        <div class="ustadz-header">Ustadz Pendamping: ${ustadzName}</div>
        <table>
          <thead>
            <tr>
              <th width="6%">No</th>
              <th width="25%">Nama Santri</th>
              <th width="20%">Nama Surat</th>
              <th width="12%">Ayat</th>
              <th width="12%">Total Ayat</th>
              <th width="12%">Capaian Juz</th>
            </tr>
          </thead>
          <tbody>
            ${santriList.map((row) => `
              <tr>
                <td>${globalNo++}</td>
                <td>${row.nama}</td>
                <td>${row.namaSurat}</td>
                <td>${row.ayatRange}</td>
                <td>${row.totalAyat}</td>
                <td>${row.capaianJuz}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  });
  
  return html;
}

async function generatePDF(reportData, startDate, endDate) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const today = new Date().toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Get Kepala Tahfidz name from admin user
  const fs = require('fs');
  const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf8'));
  const admin = usersData.find(u => u.role === 'admin');
  const kepalaNama = admin && admin.kepala_tahfidz ? admin.kepala_tahfidz : 'Kepala Lembaga Tahfidz';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h2 { margin: 5px 0; }
    .ustadz-section { margin-bottom: 30px; page-break-inside: avoid; }
    .ustadz-header { 
      background: #00B7B5; 
      color: white; 
      padding: 10px 15px; 
      margin: 20px 0 10px 0;
      font-weight: bold;
      font-size: 14px;
    }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
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
    <h3>Kulliyatul Mu'allimin Al-Islamiyah</h3>
    <h3>LAPORAN SETORAN TAHFIDZ</h3>
    <p>Periode: ${startDate} – ${endDate}</p>
  </div>

  ${generateGroupedTables(reportData)}

  <div class="footer">
    <p>Mengetahui,<br>Kepala Lembaga Tahfidz</p>
    <div class="signature">
      <p><strong><u>${kepalaNama}</u></strong></p>
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
