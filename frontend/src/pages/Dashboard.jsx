import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { kullanici } = useAuth();
  const [istatistik, setIstatistik] = useState({ markalar: 0, icerikler: 0, medya: 0, yayinda: 0 });
  const [sonIcerikler, setSonIcerikler] = useState([]);

  useEffect(() => {
    Promise.all([
      kullanici?.rol === 'superadmin' ? api.get('/markalar') : Promise.resolve({ data: [] }),
      api.get('/icerikler?limit=5'),
      api.get('/medya?limit=1'),
    ]).then(([m, i, med]) => {
      setIstatistik({
        markalar: m.data.length || 0,
        icerikler: i.data.toplam || 0,
        yayinda: i.data.icerikler?.filter(x => x.durum === 'yayinda').length || 0,
      });
      setSonIcerikler(i.data.icerikler || []);
    }).catch(() => {});
  }, [kullanici]);

  const kartlar = [
    { baslik: 'Toplam Marka', deger: istatistik.markalar, renk: '#6366f1', ikon: '🏢', yol: '/markalar' },
    { baslik: 'Toplam İçerik', deger: istatistik.icerikler, renk: '#10b981', ikon: '📝', yol: '/icerikler' },
    { baslik: 'Yayında', deger: istatistik.yayinda, renk: '#f59e0b', ikon: '✅', yol: '/icerikler?durum=yayinda' },
  ];

  return (
    <div>
      <div style={styles.baslik}>
        <h1 style={styles.h1}>Merhaba, {kullanici?.ad} 👋</h1>
        <p style={styles.altBaslik}>İçerik yönetim panelinize hoş geldiniz</p>
      </div>

      <div style={styles.kartlar}>
        {kartlar.map(k => (
          <Link to={k.yol} key={k.baslik} style={{ ...styles.kart, borderTopColor: k.renk, textDecoration: 'none' }}>
            <div style={{ fontSize: 32 }}>{k.ikon}</div>
            <div style={{ ...styles.kartSayi, color: k.renk }}>{k.deger}</div>
            <div style={styles.kartBaslik}>{k.baslik}</div>
          </Link>
        ))}
      </div>

      <div style={styles.bolum}>
        <div style={styles.bolumBaslik}>
          <h2 style={styles.h2}>Son İçerikler</h2>
          <Link to="/icerikler/yeni" style={styles.yeniBtn}>+ Yeni İçerik</Link>
        </div>
        <div style={styles.tablo}>
          {sonIcerikler.length === 0 ? (
            <div style={styles.bos}>Henüz içerik yok. İlk içeriğinizi oluşturun!</div>
          ) : (
            sonIcerikler.map(i => (
              <Link to={`/icerikler/${i.id}`} key={i.id} style={styles.satir}>
                <div>
                  <div style={styles.satirBaslik}>{i.baslik}</div>
                  <div style={styles.satirMeta}>{i.marka_adi} · {i.tur}</div>
                </div>
                <span style={{ ...styles.durum, background: i.durum === 'yayinda' ? '#d1fae5' : '#fef3c7', color: i.durum === 'yayinda' ? '#065f46' : '#92400e' }}>
                  {i.durum === 'yayinda' ? 'Yayında' : 'Taslak'}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  baslik: { marginBottom: 32 },
  h1: { fontSize: 28, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' },
  altBaslik: { color: '#64748b', margin: 0 },
  kartlar: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 },
  kart: {
    background: '#fff', borderRadius: 12, padding: 24, borderTop: '4px solid',
    boxShadow: '0 1px 3px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: 8,
  },
  kartSayi: { fontSize: 36, fontWeight: 700 },
  kartBaslik: { color: '#64748b', fontSize: 14 },
  bolum: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' },
  bolumBaslik: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  h2: { fontSize: 18, fontWeight: 600, color: '#0f172a', margin: 0 },
  yeniBtn: {
    padding: '8px 16px', background: '#6366f1', color: '#fff', borderRadius: 8,
    textDecoration: 'none', fontSize: 14, fontWeight: 500,
  },
  tablo: { display: 'flex', flexDirection: 'column', gap: 2 },
  satir: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', borderRadius: 8, textDecoration: 'none',
    background: '#f8fafc', transition: 'background 0.2s',
  },
  satirBaslik: { fontSize: 15, fontWeight: 500, color: '#0f172a', marginBottom: 2 },
  satirMeta: { fontSize: 12, color: '#94a3b8' },
  durum: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  bos: { textAlign: 'center', padding: 40, color: '#94a3b8' },
};
