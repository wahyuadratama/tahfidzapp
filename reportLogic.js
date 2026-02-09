const { readJSON } = require('./dataUtils');

function calculateReport(startDate, endDate, ustadzName) {
  const santriList = readJSON('santri.json');
  const setoranList = readJSON('setoran.json');

  const start = new Date(startDate);
  const end = new Date(endDate);

  const report = santriList
    .filter(s => s.aktif)
    .map(santri => {
      const setoranSantri = setoranList.filter(setoran => {
        const tanggal = new Date(setoran.tanggal);
        return setoran.santri_id === santri.id && tanggal >= start && tanggal <= end;
      });

      const totalAyat = setoranSantri.reduce((sum, s) => sum + s.total_ayat, 0);
      const capaianJuz = setoranSantri.length > 0 ? Math.max(...setoranSantri.map(s => s.juz)) : 0;

      return {
        nama: santri.nama,
        ustadz: ustadzName || '-',
        totalAyat,
        capaianJuz
      };
    })
    .filter(r => r.totalAyat > 0);

  return report;
}

module.exports = { calculateReport };
