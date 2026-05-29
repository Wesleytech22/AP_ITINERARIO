// middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ong_verde_secret');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Acesso restrito a administradores' });
  next();
};

module.exports = { auth, adminOnly };
