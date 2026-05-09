const db = require('../database/connection');

const alunoController = {
    // Criar aluno
    create: (req, res) => {
        const { nome, matricula, turma_id, responsavel, contato } = req.body;

        if (!nome || !matricula) {
            return res.status(400).json({ error: 'Nome e matrícula são obrigatórios' });
        }

        const sql = `INSERT INTO alunos (nome, matricula, turma_id, responsavel, contato, created_by, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`;

        db.run(sql, [nome, matricula, turma_id || null, responsavel || null, contato || null, req.usuarioId], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Matrícula já existe!' });
                }
                console.error('Erro ao criar aluno:', err);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                id: this.lastID,
                message: 'Aluno criado com sucesso!'
            });
        });
    },

    // Listar todos os alunos (com nome da turma)
    list: (req, res) => {
        const sql = `
            SELECT a.*, t.nome as turma_nome 
            FROM alunos a
            LEFT JOIN turmas t ON a.turma_id = t.id 
            ORDER BY a.id DESC
        `;
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Erro ao listar alunos:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    },

    // Buscar aluno por ID (com nome da turma)
    getById: (req, res) => {
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
    },

    // Atualizar aluno
    update: (req, res) => {
        const { id } = req.params;
        const { nome, turma_id, responsavel, contato } = req.body;

        if (!nome) {
            return res.status(400).json({ error: 'Nome é obrigatório' });
        }

        const sql = `UPDATE alunos SET nome=?, turma_id=?, responsavel=?, contato=?, updated_by=?, updated_at=datetime('now') 
                     WHERE id=?`;

        db.run(sql, [nome, turma_id || null, responsavel || null, contato || null, req.usuarioId, id], function (err) {
            if (err) {
                console.error('Erro ao atualizar aluno:', err);
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Aluno não encontrado' });
            }
            res.json({ message: 'Aluno atualizado com sucesso!' });
        });
    },

    // Deletar aluno (com verificação de ocorrências vinculadas)
    delete: (req, res) => {
        const { id } = req.params;

        // Verificar se existem ocorrências vinculadas
        db.get('SELECT COUNT(*) as total FROM ocorrencias WHERE aluno_id = ?', [id], (err, row) => {
            if (err) {
                console.error('Erro ao verificar ocorrências:', err);
                return res.status(500).json({ error: err.message });
            }

            if (row.total > 0) {
                return res.status(400).json({
                    error: `Não é possível excluir. Aluno possui ${row.total} ocorrência(s) vinculada(s).`
                });
            }

            // Verificar se existem laudos vinculados
            db.get('SELECT COUNT(*) as total FROM laudos WHERE aluno_id = ?', [id], (err, rowLaudos) => {
                if (err) {
                    console.error('Erro ao verificar laudos:', err);
                    return res.status(500).json({ error: err.message });
                }

                if (rowLaudos && rowLaudos.total > 0) {
                    return res.status(400).json({
                        error: `Não é possível excluir. Aluno possui ${rowLaudos.total} laudo(s) vinculado(s).`
                    });
                }

                const sql = 'DELETE FROM alunos WHERE id = ?';

                db.run(sql, [id], function (err) {
                    if (err) {
                        console.error('Erro ao deletar aluno:', err);
                        return res.status(500).json({ error: err.message });
                    }
                    if (this.changes === 0) {
                        return res.status(404).json({ error: 'Aluno não encontrado' });
                    }
                    res.json({ message: 'Aluno removido com sucesso!' });
                });
            });
        });
    },

    // Buscar alunos por turma
    getByTurma: (req, res) => {
        const { turma_id } = req.params;
        const sql = `
            SELECT a.*, t.nome as turma_nome 
            FROM alunos a
            LEFT JOIN turmas t ON a.turma_id = t.id 
            WHERE a.turma_id = ?
            ORDER BY a.nome ASC
        `;

        db.all(sql, [turma_id], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar alunos por turma:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    },

    // Buscar aluno por matrícula
    getByMatricula: (req, res) => {
        const { matricula } = req.params;
        const sql = `
            SELECT a.*, t.nome as turma_nome 
            FROM alunos a
            LEFT JOIN turmas t ON a.turma_id = t.id 
            WHERE a.matricula = ?
        `;

        db.get(sql, [matricula], (err, row) => {
            if (err) {
                console.error('Erro ao buscar aluno por matrícula:', err);
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(404).json({ error: 'Aluno não encontrado' });
            }
            res.json(row);
        });
    },

    // Buscar alunos em risco (exemplo - você pode personalizar a lógica)
    getAlunosRisco: (req, res) => {
        // Esta é uma lógica de exemplo - você pode implementar critérios reais
        const sql = `
            SELECT a.*, t.nome as turma_nome,
                   COUNT(o.id) as total_ocorrencias
            FROM alunos a
            LEFT JOIN turmas t ON a.turma_id = t.id
            LEFT JOIN ocorrencias o ON a.id = o.aluno_id
            GROUP BY a.id
            HAVING total_ocorrencias >= 2
            ORDER BY total_ocorrencias DESC
        `;

        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar alunos em risco:', err);
                return res.status(500).json({ error: err.message });
            }

            // Classificar risco baseado no número de ocorrências
            const alunosComRisco = rows.map(aluno => ({
                ...aluno,
                risco: aluno.total_ocorrencias >= 5 ? 'alto' : (aluno.total_ocorrencias >= 2 ? 'medio' : 'baixo')
            }));

            res.json(alunosComRisco);
        });
    }
};

module.exports = alunoController;