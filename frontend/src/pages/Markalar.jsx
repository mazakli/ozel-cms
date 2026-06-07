import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function Markalar() {
  const [markalar, setMarkalar] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ad: '', slug: '', renk: '#6366f1' });
  const [duzenleId, setDuzenleId] = useState(null);

  useEffect(() => { yukle(); }, []);

  const yukle = () => api.get('/markalar').then(r => setMarkalar(r.data));

  const kaydet = async () => {
    try {
      if (duzenleId) {
        await api.put(`/markalar/${duzenleId}`, form);
        toast.success('Marka güncellendi');
      } else {
        await api.post('/markalar', form);
        toast.success('Marka oluşturuldu');
      }
      setModal(false); setForm({ ad: '', slug: '', renk: '#6366f1' }); setDuzenleId(null);
      yukle();
    } catch (err) { toast.error(err.response?.data?.hata || 'Hata'); }
  };

  const duzenle = (m) => {
    setForm({ ad: m.ad, slug: m.slug, renk: m.renk, aktif: m.aktif });
    setDuzenleId(m.id); setModal(true);
  };

  return (
    <div>
      <div style={styles.ust}>
        <h1 style={styles.baslik}>Markalar</h1>
        <button onClick={() => setModal(true)} style={styles.yeniBtn}>+ Yeni Marka</button>
      </div>

      <div style={styles.grid}>
        {markalar.map(m => (
          <div key={m.id} style={styles.kart}>
            <div style={{ ...styles.renkBar, background: m.renk }} />
            {m.logo_url && <img src={m.logo_url} alt={m.ad} style={styles.logo} />}
            <h3 style={styles.markaAd}>{m.ad}</h3>
            <p style={styles.markaSlug}>/{m.slug}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
              <span style={{ ...styles.badge, background: m.aktif ? '#d1fae5' : '#fee2e2', color: m.aktif ? '#065f46' : '#dc2626' }}>
                {m.aktif ? 'Aktif' : 'Pasif'}
              </span>
              <button onClick={() => duzenle(m)} style={styles.duzBtn}>Düzenle</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div style={styles.overlay} onClick={() => setModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalBaslik}>{duzenleId ? 'Marka Düzenle' : 'Yeni Marka'}</h2>
            {[
              { key: 'ad', label: 'Marka Adı', placeholder: 'Sare Vakfı' },
              { key: 'slug', label: 'Slug', placeholder: 'sare-vakfi' },
              { key: 'logo_url', label: 'Logo URL', placeholder: 'https://...' },
            ].map(f => (
              <div key={f.key} style={styles.alan}>
                <label style={styles.etiket}>{f.label}</label>
                <input style={styles.input} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />
              </div>
            ))}
            <div style={styles.alan}>
              <label style={styles.etiket}>Renk</label>
              <input type="color" value={form.renk} onChange={e => setForm({ ...form, renk: e.target.value })} style={{ height: 40, width: '100%', borderRadius: 8, border: 'none', cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={() => setModal(false)} style={styles.iptalBtn}>İptal</button>
              <button onClick={kaydet} style={styles.kaydetBtn}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  ust: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  baslik: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 },
  yeniBtn: { padding: '10px 20px', background: '#6366f1', color: '#fff', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  kart: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', padding: 20, display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' },
  renkBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  logo: { width: 48, height: 48, objectFit: 'contain', marginTop: 4 },
  markaAd: { fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 },
  markaSlug: { fontSize: 12, color: '#94a3b8', margin: 0 },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  duzBtn: { padding: '4px 12px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 16, padding: 32, width: 400, maxWidth: '90vw', display: 'flex', flexDirection: 'column', gap: 14 },
  modalBaslik: { fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 },
  alan: { display: 'flex', flexDirection: 'column', gap: 6 },
  etiket: { fontSize: 13, fontWeight: 500, color: '#374151' },
  input: { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14 },
  iptalBtn: { flex: 1, padding: 10, background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  kaydetBtn: { flex: 1, padding: 10, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
};
