// database/db.js - SQLite via sql.js (pure JS)
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'ong_verde.db');

let _db = null;
let _initPromise = null;

function ensureInit() {
  if (_initPromise) return _initPromise;
  _initPromise = initSqlJs().then(SQL => {
    if (fs.existsSync(DB_PATH)) {
      _db = new SQL.Database(fs.readFileSync(DB_PATH));
    } else {
      _db = new SQL.Database();
    }
    _db.run('PRAGMA foreign_keys = ON;');
    return _db;
  });
  return _initPromise;
}

function save() {
  if (!_db) return;
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(_db.export()));
}

// Synchronous helpers (call only after ensureInit resolves)
function run(sql, params = []) {
  _db.run(sql, params);
  save();
}

function get(sql, params = []) {
  const stmt = _db.prepare(sql);
  stmt.bind(params);
  let result = null;
  if (stmt.step()) {
    const cols = stmt.getColumnNames();
    result = Object.fromEntries(cols.map((c,i) => [c, stmt.get()[i]]));
  }
  stmt.free();
  return result;
}

function all(sql, params = []) {
  const results = [];
  const stmt = _db.prepare(sql);
  stmt.bind(params);
  while (stmt.step()) {
    const vals = stmt.get();
    const cols = stmt.getColumnNames();
    results.push(Object.fromEntries(cols.map((c,i) => [c, vals[i]])));
  }
  stmt.free();
  return results;
}

module.exports = { ensureInit, run, get, all, save };
