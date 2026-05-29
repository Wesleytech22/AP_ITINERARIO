// quizController.js – Instituto Aiye
const db = require('../database/connection');

exports.listar = (_req, res) => {
  db.all('SELECT * FROM quizzes WHERE ativo=1', [], (err, rows) => {
    res.json(rows || []);
  });
};

exports.perguntas = (req, res) => {
  db.all('SELECT * FROM perguntas WHERE quiz_id=?', [req.params.id], (err, rows) => {
    if (!rows) return res.status(404).json({ erro: 'Quiz nao encontrado.' });
    res.json(rows.map(p => ({ ...p, opcoes: JSON.parse(p.opcoes || '[]') })));
  });
};

exports.responder = (req, res) => {
  // respostas pode ser array [indice0, indice1, ...] ou objeto { pergunta_id: indice }
  const { respostas } = req.body;
  db.all('SELECT * FROM perguntas WHERE quiz_id=? ORDER BY id', [req.params.id], (err, pergs) => {
    if (!pergs?.length) return res.status(404).json({ erro: 'Quiz nao encontrado.' });
    let acertos = 0;
    const detalhes = pergs.map((p, idx) => {
      const escolhida = Array.isArray(respostas) ? respostas[idx] : respostas?.[p.id];
      const ok = escolhida === p.correta;
      if (ok) acertos++;
      return { pergunta_id: p.id, correta: ok };
    });
    const pts = acertos * 10;
    const uid = req.usuario?.id;
    if (uid) {
      db.run('INSERT INTO sessoes_jogo (usuario_id,tipo_jogo,pontuacao,acertos,total) VALUES (?,?,?,?,?)',
        [uid, 'quiz', pts, acertos, pergs.length]);
    }
    res.json({ acertos, total: pergs.length, pontos_ganhos: pts, detalhes });
  });
};
