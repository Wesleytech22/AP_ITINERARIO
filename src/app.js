require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

require('./database/connection');

const app = express();
const PORT = process.env.PORT || 3001;

<<<<<<< HEAD
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
=======
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
const authRoutes = require('./routes/authRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const turmaRoutes = require('./routes/turmaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const emailRoutes = require('./routes/emailRoutes');
const notasRoutes = require('./routes/notasRoutes');
const frequenciaRoutes = require('./routes/frequenciaRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/turmas', turmaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/notas', notasRoutes);
app.use('/api/frequencias', frequenciaRoutes);

// Rota raiz - apenas API info
app.get('/', (req, res) => {
    res.json({
        name: 'Help School API',
        version: '1.0.0',
        status: 'online',
        endpoints: {
            login: 'POST /api/auth/login',
            alunos: 'GET /api/alunos',
            turmas: 'GET /api/turmas',
            professores: 'GET /api/usuarios/professores',
            notas: 'POST /api/notas',
            frequencias: 'POST /api/frequencias'
        }
    });
});

// Não tentar servir arquivos estáticos
// app.use(express.static('.'));  // REMOVA esta linha se existir

app.listen(PORT, () => {
    console.log(`🚀 API rodando na porta ${PORT}`);
    console.log(`📍 URL: https://ap_itinerario.up.railway.app`);
});
>>>>>>> 35f0742adf86c2faa55294c764daac0f3c6f1c15
