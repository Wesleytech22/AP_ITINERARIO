const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da raiz
app.use(express.static(path.join(__dirname, '..')));

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

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Rota de login
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'login.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📋 Acesse: https://ap_itinerario.up.railway.app`);
    console.log(`🔐 Login: POST https://ap_itinerario.up.railway.app/api/auth/login`);
});