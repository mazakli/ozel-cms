import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Giris() {
  const [form, setForm] = useState({ email: '', sifre: '' });
  const [yukleniyor, setYukleniyor] = useState(false);
  const { giris } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setYukleniyor(true);
    try {
      await giris(form.email, form.sifre);
      navigate('/');
    } catch {
      toast.error('Email veya şifre hatalı');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.kart}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>CMS</div>
          <h1 style={styles.baslik}>İçerik Yönetim Sistemi</h1>
          <p style={styles.altBaslik}>Tüm markalarınızı tek panelden yönetin</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.alan}>
            <label style={styles.etiket}>E-posta</label>
            <input
              style={styles.input}
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="admin@cms.com"
              required
            />
          </div>
          <div style={styles.alan}>
            <label style={styles.etiket}>Şifre</label>
            <input
              style={styles.input}
              type="password"
              value={form.sifre}
              onChange={e => setForm({ ...form, sifre: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>
          <button style={{ ...styles.buton, opacity: yukleniyor ? 0.7 : 1 }} type="submit" disabled={yukleniyor}>
            {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  },
  kart: {
    background: '#fff',
    borderRadius: 16,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
  },
  logo: { textAlign: 'center', marginBottom: 32 },
  logoIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: 16,
    color: '#fff',
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 16,
  },
  baslik: { fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' },
  altBaslik: { fontSize: 14, color: '#64748b', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  alan: { display: 'flex', flexDirection: 'column', gap: 6 },
  etiket: { fontSize: 14, fontWeight: 500, color: '#374151' },
  input: {
    padding: '10px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  buton: {
    padding: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
  },
};
