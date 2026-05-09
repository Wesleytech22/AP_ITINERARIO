const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados
const dbPath = path.join(__dirname, 'database.db');

console.log('📁 Conectando ao banco:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco:', err.message);
    } else {
        console.log('✅ Conectado ao SQLite!');
        db.run('PRAGMA foreign_keys = ON');
    }
});

module.exports = db;