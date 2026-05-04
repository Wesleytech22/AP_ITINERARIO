const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
const authRoutes = require('./routes/authRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const turmaRoutes = require('./routes/turmaRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/turmas', turmaRoutes);

// Rota principal (mantendo a antiga para compatibilidade)
app.get('/', (req, res) => {
    res.json({ message: 'API Escola funcionando!' });
});

app.get('/alunos', (req, res) => {
    res.json({ message: 'Use /api/alunos para acessar os alunos' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`íº€ Servidor rodando na porta ${PORT}`);
    console.log(`í³Œ Teste: http://localhost:${PORT}/`);
    console.log(`í³Œ Login: POST http://localhost:${PORT}/api/auth/login`);
    console.log(`í³Œ Alunos: GET http://localhost:${PORT}/api/alunos`);
});
