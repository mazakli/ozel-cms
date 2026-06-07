import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

const TURLER = ['slider', 'blog', 'sayfa', 'proje', 'anasayfa', 'hakkimizda', 'iletisim', 'duyuru', 'galeri'];

export default function Icerikler() {
  const [icerikler, setIcerikler] = useState([]);
  const [markalar, setMarkalar] = useState([]);
  const [filtre, setFiltre] = useState({ marka_id: '', tur: '', durum: '' });
  const [yukleniyor, setYukleniyor] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/markalar').then(r => setMarkalar(r.data)).catch(() => {});
    yukle();
  }, [filtre]);

  const yukle = () => {
    setYukleniyor(true);
    const params = new URLSearchParams();
    if (filtre.marka_id) params.append('marka_id', filtre.marka_id);
    if (filtre.tur) params.append('tur', filtre.tur);
    if (filtre.durum) params.append('durum', filtre.durum);
    api.get(`/icerikler?${params}`).then(r => {
      setIcerikler(r.data.icerikler || []);
    }).finally(() => setYukleniyor(false));
  };

  const sil = async (id) => {
    if (!confirm('Bu içeriği silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/icerikler/${id}`);
      toast.success('İçerik silindi');
      yukle();
    } catch { toast.error('Hata oluştu'); }
  };

  return (
    <div>
      <div style={styles.ust}>
        <h1 style={styles.baslik}>İçerikler</h1>
        <Link to="/icerikler/yeni" style={styles.yeniBtn}>+ Yeni İçerik</Link>
      </div>

      {/* Filtreler */}
      <div style={styles.filtreler}>
        <select style={styles.select} value={filtre.marka_id} onChange={e => setFiltre({ ...filtre, marka_id: e.target.value })}>
          <option value="">Tüm Markalar</option>
          {markalar.map(m => <option key={m.id} value={m.id}>{m.ad}</option>)}
        </select>
        <select style={styles.select} value={filtre.tur} onChange={e => setFiltre({ ...filtre, tur: e.target.value })}>
          <option value="">Tüm Türler</option>
          {TURLER.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select style={styles.select} value={filtre.durum} onChange={e => setFiltre({ ...filtre, durum: e.target.value })}>
          <option value="">Tüm Durumlar</option>
          <option value="taslak">Taslak</option>
          <option value="yayinda">Yayında</option>
        </select>
      </div>

      {/* Tablo */}
      <div style={styles.tablo}>
        {yukleniyor ? (
          <div style={styles.bos}>Yükleniyor...</div>
        ) : icerikler.length === 0 ? (
          <div style={styles.bos}>İçerik bulunamadı</div>
        ) : (
          icerikler.map(i => (
            <div key={i.id} style={styles.satir}>
              <div style={styles.satirIcerik}>
                {i.gorsel_url && <img src={i.gorsel_url} alt="" style={styles.kucukGorsel} />}
                <div>
                  <div style={styles.satirBaslik}>{i.baslik}</div>
                  <div style={styles.satirMeta}>
                    <span style={styles.markaEtiketi}>{i.marka_adi}</span>
                    <span style={styles.turEtiketi}>{i.tur}</span>
                    <span>{new Date(i.olusturuldu).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>
              <div style={styles.satirSag}>
                <span style={{ ...styles.durum, background: i.durum === 'yayinda' ? '#d1fae5' : '#fef3c7', color: i.durum === 'yayinda' ? '#065f46' : '#92400e' }}>
                  {i.durum === 'yayinda' ? 'Yayında' : 'Taslak'}
                </span>
                <button onClick={() => navigate(`/icerikler/${i.id}`)} style={styles.duzBtn}>Düzenle</button>
                <button onClick={() => sil(i.id)} style={styles.silBtn}>Sil</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  ust: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  baslik: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 },
  yeniBtn: { padding: '10px 20px', background: '#6366f1', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500 },
  filtreler: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  select: { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: '#fff', cursor: 'pointer' },
  tablo: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' },
  bos: { textAlign: 'center', padding: 60, color: '#94a3b8' },
  satir: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #f1f5f9' },
  satirIcerik: { display: 'flex', alignItems: 'center', gap: 12 },
  kucukGorsel: { width: 48, height: 48, borderRadius: 8, objectFit: 'cover' },
  satirBaslik: { fontSize: 15, fontWeight: 500, color: '#0f172a', marginBottom: 4 },
  satirMeta: { display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#94a3b8' },
  markaEtiketi: { background: '#ede9fe', color: '#5b21b6', padding: '2px 8px', borderRadius: 20, fontSize: 11 },
  turEtiketi: { background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 20, fontSize: 11 },
  satirSag: { display: 'flex', alignItems: 'center', gap: 8 },
  durum: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  duzBtn: { padding: '6px 14px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  silBtn: { padding: '6px 14px', background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#dc2626' },
};
