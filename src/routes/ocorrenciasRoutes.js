const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { authenticate, isProfessor, canAccessAluno } = require('../middleware/auth');

// Registrar falta
router.post('/falta', authenticate, canAccessAluno, (req, res) => {
    const { aluno_id, data, quantidade, observacao } = req.body;
    
    const sql = `INSERT INTO ocorrencias (aluno_id, tipo, descricao, data, created_by) 
                 VALUES (?, 'falta', ?, ?, ?)`;
    const descricao = `Falta${quantidade > 1 ? `s (${quantidade})` : ''}: ${observacao || 'Sem observação'}`;
    
    db.run(sql, [aluno_id, descricao, data, req.usuarioId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: 'Falta registrada com sucesso!' });
    });
});

// Registrar comportamento
router.post('/comportamento', authenticate, canAccessAluno, (req, res) => {
    const { aluno_id, tipo, descricao, data } = req.body;
    const tiposPermitidos = ['bom', 'regular', 'ruim', 'ocorrencia'];
    
    if (!tiposPermitidos.includes(tipo)) {
        return res.status(400).json({ error: 'Tipo de comportamento inválido' });
    }
    
    const sql = `INSERT INTO ocorrencias (aluno_id, tipo, descricao, data, created_by) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [aluno_id, 'comportamento_' + tipo, descricao, data, req.usuarioId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: 'Comportamento registrado com sucesso!' });
    });
});

// Listar ocorrências do aluno
router.get('/aluno/:id', authenticate, canAccessAluno, (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM ocorrencias WHERE aluno_id = ? ORDER BY data DESC';
    
    db.all(sql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router;
