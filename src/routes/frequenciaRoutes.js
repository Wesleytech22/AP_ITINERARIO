const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { authenticate, canAccessAluno } = require('../middleware/auth');

// Registrar frequência (sem disciplina_id)
router.post('/', authenticate, canAccessAluno, (req, res) => {
    const { aluno_id, data, presente } = req.body;

    if (!aluno_id || !data) {
        return res.status(400).json({ error: 'Aluno e data são obrigatórios' });
    }

    const sql = `INSERT OR REPLACE INTO frequencias (aluno_id, data, presente, created_by, created_at) 
                 VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`;

    db.run(sql, [aluno_id, data, presente ? 1 : 0, req.usuarioId], function (err) {
        if (err) {
            console.error('Erro ao registrar frequência:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: 'Frequência registrada com sucesso!' });
    });
});

// Buscar frequências do aluno
router.get('/aluno/:id', authenticate, canAccessAluno, (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT f.* 
        FROM frequencias f
        WHERE f.aluno_id = ?
        ORDER BY f.data DESC
    `;

    db.all(sql, [id], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar frequências:', err);
            return res.status(500).json({ error: err.message });
        }

        const totalAulas = rows.length;
        const faltas = rows.filter(f => f.presente === 0).length;
        const percentualFrequencia = totalAulas > 0 ? ((totalAulas - faltas) / totalAulas * 100).toFixed(1) : 100;

        res.json({
            frequencias: rows,
            totalAulas,
            faltas,
            percentualFrequencia: parseFloat(percentualFrequencia)
        });
    });
});

// Contar faltas
router.get('/faltas/:id', authenticate, canAccessAluno, (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT COUNT(*) as total_faltas
        FROM frequencias f
        WHERE f.aluno_id = ? AND f.presente = 0
    `;

    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error('Erro ao contar faltas:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json([{ disciplina: 'Geral', total_faltas: row?.total_faltas || 0 }]);
    });
});

module.exports = router;