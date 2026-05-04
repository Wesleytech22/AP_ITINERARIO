const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { authenticate, isCoordenador, isDiretor, canAccessAluno, isProfessor } = require('../middleware/auth');

// Listar alunos (professor vê só sua turma)
router.get('/', authenticate, isProfessor, (req, res) => {
    let sql = `
        SELECT a.*, t.nome as turma_nome 
        FROM alunos a
        LEFT JOIN turmas t ON a.turma_id = t.id
    `;
    let params = [];
    
    // Professor vê apenas alunos da sua turma
    if (req.usuarioPerfil === 'professor' && req.turmaId) {
        sql += ' WHERE a.turma_id = ?';
        params.push(req.turmaId);
    }
    
    sql += ' ORDER BY a.id DESC';
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Buscar aluno por ID (com verificação de acesso)
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
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }
        res.json(row);
    });
});

// Criar aluno (apenas coordenador ou diretor)
router.post('/', authenticate, isCoordenador, (req, res) => {
    const { nome, matricula, turma_id, responsavel, contato } = req.body;
    
    if (!nome || !matricula) {
        return res.status(400).json({ error: 'Nome e matrícula são obrigatórios' });
    }
    
    const sql = `INSERT INTO alunos (nome, matricula, turma_id, responsavel, contato, created_by) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [nome, matricula, turma_id, responsavel, contato, req.usuarioId], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(409).json({ error: 'Matrícula já existe!' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: 'Aluno criado com sucesso!' });
    });
});

// Atualizar aluno (apenas coordenador ou diretor)
router.put('/:id', authenticate, isCoordenador, (req, res) => {
    const { id } = req.params;
    const { nome, turma_id, responsavel, contato } = req.body;
    
    const sql = `UPDATE alunos SET nome=?, turma_id=?, responsavel=?, contato=?, updated_by=? 
                 WHERE id=?`;
    
    db.run(sql, [nome, turma_id, responsavel, contato, req.usuarioId, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }
        res.json({ message: 'Aluno atualizado com sucesso!' });
    });
});

// Deletar aluno (apenas diretor)
router.delete('/:id', authenticate, isDiretor, (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT COUNT(*) as total FROM ocorrencias WHERE aluno_id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (row.total > 0) {
            return res.status(400).json({ 
                error: `Não é possível excluir. Aluno possui ${row.total} ocorrência(s) vinculada(s).` 
            });
        }
        
        db.run('DELETE FROM alunos WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
            res.json({ message: 'Aluno removido com sucesso!' });
        });
    });
});

module.exports = router;
