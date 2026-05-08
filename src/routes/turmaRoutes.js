const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// Listar todas as turmas
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM turmas ORDER BY nome ASC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Buscar turma por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM turmas WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Turma não encontrada' });
        }
        res.json(row);
    });
});

module.exports = router;
