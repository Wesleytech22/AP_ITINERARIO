const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { authenticate, isCoordenador, isDiretor, canAccessAluno } = require('../middleware/auth');

// Função auxiliar para permitir diretor ou coordenador
function isDiretorOuCoordenador(req, res, next) {
    if (req.usuarioPerfil === 'direcao' || req.usuarioPerfil === 'coordenador') {
        return next();
    }
    return res.status(403).json({ error: 'Acesso restrito à direção ou coordenadores' });
}

// Listar todos os alunos (com nome da turma)
router.get('/', authenticate, (req, res) => {
    let sql = `
        SELECT a.*, t.nome as turma_nome 
        FROM alunos a
        LEFT JOIN turmas t ON a.turma_id = t.id
    `;
    let params = [];

    if (req.usuarioPerfil === 'professor' && req.turmaId) {
        sql += ' WHERE a.turma_id = ?';
        params.push(req.turmaId);
    }

    sql += ' ORDER BY a.id DESC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Erro ao listar alunos:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Buscar aluno por ID
router.get('/:id', authenticate, canAccessAluno, (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT a.*, t.nome as turma_nome 
        FROM alunos a
        LEFT JOIN turmas t ON a.turma_id = t.id
        WHERE a.id = ?
    `;

    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error('Erro ao buscar aluno:', err);
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }
        res.json(row);
    });
});

// Criar aluno
router.post('/', authenticate, isDiretorOuCoordenador, async (req, res) => {
    const { nome, matricula, turma_nome, responsavel, contato } = req.body;

    if (!nome || !matricula) {
        return res.status(400).json({ error: 'Nome e matrícula são obrigatórios' });
    }

    let turma_id = null;

    if (turma_nome && turma_nome.trim() !== '') {
        const turmaExistente = await new Promise((resolve) => {
            db.get('SELECT id FROM turmas WHERE nome = ?', [turma_nome], (err, row) => {
                resolve(err ? null : row);
            });
        });

        if (turmaExistente) {
            turma_id = turmaExistente.id;
        } else {
            const novaTurma = await new Promise((resolve) => {
                db.run('INSERT INTO turmas (nome) VALUES (?)', [turma_nome], function (err) {
                    resolve(err ? null : this.lastID);
                });
            });
            turma_id = novaTurma;
        }
    }

    const sql = `INSERT INTO alunos (nome, matricula, turma_id, responsavel, contato, created_by) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(sql, [nome, matricula, turma_id, responsavel, contato, req.usuarioId], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(409).json({ error: 'Matrícula já existe!' });
            }
            console.error('Erro ao criar aluno:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: 'Aluno criado com sucesso!' });
    });
});

// Atualizar aluno
router.put('/:id', authenticate, isDiretorOuCoordenador, async (req, res) => {
    const { id } = req.params;
    const { nome, turma_nome, responsavel, contato } = req.body;

    let turma_id = null;

    if (turma_nome && turma_nome.trim() !== '') {
        const turmaExistente = await new Promise((resolve) => {
            db.get('SELECT id FROM turmas WHERE nome = ?', [turma_nome], (err, row) => {
                resolve(err ? null : row);
            });
        });

        if (turmaExistente) {
            turma_id = turmaExistente.id;
        } else {
            const novaTurma = await new Promise((resolve) => {
                db.run('INSERT INTO turmas (nome) VALUES (?)', [turma_nome], function (err) {
                    resolve(err ? null : this.lastID);
                });
            });
            turma_id = novaTurma;
        }
    }

    const sql = `UPDATE alunos SET nome=?, turma_id=?, responsavel=?, contato=?, updated_by=?, updated_at=CURRENT_TIMESTAMP
                 WHERE id=?`;

    db.run(sql, [nome, turma_id, responsavel, contato, req.usuarioId, id], function (err) {
        if (err) {
            console.error('Erro ao atualizar aluno:', err);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }
        res.json({ message: 'Aluno atualizado com sucesso!' });
    });
});

// Deletar aluno
router.delete('/:id', authenticate, isDiretor, (req, res) => {
    const { id } = req.params;

    db.get('SELECT COUNT(*) as total FROM ocorrencias WHERE aluno_id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row.total > 0) {
            return res.status(400).json({
                error: `Não é possível excluir. Aluno possui ${row.total} ocorrência(s) vinculada(s).`
            });
        }

        db.run('DELETE FROM alunos WHERE id = ?', [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
            res.json({ message: 'Aluno removido com sucesso!' });
        });
    });
});

module.exports = router;