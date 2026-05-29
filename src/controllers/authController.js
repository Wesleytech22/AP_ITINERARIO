const db = require('../database/connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'aiye_secret';
const EXPIRE = '7d';

function gerarToken(usuario) {
  return jwt.sign({ id: usuario.id, email: usuario.email, role: usuario.role }, SECRET, { expiresIn: EXPIRE });
}

exports.register = (req, res) => {
  const { nome, email, senha, role } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });

  const hash = bcrypt.hashSync(senha, 10);
  const roleValido = ['admin', 'educador', 'aluno'].includes(role) ? role : 'aluno';

  db.run(
    'INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)',
    [nome, email, hash, roleValido],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(409).json({ erro: 'E-mail já cadastrado.' });
        return res.status(500).json({ erro: 'Erro ao cadastrar.' });
      }
      const usuario = { id: this.lastID, nome, email, role: roleValido, pontos: 0, nivel: 0 };
      // Criar progresso inicial
      db.run('INSERT INTO progresso (usuario_id, pontos, nivel, animais_desbloqueados, jogos_concluidos) VALUES (?,0,0,?,0)',
        [this.lastID, '[]']);
      res.status(201).json({ token: gerarToken(usuario), usuario });
    }
  );
};

exports.login = (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });

  db.get('SELECT u.*, p.pontos as p_pontos FROM usuarios u LEFT JOIN progresso p ON p.usuario_id=u.id WHERE u.email=?',
    [email], (err, row) => {
      if (!row) return res.status(401).json({ erro: 'Credenciais inválidas.' });
      if (!bcrypt.compareSync(senha, row.senha)) return res.status(401).json({ erro: 'Credenciais inválidas.' });

      const calcNivel = (pts) => {
        if (pts >= 1000) return 4; if (pts >= 600) return 3;
        if (pts >= 300) return 2; if (pts >= 100) return 1; return 0;
      };
      const pontos = row.p_pontos || 0;
      const usuario = { id: row.id, nome: row.nome, email: row.email, role: row.role, pontos, nivel: calcNivel(pontos) };
      res.json({ token: gerarToken(usuario), usuario });
    }
  );
};

exports.me = (req, res) => {
  db.get('SELECT u.*, p.pontos as p_pontos FROM usuarios u LEFT JOIN progresso p ON p.usuario_id=u.id WHERE u.id=?',
    [req.usuario.id], (err, row) => {
      if (!row) return res.status(404).json({ erro: 'Usuário não encontrado.' });
      res.json({ id: row.id, nome: row.nome, email: row.email, role: row.role, pontos: row.p_pontos || 0 });
    }
  );
};
