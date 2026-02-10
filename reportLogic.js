const { readJSON } = require('./dataUtils');

function calculateReport(startDate, endDate, ustadzName, userId, role) {
  const santriList = readJSON('santri.json');
  const setoranList = readJSON('setoran.json');
  const usersList = readJSON('users.json');

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Filter santri berdasarkan role
  let filteredSantri = santriList.filter(s => s.aktif);
  if (role !== 'admin') {
    filteredSantri = filteredSantri.filter(s => s.ustadz_id === parseInt(userId));
  }

  const report = filteredSantri
    .map(santri => {
      const setoranSantri = setoranList.filter(setoran => {
        const tanggal = new Date(setoran.tanggal);
        return setoran.santri_id === santri.id && tanggal >= start && tanggal <= end;
      });

      const totalAyat = setoranSantri.reduce((sum, s) => sum + s.total_ayat, 0);
      const capaianJuz = setoranSantri.length > 0 ? Math.max(...setoranSantri.map(s => s.juz)) : 0;
      
      // Ambil nama ustadz dari users berdasarkan ustadz_id santri
      const ustadzData = usersList.find(u => u.id === santri.ustadz_id);
      const ustadzPendamping = ustadzData ? ustadzData.nama : '-';
      
      // Ambil detail surat terakhir
      const lastSetoran = setoranSantri.length > 0 ? setoranSantri[setoranSantri.length - 1] : null;
      const namaSurat = lastSetoran ? lastSetoran.nama_surat : '-';
      const ayatRange = lastSetoran ? `${lastSetoran.ayat_awal}-${lastSetoran.ayat_akhir}` : '-';

      return {
        nama: santri.nama,
        ustadz: ustadzPendamping,
        ustadz_id: santri.ustadz_id,
        totalAyat,
        capaianJuz,
        namaSurat,
        ayatRange
      };
    })
    .filter(r => r.totalAyat > 0);

  // Jika admin, urutkan berdasarkan nama ustadz
  if (role === 'admin') {
    report.sort((a, b) => a.ustadz.localeCompare(b.ustadz));
  }

  return report;
}

module.exports = { calculateReport };
