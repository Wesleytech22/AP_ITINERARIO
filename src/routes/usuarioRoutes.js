const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { authenticate, isDiretor } = require('../middleware/auth');

// Listar todos os professores
router.get('/professores', authenticate, isDiretor, (req, res) => {
    const sql = "SELECT id, nome, email, perfil, created_at FROM usuarios WHERE perfil = 'professor' ORDER BY nome";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Criar novo professor
router.post('/professores', authenticate, isDiretor, (req, res) => {
    const { nome, email, senha, disciplina } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const sql = "INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, 'professor')";

    db.run(sql, [nome, email, senha], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(409).json({ error: 'Email já cadastrado!' });
            }
            console.error('Erro ao criar professor:', err);
            return res.status(500).json({ error: err.message });
        }

        // Se tiver disciplina, adicionar
        if (disciplina) {
            db.run("INSERT OR IGNORE INTO disciplinas (nome) VALUES (?)", [disciplina]);
        }

        res.status(201).json({
            id: this.lastID,
            message: 'Professor criado com sucesso!'
        });
    });
});

// Vincular professor a turma
router.post('/vinculo-professor', authenticate, isDiretor, (req, res) => {
    const { professor_id, turma_id, disciplina_id, ano_letivo } = req.body;

    if (!professor_id || !turma_id || !disciplina_id) {
        return res.status(400).json({ error: 'Professor, turma e disciplina são obrigatórios' });
    }

    const sql = `INSERT OR IGNORE INTO turma_professores (turma_id, professor_id, disciplina_id, ano_letivo) 
                 VALUES (?, ?, ?, ?)`;

    db.run(sql, [turma_id, professor_id, disciplina_id, ano_letivo || 2026], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, message: 'Professor vinculado com sucesso!' });
    });
});

// Listar disciplinas
router.get('/disciplinas', authenticate, (req, res) => {
    const sql = "SELECT id, nome FROM disciplinas ORDER BY nome";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;