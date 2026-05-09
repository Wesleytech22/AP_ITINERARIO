const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
// Usar a porta do ambiente (Railway define automaticamente)
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

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

app.get('/', (req, res) => {
    res.json({ message: 'API Help School funcionando!' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📋 Acesse: http://localhost:${PORT}/index.html`);
    console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
});