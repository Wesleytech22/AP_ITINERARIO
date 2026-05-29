const db = require('../database/connection');

// Registrar sessão de jogo
exports.registrar = (req, res) => {
  const { tipo_jogo, pontuacao, pontos, acertos, total } = req.body;
  const uid = req.usuario.id;
  db.run(
    `INSERT INTO sessoes_jogo (usuario_id,tipo_jogo,pontuacao,acertos,total) VALUES (?,?,?,?,?)`,
    [uid, tipo_jogo, pontuacao||pontos||0, acertos||0, total||0],
    function(err) {
      if (err) return res.status(500).json({ erro: 'Erro ao registrar sessão.' });
      res.status(201).json({ id: this.lastID });
    }
  );
};

// Histórico do usuário
exports.historico = (req, res) => {
  db.all(
    `SELECT id, tipo_jogo, pontuacao as pontos, acertos, total, created_at
     FROM sessoes_jogo WHERE usuario_id=? ORDER BY created_at DESC LIMIT 50`,
    [req.usuario.id], (err, rows) => res.json(rows || [])
  );
};

// Estatísticas gerais
exports.estatisticas = (_req, res) => {
  db.get(
    `SELECT COUNT(*) as total_jogos, SUM(pontuacao) as total_pontos FROM sessoes_jogo`,
    [], (err, row) => res.json(row || { total_jogos: 0, total_pontos: 0 })
  );
};
