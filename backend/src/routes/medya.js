const router = require('express').Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const izinliler = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'application/pdf'];
    cb(null, izinliler.includes(file.mimetype));
  },
});

// Medya yükle
router.post('/yukle', authMiddleware, upload.single('dosya'), async (req, res) => {
  if (!req.file) return res.status(400).json({ hata: 'Dosya seçilmedi' });
  const { marka_id } = req.body;

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: `cms/${marka_id || 'genel'}`, resource_type: 'auto' },
        (err, result) => err ? reject(err) : resolve(result)
      ).end(req.file.buffer);
    });

    const tur = req.file.mimetype.startsWith('image') ? 'gorsel' :
                req.file.mimetype.startsWith('video') ? 'video' : 'dosya';

    const { rows } = await pool.query(
      `INSERT INTO medyalar (marka_id, dosya_adi, url, cloudinary_id, tur, boyut, genislik, yukseklik)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [marka_id || null, req.file.originalname, result.secure_url, result.public_id,
       tur, req.file.size, result.width || null, result.height || null]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Medya listele
router.get('/', authMiddleware, async (req, res) => {
  const { marka_id, tur } = req.query;
  let where = [];
  let params = [];
  let idx = 1;

  if (marka_id) { where.push(`marka_id = $${idx++}`); params.push(marka_id); }
  if (tur) { where.push(`tur = $${idx++}`); params.push(tur); }

  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
  try {
    const { rows } = await pool.query(
      `SELECT * FROM medyalar ${whereStr} ORDER BY olusturuldu DESC LIMIT 100`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Medya sil
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT cloudinary_id FROM medyalar WHERE id = $1', [req.params.id]);
    if (rows[0]?.cloudinary_id) {
      await cloudinary.uploader.destroy(rows[0].cloudinary_id);
    }
    await pool.query('DELETE FROM medyalar WHERE id = $1', [req.params.id]);
    res.json({ mesaj: 'Silindi' });
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

module.exports = router;
