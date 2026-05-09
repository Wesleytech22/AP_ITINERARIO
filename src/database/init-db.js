const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Caminho do banco de dados
const dbPath = path.join(__dirname, '../../../database.db');

// Deletar o banco se existir
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('📁 Banco antigo removido!');
}

console.log('📁 Criando novo banco em:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Conectado ao SQLite!');
        criarTodasTabelas();
    }
});

function criarTodasTabelas() {
    // Tabela de usuários
    db.run(`CREATE TABLE usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        perfil VARCHAR(20) DEFAULT 'professor',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de turmas
    db.run(`CREATE TABLE turmas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(50) NOT NULL,
        ano VARCHAR(10),
        turno VARCHAR(20),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de disciplinas
    db.run(`CREATE TABLE disciplinas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        carga_horaria INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de alunos
    db.run(`CREATE TABLE alunos (
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
        FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE SET NULL
    )`);

    // Tabela de ocorrências
    db.run(`CREATE TABLE ocorrencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aluno_id INTEGER NOT NULL,
        tipo VARCHAR(50),
        descricao TEXT,
        data DATE,
        anexo VARCHAR(255),
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
    )`);

    // Tabela de laudos
    db.run(`CREATE TABLE laudos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aluno_id INTEGER NOT NULL,
        arquivo VARCHAR(255) NOT NULL,
        tipo VARCHAR(50),
        observacoes TEXT,
        data_laudo DATE,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
    )`);

    // Tabela de vínculo professor-turma
    db.run(`CREATE TABLE turma_professores (
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
    )`);

    // Tabela de notas
    db.run(`CREATE TABLE notas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aluno_id INTEGER NOT NULL,
        disciplina_id INTEGER NOT NULL,
        bimestre INTEGER NOT NULL,
        nota REAL,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
        FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
        UNIQUE(aluno_id, disciplina_id, bimestre)
    )`);

    // Tabela de frequencia (SEM disciplina_id)
    db.run(`CREATE TABLE frequencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aluno_id INTEGER NOT NULL,
        data DATE NOT NULL,
        presente BOOLEAN DEFAULT 1,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
        UNIQUE(aluno_id, data)
    )`);

    console.log('✅ Tabelas criadas!');

    inserirDadosIniciais();
}

function inserirDadosIniciais() {
    // Usuários
    db.run(`INSERT INTO usuarios (id, nome, email, senha, perfil) VALUES (1, 'Administrador', 'admin@escola.com', '123456', 'coordenador')`);
    db.run(`INSERT INTO usuarios (id, nome, email, senha, perfil) VALUES (2, 'Professor Joao Silva', 'joao@escola.com', '123456', 'professor')`);
    db.run(`INSERT INTO usuarios (id, nome, email, senha, perfil) VALUES (3, 'Professor Maria Santos', 'maria@escola.com', '123456', 'professor')`);
    db.run(`INSERT INTO usuarios (id, nome, email, senha, perfil) VALUES (4, 'Diretora Ana Costa', 'diretora@escola.com', '123456', 'direcao')`);
    console.log('✅ Usuários inseridos!');

    // Turmas
    db.run(`INSERT INTO turmas (id, nome, ano, turno) VALUES (1, '3º Ano A', '3', 'manha')`);
    db.run(`INSERT INTO turmas (id, nome, ano, turno) VALUES (2, '3º Ano B', '3', 'manha')`);
    db.run(`INSERT INTO turmas (id, nome, ano, turno) VALUES (3, '3º Ano C', '3', 'tarde')`);
    db.run(`INSERT INTO turmas (id, nome, ano, turno) VALUES (4, '2º Ano A', '2', 'manha')`);
    db.run(`INSERT INTO turmas (id, nome, ano, turno) VALUES (5, '2º Ano B', '2', 'tarde')`);
    db.run(`INSERT INTO turmas (id, nome, ano, turno) VALUES (6, '1º Ano A', '1', 'manha')`);
    console.log('✅ Turmas inseridas!');

    // Disciplinas
    db.run(`INSERT INTO disciplinas (id, nome, carga_horaria) VALUES (1, 'Matemática', 120)`);
    db.run(`INSERT INTO disciplinas (id, nome, carga_horaria) VALUES (2, 'Português', 120)`);
    db.run(`INSERT INTO disciplinas (id, nome, carga_horaria) VALUES (3, 'Ciências', 90)`);
    db.run(`INSERT INTO disciplinas (id, nome, carga_horaria) VALUES (4, 'História', 90)`);
    db.run(`INSERT INTO disciplinas (id, nome, carga_horaria) VALUES (5, 'Geografia', 90)`);
    db.run(`INSERT INTO disciplinas (id, nome, carga_horaria) VALUES (6, 'Inglês', 60)`);
    console.log('✅ Disciplinas inseridas!');

    // Alunos
    db.run(`INSERT INTO alunos (id, nome, matricula, turma_id, responsavel, contato, created_by) VALUES (1, 'João Silva', '2024001', 1, 'maria@email.com', '(11) 99999-1111', 1)`);
    db.run(`INSERT INTO alunos (id, nome, matricula, turma_id, responsavel, contato, created_by) VALUES (2, 'Maria Santos', '2024002', 1, 'jose@email.com', '(11) 99999-2222', 1)`);
    db.run(`INSERT INTO alunos (id, nome, matricula, turma_id, responsavel, contato, created_by) VALUES (3, 'Pedro Oliveira', '2024003', 2, 'ana@email.com', '(11) 99999-3333', 1)`);
    db.run(`INSERT INTO alunos (id, nome, matricula, turma_id, responsavel, contato, created_by) VALUES (4, 'Ana Carolina', '2024004', 3, 'carlos@email.com', '(11) 97777-4444', 1)`);
    db.run(`INSERT INTO alunos (id, nome, matricula, turma_id, responsavel, contato, created_by) VALUES (5, 'Lucas Ferreira', '2024005', 1, 'patricia@email.com', '(11) 98888-5555', 1)`);
    console.log('✅ Alunos inseridos!');

    // Vínculos
    db.run(`INSERT INTO turma_professores (turma_id, professor_id, disciplina_id) VALUES (1, 2, 1)`);
    db.run(`INSERT INTO turma_professores (turma_id, professor_id, disciplina_id) VALUES (1, 3, 2)`);
    db.run(`INSERT INTO turma_professores (turma_id, professor_id, disciplina_id) VALUES (2, 2, 1)`);
    db.run(`INSERT INTO turma_professores (turma_id, professor_id, disciplina_id) VALUES (2, 3, 2)`);
    console.log('✅ Vínculos inseridos!');

    // Ocorrências
    db.run(`INSERT INTO ocorrencias (aluno_id, tipo, descricao, data, created_by) VALUES (1, 'Atraso', 'Aluno chegou 30 minutos atrasado', '2026-05-01', 1)`);
    db.run(`INSERT INTO ocorrencias (aluno_id, tipo, descricao, data, created_by) VALUES (2, 'Comportamento', 'Participação ativa em aula', '2026-05-02', 2)`);
    db.run(`INSERT INTO ocorrencias (aluno_id, tipo, descricao, data, created_by) VALUES (1, 'Nota', 'Baixo desempenho em matemática', '2026-05-03', 2)`);
    db.run(`INSERT INTO ocorrencias (aluno_id, tipo, descricao, data, created_by) VALUES (3, 'Falta', 'Faltou sem justificativa', '2026-05-03', 1)`);
    console.log('✅ Ocorrências inseridas!');

    console.log('');
    console.log('🎉 Banco de dados inicializado com sucesso!');
    console.log('📌 Credenciais de acesso:');
    console.log('   Coordenador: admin@escola.com / 123456');
    console.log('   Professor: joao@escola.com / 123456');
    console.log('   Professor: maria@escola.com / 123456');
    console.log('   Direção: diretora@escola.com / 123456');
    console.log('');

    db.close(() => {
        console.log('🔒 Conexão fechada.');
        process.exit(0);
    });
}

module.exports = db;