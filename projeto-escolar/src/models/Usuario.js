const db = require('../database/connection');

const Usuario = {
    // Buscar usuário por email
    findByEmail: (email, callback) => {
        const sql = 'SELECT * FROM usuarios WHERE email = ?';
        db.get(sql, [email], callback);
    },

    // Criar usuário
    create: (usuarioData, callback) => {
        const sql = 'INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)';
        db.run(sql, [usuarioData.nome, usuarioData.email, usuarioData.senha, usuarioData.perfil], function (err) {
            callback(err, { insertId: this.lastID });
        });
    }
};

module.exports = Usuario;