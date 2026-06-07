const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Veritabanı tabloları oluşturuluyor...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS markalar (
        id SERIAL PRIMARY KEY,
        ad VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        logo_url TEXT,
        renk VARCHAR(7) DEFAULT '#000000',
        aktif BOOLEAN DEFAULT true,
        olusturuldu TIMESTAMP DEFAULT NOW(),
        guncellendi TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS kullanicilar (
        id SERIAL PRIMARY KEY,
        ad VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        sifre TEXT NOT NULL,
        rol VARCHAR(50) DEFAULT 'editor',
        marka_id INTEGER REFERENCES markalar(id),
        aktif BOOLEAN DEFAULT true,
        olusturuldu TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS icerikler (
        id SERIAL PRIMARY KEY,
        marka_id INTEGER REFERENCES markalar(id) NOT NULL,
        tur VARCHAR(100) NOT NULL,
        baslik VARCHAR(500) NOT NULL,
        slug VARCHAR(500),
        icerik TEXT,
        ozet TEXT,
        meta_aciklama TEXT,
        gorsel_url TEXT,
        ekstra JSONB DEFAULT '{}',
        sira INTEGER DEFAULT 0,
        durum VARCHAR(20) DEFAULT 'taslak',
        yayinlandi TIMESTAMP,
        olusturuldu TIMESTAMP DEFAULT NOW(),
        guncellendi TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS medyalar (
        id SERIAL PRIMARY KEY,
        marka_id INTEGER REFERENCES markalar(id),
        dosya_adi VARCHAR(500) NOT NULL,
        url TEXT NOT NULL,
        cloudinary_id TEXT,
        tur VARCHAR(50) NOT NULL,
        boyut INTEGER,
        genislik INTEGER,
        yukseklik INTEGER,
        olusturuldu TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ayarlar (
        id SERIAL PRIMARY KEY,
        marka_id INTEGER REFERENCES markalar(id) UNIQUE NOT NULL,
        site_adi VARCHAR(255),
        site_aciklama TEXT,
        logo_url TEXT,
        favicon_url TEXT,
        iletisim_email VARCHAR(255),
        iletisim_telefon VARCHAR(50),
        adres TEXT,
        sosyal_medya JSONB DEFAULT '{}',
        ekstra JSONB DEFAULT '{}',
        guncellendi TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Tablolar başarıyla oluşturuldu!');

    // Varsayılan admin kullanıcısı
    const bcrypt = require('bcryptjs');
    const sifre = await bcrypt.hash('admin123', 10);

    await client.query(`
      INSERT INTO kullanicilar (ad, email, sifre, rol)
      VALUES ('Admin', 'admin@cms.com', $1, 'superadmin')
      ON CONFLICT (email) DO NOTHING;
    `, [sifre]);

    console.log('✅ Varsayılan admin oluşturuldu: admin@cms.com / admin123');
    console.log('⚠️  Giriş yaptıktan sonra şifreyi değiştirin!');

  } catch (err) {
    console.error('Hata:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
