require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

require('./database/connection');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../../public')));

app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/animais',   require('./routes/alunoRoutes'));
app.use('/api/progresso', require('./routes/ocorrenciaRoutes'));
app.use('/api/jogo',      require('./routes/turmaRoutes'));
app.use('/api/quiz',      require('./routes/ocorrenciasRoutes'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Instituto Aiye - Exploradores da Mata Atlantica' });
});

app.use('/api/*', (_req, res) => res.status(404).json({ erro: 'Rota nao encontrada.' }));

app.listen(PORT, () => {
  console.log('Instituto Aiye - Backend rodando na porta ' + PORT);
});
