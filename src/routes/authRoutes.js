const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/authController');

router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);
router.get('/me',        auth, ctrl.me);

module.exports = router;
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_sistema_escolar_2026';

// Rota de login
router.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const sql = 'SELECT id, nome, email, senha, perfil FROM usuarios WHERE email = ?';

    db.get(sql, [email], (err, user) => {
        if (err) {
            console.error('Erro no banco:', err);
            return res.status(500).json({ error: 'Erro no servidor' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        // Comparação simples de senha (em produção, use bcrypt)
        if (user.senha !== senha) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        const token = jwt.sign(
            {
                id: user.id,
                nome: user.nome,
                email: user.email,
                perfil: user.perfil
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            token,
            usuario: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                perfil: user.perfil
            }
        });
    });
});

// Rota para verificar token (opcional)
router.get('/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ valid: false, error: 'Token inválido' });
    }
});

module.exports = router;