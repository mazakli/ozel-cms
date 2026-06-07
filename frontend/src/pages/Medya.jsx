import { useEffect, useState, useRef } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function Medya() {
  const [medya, setMedya] = useState([]);
  const [markalar, setMarkalar] = useState([]);
  const [seciliMarka, setSeciliMarka] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [surukle, setSurukle] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    api.get('/markalar').then(r => setMarkalar(r.data));
    yukle();
  }, [seciliMarka]);

  const yukle = () => {
    const params = seciliMarka ? `?marka_id=${seciliMarka}` : '';
    api.get(`/medya${params}`).then(r => setMedya(r.data));
  };

  const dosyaYukle = async (dosyalar) => {
    if (!dosyalar.length) return;
    setYukleniyor(true);
    let basarili = 0;
    for (const dosya of dosyalar) {
      const fd = new FormData();
      fd.append('dosya', dosya);
      if (seciliMarka) fd.append('marka_id', seciliMarka);
      try {
        await api.post('/medya/yukle', fd);
        basarili++;
      } catch { toast.error(`${dosya.name} yüklenemedi`); }
    }
    if (basarili > 0) toast.success(`${basarili} dosya yüklendi`);
    setYukleniyor(false);
    yukle();
  };

  const sil = async (id) => {
    if (!confirm('Bu medyayı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/medya/${id}`);
      toast.success('Silindi');
      yukle();
    } catch { toast.error('Silinemedi'); }
  };

  const kopyala = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('URL kopyalandı');
  };

  return (
    <div>
      <div style={styles.ust}>
        <h1 style={styles.baslik}>Medya Kütüphanesi</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <select style={styles.select} value={seciliMarka} onChange={e => setSeciliMarka(e.target.value)}>
            <option value="">Tüm Markalar</option>
            {markalar.map(m => <option key={m.id} value={m.id}>{m.ad}</option>)}
          </select>
          <button onClick={() => inputRef.current.click()} style={styles.yukleBtn}>
            {yukleniyor ? 'Yükleniyor...' : '+ Dosya Yükle'}
          </button>
          <input ref={inputRef} type="file" multiple accept="image/*,video/*" onChange={e => dosyaYukle([...e.target.files])} style={{ display: 'none' }} />
        </div>
      </div>

      {/* Sürükle bırak alanı */}
      <div
        style={{ ...styles.surukleAlan, borderColor: surukle ? '#6366f1' : '#e2e8f0', background: surukle ? '#ede9fe' : '#f8fafc' }}
        onDragOver={e => { e.preventDefault(); setSurukle(true); }}
        onDragLeave={() => setSurukle(false)}
        onDrop={e => { e.preventDefault(); setSurukle(false); dosyaYukle([...e.dataTransfer.files]); }}
        onClick={() => inputRef.current.click()}
      >
        <div style={styles.surukleIkon}>🖼️</div>
        <p style={styles.surukleMetin}>Dosyaları buraya sürükleyin veya tıklayın</p>
        <p style={styles.surukleAlt}>JPG, PNG, GIF, WebP, MP4 — Maks. 50MB</p>
      </div>

      {/* Medya Grid */}
      <div style={styles.grid}>
        {medya.map(m => (
          <div key={m.id} style={styles.kart}>
            {m.tur === 'gorsel' ? (
              <img src={m.url} alt={m.dosya_adi} style={styles.gorsel} />
            ) : (
              <div style={styles.videoOnizleme}>🎬</div>
            )}
            <div style={styles.kartAlt}>
              <div style={styles.dosyaAdi}>{m.dosya_adi.substring(0, 20)}...</div>
              <div style={styles.butonlar}>
                <button onClick={() => kopyala(m.url)} style={styles.kopyaBtn} title="URL Kopyala">📋</button>
                <button onClick={() => sil(m.id)} style={styles.silBtn} title="Sil">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {medya.length === 0 && <div style={styles.bos}>Henüz medya yüklenmedi</div>}
    </div>
  );
}

const styles = {
  ust: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  baslik: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 },
  select: { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14 },
  yukleBtn: { padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 },
  surukleAlan: { border: '2px dashed', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer', marginBottom: 24, transition: 'all 0.2s' },
  surukleIkon: { fontSize: 36, marginBottom: 8 },
  surukleMetin: { fontSize: 15, fontWeight: 500, color: '#374151', margin: '0 0 4px' },
  surukleAlt: { fontSize: 13, color: '#94a3b8', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 },
  kart: { background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' },
  gorsel: { width: '100%', height: 130, objectFit: 'cover', display: 'block' },
  videoOnizleme: { height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', fontSize: 40 },
  kartAlt: { padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dosyaAdi: { fontSize: 11, color: '#64748b', flex: 1, overflow: 'hidden' },
  butonlar: { display: 'flex', gap: 4 },
  kopyaBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 2 },
  silBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 2 },
  bos: { textAlign: 'center', padding: 60, color: '#94a3b8' },
};
