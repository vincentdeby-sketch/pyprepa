"use strict";
require("dotenv").config();

const path = require("path");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { db, getSetting, setSetting, allSettings, log } = require("./db");
const { seed } = require("./seed");

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || "dev-secret-a-changer";
const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

/* ================= amorçage ================= */
if (seed(db)) console.log("Contenu initial installé.");
if (process.env.ANTHROPIC_API_KEY && !getSetting("anthropic_key")) {
  setSetting("anthropic_key", process.env.ANTHROPIC_API_KEY);
}
(function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || "admin@local").toLowerCase().trim();
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (exists) return;
  const pwd = process.env.ADMIN_PASSWORD || "admin1234";
  db.prepare(
    `INSERT INTO users (email,password,name,avatar,role,active,goal,settings,progress,created_at)
     VALUES (?,?,?,?,'admin',1,50,'{}','{}',?)`
  ).run(email, bcrypt.hashSync(pwd, 10), "Administration", "🛠️", Date.now());
  console.log("Compte administrateur créé :", email);
  if (!process.env.ADMIN_PASSWORD) console.log("Mot de passe par défaut : admin1234 — change-le tout de suite.");
})();

/* ================= helpers ================= */
const publicUser = u => ({
  id: u.id, email: u.email, name: u.name, avatar: u.avatar, role: u.role,
  goal: u.goal, active: !!u.active,
  settings: safe(u.settings, {}), progress: safe(u.progress, {}),
  createdAt: u.created_at, lastSeen: u.last_seen, aiCalls: u.ai_calls
});
function safe(s, d) { try { return JSON.parse(s); } catch (e) { return d; } }
function sign(u) { return jwt.sign({ id: u.id, role: u.role }, SECRET, { expiresIn: "60d" }); }

function auth(req, res, nextFn) {
  const h = req.headers.authorization || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!t) return res.status(401).json({ error: "Non authentifié." });
  try {
    const p = jwt.verify(t, SECRET);
    const u = db.prepare("SELECT * FROM users WHERE id = ?").get(p.id);
    if (!u || !u.active) return res.status(403).json({ error: "Compte désactivé." });
    req.user = u;
    db.prepare("UPDATE users SET last_seen = ? WHERE id = ?").run(Date.now(), u.id);
    nextFn();
  } catch (e) { res.status(401).json({ error: "Session expirée." }); }
}
function admin(req, res, nextFn) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Réservé à l'administration." });
  nextFn();
}
const isEmail = s => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(s || ""));

/* ================= authentification ================= */
app.get("/api/config", (req, res) => {
  const s = allSettings();
  res.json({
    appName: s.app_name, welcome: s.welcome,
    allowRegistration: s.allow_registration === "1",
    aiEnabled: s.ai_enabled === "1" && !!s.anthropic_key
  });
});

app.post("/api/auth/register", (req, res) => {
  if (getSetting("allow_registration") !== "1")
    return res.status(403).json({ error: "Les inscriptions sont fermées. Demande un compte à l'administrateur." });
  const email = String(req.body.email || "").toLowerCase().trim();
  const { password, name, avatar, goal } = req.body;
  if (!isEmail(email)) return res.status(400).json({ error: "Adresse e-mail invalide." });
  if (!password || password.length < 8) return res.status(400).json({ error: "Mot de passe : 8 caractères minimum." });
  if (!name || !name.trim()) return res.status(400).json({ error: "Indique un prénom." });
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(email))
    return res.status(409).json({ error: "Un compte existe déjà avec cette adresse." });

  const r = db.prepare(
    `INSERT INTO users (email,password,name,avatar,role,active,goal,settings,progress,created_at)
     VALUES (?,?,?,?,'student',1,?,'{}','{}',?)`
  ).run(email, bcrypt.hashSync(password, 10), name.trim(), avatar || "🐍", Number(goal) || 50, Date.now());
  const u = db.prepare("SELECT * FROM users WHERE id = ?").get(r.lastInsertRowid);
  log(u.id, "register", email);
  res.json({ token: sign(u), user: publicUser(u) });
});

app.post("/api/auth/login", (req, res) => {
  const email = String(req.body.email || "").toLowerCase().trim();
  const u = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!u || !bcrypt.compareSync(String(req.body.password || ""), u.password))
    return res.status(401).json({ error: "Adresse ou mot de passe incorrect." });
  if (!u.active) return res.status(403).json({ error: "Ce compte est désactivé." });
  log(u.id, "login", email);
  res.json({ token: sign(u), user: publicUser(u) });
});

app.get("/api/me", auth, (req, res) => res.json({ user: publicUser(req.user) }));

app.put("/api/me", auth, (req, res) => {
  const { name, avatar, goal, settings } = req.body;
  db.prepare("UPDATE users SET name = ?, avatar = ?, goal = ?, settings = ? WHERE id = ?")
    .run(name || req.user.name, avatar || req.user.avatar, Number(goal) || req.user.goal,
         JSON.stringify(settings || safe(req.user.settings, {})), req.user.id);
  res.json({ user: publicUser(db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id)) });
});

app.put("/api/me/progress", auth, (req, res) => {
  db.prepare("UPDATE users SET progress = ? WHERE id = ?")
    .run(JSON.stringify(req.body.progress || {}), req.user.id);
  res.json({ ok: true });
});

app.post("/api/me/password", auth, (req, res) => {
  const { current, next } = req.body;
  if (!bcrypt.compareSync(String(current || ""), req.user.password))
    return res.status(401).json({ error: "Mot de passe actuel incorrect." });
  if (!next || next.length < 8) return res.status(400).json({ error: "8 caractères minimum." });
  db.prepare("UPDATE users SET password = ? WHERE id = ?").run(bcrypt.hashSync(next, 10), req.user.id);
  res.json({ ok: true });
});

/* ================= contenu ================= */
function buildContent(includeUnpublished) {
  const uq = includeUnpublished ? "" : " WHERE published = 1";
  const units = db.prepare("SELECT * FROM units" + uq + " ORDER BY position, id").all();
  const lq = includeUnpublished ? "" : " AND published = 1";
  const lst = db.prepare("SELECT * FROM lessons WHERE unit_id = ?" + lq + " ORDER BY position, id");
  return {
    units: units.map(u => ({
      id: u.id, slug: u.slug, title: u.title, subtitle: u.subtitle, color: u.color,
      published: !!u.published,
      lessons: lst.all(u.id).map(l => ({
        id: l.id, slug: l.slug, title: l.title, published: !!l.published, items: safe(l.items, [])
      }))
    })),
    fiches: db.prepare("SELECT * FROM resources WHERE kind='fiche' ORDER BY position, id").all()
      .map(r => ({ id: r.id, unit: r.unit_slug, title: r.title, body: r.body })),
    glossaire: db.prepare("SELECT * FROM resources WHERE kind='glossaire' ORDER BY position, id").all()
      .map(r => ({ id: r.id, title: r.title, body: r.body })),
    complexites: db.prepare("SELECT * FROM resources WHERE kind='complexite' ORDER BY position, id").all()
      .map(r => ({ id: r.id, title: r.title, body: r.body, extra: r.extra })),
    snippets: db.prepare("SELECT * FROM resources WHERE kind='snippet' ORDER BY position, id").all()
      .map(r => ({ id: r.id, title: r.title, body: r.body })),
    astuces: db.prepare("SELECT body FROM resources WHERE kind='astuce' ORDER BY position, id").all()
      .map(r => r.body)
  };
}
app.get("/api/content", auth, (req, res) => res.json(buildContent(false)));

/* ================= administration ================= */
app.get("/api/admin/overview", auth, admin, (req, res) => {
  const c = q => db.prepare(q).get().c;
  const users = db.prepare("SELECT * FROM users ORDER BY created_at DESC").all().map(publicUser);
  const active7 = c(`SELECT COUNT(*) c FROM users WHERE last_seen > ${Date.now() - 7 * 864e5}`);
  res.json({
    settings: (() => { const s = allSettings(); s.anthropic_key = s.anthropic_key ? "configurée" : ""; return s; })(),
    stats: {
      users: users.length, admins: users.filter(u => u.role === "admin").length,
      active7, units: c("SELECT COUNT(*) c FROM units"), lessons: c("SELECT COUNT(*) c FROM lessons"),
      aiCalls: db.prepare("SELECT COALESCE(SUM(ai_calls),0) c FROM users").get().c
    },
    users,
    logs: db.prepare("SELECT * FROM logs ORDER BY at DESC LIMIT 60").all()
  });
});

app.put("/api/admin/settings", auth, admin, (req, res) => {
  const allowed = ["app_name", "welcome", "ai_enabled", "ai_daily_limit", "allow_registration", "anthropic_key"];
  for (const k of allowed) {
    if (req.body[k] === undefined) continue;
    if (k === "anthropic_key" && req.body[k] === "") continue; // champ laissé vide = on garde l'existante
    setSetting(k, req.body[k]);
  }
  log(req.user.id, "settings", "mise à jour");
  res.json({ ok: true });
});
app.delete("/api/admin/settings/key", auth, admin, (req, res) => {
  setSetting("anthropic_key", "");
  log(req.user.id, "settings", "clé API supprimée");
  res.json({ ok: true });
});

app.post("/api/admin/users", auth, admin, (req, res) => {
  const email = String(req.body.email || "").toLowerCase().trim();
  if (!isEmail(email)) return res.status(400).json({ error: "Adresse invalide." });
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(email))
    return res.status(409).json({ error: "Adresse déjà utilisée." });
  const pwd = String(req.body.password || "");
  if (pwd.length < 8) return res.status(400).json({ error: "Mot de passe : 8 caractères minimum." });
  db.prepare(`INSERT INTO users (email,password,name,avatar,role,active,goal,settings,progress,created_at)
    VALUES (?,?,?,?,?,1,50,'{}','{}',?)`)
    .run(email, bcrypt.hashSync(pwd, 10), req.body.name || "Élève", req.body.avatar || "🐍",
         req.body.role === "admin" ? "admin" : "student", Date.now());
  log(req.user.id, "user", "création " + email);
  res.json({ ok: true });
});

app.patch("/api/admin/users/:id", auth, admin, (req, res) => {
  const id = Number(req.params.id);
  const u = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!u) return res.status(404).json({ error: "Compte introuvable." });
  if (u.id === req.user.id && req.body.role && req.body.role !== "admin")
    return res.status(400).json({ error: "Impossible de retirer ton propre rôle d'administrateur." });
  const name = req.body.name !== undefined ? req.body.name : u.name;
  const role = req.body.role === "admin" || req.body.role === "student" ? req.body.role : u.role;
  const active = req.body.active !== undefined ? (req.body.active ? 1 : 0) : u.active;
  db.prepare("UPDATE users SET name = ?, role = ?, active = ? WHERE id = ?").run(name, role, active, id);
  if (req.body.password) {
    if (String(req.body.password).length < 8) return res.status(400).json({ error: "8 caractères minimum." });
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(bcrypt.hashSync(req.body.password, 10), id);
    log(req.user.id, "user", "mot de passe réinitialisé pour " + u.email);
  }
  if (req.body.resetProgress) db.prepare("UPDATE users SET progress='{}' WHERE id = ?").run(id);
  res.json({ ok: true });
});

app.delete("/api/admin/users/:id", auth, admin, (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: "Tu ne peux pas supprimer ton propre compte." });
  const u = db.prepare("SELECT email FROM users WHERE id = ?").get(id);
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  log(req.user.id, "user", "suppression " + (u ? u.email : id));
  res.json({ ok: true });
});

/* ---- contenu : unités, leçons, ressources ---- */
app.get("/api/admin/content", auth, admin, (req, res) => res.json(buildContent(true)));

app.post("/api/admin/units", auth, admin, (req, res) => {
  const slug = (req.body.slug || "u" + Date.now()).trim();
  const pos = db.prepare("SELECT COALESCE(MAX(position),-1)+1 p FROM units").get().p;
  db.prepare("INSERT INTO units (slug,title,subtitle,color,position,published) VALUES (?,?,?,?,?,?)")
    .run(slug, req.body.title || "Nouvelle unité", req.body.subtitle || "", req.body.color || "#58CC02",
         pos, req.body.published === false ? 0 : 1);
  res.json({ ok: true });
});
app.patch("/api/admin/units/:id", auth, admin, (req, res) => {
  const u = db.prepare("SELECT * FROM units WHERE id = ?").get(Number(req.params.id));
  if (!u) return res.status(404).json({ error: "Unité introuvable." });
  db.prepare("UPDATE units SET title=?,subtitle=?,color=?,position=?,published=? WHERE id=?").run(
    req.body.title ?? u.title, req.body.subtitle ?? u.subtitle, req.body.color ?? u.color,
    req.body.position ?? u.position, req.body.published === undefined ? u.published : (req.body.published ? 1 : 0),
    u.id);
  res.json({ ok: true });
});
app.delete("/api/admin/units/:id", auth, admin, (req, res) => {
  db.prepare("DELETE FROM units WHERE id = ?").run(Number(req.params.id));
  res.json({ ok: true });
});

app.post("/api/admin/lessons", auth, admin, (req, res) => {
  const unitId = Number(req.body.unitId);
  if (!db.prepare("SELECT id FROM units WHERE id = ?").get(unitId))
    return res.status(400).json({ error: "Unité inconnue." });
  const pos = db.prepare("SELECT COALESCE(MAX(position),-1)+1 p FROM lessons WHERE unit_id = ?").get(unitId).p;
  db.prepare("INSERT INTO lessons (unit_id,slug,title,items,position,published) VALUES (?,?,?,?,?,1)")
    .run(unitId, (req.body.slug || "l" + Date.now()).trim(), req.body.title || "Nouvelle leçon",
         JSON.stringify(req.body.items || []), pos);
  res.json({ ok: true });
});
app.patch("/api/admin/lessons/:id", auth, admin, (req, res) => {
  const l = db.prepare("SELECT * FROM lessons WHERE id = ?").get(Number(req.params.id));
  if (!l) return res.status(404).json({ error: "Leçon introuvable." });
  let items = l.items;
  if (req.body.items !== undefined) {
    const arr = typeof req.body.items === "string" ? safe(req.body.items, null) : req.body.items;
    if (!Array.isArray(arr)) return res.status(400).json({ error: "Le contenu doit être un tableau JSON." });
    const bad = arr.findIndex(x => !x || !x.t || !x.q);
    if (bad >= 0) return res.status(400).json({ error: "Exercice " + (bad + 1) + " : champs t et q obligatoires." });
    items = JSON.stringify(arr);
  }
  db.prepare("UPDATE lessons SET title=?,items=?,position=?,published=?,unit_id=? WHERE id=?").run(
    req.body.title ?? l.title, items, req.body.position ?? l.position,
    req.body.published === undefined ? l.published : (req.body.published ? 1 : 0),
    req.body.unitId ?? l.unit_id, l.id);
  log(req.user.id, "content", "leçon " + l.slug + " modifiée");
  res.json({ ok: true });
});
app.delete("/api/admin/lessons/:id", auth, admin, (req, res) => {
  db.prepare("DELETE FROM lessons WHERE id = ?").run(Number(req.params.id));
  res.json({ ok: true });
});

app.post("/api/admin/resources", auth, admin, (req, res) => {
  const { kind, unit, title, body, extra } = req.body;
  if (!["fiche", "glossaire", "complexite", "snippet", "astuce"].includes(kind))
    return res.status(400).json({ error: "Type de ressource inconnu." });
  const pos = db.prepare("SELECT COALESCE(MAX(position),-1)+1 p FROM resources WHERE kind = ?").get(kind).p;
  db.prepare("INSERT INTO resources (kind,unit_slug,title,body,extra,position) VALUES (?,?,?,?,?,?)")
    .run(kind, unit || null, title || "", body || "", extra || "", pos);
  res.json({ ok: true });
});
app.patch("/api/admin/resources/:id", auth, admin, (req, res) => {
  const r = db.prepare("SELECT * FROM resources WHERE id = ?").get(Number(req.params.id));
  if (!r) return res.status(404).json({ error: "Ressource introuvable." });
  db.prepare("UPDATE resources SET unit_slug=?,title=?,body=?,extra=? WHERE id=?").run(
    req.body.unit ?? r.unit_slug, req.body.title ?? r.title, req.body.body ?? r.body, req.body.extra ?? r.extra, r.id);
  res.json({ ok: true });
});
app.delete("/api/admin/resources/:id", auth, admin, (req, res) => {
  db.prepare("DELETE FROM resources WHERE id = ?").run(Number(req.params.id));
  res.json({ ok: true });
});

/* ================= proxy IA ================= */
const dayCount = new Map(); // userId -> { day, n }
app.post("/api/ai", auth, async (req, res) => {
  const key = getSetting("anthropic_key");
  if (getSetting("ai_enabled") !== "1") return res.status(503).json({ error: "L'assistance IA est désactivée." });
  if (!key) return res.status(503).json({ error: "Aucune clé API n'est configurée par l'administrateur." });

  const limit = Number(getSetting("ai_daily_limit")) || 80;
  const day = new Date().toDateString();
  const c = dayCount.get(req.user.id);
  const cur = c && c.day === day ? c : { day, n: 0 };
  if (cur.n >= limit) return res.status(429).json({ error: "Quota d'assistance atteint pour aujourd'hui." });
  cur.n++; dayCount.set(req.user.id, cur);

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: Math.min(Number(req.body.max_tokens) || 800, 4000),
        system: String(req.body.system || ""),
        messages: Array.isArray(req.body.messages) ? req.body.messages.slice(-12) : []
      })
    });
    if (!r.ok) {
      const t = await r.text();
      return res.status(502).json({ error: "Erreur de l'API Anthropic (" + r.status + ").", detail: t.slice(0, 300) });
    }
    const d = await r.json();
    db.prepare("UPDATE users SET ai_calls = ai_calls + 1 WHERE id = ?").run(req.user.id);
    res.json({ text: (d.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim() });
  } catch (e) {
    res.status(502).json({ error: "Appel impossible : " + e.message });
  }
});

/* ================= divers ================= */
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "Route inconnue." });
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => console.log("PyPrépa écoute sur http://localhost:" + PORT));
