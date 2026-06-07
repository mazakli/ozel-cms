require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/markalar', require('./routes/markalar'));
app.use('/api/icerikler', require('./routes/icerikler'));
app.use('/api/medya', require('./routes/medya'));
app.use('/api/ayarlar', require('./routes/ayarlar'));
app.use('/api/public', require('./routes/public'));

// Sağlık kontrolü
app.get('/_health', (req, res) => res.json({ durum: 'çalışıyor' }));

app.listen(PORT, () => {
  console.log(`✅ CMS Backend çalışıyor: http://localhost:${PORT}`);
});
