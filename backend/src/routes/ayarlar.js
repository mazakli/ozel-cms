const router = require('express').Router();
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

// Ayarları getir
router.get('/:marka_id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM ayarlar WHERE marka_id = $1', [req.params.marka_id]);
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Ayarları güncelle
router.put('/:marka_id', authMiddleware, async (req, res) => {
  const { site_adi, site_aciklama, logo_url, favicon_url, iletisim_email, iletisim_telefon, adres, sosyal_medya, ekstra } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO ayarlar (marka_id, site_adi, site_aciklama, logo_url, favicon_url, iletisim_email, iletisim_telefon, adres, sosyal_medya, ekstra)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (marka_id) DO UPDATE SET
         site_adi=$2, site_aciklama=$3, logo_url=$4, favicon_url=$5,
         iletisim_email=$6, iletisim_telefon=$7, adres=$8,
         sosyal_medya=$9, ekstra=$10, guncellendi=NOW()
       RETURNING *`,
      [req.params.marka_id, site_adi, site_aciklama, logo_url, favicon_url,
       iletisim_email, iletisim_telefon, adres,
       JSON.stringify(sosyal_medya || {}), JSON.stringify(ekstra || {})]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

module.exports = router;
