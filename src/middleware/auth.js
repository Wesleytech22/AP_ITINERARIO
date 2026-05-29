const jwt = require('jsonwebtoken');
const db = require('../database/connection');

<<<<<<< HEAD
module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }
  try {
    req.usuario = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'aiye_secret');
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
};

module.exports.admin = (req, res, next) => {
  if (!req.usuario || !['admin'].includes(req.usuario.role)) {
    return res.status(403).json({ erro: 'Acesso restrito a administradores.' });
  }
  next();
};

module.exports.educadorOuAdmin = (req, res, next) => {
  if (!req.usuario || !['admin','educador'].includes(req.usuario.role)) {
    return res.status(403).json({ erro: 'Acesso restrito a educadores.' });
  }
  next();
};
=======
const JWT_SECRET = process.env.JWT_SECRET || 'segredo_sistema_escolar_2026';

function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token inválido' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuarioId = decoded.id;
        req.usuarioPerfil = decoded.perfil;
        req.usuarioNome = decoded.nome;
        req.usuarioEmail = decoded.email;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
}

function isProfessor(req, res, next) {
    if (req.usuarioPerfil !== 'professor') {
        return res.status(403).json({ error: 'Acesso negado. Apenas professores.' });
    }
    next();
}

function isCoordenador(req, res, next) {
    if (req.usuarioPerfil !== 'coordenador' && req.usuarioPerfil !== 'direcao') {
        return res.status(403).json({ error: 'Acesso negado. Apenas coordenadores ou direção.' });
    }
    next();
}

function isDiretorOuCoordenador(req, res, next) {
    if (req.usuarioPerfil === 'direcao' || req.usuarioPerfil === 'coordenador') {
        return next();
    }
    return res.status(403).json({ error: 'Acesso negado. Apenas direção ou coordenadores.' });
}

function isDiretor(req, res, next) {
    if (req.usuarioPerfil !== 'direcao') {
        return res.status(403).json({ error: 'Acesso negado. Apenas direção.' });
    }
    next();
}

function canAccessAluno(req, res, next) {
    const alunoId = req.params.id || req.params.alunoId || req.body.aluno_id;

    if (!alunoId) return next();

    if (req.usuarioPerfil === 'direcao' || req.usuarioPerfil === 'coordenador') {
        return next();
    }

    if (req.usuarioPerfil === 'professor') {
        const sql = `
            SELECT a.* FROM alunos a
            JOIN turma_professores tp ON a.turma_id = tp.turma_id
            WHERE a.id = ? AND tp.professor_id = ?
        `;

        db.get(sql, [alunoId, req.usuarioId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!result) return res.status(403).json({ error: 'Acesso negado. Aluno não pertence à sua turma.' });
            next();
        });
    } else {
        next();
    }
}

module.exports = {
    authenticate,
    isProfessor,
    isCoordenador,
    isDiretor,
    isDiretorOuCoordenador,
    canAccessAluno
};
>>>>>>> 35f0742adf86c2faa55294c764daac0f3c6f1c15
