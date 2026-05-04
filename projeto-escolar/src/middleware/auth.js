const jwt = require('jsonwebtoken');

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

// Professor pode acessar apenas sua turma
function isProfessor(req, res, next) {
    if (req.usuarioPerfil === 'professor') {
        // Buscar turma do professor
        const db = require('../database/connection');
        db.get(
            'SELECT turma_id FROM turma_professores WHERE professor_id = ? LIMIT 1',
            [req.usuarioId],
            (err, result) => {
                if (err || !result) {
                    return res.status(403).json({ error: 'Professor não vinculado a nenhuma turma' });
                }
                req.turmaId = result.turma_id;
                next();
            }
        );
    } else {
        next();
    }
}

// Coordenador ou superior
function isCoordenador(req, res, next) {
    if (req.usuarioPerfil !== 'coordenador' && req.usuarioPerfil !== 'diretor') {
        return res.status(403).json({ 
            error: 'Acesso negado. Apenas coordenadores podem realizar esta ação.' 
        });
    }
    next();
}

// Apenas Diretor (Root)
function isDiretor(req, res, next) {
    if (req.usuarioPerfil !== 'diretor') {
        return res.status(403).json({ 
            error: 'Acesso negado. Apenas o Diretor pode realizar esta ação.' 
        });
    }
    next();
}

// Verificar se pode acessar o aluno (professor só vê sua turma)
function canAccessAluno(req, res, next) {
    if (req.usuarioPerfil === 'diretor') {
        return next();
    }
    
    if (req.usuarioPerfil === 'coordenador') {
        return next();
    }
    
    if (req.usuarioPerfil === 'professor') {
        const db = require('../database/connection');
        const alunoId = req.params.id || req.body.aluno_id;
        
        db.get(`
            SELECT a.* FROM alunos a
            JOIN turma_professores tp ON a.turma_id = tp.turma_id
            WHERE a.id = ? AND tp.professor_id = ?
        `, [alunoId, req.usuarioId], (err, result) => {
            if (err || !result) {
                return res.status(403).json({ error: 'Acesso negado. Aluno não pertence à sua turma.' });
            }
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
    canAccessAluno 
};
