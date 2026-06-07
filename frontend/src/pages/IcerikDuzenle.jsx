import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

const TURLER = ['slider', 'blog', 'duyuru', 'intro', 'sayac', 'misyon', 'cta', 'sayfa', 'proje', 'hakkimizda', 'iletisim', 'galeri'];

export default function IcerikDuzenle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const yeni = id === 'yeni';

  const [form, setForm] = useState({
    marka_id: '', tur: 'blog', baslik: '', slug: '', icerik: '', ozet: '',
    meta_aciklama: '', gorsel_url: '', sira: 0, durum: 'taslak', ekstra: {},
  });
  const [markalar, setMarkalar] = useState([]);
  const [medya, setMedya] = useState([]);
  const [medyaAc, setMedyaAc] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [dosyaYukleniyor, setDosyaYukleniyor] = useState(false);

  useEffect(() => {
    api.get('/markalar').then(r => setMarkalar(r.data));
    if (!yeni) {
      api.get(`/icerikler/${id}`).then(r => setForm(r.data));
    }
  }, [id]);

  const medyaYukle = () => {
    api.get('/medya').then(r => setMedya(r.data));
    setMedyaAc(true);
  };

  const dosyaYukle = async (e) => {
    const dosya = e.target.files[0];
    if (!dosya) return;
    setDosyaYukleniyor(true);
    const fd = new FormData();
    fd.append('dosya', dosya);
    fd.append('marka_id', form.marka_id);
    try {
      const r = await api.post('/medya/yukle', fd);
      setForm({ ...form, gorsel_url: r.data.url });
      toast.success('Görsel yüklendi');
    } catch { toast.error('Yükleme hatası'); }
    finally { setDosyaYukleniyor(false); }
  };

  const kaydet = async (durum) => {
    setYukleniyor(true);
    try {
      const veri = { ...form, durum: durum || form.durum };
      if (yeni) {
        await api.post('/icerikler', veri);
        toast.success('İçerik oluşturuldu');
      } else {
        await api.put(`/icerikler/${id}`, veri);
        toast.success('İçerik güncellendi');
      }
      navigate('/icerikler');
    } catch (err) {
      toast.error(err.response?.data?.hata || 'Hata oluştu');
    } finally { setYukleniyor(false); }
  };

  return (
    <div>
      <div style={styles.ust}>
        <button onClick={() => navigate('/icerikler')} style={styles.geriBtn}>← Geri</button>
        <h1 style={styles.baslik}>{yeni ? 'Yeni İçerik' : 'İçeriği Düzenle'}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => kaydet('taslak')} style={styles.taslakBtn} disabled={yukleniyor}>Taslak Kaydet</button>
          <button onClick={() => kaydet('yayinda')} style={styles.yayinBtn} disabled={yukleniyor}>Yayınla</button>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Sol: Ana içerik */}
        <div style={styles.solPanel}>
          <div style={styles.kart}>
            <div style={styles.alan}>
              <label style={styles.etiket}>Başlık *</label>
              <input style={styles.input} value={form.baslik} onChange={e => setForm({ ...form, baslik: e.target.value })} placeholder="İçerik başlığı..." />
            </div>
            <div style={styles.alan}>
              <label style={styles.etiket}>Slug (URL)</label>
              <input style={styles.input} value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="icerik-url" />
            </div>
            <div style={styles.alan}>
              <label style={styles.etiket}>Özet</label>
              <textarea style={{ ...styles.input, height: 80 }} value={form.ozet} onChange={e => setForm({ ...form, ozet: e.target.value })} placeholder="Kısa özet..." />
            </div>
            <div style={styles.alan}>
              <label style={styles.etiket}>İçerik</label>
              <textarea style={{ ...styles.input, height: 300, fontFamily: 'monospace', fontSize: 13 }} value={form.icerik} onChange={e => setForm({ ...form, icerik: e.target.value })} placeholder="İçerik metni (HTML destekler)..." />
            </div>
            <div style={styles.alan}>
              <label style={styles.etiket}>Meta Açıklama (SEO)</label>
              <textarea style={{ ...styles.input, height: 60 }} value={form.meta_aciklama} onChange={e => setForm({ ...form, meta_aciklama: e.target.value })} placeholder="Arama motorları için açıklama..." />
            </div>
          </div>
        </div>

        {/* Sağ: Ayarlar */}
        <div style={styles.sagPanel}>
          <div style={styles.kart}>
            <h3 style={styles.kartBaslik}>Ayarlar</h3>
            <div style={styles.alan}>
              <label style={styles.etiket}>Marka *</label>
              <select style={styles.input} value={form.marka_id} onChange={e => setForm({ ...form, marka_id: e.target.value })}>
                <option value="">Seçin...</option>
                {markalar.map(m => <option key={m.id} value={m.id}>{m.ad}</option>)}
              </select>
            </div>
            <div style={styles.alan}>
              <label style={styles.etiket}>İçerik Türü</label>
              <select style={styles.input} value={form.tur} onChange={e => setForm({ ...form, tur: e.target.value })}>
                {TURLER.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={styles.alan}>
              <label style={styles.etiket}>Sıra</label>
              <input style={styles.input} type="number" value={form.sira} onChange={e => setForm({ ...form, sira: parseInt(e.target.value) })} />
            </div>
          </div>

          <div style={styles.kart}>
            <h3 style={styles.kartBaslik}>Kapak Görseli</h3>
            {form.gorsel_url && (
              <img src={form.gorsel_url} alt="" style={styles.onizleme} />
            )}
            <input type="file" accept="image/*" onChange={dosyaYukle} style={{ marginBottom: 8, fontSize: 13 }} />
            <button onClick={medyaYukle} style={styles.medyaBtn}>📁 Medya Kütüphanesi</button>
            {form.gorsel_url && (
              <input style={{ ...styles.input, marginTop: 8, fontSize: 12 }} value={form.gorsel_url} onChange={e => setForm({ ...form, gorsel_url: e.target.value })} placeholder="Görsel URL" />
            )}
          </div>
        </div>
      </div>

      {/* Medya Modal */}
      {medyaAc && (
        <div style={styles.modal} onClick={() => setMedyaAc(false)}>
          <div style={styles.modalIcerik} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Medya Kütüphanesi</h3>
              <button onClick={() => setMedyaAc(false)} style={styles.kapatBtn}>✕</button>
            </div>
            <div style={styles.medyaGrid}>
              {medya.map(m => (
                <img key={m.id} src={m.url} alt={m.dosya_adi} style={styles.medyaItem}
                  onClick={() => { setForm({ ...form, gorsel_url: m.url }); setMedyaAc(false); }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  ust: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  baslik: { fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, flex: 1 },
  geriBtn: { padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  taslakBtn: { padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 },
  yayinBtn: { padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' },
  solPanel: { display: 'flex', flexDirection: 'column', gap: 16 },
  sagPanel: { display: 'flex', flexDirection: 'column', gap: 16 },
  kart: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: 14 },
  kartBaslik: { fontSize: 14, fontWeight: 600, color: '#374151', margin: 0, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' },
  alan: { display: 'flex', flexDirection: 'column', gap: 6 },
  etiket: { fontSize: 13, fontWeight: 500, color: '#374151' },
  input: { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box', resize: 'vertical' },
  onizleme: { width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 160 },
  medyaBtn: { width: '100%', padding: '8px', background: '#f8fafc', border: '1.5px dashed #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalIcerik: { background: '#fff', borderRadius: 16, padding: 24, width: '80vw', maxWidth: 800, maxHeight: '80vh', overflow: 'auto' },
  kapatBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' },
  medyaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 },
  medyaItem: { width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' },
};
