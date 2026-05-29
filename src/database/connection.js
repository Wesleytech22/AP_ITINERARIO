const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

<<<<<<< HEAD
const dbPath = path.join(__dirname, '../../instituto_aiye.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco:', err.message);
  } else {
    console.log('✅ Banco Instituto Aiyê conectado!');
    db.run('PRAGMA foreign_keys = ON');
    criarTabelas();
  }
});

function criarTabelas() {
  db.serialize(() => {
    // Usuários (admin, educador, aluno)
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      role TEXT DEFAULT 'aluno' CHECK(role IN ('admin','educador','aluno')),
      idade INTEGER,
      escola TEXT,
      ativo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Animais da Mata Atlântica (14 espécies)
    db.run(`CREATE TABLE IF NOT EXISTS animais (
      id INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      nome_cientifico TEXT NOT NULL,
      emoji TEXT NOT NULL,
      habitat TEXT NOT NULL,
      status_conservacao TEXT NOT NULL,
      tamanho TEXT,
      alimentacao TEXT,
      curiosidades TEXT,
      voz TEXT,
      pistas TEXT,
      nivel_trofico TEXT
    )`);

    // Progresso do aluno
    db.run(`CREATE TABLE IF NOT EXISTS progresso (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER UNIQUE NOT NULL,
      pontos INTEGER DEFAULT 0,
      nivel TEXT DEFAULT 'Iniciante',
      animais_desbloqueados TEXT DEFAULT '[]',
      jogos_concluidos TEXT DEFAULT '[]',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )`);

    // Sessões de jogo
    db.run(`CREATE TABLE IF NOT EXISTS sessoes_jogo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      tipo_jogo TEXT NOT NULL,
      pontuacao INTEGER DEFAULT 0,
      acertos INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )`);

    // Quizzes
    db.run(`CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      ativo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Perguntas
    db.run(`CREATE TABLE IF NOT EXISTS perguntas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL,
      texto TEXT NOT NULL,
      emoji TEXT DEFAULT '🌿',
      opcoes TEXT NOT NULL,
      correta INTEGER NOT NULL,
      explicacao TEXT,
      animal_id INTEGER,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    )`);

    // Turmas
    db.run(`CREATE TABLE IF NOT EXISTS turmas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      escola TEXT,
      educador_id INTEGER NOT NULL,
      codigo TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (educador_id) REFERENCES usuarios(id)
    )`);

    // Turma ↔ Aluno
    db.run(`CREATE TABLE IF NOT EXISTS turmas_alunos (
      turma_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      PRIMARY KEY (turma_id, usuario_id),
      FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )`);

    setTimeout(seedDados, 300);
  });
}

async function seedDados() {
  // Admin (Patrícia)
  db.get("SELECT id FROM usuarios WHERE email='patricia@institutoaiye.org.br'", async (err, row) => {
    if (!row) {
      const hash = await bcrypt.hash('aiye@2024', 10);
      db.run(`INSERT INTO usuarios (nome,email,senha,role) VALUES (?,?,?,?)`,
        ['Patrícia (Fundadora)', 'patricia@institutoaiye.org.br', hash, 'admin']);
      db.run(`INSERT INTO usuarios (nome,email,senha,role) VALUES (?,?,?,?)`,
        ['Jerusa (Fundadora)', 'jerusa@institutoaiye.org.br', hash, 'admin']);
      console.log('✅ Admins criados: patricia@institutoaiye.org.br / aiye@2024');
    }
  });

  // Animais
  db.get("SELECT id FROM animais LIMIT 1", (err, row) => {
    if (row) return;
    const animais = [
      [1,'Gavião-pega-macaco','Spizaetus tyrannus','🦅','copa','LC','Tamanho de um gato grande',
       JSON.stringify(['macacos','aves','répteis']),
       JSON.stringify(['Asas chegam a 1 metro de envergadura!','Caça macacos em pleno voo.','Usa chamados para confundir presas.']),
       'Sou o mestre do ar!',
       JSON.stringify(['Ave de rapina das copas.','Meu prato favorito sobe em árvores.','Asas escuras e voo majestoso.']),'predador_topo'],
      [2,'Gavião-pato','Leucopternis lacernulatus','🦆','rio','VU','Maior que uma galinha',
       JSON.stringify(['patos','sapos','peixes']),
       JSON.stringify(['Endêmico da Mata Atlântica!','Vulnerável à extinção.','Vive perto de rios e brejos.']),
       'Sou raro e preciso de proteção.',
       JSON.stringify(['Ave de rapina branca e preta.','Vivo próximo a rios.','Exclusivo da Mata Atlântica.']),'predador_topo'],
      [3,'Tucano-de-bico-preto','Ramphastos vitellinus','🦜','copa','LC','Tamanho de 1 garrafa',
       JSON.stringify(['frutas','sementes','insetos']),
       JSON.stringify(['Bico oco e levíssimo!','Excelente dispersor de sementes.','Dorme com bico nas costas.']),
       'Meu bico é minha ferramenta!',
       JSON.stringify(['Bico enorme e colorido.','Espalha sementes pela floresta.','Barriga amarela vibrante.']),'onivoro'],
      [4,'Araçari-castanho','Pteroglossus castanotis','🐦','copa','LC','Tamanho de um pombo grande',
       JSON.stringify(['frutas','insetos','ovos']),
       JSON.stringify(['Parente menor do tucano!','Vive em grupos familiares.','Bico serrilhado como faca.']),
       'Somos uma família!',
       JSON.stringify(['Parente do tucano com bico serrilhado.','Vivo em grupos familiares.','Plumagem amarela intensa.']),'onivoro'],
      [5,'Surucuá-variado','Trogon surrucura','🌈','sub-bosque','LC','Tamanho de um pombo',
       JSON.stringify(['insetos','frutas','larvas']),
       JSON.stringify(['Barriga vermelha vibrante!','Mestre do disfarce.','Fica imóvel por horas nos galhos.']),
       'Sou mestre do disfarce!',
       JSON.stringify(['Plumagem vermelha, azul e verde.','Fico parado nos galhos.','Nome imita meu canto.']),'onivoro'],
      [6,'Udu-de-coroa-azul','Momotus momota','💎','sub-bosque','LC','Tamanho de um pombo',
       JSON.stringify(['insetos','aranhas','répteis pequenos']),
       JSON.stringify(['Raquetes azuis na cauda!','Balança a cauda como pêndulo.','Nidifica em barrancos de terra.']),
       'Minha cauda é como um relógio!',
       JSON.stringify(['Cauda com raquetes azuis nas pontas.','Coroa de penas azuis brilhantes.','Balança a cauda quando alerta.']),'onivoro'],
      [7,'Tamanduá-mirim','Tamandua tetradactyla','🐜','sub-bosque','LC','Tamanho de cachorro pequeno',
       JSON.stringify(['formigas','cupins','abelhas']),
       JSON.stringify(['Língua de 40 cm!','Sem dentes — estômago musculoso.','Come 9.000 formigas por dia!']),
       'Minha língua é minha arma secreta!',
       JSON.stringify(['Língua longa para formigas.','Garras fortes para formigueiros.','Focinho comprido e pelagem bicolor.']),'onivoro'],
      [8,'Anta','Tapirus terrestris','🦏','solo','VU','Até 300 kg!',
       JSON.stringify(['frutos','folhas','raízes','plantas aquáticas']),
       JSON.stringify(['Maior mamífero terrestre da América do Sul!','Focinho como pequena tromba.','Jardineira da floresta — espalha sementes.']),
       'Sou importantíssima para a floresta!',
       JSON.stringify(['Maior animal terrestre da América do Sul.','Focinho parecido com tromba.','Corre para o rio quando assustada.']),'herbivoro'],
      [9,'Jacutinga','Aburria jacutinga','🦃','copa','EN','Tamanho de galo grande',
       JSON.stringify(['frutas','sementes','palmito']),
       JSON.stringify(['Em perigo de extinção!','Bolsa azul que infla no canto.','Essencial para palmeiras nativas.']),
       'Preciso da sua ajuda!',
       JSON.stringify(['Ave preta com manchas brancas.','Pele azul e vermelha ao redor dos olhos.','Em perigo — vive em florestas grandes.']),'herbivoro'],
      [10,'Saíra-sete-cores','Tangara seledon','🎨','copa','LC','Passarinho pequeno',
       JSON.stringify(['frutas','insetos','néctar']),
       JSON.stringify(['7 cores na plumagem!','Viaja em bandos mistos.','Canto com notas agudas rápidas.']),
       'Sou um arco-íris que voa!',
       JSON.stringify(['Plumagem com 7 cores.','Pequeno, vive nas copas.','Nome refere-se à sua coloração.']),'herbivoro'],
      [11,'Tangarà-dançador','Chiroxiphia caudata','💃','sub-bosque','LC','Tamanho de pardal',
       JSON.stringify(['frutas pequenas','insetos']),
       JSON.stringify(['Dança elaborada para atrair fêmea!','Dois ou três machos dançam juntos.','Macho tem azul, preto e coroa vermelha.']),
       'Sou o melhor dançarino da floresta!',
       JSON.stringify(['Dança incrível para conquistar parceiros.','Macho com coroa vermelha brilhante.','Até 3 machos dançam em sincronia.']),'herbivoro'],
      [12,'Tiê-sangue','Ramphocelus bresilius','❤️','sub-bosque','LC','Tamanho de pardal',
       JSON.stringify(['frutas','insetos','néctar']),
       JSON.stringify(['Vermelho intenso como sangue!','Símbolo da Mata Atlântica.','Frequenta jardins e quintais.']),
       'Minha cor vermelha é um símbolo!',
       JSON.stringify(['Plumagem vermelha intensa com preto.','Muito comum na Mata Atlântica.','Nome vem da cor da plumagem.']),'herbivoro'],
      [13,'Preguiça-de-três-dedos','Bradypus tridactylus','🦥','copa','LC','Tamanho de um gato',
       JSON.stringify(['folhas','brotos','flores']),
       JSON.stringify(['Algas crescem na pelagem!','Desce da árvore 1x por semana.','Digere alimento em 1 mês.']),
       'Não tenho pressa... a floresta continuará aqui?',
       JSON.stringify(['Mamífero mais lento do mundo.','Pendurada de cabeça para baixo nas copas.','Algas verdes na pelagem para camuflagem.']),'herbivoro'],
      [14,'Benedito-de-testa-amarela','Melanerpes flavifrons','🪶','copa','LC','Tamanho de pombo',
       JSON.stringify(['insetos','larvas','frutas']),
       JSON.stringify(['Pica-pau com testa amarela!','Bico fura madeira dura.','Buracos viram lares para outros animais.']),
       'Tap! Tap! Tap! Estou trabalhando!',
       JSON.stringify(['Pica-pau com testa amarela vibrante.','Faz barulho bicando madeira.','Buracos servem de lar para outros animais.']),'onivoro']
    ];

    animais.forEach(a => {
      db.run(`INSERT INTO animais VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, a);
    });
    console.log('✅ 14 animais da Mata Atlântica inseridos!');
  });

  // Quiz padrão
  db.get("SELECT id FROM quizzes LIMIT 1", (err, row) => {
    if (row) return;
    db.run(`INSERT INTO quizzes (titulo,descricao) VALUES (?,?)`,
      ['Quiz da Mata Atlântica','Quiz principal com perguntas sobre os 14 animais'],
      function(err) {
        if (err) return;
        const qid = this.lastID;
        const perguntas = [
          ['Qual animal usa língua longa para comer formigas?','🐜',JSON.stringify(['Preguiça','Tamanduá-mirim','Anta','Jacutinga']),1,'O tamanduá tem língua de até 40 cm!',7],
          ['Qual é o maior mamífero terrestre da América do Sul?','🦏',JSON.stringify(['Tamanduá','Preguiça','Anta','Jacutinga']),2,'A anta pode pesar até 300 kg!',8],
          ['Por que o gavião-pega-macaco tem esse nome?','🦅',JSON.stringify(['Macaco é seu predador','Caça macacos','Vive onde macacos vivem','Parece macaco']),1,'Ele realmente caça macacos em pleno voo!',1],
          ['Qual pássaro tem 7 cores na plumagem?','🎨',JSON.stringify(['Tiê-sangue','Tucano','Saíra-sete-cores','Araçari']),2,'A saíra-sete-cores é um arco-íris com asas!',10],
          ['Quantos dedos tem a preguiça-de-três-dedos?','🦥',JSON.stringify(['2','3','4','5']),1,'Três dedos — exatamente como o nome diz!',13],
          ['Qual ave faz dança elaborada para atrair parceiros?','💃',JSON.stringify(['Tiê-sangue','Tucano','Gavião-pato','Tangarà-dançador']),3,'O tangarà é famoso por sua coreografia!',11],
          ['O que o udu tem de especial na cauda?','💎',JSON.stringify(['É muito longa','Raquetes azuis nas pontas','É azul brilhante','Tem chocalhos']),1,'As "raquetes" azuis são únicas no mundo das aves!',6],
          ['Qual bioma é o mais ameaçado do Brasil?','🌿',JSON.stringify(['Amazônia','Cerrado','Mata Atlântica','Pantanal']),2,'Restam apenas ~12% da Mata Atlântica original!',null],
          ['O que cresce na pelagem da preguiça?','🌱',JSON.stringify(['Musgo','Fungos','Algas verdes','Líquens']),2,'Algas! A preguiça se move devagar o suficiente para isso.',13],
          ['Qual é o status de conservação da Jacutinga?','🦃',JSON.stringify(['Pouco preocupante','Vulnerável','Em perigo','Criticamente ameaçada']),2,'A jacutinga está em perigo — precisa de proteção!',9],
          ['Qual animal é a "jardineira da floresta"?','🌱',JSON.stringify(['Tucano','Tamanduá','Anta','Preguiça']),2,'A anta espalha sementes por onde passa!',8],
          ['Qual ave pica madeira para encontrar larvas?','🪶',JSON.stringify(['Tucano','Araçari','Benedito-de-testa-amarela','Surucuá']),2,'O benedito é um pica-pau — tap tap tap!',14],
          ['Quantas formigas o tamanduá come por dia?','🐜',JSON.stringify(['500','1.000','9.000','50.000']),2,'Até 9.000! Sua língua faz todo o trabalho.',7],
          ['Qual animal é endêmico da Mata Atlântica?','🌿',JSON.stringify(['Anta','Tamanduá','Gavião-pato','Preguiça']),2,'O gavião-pato só existe na Mata Atlântica!',2],
          ['O que o tangarà-dançador faz para conquistar fêmeas?','💃',JSON.stringify(['Canta alto','Faz dança elaborada','Constrói ninhos','Traz comida']),1,'Até 3 machos dançam juntos em coreografia!',11]
        ];
        perguntas.forEach(p => {
          db.run(`INSERT INTO perguntas (quiz_id,texto,emoji,opcoes,correta,explicacao,animal_id) VALUES (?,?,?,?,?,?,?)`,
            [qid, ...p]);
        });
        console.log('✅ Quiz e perguntas inseridos!');
      }
    );
  });
}

module.exports = db;
=======
// Caminho do banco de dados
const dbPath = path.join(__dirname, 'database.db');

console.log('📁 Conectando ao banco:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco:', err.message);
    } else {
        console.log('✅ Conectado ao SQLite!');
        db.run('PRAGMA foreign_keys = ON');
    }
});

module.exports = db;
>>>>>>> 35f0742adf86c2faa55294c764daac0f3c6f1c15
