const router = require('express').Router();
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

// Marka yetkisi kontrolü
const markaYetkisi = (req) => {
  if (req.kullanici.rol === 'superadmin') return true;
  return req.kullanici.marka_id === parseInt(req.params.markaId || req.body.marka_id);
};

// İçerikleri listele
router.get('/', authMiddleware, async (req, res) => {
  const { marka_id, tur, durum, sayfa = 1, limit = 20 } = req.query;
  const offset = (sayfa - 1) * limit;

  let where = [];
  let params = [];
  let idx = 1;

  if (marka_id) { where.push(`marka_id = $${idx++}`); params.push(marka_id); }
  else if (req.kullanici.rol !== 'superadmin') {
    where.push(`marka_id = $${idx++}`); params.push(req.kullanici.marka_id);
  }
  if (tur) { where.push(`tur = $${idx++}`); params.push(tur); }
  if (durum) { where.push(`durum = $${idx++}`); params.push(durum); }

  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

  try {
    const { rows } = await pool.query(
      `SELECT i.*, m.ad as marka_adi FROM icerikler i
       LEFT JOIN markalar m ON i.marka_id = m.id
       ${whereStr} ORDER BY i.olusturuldu DESC LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );
    const { rows: count } = await pool.query(
      `SELECT COUNT(*) FROM icerikler ${whereStr}`, params
    );
    res.json({ icerikler: rows, toplam: parseInt(count[0].count), sayfa: parseInt(sayfa) });
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Tek içerik
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT i.*, m.ad as marka_adi FROM icerikler i LEFT JOIN markalar m ON i.marka_id = m.id WHERE i.id = $1',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ hata: 'İçerik bulunamadı' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// İçerik oluştur
router.post('/', authMiddleware, async (req, res) => {
  const { marka_id, tur, baslik, slug, icerik, ozet, meta_aciklama, gorsel_url, ekstra, sira, durum } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO icerikler (marka_id, tur, baslik, slug, icerik, ozet, meta_aciklama, gorsel_url, ekstra, sira, durum, yayinlandi)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [marka_id, tur, baslik, slug, icerik, ozet, meta_aciklama, gorsel_url,
       JSON.stringify(ekstra || {}), sira || 0, durum || 'taslak',
       durum === 'yayinda' ? new Date() : null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// İçerik güncelle
router.put('/:id', authMiddleware, async (req, res) => {
  const { baslik, slug, icerik, ozet, meta_aciklama, gorsel_url, ekstra, sira, durum } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE icerikler SET baslik=$1, slug=$2, icerik=$3, ozet=$4, meta_aciklama=$5,
       gorsel_url=$6, ekstra=$7, sira=$8, durum=$9,
       yayinlandi = CASE WHEN $9='yayinda' AND yayinlandi IS NULL THEN NOW() ELSE yayinlandi END,
       guncellendi=NOW() WHERE id=$10 RETURNING *`,
      [baslik, slug, icerik, ozet, meta_aciklama, gorsel_url,
       JSON.stringify(ekstra || {}), sira || 0, durum || 'taslak', req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// İçerik sil
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM icerikler WHERE id = $1', [req.params.id]);
    res.json({ mesaj: 'Silindi' });
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

module.exports = router;
