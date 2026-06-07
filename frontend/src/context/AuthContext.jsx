import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [kullanici, setKullanici] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/ben')
        .then(r => setKullanici(r.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setYukleniyor(false));
    } else {
      setYukleniyor(false);
    }
  }, []);

  const giris = async (email, sifre) => {
    const r = await api.post('/auth/giris', { email, sifre });
    localStorage.setItem('token', r.data.token);
    setKullanici(r.data.kullanici);
    return r.data;
  };

  const cikis = () => {
    localStorage.removeItem('token');
    setKullanici(null);
  };

  return (
    <AuthContext.Provider value={{ kullanici, giris, cikis, yukleniyor }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
