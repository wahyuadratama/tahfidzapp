const { readJSON } = require('./dataUtils');

function calculateReport(startDate, endDate, ustadzName, userId, role) {
  const santriList = readJSON('santri.json');
  const setoranList = readJSON('setoran.json');
  const usersList = readJSON('users.json');

  console.log('Calculate report - Total santri:', santriList.length);
  console.log('Calculate report - Total setoran:', setoranList.length);
  console.log('Calculate report - Date range:', startDate, 'to', endDate);
  console.log('Calculate report - Role:', role, 'UserId:', userId);

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Filter santri berdasarkan role
  let filteredSantri = santriList.filter(s => s.aktif);
  if (role !== 'admin') {
    filteredSantri = filteredSantri.filter(s => s.ustadz_id === parseInt(userId));
  }
  
  console.log('Filtered santri count:', filteredSantri.length);

  const report = filteredSantri
    .map(santri => {
      const setoranSantri = setoranList.filter(setoran => {
        const tanggal = new Date(setoran.tanggal);
        return setoran.santri_id === santri.id && tanggal >= start && tanggal <= end;
      });
      
      console.log(`Santri ${santri.nama} - Setoran count:`, setoranSantri.length);

      const totalAyat = setoranSantri.reduce((sum, s) => sum + s.total_ayat, 0);
      const capaianJuz = setoranSantri.length > 0 ? Math.max(...setoranSantri.map(s => s.juz)) : 0;
      
      // Ambil nama ustadz dari users berdasarkan ustadz_id santri
      const ustadzData = usersList.find(u => u.id === santri.ustadz_id);
      const ustadzPendamping = ustadzData ? ustadzData.nama : '-';
      
      // Kumpulkan semua surat yang unik
      const suratList = [];
      const suratMap = {};
      
      setoranSantri.forEach(setoran => {
        const suratKey = setoran.nama_surat.toLowerCase();
        if (!suratMap[suratKey]) {
          suratMap[suratKey] = {
            nama: setoran.nama_surat,
            ayatRanges: [],
            totalAyat: 0
          };
        }
        suratMap[suratKey].ayatRanges.push(`${setoran.ayat_awal}-${setoran.ayat_akhir}`);
        suratMap[suratKey].totalAyat += setoran.total_ayat;
      });
      
      // Format surat list
      Object.values(suratMap).forEach(surat => {
        suratList.push({
          nama: surat.nama,
          ayatRange: surat.ayatRanges.join(', '),
          totalAyat: surat.totalAyat
        });
      });
      
      // Untuk backward compatibility, ambil info surat pertama atau gabungan
      let namaSurat = '-';
      let ayatRange = '-';
      
      if (suratList.length === 1) {
        namaSurat = suratList[0].nama;
        ayatRange = suratList[0].ayatRange;
      } else if (suratList.length > 1) {
        namaSurat = suratList.map(s => s.nama).join(', ');
        ayatRange = 'Multiple';
      }

      return {
        nama: santri.nama,
        ustadz: ustadzPendamping,
        ustadz_id: santri.ustadz_id,
        totalAyat,
        capaianJuz,
        namaSurat,
        ayatRange,
        suratList // Array detail per surat
      };
    })
    .filter(r => r.totalAyat > 0);
  
  console.log('Final report count:', report.length);

  // Jika admin, urutkan berdasarkan nama ustadz
  if (role === 'admin') {
    report.sort((a, b) => a.ustadz.localeCompare(b.ustadz));
  }

  return report;
}

module.exports = { calculateReport };
