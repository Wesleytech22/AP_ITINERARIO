// quizRoutes.js – Instituto Aiye
const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const auth = require('../middleware/auth');
const ctrl = require('../controllers/ocorrenciaController');

router.get('/',              ctrl.listar);
router.get('/:id/perguntas', ctrl.perguntas);
router.post('/:id/responder', auth, ctrl.responder);
=======
const db = require('../database/connection');
const { authenticate, canAccessAluno, isDiretorOuCoordenador } = require('../middleware/auth');

// Registrar ocorrência
router.post('/', authenticate, canAccessAluno, (req, res) => {
    const { aluno_id, tipo, descricao, data } = req.body;

    if (!aluno_id || !descricao) {
        return res.status(400).json({ error: 'Aluno e descrição são obrigatórios' });
    }

    const dataAtual = data || new Date().toISOString().split('T')[0];
    const tipoOcorrencia = tipo || 'Geral';

    const sql = `INSERT INTO ocorrencias (aluno_id, tipo, descricao, data, created_by, created_at) 
                 VALUES (?, ?, ?, ?, ?, datetime('now'))`;

    db.run(sql, [aluno_id, tipoOcorrencia, descricao, dataAtual, req.usuarioId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, message: 'Ocorrência registrada com sucesso!' });
    });
});

// Listar ocorrências de um aluno
router.get('/aluno/:id', authenticate, canAccessAluno, (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT o.*, u.nome as criado_por 
        FROM ocorrencias o
        LEFT JOIN usuarios u ON o.created_by = u.id
        WHERE o.aluno_id = ? 
        ORDER BY o.created_at DESC
    `;

    db.all(sql, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
>>>>>>> 35f0742adf86c2faa55294c764daac0f3c6f1c15

// Listar todas as ocorrências
router.get('/', authenticate, isDiretorOuCoordenador, (req, res) => {
    const sql = `
        SELECT o.*, a.nome as aluno_nome, a.matricula, u.nome as criado_por 
        FROM ocorrencias o
        JOIN alunos a ON o.aluno_id = a.id
        LEFT JOIN usuarios u ON o.created_by = u.id
        ORDER BY o.created_at DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Buscar ocorrência por ID
router.get('/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT o.*, a.nome as aluno_nome, a.matricula, u.nome as criado_por 
        FROM ocorrencias o
        JOIN alunos a ON o.aluno_id = a.id
        LEFT JOIN usuarios u ON o.created_by = u.id
        WHERE o.id = ?
    `;

    db.get(sql, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Ocorrência não encontrada' });
        res.json(row);
    });
});

// Atualizar ocorrência
router.put('/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const { tipo, descricao, data } = req.body;

    db.get('SELECT created_by FROM ocorrencias WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Ocorrência não encontrada' });

        if (row.created_by !== req.usuarioId && req.usuarioPerfil !== 'direcao' && req.usuarioPerfil !== 'coordenador') {
            return res.status(403).json({ error: 'Sem permissão para editar esta ocorrência' });
        }

        const sql = `UPDATE ocorrencias SET tipo=?, descricao=?, data=? WHERE id=?`;

        db.run(sql, [tipo, descricao, data, id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Ocorrência atualizada com sucesso!' });
        });
    });
});

// Deletar ocorrência
router.delete('/:id', authenticate, isDiretorOuCoordenador, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM ocorrencias WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Ocorrência não encontrada' });
        res.json({ message: 'Ocorrência removida com sucesso!' });
    });
});

module.exports = router;