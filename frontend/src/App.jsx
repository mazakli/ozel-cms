import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Giris from './pages/Giris';
import Dashboard from './pages/Dashboard';
import Markalar from './pages/Markalar';
import Icerikler from './pages/Icerikler';
import IcerikDuzenle from './pages/IcerikDuzenle';
import Medya from './pages/Medya';
import Ayarlar from './pages/Ayarlar';
import SosyalMedya from './pages/SosyalMedya';
import SosyalMedyaPost from './pages/SosyalMedyaPost';
import SosyalMedyaHesaplar from './pages/SosyalMedyaHesaplar';
import SosyalMedyaHighlights from './pages/SosyalMedyaHighlights';

function KorunanRotalar() {
  const { kullanici, yukleniyor } = useAuth();
  if (yukleniyor) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontSize:18 }}>Yükleniyor...</div>;
  if (!kullanici) return <Navigate to="/giris" />;
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/markalar" element={<Markalar />} />
        <Route path="/icerikler" element={<Icerikler />} />
        <Route path="/icerikler/:id" element={<IcerikDuzenle />} />
        <Route path="/medya" element={<Medya />} />
        <Route path="/ayarlar" element={<Ayarlar />} />
        <Route path="/sosyal-medya" element={<SosyalMedya />} />
        <Route path="/sosyal-medya/post" element={<SosyalMedyaPost />} />
        <Route path="/sosyal-medya/post/:id" element={<SosyalMedyaPost />} />
        <Route path="/sosyal-medya/hesaplar" element={<SosyalMedyaHesaplar />} />
        <Route path="/sosyal-medya/highlights" element={<SosyalMedyaHighlights />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/giris" element={<Giris />} />
          <Route path="/*" element={<KorunanRotalar />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
