// Public API - web siteleri bu endpointlerden içerik çeker (token gerekmez)
const router = require('express').Router();
const pool = require('../db/pool');

// Marka içeriklerini getir
router.get('/:markaSlug/icerikler', async (req, res) => {
  const { tur } = req.query;
  try {
    const { rows: marka } = await pool.query('SELECT id FROM markalar WHERE slug = $1', [req.params.markaSlug]);
    if (!marka[0]) return res.status(404).json({ hata: 'Marka bulunamadı' });

    let query = `SELECT * FROM icerikler WHERE marka_id = $1 AND durum = 'yayinda'`;
    const params = [marka[0].id];
    if (tur) { query += ` AND tur = $2`; params.push(tur); }
    query += ` ORDER BY sira ASC, yayinlandi DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Tek içerik slug ile
router.get('/:markaSlug/icerik/:slug', async (req, res) => {
  try {
    const { rows: marka } = await pool.query('SELECT id FROM markalar WHERE slug = $1', [req.params.markaSlug]);
    if (!marka[0]) return res.status(404).json({ hata: 'Marka bulunamadı' });

    const { rows } = await pool.query(
      `SELECT * FROM icerikler WHERE marka_id = $1 AND slug = $2 AND durum = 'yayinda'`,
      [marka[0].id, req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ hata: 'İçerik bulunamadı' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Marka ayarları
router.get('/:markaSlug/ayarlar', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.* FROM ayarlar a JOIN markalar m ON a.marka_id = m.id WHERE m.slug = $1`,
      [req.params.markaSlug]
    );
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

module.exports = router;
