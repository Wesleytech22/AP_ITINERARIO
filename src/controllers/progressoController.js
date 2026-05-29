const db = require('../database/connection');

// Calcular nível a partir dos pontos
function calcularNivel(pontos) {
  if (pontos >= 1000) return 4;
  if (pontos >= 600)  return 3;
  if (pontos >= 300)  return 2;
  if (pontos >= 100)  return 1;
  return 0;
}

// Buscar progresso do usuário
exports.buscar = (req, res) => {
  const id = req.params.id || req.usuario.id;
  db.get(`SELECT * FROM progresso WHERE usuario_id=?`, [id], (err, row) => {
    if (!row) return res.json({ pontos:0, nivel:0, animais_desbloqueados:[], jogos_concluidos:0 });
    const animais = JSON.parse(row.animais_desbloqueados || '[]');
    const jogos = typeof row.jogos_concluidos === 'number'
      ? row.jogos_concluidos
      : (JSON.parse(row.jogos_concluidos || '[]').length || 0);
    res.json({ ...row, nivel: calcularNivel(row.pontos), animais_desbloqueados: animais, jogos_concluidos: jogos });
  });
};

// Salvar progresso
exports.salvar = (req, res) => {
  const { pontos, animais_desbloqueados, jogos_concluidos } = req.body;
  const uid = req.usuario.id;
  const nivel = calcularNivel(pontos || 0);
  db.run(
    `INSERT INTO progresso (usuario_id,pontos,nivel,animais_desbloqueados,jogos_concluidos,updated_at)
     VALUES (?,?,?,?,?,CURRENT_TIMESTAMP)
     ON CONFLICT(usuario_id) DO UPDATE SET
       pontos=excluded.pontos, nivel=excluded.nivel,
       animais_desbloqueados=excluded.animais_desbloqueados,
       jogos_concluidos=excluded.jogos_concluidos,
       updated_at=CURRENT_TIMESTAMP`,
    [uid, pontos||0, nivel,
     JSON.stringify(animais_desbloqueados||[]),
     jogos_concluidos||0],
    (err) => {
      if (err) return res.status(500).json({ erro: 'Erro ao salvar progresso.' });
      exports.buscar(req, res);
    }
  );
};

// Ranking
exports.ranking = (_req, res) => {
  db.all(
    `SELECT u.nome, p.pontos, p.nivel,
       json_array_length(p.animais_desbloqueados) as animais
     FROM progresso p JOIN usuarios u ON u.id=p.usuario_id
     ORDER BY p.pontos DESC LIMIT 20`,
    [], (err, rows) => res.json(rows || [])
  );
};
