import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function Ayarlar() {
  const [markalar, setMarkalar] = useState([]);
  const [secilenMarka, setSecilenMarka] = useState('');
  const [form, setForm] = useState({
    site_adi: '', site_aciklama: '', logo_url: '', favicon_url: '',
    iletisim_email: '', iletisim_telefon: '', adres: '',
  });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  useEffect(() => {
    api.get('/markalar').then(r => {
      setMarkalar(r.data);
      if (r.data.length > 0) setSecilenMarka(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!secilenMarka) return;
    setYukleniyor(true);
    api.get(`/ayarlar/${secilenMarka}`)
      .then(r => {
        const d = r.data || {};
        setForm({
          site_adi: d.site_adi || '',
          site_aciklama: d.site_aciklama || '',
          logo_url: d.logo_url || '',
          favicon_url: d.favicon_url || '',
          iletisim_email: d.iletisim_email || '',
          iletisim_telefon: d.iletisim_telefon || '',
          adres: d.adres || '',
        });
      })
      .catch(() => {})
      .finally(() => setYukleniyor(false));
  }, [secilenMarka]);

  const kaydet = async () => {
    setKaydediliyor(true);
    try {
      await api.put(`/ayarlar/${secilenMarka}`, form);
      toast.success('Ayarlar kaydedildi');
    } catch (err) {
      toast.error(err.response?.data?.hata || 'Hata oluştu');
    } finally {
      setKaydediliyor(false);
    }
  };

  const inp = (label, key, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151', fontSize: 14 }}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder}
          rows={3}
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
        />
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder}
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
        />
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Site Ayarları</h1>
        <p style={{ color: '#6b7280', marginTop: 6 }}>Marka başına site adı, logo ve iletişim bilgilerini yönetin.</p>
      </div>

      {/* Marka Seçimi */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#374151', fontSize: 14 }}>Marka</label>
        <select
          value={secilenMarka}
          onChange={e => setSecilenMarka(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, minWidth: 220, background: '#fff' }}
        >
          {markalar.map(m => <option key={m.id} value={m.id}>{m.ad}</option>)}
        </select>
      </div>

      {yukleniyor ? (
        <div style={{ color: '#6b7280', padding: 20 }}>Yükleniyor...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>Genel Bilgiler</h2>
          {inp('Site Adı', 'site_adi', 'text', 'Örn: Sare Vakfı')}
          {inp('Site Açıklaması', 'site_aciklama', 'textarea', 'Kısa açıklama...')}

          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '28px 0 20px', paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>Logo & Favicon</h2>
          {inp('Logo URL', 'logo_url', 'url', 'https://res.cloudinary.com/...')}
          {form.logo_url && (
            <div style={{ marginBottom: 20 }}>
              <img src={form.logo_url} alt="Logo önizleme" style={{ height: 60, borderRadius: 8, objectFit: 'contain', border: '1px solid #e5e7eb', padding: 4 }} />
            </div>
          )}
          {inp('Favicon URL', 'favicon_url', 'url', 'https://res.cloudinary.com/...')}

          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '28px 0 20px', paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>İletişim Bilgileri</h2>
          {inp('E-posta', 'iletisim_email', 'email', 'info@example.com')}
          {inp('Telefon', 'iletisim_telefon', 'text', '+90 212 000 00 00')}
          {inp('Adres', 'adres', 'textarea', 'Tam adres...')}

          <button
            onClick={kaydet}
            disabled={kaydediliyor}
            style={{ padding: '12px 32px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: kaydediliyor ? 'not-allowed' : 'pointer', opacity: kaydediliyor ? 0.7 : 1 }}
          >
            {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      )}
    </div>
  );
}
