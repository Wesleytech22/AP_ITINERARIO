-- ==========================================
-- SCRIPT COMPLETO PARA SQLITE
-- ==========================================

-- ==========================================
-- 1. TABELA DE USUARIOS
-- ==========================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) DEFAULT 'professor',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. TABELA DE TURMAS
-- ==========================================
CREATE TABLE IF NOT EXISTS turmas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(50) NOT NULL,
    ano VARCHAR(10),
    turno VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. TABELA DE DISCIPLINAS
-- ==========================================
CREATE TABLE IF NOT EXISTS disciplinas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    carga_horaria INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. TABELA DE ALUNOS
-- ==========================================
CREATE TABLE IF NOT EXISTS alunos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    turma_id INTEGER,
    responsavel VARCHAR(100),
    contato VARCHAR(50),
    created_by INTEGER,
    updated_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id),
    FOREIGN KEY (updated_by) REFERENCES usuarios(id)
);

-- ==========================================
-- 5. TABELA DE OCORRENCIAS
-- ==========================================
CREATE TABLE IF NOT EXISTS ocorrencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL,
    tipo VARCHAR(50),
    descricao TEXT,
    data DATE,
    anexo VARCHAR(255),
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES usuarios(id)
);

-- ==========================================
-- 6. TABELA DE LAUDOS
-- ==========================================
CREATE TABLE IF NOT EXISTS laudos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL,
    arquivo VARCHAR(255) NOT NULL,
    tipo VARCHAR(50),
    observacoes TEXT,
    data_laudo DATE,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES usuarios(id)
);

-- ==========================================
-- 7. TABELA DE VINCULO PROFESSOR-TURMA-DISCIPLINA
-- ==========================================
CREATE TABLE IF NOT EXISTS turma_professores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    turma_id INTEGER NOT NULL,
    professor_id INTEGER NOT NULL,
    disciplina_id INTEGER NOT NULL,
    ano_letivo INTEGER DEFAULT 2026,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE,
    UNIQUE(turma_id, professor_id, disciplina_id, ano_letivo)
);

-- ==========================================
-- 8. TABELA DE LOGS DE ALTERACAO
-- ==========================================
CREATE TABLE IF NOT EXISTS logs_alteracao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tabela VARCHAR(50),
    registro_id INTEGER,
    acao VARCHAR(20),
    dados_antigos TEXT,
    dados_novos TEXT,
    usuario_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ==========================================
-- INSERIR DADOS INICIAIS
-- ==========================================

-- Usuarios (senha = 123456)
INSERT OR IGNORE INTO usuarios (nome, email, senha, perfil) VALUES
('Administrador', 'admin@escola.com', '123456', 'coordenador'),
('Professor Joao Silva', 'joao@escola.com', '123456', 'professor'),
('Professor Maria Santos', 'maria@escola.com', '123456', 'professor'),
('Diretora Ana Costa', 'diretora@escola.com', '123456', 'direcao');

-- Turmas
INSERT OR IGNORE INTO turmas (nome, ano, turno) VALUES
('3 Ano A', '3', 'manha'),
('3 Ano B', '3', 'manha'),
('3 Ano C', '3', 'tarde'),
('2 Ano A', '2', 'manha'),
('2 Ano B', '2', 'tarde'),
('1 Ano A', '1', 'manha');

-- Disciplinas
INSERT OR IGNORE INTO disciplinas (nome, carga_horaria) VALUES
('Matematica', 120),
('Portugues', 120),
('Ciencias', 90),
('Historia', 90),
('Geografia', 90),
('Ingles', 60),
('Educacao Fisica', 60),
('Artes', 60);

-- Vincular professores as turmas
INSERT OR IGNORE INTO turma_professores (turma_id, professor_id, disciplina_id) VALUES (1, 2, 1);
INSERT OR IGNORE INTO turma_professores (turma_id, professor_id, disciplina_id) VALUES (1, 3, 2);
INSERT OR IGNORE INTO turma_professores (turma_id, professor_id, disciplina_id) VALUES (2, 2, 1);
INSERT OR IGNORE INTO turma_professores (turma_id, professor_id, disciplina_id) VALUES (2, 2, 2);

-- Alunos de exemplo
INSERT OR IGNORE INTO alunos (nome, matricula, turma_id, responsavel, contato, created_by) VALUES
('Joao Silva', '2024001', 1, 'Maria Silva', '(11) 99999-1111', 1),
('Maria Santos', '2024002', 1, 'Jose Santos', '(11) 99999-2222', 1),
('Pedro Oliveira', '2024003', 2, 'Ana Oliveira', '(11) 99999-3333', 1),
('Ana Carolina', '2024004', 3, 'Carlos Souza', '(11) 97777-4444', 1),
('Lucas Ferreira', '2024005', 1, 'Patricia Ferreira', '(11) 98888-5555', 1);

-- Ocorrencias exemplo
INSERT OR IGNORE INTO ocorrencias (aluno_id, tipo, descricao, data, created_by) VALUES
(1, 'Atraso', 'Aluno chegou 30 minutos atrasado', '2026-05-01', 1),
(2, 'Comportamento', 'Participacao ativa em aula', '2026-05-02', 2),
(1, 'Nota', 'Baixo desempenho em matematica', '2026-05-03', 2),
(3, 'Falta', 'Faltou sem justificativa', '2026-05-03', 1);

-- ==========================================
-- VERIFICACOES FINAIS
-- ==========================================

-- Ativar suporte a chaves estrangeiras
PRAGMA foreign_keys = ON;

-- Ver todas as tabelas criadas
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;

-- Ver usuarios
SELECT '=== USUARIOS ===' as '';
SELECT id, nome, email, perfil FROM usuarios;

-- Ver turmas
SELECT '=== TURMAS ===' as '';
SELECT * FROM turmas;

-- Ver disciplinas
SELECT '=== DISCIPLINAS ===' as '';
SELECT * FROM disciplinas;

-- Ver vinculos professor-turma-disciplina
SELECT '=== VINCULOS ===' as '';
SELECT 
    t.nome as turma,
    u.nome as professor,
    d.nome as disciplina
FROM turma_professores tp
JOIN turmas t ON tp.turma_id = t.id
JOIN usuarios u ON tp.professor_id = u.id
JOIN disciplinas d ON tp.disciplina_id = d.id;

-- Ver alunos com suas turmas
SELECT '=== ALUNOS ===' as '';
SELECT a.id, a.nome, a.matricula, t.nome as turma, a.responsavel, a.contato
FROM alunos a
LEFT JOIN turmas t ON a.turma_id = t.id
ORDER BY a.id;

-- Ver ocorrencias
SELECT '=== OCORRENCIAS ===' as '';
SELECT o.id, a.nome as aluno, o.tipo, o.descricao, o.data
FROM ocorrencias o
JOIN alunos a ON o.aluno_id = a.id
ORDER BY o.data DESC;