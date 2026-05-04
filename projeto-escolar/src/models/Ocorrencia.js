const db = require('../database/connection');

const Ocorrencia = {
    // Criar ocorrência
    create: (ocorrenciaData, callback) => {
        const sql = 'INSERT INTO ocorrencias (aluno_id, tipo, descricao, data) VALUES (?, ?, ?, ?)';
        db.run(sql, [ocorrenciaData.aluno_id, ocorrenciaData.tipo, ocorrenciaData.descricao, ocorrenciaData.data], function (err) {
            callback(err, { insertId: this.lastID });
        });
    },

    // Listar ocorrências de um aluno
    getByAluno: (aluno_id, callback) => {
        const sql = 'SELECT * FROM ocorrencias WHERE aluno_id = ? ORDER BY data DESC';
        db.all(sql, [aluno_id], callback);
    },

    // Listar todas
    getAll: (callback) => {
        const sql = 'SELECT o.*, a.nome as aluno_nome FROM ocorrencias o JOIN alunos a ON o.aluno_id = a.id ORDER BY o.data DESC';
        db.all(sql, callback);
    }
};

module.exports = Ocorrencia;