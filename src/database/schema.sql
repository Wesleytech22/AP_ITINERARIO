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
-- 9. TABELA DE NOTAS
-- ==========================================
CREATE TABLE IF NOT EXISTS notas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL,
    disciplina_id INTEGER NOT NULL,
    bimestre INTEGER NOT NULL,
    nota REAL,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
    FOREIGN KEY (created_by) REFERENCES usuarios(id),
    UNIQUE(aluno_id, disciplina_id, bimestre)
);

-- ==========================================
-- 10. TABELA DE FREQUENCIA
-- ==========================================
CREATE TABLE IF NOT EXISTS frequencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL,
    data DATE NOT NULL,
    presente BOOLEAN DEFAULT 1,
    disciplina_id INTEGER,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
    FOREIGN KEY (created_by) REFERENCES usuarios(id),
    UNIQUE(aluno_id, data, disciplina_id)
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
('3º Ano A', '3', 'manha'),
('3º Ano B', '3', 'manha'),
('3º Ano C', '3', 'tarde'),
('2º Ano A', '2', 'manha'),
('2º Ano B', '2', 'tarde'),
('1º Ano A', '1', 'manha');

-- Disciplinas
INSERT OR IGNORE INTO disciplinas (nome, carga_horaria) VALUES
('Matemática', 120),
('Português', 120),
('Ciências', 90),
('História', 90),
('Geografia', 90),
('Inglês', 60),
('Educação Física', 60),
('Artes', 60);

-- Vincular professores as turmas
INSERT OR IGNORE INTO turma_professores (turma_id, professor_id, disciplina_id) VALUES 
(1, 2, 1),
(1, 3, 2),
(2, 2, 1),
(2, 3, 2);

-- Alunos de exemplo
INSERT OR IGNORE INTO alunos (nome, matricula, turma_id, responsavel, contato, created_by) VALUES
('João Silva', '2024001', 1, 'maria@email.com', '(11) 99999-1111', 1),
('Maria Santos', '2024002', 1, 'jose@email.com', '(11) 99999-2222', 1),
('Pedro Oliveira', '2024003', 2, 'ana@email.com', '(11) 99999-3333', 1),
('Ana Carolina', '2024004', 3, 'carlos@email.com', '(11) 97777-4444', 1),
('Lucas Ferreira', '2024005', 1, 'patricia@email.com', '(11) 98888-5555', 1);

-- Ocorrências exemplo
INSERT OR IGNORE INTO ocorrencias (aluno_id, tipo, descricao, data, created_by) VALUES
(1, 'Atraso', 'Aluno chegou 30 minutos atrasado', '2026-05-01', 1),
(2, 'Comportamento', 'Participação ativa em aula', '2026-05-02', 2),
(1, 'Nota', 'Baixo desempenho em matemática', '2026-05-03', 2),
(3, 'Falta', 'Faltou sem justificativa', '2026-05-03', 1);

-- ==========================================
-- VERIFICACOES FINAIS
-- ==========================================

-- Ativar suporte a chaves estrangeiras
PRAGMA foreign_keys = ON;