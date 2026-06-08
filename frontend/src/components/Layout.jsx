import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuler = [
  { yol: '/', ikon: '🏠', etiket: 'Dashboard' },
  { yol: '/markalar', ikon: '🏢', etiket: 'Markalar', sadeceSuperadmin: true },
  { yol: '/icerikler', ikon: '📝', etiket: 'İçerikler' },
  { yol: '/medya', ikon: '🖼️', etiket: 'Medya Kütüphanesi' },
  { bolum: true, etiket: 'SOSYAL MEDYA' },
  { yol: '/sosyal-medya', ikon: '📱', etiket: 'Genel Bakış' },
  { yol: '/sosyal-medya/post', ikon: '✏️', etiket: 'Yeni Post', alt: true },
  { yol: '/sosyal-medya/hesaplar', ikon: '🔗', etiket: 'Hesap Bağla', alt: true },
  { yol: '/sosyal-medya/highlights', ikon: '⭐', etiket: 'IG Highlights', alt: true },
  { bolum: true, etiket: 'GENEL' },
  { yol: '/ayarlar', ikon: '⚙️', etiket: 'Site Ayarları' },
];

export default function Layout({ children }) {
  const { kullanici, cikis } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [kenarCubugu, setKenarCubugu] = useState(true);

  const handleCikis = () => { cikis(); navigate('/giris'); };

  return (
    <div style={styles.wrapper}>
      {/* Kenar Çubuğu */}
      <aside style={{ ...styles.sidebar, width: kenarCubugu ? 240 : 64 }}>
        <div style={styles.sidebarUst}>
          <div style={styles.logoArea} onClick={() => setKenarCubugu(!kenarCubugu)}>
            <div style={styles.logoKutu}>CMS</div>
            {kenarCubugu && <span style={styles.logoText}>Yönetim Paneli</span>}
          </div>
        </div>

        <nav style={styles.nav}>
          {menuler
            .filter(m => !m.sadeceSuperadmin || kullanici?.rol === 'superadmin')
            .map((m, i) => {
              if (m.bolum) {
                return kenarCubugu ? (
                  <div key={`bolum_${i}`} style={styles.navBolum}>{m.etiket}</div>
                ) : <div key={`bolum_${i}`} style={styles.navBolumCizgi} />;
              }
              const aktif = location.pathname === m.yol ||
                (m.yol !== '/' && location.pathname.startsWith(m.yol) && m.yol.split('/').length > 1);
              return (
                <Link
                  key={m.yol}
                  to={m.yol}
                  style={{
                    ...styles.navLink,
                    ...(m.alt ? styles.navLinkAlt : {}),
                    background: aktif ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: aktif ? '#6366f1' : m.alt ? '#94a3b8' : '#cbd5e1',
                  }}
                >
                  <span style={styles.navIkon}>{m.ikon}</span>
                  {kenarCubugu && <span>{m.etiket}</span>}
                </Link>
              );
            })}
        </nav>

        <div style={styles.sidebarAlt}>
          <div style={styles.kullaniciBilgi}>
            <div style={styles.avatar}>{kullanici?.ad?.[0]?.toUpperCase()}</div>
            {kenarCubugu && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{kullanici?.ad}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{kullanici?.rol}</div>
              </div>
            )}
          </div>
          <button onClick={handleCikis} style={styles.cikisBtn} title="Çıkış">
            🚪 {kenarCubugu && 'Çıkış'}
          </button>
        </div>
      </aside>

      {/* Ana İçerik */}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', minHeight: '100vh', background: '#f8fafc' },
  sidebar: {
    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s',
    overflow: 'hidden',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  sidebarUst: { padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  logoArea: { display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' },
  logoKutu: {
    width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
  },
  logoText: { color: '#f1f5f9', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' },
  nav: { flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 4 },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
    borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500,
    transition: 'all 0.2s', whiteSpace: 'nowrap',
  },
  navIkon: { fontSize: 18, flexShrink: 0 },
  navLinkAlt: { paddingLeft: 28, fontSize: 13 },
  navBolum: {
    fontSize: 10, fontWeight: 700, color: 'rgba(148,163,184,0.6)', letterSpacing: '0.08em',
    padding: '12px 12px 4px', whiteSpace: 'nowrap',
  },
  navBolumCizgi: { borderTop: '1px solid rgba(255,255,255,0.06)', margin: '8px 4px' },
  sidebarAlt: { padding: 12, borderTop: '1px solid rgba(255,255,255,0.08)' },
  kullaniciBilgi: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', marginBottom: 8 },
  avatar: {
    width: 32, height: 32, borderRadius: '50%', background: '#6366f1',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
  },
  cikisBtn: {
    width: '100%', padding: '8px 12px', background: 'rgba(239,68,68,0.1)',
    border: 'none', borderRadius: 8, color: '#fca5a5', cursor: 'pointer',
    fontSize: 13, textAlign: 'left', display: 'flex', gap: 8,
  },
  main: { flex: 1, overflow: 'auto', padding: 24 },
};
