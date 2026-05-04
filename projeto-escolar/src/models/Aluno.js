const db = require('../database/connection');

const Aluno = {
    // Criar aluno
    create: (alunoData, callback) => {
        const sql = 'INSERT INTO alunos (nome, matricula, turma, responsavel, contato) VALUES (?, ?, ?, ?, ?)';
        db.run(sql, [alunoData.nome, alunoData.matricula, alunoData.turma, alunoData.responsavel, alunoData.contato], function (err) {
            callback(err, { insertId: this.lastID });
        });
    },

    // Listar todos
    getAll: (callback) => {
        const sql = 'SELECT * FROM alunos';
        db.all(sql, callback);
    },

    // Buscar por id
    getById: (id, callback) => {
        const sql = 'SELECT * FROM alunos WHERE id = ?';
        db.get(sql, [id], callback);
    },

    // Buscar por matrícula
    getByMatricula: (matricula, callback) => {
        const sql = 'SELECT * FROM alunos WHERE matricula = ?';
        db.get(sql, [matricula], callback);
    },

    // Atualizar
    update: (id, alunoData, callback) => {
        const sql = 'UPDATE alunos SET nome=?, turma=?, responsavel=?, contato=? WHERE id=?';
        db.run(sql, [alunoData.nome, alunoData.turma, alunoData.responsavel, alunoData.contato, id], callback);
    },

    // Deletar
    delete: (id, callback) => {
        const sql = 'DELETE FROM alunos WHERE id=?';
        db.run(sql, [id], callback);
    }
};

module.exports = Aluno;