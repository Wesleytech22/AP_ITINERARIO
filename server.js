require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Initialize DB first, then start server
initDb().then(() => {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/activities', require('./routes/activities'));
  app.use('/api/moments', require('./routes/moments'));
  app.use('/api', require('./routes/content'));

  app.get('/api/health', (req, res) => res.json({ status:'ok', app:'ONG Verde Vivo API' }));
  app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }));
  app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Erro interno' }); });

  app.listen(PORT, () => {
    console.log(`🌿 Verde Vivo API → http://localhost:${PORT}`);
  });
}).catch(err => { console.error('Falha ao iniciar DB:', err); process.exit(1); });
