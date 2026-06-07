const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ hata: 'Token gerekli' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT id, ad, email, rol, marka_id FROM kullanicilar WHERE id = $1 AND aktif = true',
      [decoded.id]
    );
    if (!rows[0]) return res.status(401).json({ hata: 'Geçersiz token' });
    req.kullanici = rows[0];
    next();
  } catch {
    res.status(401).json({ hata: 'Geçersiz token' });
  }
};

const superadmin = (req, res, next) => {
  if (req.kullanici.rol !== 'superadmin') {
    return res.status(403).json({ hata: 'Yetersiz yetki' });
  }
  next();
};

module.exports = { authMiddleware, superadmin };
