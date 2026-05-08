const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados
const dbPath = path.join(__dirname, '../../database.db');

// Conectar ao banco
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar:', err.message);
    } else {
        console.log('✅ Conectado ao SQLite!');
        // ATIVAR CHAVE ESTRANGEIRA
        db.run('PRAGMA foreign_keys = ON');
        criarTodasTabelas();
    }
});

function criarTodasTabelas() {
    // 1. Tabela de usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            perfil VARCHAR(20) DEFAULT 'professor',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 2. Tabela de turmas
    db.run(`
        CREATE TABLE IF NOT EXISTS turmas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome VARCHAR(50) NOT NULL,
            ano VARCHAR(10),
            turno VARCHAR(20),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 3. Tabela de disciplinas
    db.run(`
        CREATE TABLE IF NOT EXISTS disciplinas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome VARCHAR(100) NOT NULL,
            carga_horaria INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 4. Tabela de alunos (atualizada)
    db.run(`
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
        )
    `);

    // 5. Tabela de ocorrências
    db.run(`
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
        )
    `);

    // 6. Tabela de laudos
    db.run(`
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
        )
    `);

    // 7. Tabela de vínculo professor-turma-disciplina
    db.run(`
        CREATE TABLE IF NOT EXISTS turma_professores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            turma_id INTEGER NOT NULL,
            professor_id INTEGER NOT NULL,
            disciplina_id INTEGER NOT NULL,
            ano_letivo INTEGER DEFAULT 2026,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
            FOREIGN KEY (professor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE
        )
    `);

    // 8. Tabela de logs de alteração
    db.run(`
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
        )
    `);

    // Aguardar criação das tabelas antes de inserir dados
    setTimeout(() => {
        inserirDadosIniciais();
    }, 100);
}

function inserirDadosIniciais() {
    // Inserir usuários padrão
    db.get("SELECT * FROM usuarios WHERE email = 'admin@escola.com'", (err, row) => {
        if (!row) {
            const usuarios = [
                ['Administrador', 'admin@escola.com', '123456', 'coordenador'],
                ['Professor João', 'joao@escola.com', '123456', 'professor'],
                ['Professor Maria', 'maria@escola.com', '123456', 'professor'],
                ['Diretora Ana', 'diretora@escola.com', '123456', 'direcao']
            ];

            usuarios.forEach(usuario => {
                db.run(`INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)`, usuario);
            });
            console.log('✅ Usuários inseridos!');
        }
    });

    // Inserir turmas
    db.get("SELECT * FROM turmas LIMIT 1", (err, row) => {
        if (!row) {
            const turmas = [
                ['3º Ano A', '3º', 'manhã'],
                ['3º Ano B', '3º', 'manhã'],
                ['3º Ano C', '3º', 'tarde'],
                ['2º Ano A', '2º', 'manhã']
            ];

            turmas.forEach(turma => {
                db.run(`INSERT INTO turmas (nome, ano, turno) VALUES (?, ?, ?)`, turma);
            });
            console.log('✅ Turmas inseridas!');
        }
    });

    // Inserir disciplinas
    db.get("SELECT * FROM disciplinas LIMIT 1", (err, row) => {
        if (!row) {
            const disciplinas = [
                ['Matemática', 120],
                ['Português', 120],
                ['Ciências', 90],
                ['História', 90],
                ['Geografia', 90],
                ['Inglês', 60]
            ];

            disciplinas.forEach(disciplina => {
                db.run(`INSERT INTO disciplinas (nome, carga_horaria) VALUES (?, ?)`, disciplina);
            });
            console.log('✅ Disciplinas inseridas!');
        }
    });

    // Inserir alunos de exemplo
    db.get("SELECT * FROM alunos LIMIT 1", (err, row) => {
        if (!row) {
            // Primeiro, pegar o ID da primeira turma
            db.get("SELECT id FROM turmas WHERE nome = '3º Ano A'", (err, turma) => {
                const turmaId = turma ? turma.id : 1;

                const alunos = [
                    ['João Silva', '2024001', turmaId, 'Maria Silva', '(11) 99999-1111', 1],
                    ['Maria Santos', '2024002', turmaId, 'José Santos', '(11) 99999-2222', 1],
                    ['Pedro Oliveira', '2024003', turmaId + 1, 'Ana Oliveira', '(11) 99999-3333', 1]
                ];

                alunos.forEach(aluno => {
                    db.run(`INSERT INTO alunos (nome, matricula, turma_id, responsavel, contato, created_by) VALUES (?, ?, ?, ?, ?, ?)`, aluno);
                });
                console.log('✅ Alunos de exemplo inseridos!');
            });
        }
    });

    // Inserir vínculos professor-turma
    db.get("SELECT * FROM turma_professores LIMIT 1", (err, row) => {
        if (!row) {
            // Pegar IDs necessários
            db.get("SELECT id FROM turmas WHERE nome = '3º Ano A'", (err, turma1) => {
                db.get("SELECT id FROM turmas WHERE nome = '3º Ano B'", (err, turma2) => {
                    db.get("SELECT id FROM usuarios WHERE email = 'joao@escola.com'", (err, profJoao) => {
                        db.get("SELECT id FROM usuarios WHERE email = 'maria@escola.com'", (err, profMaria) => {
                            db.get("SELECT id FROM disciplinas WHERE nome = 'Matemática'", (err, discMat) => {
                                db.get("SELECT id FROM disciplinas WHERE nome = 'Português'", (err, discPort) => {

                                    if (turma1 && profJoao && discMat) {
                                        db.run(`INSERT INTO turma_professores (turma_id, professor_id, disciplina_id) VALUES (?, ?, ?)`,
                                            [turma1.id, profJoao.id, discMat.id]);
                                    }
                                    if (turma1 && profMaria && discPort) {
                                        db.run(`INSERT INTO turma_professores (turma_id, professor_id, disciplina_id) VALUES (?, ?, ?)`,
                                            [turma1.id, profMaria.id, discPort.id]);
                                    }
                                    if (turma2 && profJoao && discMat) {
                                        db.run(`INSERT INTO turma_professores (turma_id, professor_id, disciplina_id) VALUES (?, ?, ?)`,
                                            [turma2.id, profJoao.id, discMat.id]);
                                    }

                                    console.log('✅ Vínculos professor-turma inseridos!');
                                });
                            });
                        });
                    });
                });
            });
        }
    });

    console.log('🎉 Banco de dados inicializado com sucesso!');
    console.log('📌 Credenciais de acesso:');
    console.log('   Coordenador: admin@escola.com / 123456');
    console.log('   Professor: joao@escola.com / 123456');
    console.log('   Professor: maria@escola.com / 123456');
    console.log('   Direção: diretora@escola.com / 123456');
}

module.exports = db;