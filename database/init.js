const { ensureInit, run, get, all, save } = require('./db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const SCHEMA = [
`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'volunteer',
  bio TEXT, avatar_url TEXT, points INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT (datetime('now')))`,
`CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
  type TEXT NOT NULL, location TEXT, date DATETIME NOT NULL,
  max_members INTEGER DEFAULT 20, image_url TEXT, created_by TEXT,
  created_at DATETIME DEFAULT (datetime('now')))`,
`CREATE TABLE IF NOT EXISTS activity_enrollments (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, activity_id TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed', enrolled_at DATETIME DEFAULT (datetime('now')),
  UNIQUE(user_id, activity_id))`,
`CREATE TABLE IF NOT EXISTS volunteer_moments (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, activity_id TEXT,
  title TEXT NOT NULL, description TEXT, image_url TEXT, tags TEXT,
  likes INTEGER DEFAULT 0, created_at DATETIME DEFAULT (datetime('now')))`,
`CREATE TABLE IF NOT EXISTS moment_likes (
  user_id TEXT NOT NULL, moment_id TEXT NOT NULL,
  created_at DATETIME DEFAULT (datetime('now')), PRIMARY KEY (user_id, moment_id))`,
`CREATE TABLE IF NOT EXISTS moment_comments (
  id TEXT PRIMARY KEY, moment_id TEXT NOT NULL, user_id TEXT NOT NULL,
  content TEXT NOT NULL, created_at DATETIME DEFAULT (datetime('now')))`,
`CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
  youtube_id TEXT NOT NULL, category TEXT NOT NULL, duration TEXT,
  views INTEGER DEFAULT 0, featured INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT (datetime('now')))`,
`CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
  category TEXT NOT NULL, iframe_url TEXT, thumbnail TEXT,
  plays INTEGER DEFAULT 0, featured INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT (datetime('now')))`,
`CREATE TABLE IF NOT EXISTS game_scores (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, game_id TEXT NOT NULL,
  score INTEGER NOT NULL, played_at DATETIME DEFAULT (datetime('now')))`,
`CREATE TABLE IF NOT EXISTS awareness_cards (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL,
  category TEXT NOT NULL, icon TEXT, color TEXT, tip TEXT,
  created_at DATETIME DEFAULT (datetime('now')))`,
`CREATE TABLE IF NOT EXISTS volunteer_hours (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, activity_id TEXT,
  hours REAL NOT NULL, description TEXT, date DATE NOT NULL,
  verified INTEGER DEFAULT 0, created_at DATETIME DEFAULT (datetime('now')))`,
`CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL,
  icon TEXT NOT NULL, condition_key TEXT NOT NULL, points_req INTEGER DEFAULT 0)`,
`CREATE TABLE IF NOT EXISTS user_badges (
  user_id TEXT NOT NULL, badge_id TEXT NOT NULL,
  earned_at DATETIME DEFAULT (datetime('now')), PRIMARY KEY (user_id, badge_id))`,
`CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL,
  summary TEXT, image_url TEXT, author_id TEXT, published INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT (datetime('now')))`
];

async function initDb() {
  await ensureInit();
  SCHEMA.forEach(s => { try { run(s); } catch(e) {} });

  const existing = get('SELECT COUNT(*) as c FROM users');
  if (existing && existing.c > 0) { console.log('✅ DB já inicializado.'); return; }

  console.log('🌱 Inserindo dados iniciais...');

  const adminId = uuidv4();
  run('INSERT INTO users (id,name,email,password,role,bio,points) VALUES (?,?,?,?,?,?,?)',
    [adminId,'Admin Verde Vivo','admin@onvverde.org',bcrypt.hashSync('admin123',10),'admin','Administrador da ONG Verde Vivo',500]);
  run('INSERT INTO users (id,name,email,password,role,bio,points) VALUES (?,?,?,?,?,?,?)',
    [uuidv4(),'Maria Silva','maria@email.com',bcrypt.hashSync('123456',10),'volunteer','Apaixonada pela natureza!',320]);

  [['A Crise da Biodiversidade','Documental sobre perda de espécies.','M1hBGS7OjC8','fauna','18:32',1],
   ['Oceanos em Perigo','Como o plástico destrói ecossistemas marinhos.','HQTUWK7CM-Y','oceano','12:44',1],
   ['Reciclagem que Transforma','Comunidades que transformaram lixo em renda.','Rs-ox6k2FbI','reciclagem','9:15',0],
   ['A Floresta Amazônica','A maior floresta tropical e sua importância.','LfkXAWDCKnw','flora','22:10',1],
   ['Mudanças Climáticas Explicadas','Entenda como o clima está mudando.','dcBXmj1nMTQ','clima','14:55',0],
   ['Água: O Ouro Azul','A crise hídrica global.','b1f-G6v3voA','educacao','11:08',0],
   ['Energia Solar no Brasil','Como energia limpa muda comunidades.','nhOGQYkrHmk','educacao','8:45',0],
  ].forEach(v => run('INSERT INTO videos (id,title,description,youtube_id,category,duration,featured) VALUES (?,?,?,?,?,?,?)',
    [uuidv4(),...v]));

  [['Plantio no Parque Ecológico','Vamos plantar 200 mudas nativas!','plantio','Parque Ecológico Municipal','2025-06-15 08:00:00',30],
   ['Limpeza da Praia dos Pescadores','Mutirão de limpeza na orla.','limpeza','Praia dos Pescadores','2025-06-22 07:00:00',50],
   ['Trilha Educativa na Reserva','Caminhada guiada com especialista.','educacao','Reserva Ambiental da Serra','2025-07-05 06:30:00',20],
   ['Oficina de Compostagem','Aprenda compostagem em casa.','educacao','Sede da ONG','2025-07-12 14:00:00',15],
   ['Corrida Verde 5K','Corrida recreativa em trilha ecológica.','recreacao','Parque Linear do Rio','2025-07-20 07:00:00',100],
  ].forEach(a => run('INSERT INTO activities (id,title,description,type,location,date,max_members,created_by) VALUES (?,?,?,?,?,?,?,?)',
    [uuidv4(),...a,adminId]));

  [['Separe o Lixo Corretamente','A separação correta aumenta 90% o aproveitamento de recicláveis.','reciclagem','♻️','#2D6A4F','Use 5 lixeiras: orgânico, papel, plástico, metal e vidro.'],
   ['Economize Água no Banho','Reduzir de 15 para 5 min economiza 90 litros/dia.','agua','💧','#1565C0','Feche o chuveiro enquanto se ensaboa.'],
   ['Desligue Aparelhos em Standby','Standby consome até 12% da conta de energia.','energia','⚡','#F57F17','Use filtros de linha com interruptor.'],
   ['Plante uma Árvore Nativa','Uma árvore absorve 22kg de CO₂ por ano.','biodiversidade','🌱','#388E3C','Consulte o viveiro municipal por mudas gratuitas.'],
   ['Reduza o Consumo de Carne','1kg de carne bovina requer 15.400 litros de água.','alimentacao','🥦','#558B2F','Experimente a "segunda sem carne".'],
   ['Use Transporte Sustentável','Um carro emite 2,4kg de CO₂ por hora.','transporte','🚲','#00695C','Para até 5km, prefira bicicleta ou caminhada.'],
   ['Evite o Consumo Excessivo','Brasil desperdiça 46 mil toneladas de alimento por dia.','consumo','🛒','#4527A0','Faça lista de compras e siga-a à risca.'],
   ['Proteja os Polinizadores','Abelhas polinizam 80% das plantas do planeta.','biodiversidade','🐝','#F9A825','Plante flores nativas no seu jardim.'],
  ].forEach(c => run('INSERT INTO awareness_cards (id,title,content,category,icon,color,tip) VALUES (?,?,?,?,?,?,?)',
    [uuidv4(),...c]));

  [['Semente','Criou sua conta na plataforma','🌱','register',0],
   ['Broto','Participou de sua primeira atividade','🌿','first_activity',50],
   ['Guardião das Águas','Participou de 3 atividades de limpeza','💧','cleanup_3',150],
   ['Plantador','Contribuiu com plantio de mudas','🌳','planting_50',200],
   ['Herói Verde','Acumulou 500 pontos','🦸','points_500',500],
  ].forEach(b => run('INSERT INTO badges (id,name,description,icon,condition_key,points_req) VALUES (?,?,?,?,?,?)',
    [uuidv4(),...b]));

  [['2048 Verde','O clássico 2048 com tema ambiental!','puzzle','https://play2048.co/','🧩',1],
   ['Pac-Man Online','O clássico arcade.','acao','https://freepacman.org/','👾',0],
   ['Tetris','Encaixe as peças e bata recordes!','puzzle','https://tetris.com/play-tetris','🟦',1],
  ].forEach(g => run('INSERT INTO games (id,title,description,category,iframe_url,thumbnail,featured) VALUES (?,?,?,?,?,?,?)',
    [uuidv4(),...g]));

  run('INSERT INTO news (id,title,content,summary,author_id) VALUES (?,?,?,?,?)',
    [uuidv4(),'Verde Vivo Planta 10.000 Mudas em 2024',
     'Com 500 voluntários, atingimos a marca histórica de 10.000 mudas nativas plantadas.',
     'ONG atinge marca histórica com participação recorde.', adminId]);
  run('INSERT INTO news (id,title,content,summary,author_id) VALUES (?,?,?,?,?)',
    [uuidv4(),'Nova Parceria para Educação Ambiental',
     'Parceria com escola municipal para levar programação ambiental às salas de aula.',
     'Parceria levará educação ambiental a 400 estudantes.', adminId]);

  save();
  console.log('✅ Dados inseridos! Admin: admin@onvverde.org / admin123');
}

module.exports = { initDb };
