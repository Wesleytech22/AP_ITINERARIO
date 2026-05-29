// jogoRoutes.js – Instituto Aiye
const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const auth = require('../middleware/auth');
const ctrl = require('../controllers/jogoController');

router.post('/',         auth, ctrl.registrar);
router.get('/historico', auth, ctrl.historico);
router.get('/stats',     auth, ctrl.estatisticas);
=======
const db = require('../database/connection');
const { authenticate, isDiretorOuCoordenador } = require('../middleware/auth');

// Listar todas as turmas (qualquer usuário autenticado)
router.get('/', authenticate, (req, res) => {
    let sql = 'SELECT id, nome, ano, turno FROM turmas ORDER BY nome ASC';

    // Professor só vê suas turmas vinculadas
    if (req.usuarioPerfil === 'professor' && req.professorTurmas) {
        sql = `
            SELECT DISTINCT t.id, t.nome, t.ano, t.turno 
            FROM turmas t
            JOIN turma_professores tp ON t.id = tp.turma_id
            WHERE tp.professor_id = ?
            ORDER BY t.nome ASC
        `;
        db.all(sql, [req.usuarioId], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    } else {
        db.all(sql, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    }
});

// Buscar turma por ID
router.get('/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT id, nome, ano, turno FROM turmas WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Turma não encontrada' });
        res.json(row);
    });
});
>>>>>>> 35f0742adf86c2faa55294c764daac0f3c6f1c15

// Criar nova turma (apenas diretor ou coordenador)
router.post('/', authenticate, isDiretorOuCoordenador, (req, res) => {
    const { nome, ano, turno } = req.body;

    if (!nome) {
        return res.status(400).json({ error: 'Nome da turma é obrigatório' });
    }

    const sql = 'INSERT INTO turmas (nome, ano, turno) VALUES (?, ?, ?)';

    db.run(sql, [nome, ano || null, turno || null], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(409).json({ error: 'Já existe uma turma com este nome!' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: 'Turma criada com sucesso!' });
    });
});

// Listar alunos de uma turma específica
router.get('/:id/alunos', authenticate, (req, res) => {
    const { id } = req.params;

    // Verificar permissão do professor
    if (req.usuarioPerfil === 'professor') {
        db.get('SELECT 1 FROM turma_professores WHERE turma_id = ? AND professor_id = ?', [id, req.usuarioId], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(403).json({ error: 'Acesso negado. Você não leciona nesta turma.' });

            const sql = `SELECT a.*, t.nome as turma_nome FROM alunos a LEFT JOIN turmas t ON a.turma_id = t.id WHERE a.turma_id = ? ORDER BY a.nome ASC`;
            db.all(sql, [id], (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows);
            });
        });
    } else {
        const sql = `SELECT a.*, t.nome as turma_nome FROM alunos a LEFT JOIN turmas t ON a.turma_id = t.id WHERE a.turma_id = ? ORDER BY a.nome ASC`;
        db.all(sql, [id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    }
});

module.exports = router;