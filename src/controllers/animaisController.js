const db = require('../database/connection');

// Todos os animais
exports.listar = (_req, res) => {
  db.all(`SELECT * FROM animais ORDER BY id`, [], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar animais.' });
    res.json(rows.map(parse));
  });
};

// Animal por ID
exports.buscar = (req, res) => {
  db.get(`SELECT * FROM animais WHERE id=?`, [req.params.id], (err, row) => {
    if (!row) return res.status(404).json({ erro: 'Animal não encontrado.' });
    res.json(parse(row));
  });
};

function parse(a) {
  return {
    ...a,
    alimentacao: JSON.parse(a.alimentacao || '[]'),
    curiosidades: JSON.parse(a.curiosidades || '[]'),
    pistas: JSON.parse(a.pistas || '[]'),
  };
}
