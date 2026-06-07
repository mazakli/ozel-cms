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
