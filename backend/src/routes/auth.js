const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

// Giriş
router.post('/giris', async (req, res) => {
  const { email, sifre } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM kullanicilar WHERE email = $1 AND aktif = true',
      [email]
    );
    const kullanici = rows[0];
    if (!kullanici || !(await bcrypt.compare(sifre, kullanici.sifre))) {
      return res.status(401).json({ hata: 'Email veya şifre hatalı' });
    }
    const token = jwt.sign(
      { id: kullanici.id, rol: kullanici.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      kullanici: {
        id: kullanici.id,
        ad: kullanici.ad,
        email: kullanici.email,
        rol: kullanici.rol,
        marka_id: kullanici.marka_id,
      },
    });
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

// Mevcut kullanıcı
router.get('/ben', authMiddleware, (req, res) => {
  res.json(req.kullanici);
});

// Şifre değiştir
router.put('/sifre', authMiddleware, async (req, res) => {
  const { eski_sifre, yeni_sifre } = req.body;
  try {
    const { rows } = await pool.query('SELECT sifre FROM kullanicilar WHERE id = $1', [req.kullanici.id]);
    if (!(await bcrypt.compare(eski_sifre, rows[0].sifre))) {
      return res.status(400).json({ hata: 'Eski şifre hatalı' });
    }
    const hash = await bcrypt.hash(yeni_sifre, 10);
    await pool.query('UPDATE kullanicilar SET sifre = $1 WHERE id = $2', [hash, req.kullanici.id]);
    res.json({ mesaj: 'Şifre güncellendi' });
  } catch (err) {
    res.status(500).json({ hata: err.message });
  }
});

module.exports = router;
