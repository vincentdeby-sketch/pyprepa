"use strict";
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data", "pyprepa.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  name        TEXT NOT NULL,
  avatar      TEXT NOT NULL DEFAULT '🐍',
  role        TEXT NOT NULL DEFAULT 'student',
  active      INTEGER NOT NULL DEFAULT 1,
  goal        INTEGER NOT NULL DEFAULT 50,
  settings    TEXT NOT NULL DEFAULT '{}',
  progress    TEXT NOT NULL DEFAULT '{}',
  ai_calls    INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,
  last_seen   INTEGER
);

CREATE TABLE IF NOT EXISTS units (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  subtitle    TEXT NOT NULL DEFAULT '',
  color       TEXT NOT NULL DEFAULT '#58CC02',
  position    INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS lessons (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  unit_id     INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  items       TEXT NOT NULL DEFAULT '[]',
  position    INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS resources (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  kind        TEXT NOT NULL,            -- fiche | glossaire | complexite | snippet | astuce
  unit_slug   TEXT,                     -- pour les fiches
  title       TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL DEFAULT '',
  extra       TEXT NOT NULL DEFAULT '',
  position    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER,
  kind        TEXT NOT NULL,
  detail      TEXT NOT NULL DEFAULT '',
  at          INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lessons_unit ON lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_resources_kind ON resources(kind);
CREATE INDEX IF NOT EXISTS idx_logs_at ON logs(at);
`);

/* ---------- réglages globaux ---------- */
const DEFAULTS = {
  app_name: "PyPrépa",
  anthropic_key: "",
  ai_enabled: "1",
  ai_daily_limit: "80",
  allow_registration: "1",
  welcome: "Réviser l'informatique de prépa par petites sessions."
};

function getSetting(key) {
  const r = db.prepare("SELECT value FROM settings WHERE key = ?").get(key);
  return r ? r.value : DEFAULTS[key] !== undefined ? DEFAULTS[key] : null;
}
function setSetting(key, value) {
  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(key, String(value));
}
function allSettings() {
  const out = { ...DEFAULTS };
  for (const r of db.prepare("SELECT key, value FROM settings").all()) out[r.key] = r.value;
  return out;
}

function log(userId, kind, detail) {
  db.prepare("INSERT INTO logs (user_id, kind, detail, at) VALUES (?, ?, ?, ?)")
    .run(userId || null, kind, detail || "", Date.now());
}

module.exports = { db, getSetting, setSetting, allSettings, log, DB_PATH, DEFAULTS };
