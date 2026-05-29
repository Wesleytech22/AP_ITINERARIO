const jwt = require('jsonwebtoken');

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
