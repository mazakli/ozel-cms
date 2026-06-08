const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function smMigrate() {
  const client = await pool.connect();
  try {
    console.log('Sosyal medya tabloları oluşturuluyor...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS sm_hesaplar (
        id SERIAL PRIMARY KEY,
        marka_id INTEGER REFERENCES markalar(id) ON DELETE CASCADE,
        platform VARCHAR(50) NOT NULL,
        hesap_adi VARCHAR(255),
        hesap_id TEXT,
        erisim_token TEXT,
        yenileme_token TEXT,
        token_bitis TIMESTAMP,
        sayfa_id TEXT,
        sayfa_adi TEXT,
        profil_resim TEXT,
        ekstra JSONB DEFAULT '{}',
        aktif BOOLEAN DEFAULT true,
        olusturuldu TIMESTAMP DEFAULT NOW(),
        guncellendi TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sm_postlar (
        id SERIAL PRIMARY KEY,
        marka_id INTEGER REFERENCES markalar(id) ON DELETE CASCADE,
        baslik VARCHAR(500),
        metin TEXT NOT NULL,
        gorsel_url TEXT,
        gorsel_cloudinary_id TEXT,
        link_url TEXT,
        hashtag TEXT,
        platformlar TEXT[] DEFAULT '{}',
        boyut_turu VARCHAR(50) DEFAULT 'kare',
        durum VARCHAR(50) DEFAULT 'taslak',
        zamanla TIMESTAMP,
        platform_sonuclar JSONB DEFAULT '{}',
        hata_log TEXT,
        olusturan INTEGER REFERENCES kullanicilar(id),
        olusturuldu TIMESTAMP DEFAULT NOW(),
        guncellendi TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS instagram_highlights (
        id SERIAL PRIMARY KEY,
        marka_id INTEGER REFERENCES markalar(id) ON DELETE CASCADE,
        sm_hesap_id INTEGER REFERENCES sm_hesaplar(id) ON DELETE CASCADE,
        platform_highlight_id TEXT,
        baslik VARCHAR(255) NOT NULL,
        kapak_gorsel_url TEXT,
        kapak_cloudinary_id TEXT,
        renk VARCHAR(7) DEFAULT '#6366f1',
        sira INTEGER DEFAULT 0,
        aktif BOOLEAN DEFAULT true,
        olusturuldu TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_sm_hesaplar_marka ON sm_hesaplar(marka_id);
      CREATE INDEX IF NOT EXISTS idx_sm_postlar_marka ON sm_postlar(marka_id);
      CREATE INDEX IF NOT EXISTS idx_sm_postlar_durum ON sm_postlar(durum);
      CREATE INDEX IF NOT EXISTS idx_sm_postlar_zamanla ON sm_postlar(zamanla);
    `);

    console.log('✅ Sosyal medya tabloları oluşturuldu!');
  } catch (err) {
    console.error('Hata:', err);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

smMigrate();
