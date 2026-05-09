const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { authenticate, canAccessAluno } = require('../middleware/auth');

// Registrar nota
router.post('/', authenticate, canAccessAluno, (req, res) => {
    const { aluno_id, disciplina_id, bimestre, nota } = req.body;

    if (!aluno_id || !disciplina_id || !bimestre || nota === undefined) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const sql = `INSERT OR REPLACE INTO notas (aluno_id, disciplina_id, bimestre, nota, created_by, created_at) 
                 VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;

    db.run(sql, [aluno_id, disciplina_id, bimestre, nota, req.usuarioId], function (err) {
        if (err) {
            console.error('Erro ao registrar nota:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: 'Nota registrada com sucesso!' });
    });
});

// Buscar notas do aluno
router.get('/aluno/:id', authenticate, canAccessAluno, (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT n.*, d.nome as disciplina_nome 
        FROM notas n
        JOIN disciplinas d ON n.disciplina_id = d.id
        WHERE n.aluno_id = ?
        ORDER BY n.bimestre, d.nome
    `;

    db.all(sql, [id], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar notas:', err);
            return res.status(500).json({ error: err.message });
        }

        const porBimestre = { 1: [], 2: [], 3: [], 4: [] };
        rows.forEach(row => {
            if (porBimestre[row.bimestre]) {
                porBimestre[row.bimestre].push(row);
            }
        });

        res.json({ notas: rows, porBimestre });
    });
});

module.exports = router;