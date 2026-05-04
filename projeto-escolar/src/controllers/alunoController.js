const db = require('../database/connection');

const alunoController = {
    // Criar aluno
    create: (req, res) => {
        const { nome, matricula, turma, responsavel, contato } = req.body;
        
        if (!nome || !matricula) {
            return res.status(400).json({ error: 'Nome e matrícula são obrigatórios' });
        }
        
        const sql = `INSERT INTO alunos (nome, matricula, turma, responsavel, contato) 
                     VALUES (?, ?, ?, ?, ?)`;
        
        db.run(sql, [nome, matricula, turma, responsavel, contato], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Matrícula já existe!' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ 
                id: this.lastID, 
                message: 'Aluno criado com sucesso!' 
            });
        });
    },
    
    // Listar todos os alunos
    list: (req, res) => {
        const sql = 'SELECT * FROM alunos ORDER BY id DESC';
        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    },
    
    // Buscar aluno por ID
    getById: (req, res) => {
        const { id } = req.params;
        const sql = 'SELECT * FROM alunos WHERE id = ?';
        
        db.get(sql, [id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(404).json({ error: 'Aluno não encontrado' });
            }
            res.json(row);
        });
    },
    
    // Atualizar aluno
    update: (req, res) => {
        const { id } = req.params;
        const { nome, turma, responsavel, contato } = req.body;
        
        const sql = `UPDATE alunos SET nome=?, turma=?, responsavel=?, contato=? 
                     WHERE id=?`;
        
        db.run(sql, [nome, turma, responsavel, contato, id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Aluno não encontrado' });
            }
            res.json({ message: 'Aluno atualizado com sucesso!' });
        });
    },
    
    // Deletar aluno
    delete: (req, res) => {
        const { id } = req.params;
        const sql = 'DELETE FROM alunos WHERE id = ?';
        
        db.run(sql, [id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Aluno não encontrado' });
            }
            res.json({ message: 'Aluno removido com sucesso!' });
        });
    }
};

module.exports = alunoController;
