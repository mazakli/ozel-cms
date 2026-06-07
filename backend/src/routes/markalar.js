const router = require('express').Router();
const pool = require('../db/pool');
const { authMiddleware, superadmin } = require('../middleware/auth');

// Tüm markalar
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM markalar ORDER BY ad');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Marka getir
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM markalar WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ hata: 'Marka bulunamadı' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Marka oluştur (sadece superadmin)
router.post('/', authMiddleware, superadmin, async (req, res) => {
  const { ad, slug, logo_url, renk } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO markalar (ad, slug, logo_url, renk) VALUES ($1, $2, $3, $4) RETURNING *',
      [ad, slug, logo_url, renk]
    );
    // Otomatik ayarlar kaydı oluştur
    await pool.query('INSERT INTO ayarlar (marka_id, site_adi) VALUES ($1, $2)', [rows[0].id, ad]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Marka güncelle
router.put('/:id', authMiddleware, superadmin, async (req, res) => {
  const { ad, slug, logo_url, renk, aktif } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE markalar SET ad=$1, slug=$2, logo_url=$3, renk=$4, aktif=$5, guncellendi=NOW() WHERE id=$6 RETURNING *',
      [ad, slug, logo_url, renk, aktif, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

module.exports = router;
