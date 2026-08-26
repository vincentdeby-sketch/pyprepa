"use strict";
/* ================================================================
   PyPrépa — client
   ================================================================ */
const $ = document.getElementById("app");
const TOKEN_KEY = "pyprepa_token";

const IC = {
  home:'<svg width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v9H4z"/></svg>',
  learn:'<svg width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 6l9-3 9 3-9 3z"/><path d="M6 10v6c0 1.5 3 3 6 3s6-1.5 6-3v-6"/></svg>',
  train:'<svg width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" viewBox="0 0 24 24"><path d="M4 12h3M17 12h3M7 8v8M17 8v8M7 12h10"/></svg>',
  res:'<svg width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M5 4h9l5 5v11H5z"/><path d="M14 4v5h5"/></svg>',
  me:'<svg width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.3" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>',
  admin:'<svg width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.3" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
  x:'<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" viewBox="0 0 24 24" opacity=".5"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  heart:'<svg width="17" height="17" fill="#FF5A5A" viewBox="0 0 24 24"><path d="M12 21s-8-4.9-8-10.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.6C20 16.1 12 21 12 21z"/></svg>',
  gem:'<svg width="16" height="16" fill="#1CB0F6" viewBox="0 0 24 24"><path d="M6 2h12l4 6-10 14L2 8z" opacity=".9"/><path d="M2 8h20L12 22z" opacity=".55"/></svg>',
  flame:'<svg width="16" height="16" fill="#EA7317" viewBox="0 0 24 24"><path d="M12 2s1 3.5-1.5 6S7 13 8.5 16 12 22 12 22s6-2 6-7c0-3-2-4.5-2-4.5S15 13 13.5 13 14 6 12 2z"/></svg>',
  lock:'<svg width="22" height="22" fill="none" stroke="#9AA3B2" stroke-width="2.3" stroke-linecap="round" viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  play:'<svg width="25" height="25" fill="#fff" viewBox="0 0 24 24"><path d="M9 5l9 7-9 7z"/></svg>',
  crown:'<svg width="23" height="23" fill="#fff" viewBox="0 0 24 24"><path d="M3 8l4 4 5-8 5 8 4-4v10H3z"/></svg>',
  star:f=>`<svg width="17" height="17" fill="${f?'#FFC800':'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2l3 6.6 7 .8-5.2 4.7 1.5 7L12 17.6 5.7 21l1.5-7L2 9.4l7-.8z"/></svg>`,
  note:'<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M4 4h16v12l-4 4H4z"/><path d="M8 9h8M8 13h5"/></svg>',
  bulb:'<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5V16H8v-2.5A6 6 0 0 1 12 3z"/></svg>',
  book:'<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M4 4h7v16H4zM13 4h7v16h-7z"/></svg>',
  wand:'<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3l1 3 3 1-3 1-1 3-1-3-3-1 3-1zM15 8l2 4 4 2-4 2-2 4-2-4-4-2 4-2z"/></svg>',
  snake:(s,m)=>{const b=m==="ko"?"#FF5A5A":"#58CC02",d=m==="ko"?"#E5323B":"#3FA110";
   const e=m==="ko"?'<path d="M11 12l5 5M16 12l-5 5" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M19 12l5 5M24 12l-5 5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>'
    :'<circle cx="13" cy="13" r="2.2" fill="#fff"/><circle cx="20" cy="13" r="2.2" fill="#fff"/>';
   return `<svg width="${s}" height="${s}" viewBox="0 0 64 64"><path d="M12 46c0-10 10-10 10-18S12 20 12 12" stroke="${d}" stroke-width="9" stroke-linecap="round" fill="none" opacity=".3"/><path d="M16 50c0-10 10-10 10-18S16 24 16 16" stroke="${b}" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="16" cy="14" r="9" fill="${b}"/>${e}<path d="M25 17c3 0 4 2 6 2" stroke="#FF5A5A" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`;}
};
const AVATARS = ["🐍","🦉","🐙","🦊","🐺","🦁","🐯","🐨","🦄","🤖","👾","🧠","🚀","⚡","🎯","🧩"];
const RANKS = [[1,"Débutant"],[3,"Initié"],[6,"Codeur"],[10,"Algorithmicien"],[15,"Colleur"],[20,"Maître du serpent"]];
const DIFF = { facile:{h:8,x:.8,lab:"Facile"}, normal:{h:5,x:1,lab:"Normal"}, exigeant:{h:3,x:1.3,lab:"Exigeant"} };
const COST = { hearts:50, freeze:200 };
const SRSD = [1,2,4,8,16];

/* ---------------- état ---------------- */
const blank = () => ({ done:{}, xp:0, gems:120, streak:0, lastDay:null, best:0, perfect:0, hearts:5, heartDay:null,
  srs:{}, stats:{days:{},units:{}}, daily:{day:null,idx:0,claimed:false}, chestDay:null, freeze:0, examBest:0,
  fav:{}, notes:{}, log:[], week:{key:null,xp:0,lessons:0,perfect:0,claimed:false}, pomo:0 });

let S = {
  boot:true, config:{}, token:localStorage.getItem(TOKEN_KEY) || "", user:null, content:null,
  auth:{ mode:"login", email:"", password:"", name:"", avatar:"🐍", goal:50, err:"", busy:false },
  tab:"home", screen:null, modal:null,
  set:{ dark:false, big:false, sound:true, zen:false, freeNav:false, diff:"normal", aiHints:true },
  prog:blank(),
  run:null, result:null, exam:null,
  state:"answering", choice:null, gapFill:[], orderPick:[], text:"", pool:[], firstTry:true,
  hints:[], hintBusy:false, hintErr:"", review:{}, testRes:null, testBusy:false,
  chat:[], chatBusy:false, tool:{kind:null,input:"",out:"",busy:false},
  flash:{deck:[],i:0,back:false}, search:"", fiche:null,
  pomo:{left:1500,run:false,phase:"focus"},
  py:{state:"idle",obj:null,promise:null}, timer:null, timeLeft:0,
  admin:{ tab:"users", data:null, busy:false, msg:"", err:"", edit:null, draft:"" }
};

/* ---------------- utilitaires ---------------- */
const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const md = s => esc(s).split("`").map((p,i)=>i%2?`<code>${p}</code>`:p).join("");
const norm = s => String(s).trim().replace(/\s+/g," ").replace(/\s*([=+\-*/%<>!,:()\[\]])\s*/g,"$1");
const shuffle = a => { a=[...a]; for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];} return a; };
const today = () => new Date().toDateString();
const weekKey = () => { const d=new Date(), j=new Date(d.getFullYear(),0,1);
  return d.getFullYear()+"-S"+Math.ceil(((d-j)/864e5+j.getDay()+1)/7); };
const fmt = t => Math.floor(t/60)+":"+String(t%60).padStart(2,"0");
const level = xp => Math.floor(xp/100)+1;
const rankOf = lv => { let r=RANKS[0][1]; for(const [m,n] of RANKS) if(lv>=m) r=n; return r; };
const maxHearts = () => DIFF[S.set.diff].h;
function rng(seed){let h=1779033703^seed.length;for(let i=0;i<seed.length;i++){h=Math.imul(h^seed.charCodeAt(i),3432918353);h=h<<13|h>>>19;}
  return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^=h>>>16)>>>0)/4294967296;};}
function pickSeeded(a,n,seed){const r=rng(seed);a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,n);}
let actx=null;
function beep(k){ if(!S.set.sound) return; try{
  actx = actx || new (window.AudioContext||window.webkitAudioContext)();
  const n = k==="ok"?[523,659,784]:k==="ko"?[220,175]:[659,880,1047,1319];
  n.forEach((f,i)=>{const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime+i*.09;
   o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.13,t+.02);
   g.gain.exponentialRampToValueAtTime(.0001,t+.19);o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+.2);});
 }catch(e){} }
function copy(t,m){ navigator.clipboard.writeText(t).then(()=>alert(m||"Copié."),()=>alert("Copie impossible.")); }

/* ---------------- API ---------------- */
async function api(path, opts) {
  const o = Object.assign({ headers:{} }, opts||{});
  o.headers["Content-Type"] = "application/json";
  if (S.token) o.headers.Authorization = "Bearer " + S.token;
  if (o.body && typeof o.body !== "string") o.body = JSON.stringify(o.body);
  const r = await fetch("/api" + path, o);
  const d = await r.json().catch(()=>({}));
  if (!r.ok) throw new Error(d.error || "Erreur " + r.status);
  return d;
}
let saveT = null;
function saveProgress() {
  clearTimeout(saveT);
  saveT = setTimeout(() => { api("/me/progress", { method:"PUT", body:{ progress:S.prog } }).catch(()=>{}); }, 700);
}
function saveMe() { api("/me", { method:"PUT", body:{ name:S.user.name, avatar:S.user.avatar, goal:S.user.goal, settings:S.set } }).catch(()=>{}); }

/* ---------------- contenu ---------------- */
const units = () => (S.content ? S.content.units : []);
function unitOpen(i) {
  if (S.set.freeNav || i === 0) return true;
  return units().slice(0, i).every(u => u.lessons.every(l => S.prog.done[l.slug]));
}
function allItems(onlyUnlocked) {
  const out = [];
  units().forEach((u, i) => {
    const open = unitOpen(i);
    u.lessons.forEach(l => {
      if (onlyUnlocked && !(S.prog.done[l.slug] || open)) return;
      l.items.forEach((it, k) => out.push({ item:it, key:l.slug+"#"+k, unit:u, lesson:l }));
    });
  });
  return out;
}
const dueItems = () => { const n=Date.now(); return allItems(false).filter(x => S.prog.srs[x.key] && S.prog.srs[x.key].due <= n); };
const favItems = () => allItems(false).filter(x => S.prog.fav[x.key]);
const todayXP = () => (S.prog.stats.days[today()] || {}).xp || 0;

function rollDates() {
  const t = today(), y = new Date(Date.now()-864e5).toDateString();
  if (S.prog.lastDay && S.prog.lastDay !== t && S.prog.lastDay !== y) {
    if (S.prog.freeze > 0) { S.prog.freeze--; S.prog.lastDay = y; S.froze = true; } else S.prog.streak = 0;
  }
  if (S.prog.heartDay !== t) { S.prog.hearts = maxHearts(); S.prog.heartDay = t; }
  if (S.prog.daily.day !== t) S.prog.daily = { day:t, idx:0, claimed:false };
  if (S.prog.week.key !== weekKey()) S.prog.week = { key:weekKey(), xp:0, lessons:0, perfect:0, claimed:false };
}
function logIt(txt) { S.prog.log.unshift({ t:Date.now(), txt }); if (S.prog.log.length > 60) S.prog.log.pop(); }
function applyTheme() { document.body.className = (S.set.dark ? "dark " : "") + (S.set.big ? "big" : ""); }

/* ---------------- Pyodide ---------------- */
function loadPy() {
  if (S.py.state === "ready") return Promise.resolve(S.py.obj);
  if (S.py.promise) return S.py.promise;
  S.py.state = "loading";
  S.py.promise = new Promise((res, rej) => {
    const base = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/", sc = document.createElement("script");
    sc.src = base + "pyodide.js";
    sc.onload = async () => { try { const p = await loadPyodide({ indexURL: base }); S.py.obj=p; S.py.state="ready"; res(p); }
      catch(e){ S.py.state="fail"; rej(e);} };
    sc.onerror = () => { S.py.state = "fail"; rej(new Error("cdn")); };
    document.head.appendChild(sc);
  });
  return S.py.promise;
}
async function runTests(code, tests) {
  const py = await loadPy();
  try { py.runPython(`exec(${JSON.stringify(code)}, globals())`); }
  catch(e){ return { fatal:String(e.message||e).split("\n").filter(Boolean).pop() }; }
  const res = [];
  for (const t of tests) {
    try { const got = py.runPython("repr(" + t.call + ")");
      res.push({ call:t.call, got:String(got), exp:t.expect, ok: norm(String(got)) === norm(t.expect) }); }
    catch(e){ res.push({ call:t.call, got:"erreur", exp:t.expect, ok:false }); }
  }
  return { res };
}

/* ---------------- IA ---------------- */
async function ai(system, messages, max) {
  const d = await api("/ai", { method:"POST", body:{ system, messages, max_tokens:max||800 } });
  return d.text;
}

/* ================================================================
   RENDU
   ================================================================ */
function render() {
  const ae = document.activeElement, id = ae && ae.id, pos = ae && ae.selectionStart;
  paint();
  if (id) { const n = document.getElementById(id); if (n) { n.focus(); try { n.setSelectionRange(pos,pos); } catch(e){} } }
}
function paint() {
  if (S.boot) { $.innerHTML = `<div class="center"><span class="spin"></span></div>`; return; }
  if (!S.user) { $.innerHTML = vAuth(); return; }
  if (!S.content) { $.innerHTML = `<div class="center"><span class="spin"></span></div>`; return; }
  const SC = { run:vRun, exam:vRun, result:vResult, examresult:vExamResult, stats:vStats, cal:vCal, league:vLeague,
    fav:vFav, notes:vNotes, journal:vJournal, fiches:vFiches, gloss:vGloss, cx:vCx, snip:vSnip, sandbox:vSandbox,
    flash:vFlash, chat:vChat, tool:vTool, pomo:vPomo, account:vAccount, settings:vSettings };
  if (S.screen && SC[S.screen]) $.innerHTML = SC[S.screen]();
  else $.innerHTML = ({ home:vHome, learn:vLearn, train:vTrain, res:vRes, me:vMe, admin:vAdmin }[S.tab] || vHome)() + nav();
  const M = { hint:mHint, shop:mShop, fiche:mFiche, note:mNote, review:mReview, pwd:mPwd, adminUser:mAdminUser, adminLesson:mAdminLesson };
  if (S.modal && M[S.modal]) $.insertAdjacentHTML("beforeend", M[S.modal]());
}
function nav() {
  const due = dueItems().length;
  const T = [["home","Accueil",IC.home],["learn","Apprendre",IC.learn],["train","Pratique",IC.train],
             ["res","Ressources",IC.res],["me","Profil",IC.me]];
  if (S.user.role === "admin") T.push(["admin","Admin",IC.admin]);
  return `<nav>${T.map(([k,l,ic])=>`<button data-a="tab" data-v="${k}" class="${S.tab===k?"on":""}">
    ${ic}${k==="train"&&due?`<span class="dot"></span>`:""}<span>${l}</span></button>`).join("")}</nav>`;
}
function head(title, sub) {
  return `<header><div class="wrap hd">
    <div class="avatar sm">${S.user.avatar}</div>
    <div class="who"><b>${esc(title)}</b><div class="tiny muted">${esc(sub||"")}</div></div>
    <div class="sp"></div>
    <span class="stat">${IC.flame} ${S.prog.streak}</span>
    <span class="stat">${IC.gem} ${S.prog.gems}</span>
    <span class="stat">${IC.heart} ${S.prog.hearts}</span>
  </div></header>`;
}
const sub = (title, inner, wide) => `<div class="wrap${wide?" lg":""}" style="padding-top:18px;padding-bottom:60px">
  <div class="row" style="margin-bottom:14px"><h2>${esc(title)}</h2><div class="sp"></div>
  <button data-a="back">${IC.x}</button></div>${inner}</div>`;
const tg = (on, a) => `<button class="toggle ${on?"on":""}" data-a="${a}"><i></i></button>`;

/* ---------------- authentification ---------------- */
function vAuth() {
  const a = S.auth, reg = a.mode === "register";
  return `<div class="wrap" style="max-width:420px;padding-top:min(9vh,70px);padding-bottom:50px">
   <div style="text-align:center">${IC.snake(78)}
    <h1 style="margin-top:10px">${esc(S.config.appName || "PyPrépa")}</h1>
    <p class="muted small" style="margin-top:6px">${esc(S.config.welcome || "")}</p></div>

   <div class="tabs" style="justify-content:center">
    <button class="${!reg?"on":""}" data-a="authmode" data-v="login">Se connecter</button>
    ${S.config.allowRegistration?`<button class="${reg?"on":""}" data-a="authmode" data-v="register">Créer un compte</button>`:""}
   </div>

   <div class="card mt">
    ${reg?`<label class="field"><span>Prénom</span><input class="in" id="f_name" value="${esc(a.name)}" placeholder="Camille" /></label>`:""}
    <label class="field"><span>Adresse e-mail</span>
     <input class="in" id="f_email" type="email" autocomplete="email" value="${esc(a.email)}" placeholder="toi@exemple.fr" /></label>
    <label class="field"><span>Mot de passe</span>
     <input class="in" id="f_password" type="password" autocomplete="${reg?"new-password":"current-password"}" value="${esc(a.password)}" placeholder="${reg?"8 caractères minimum":"••••••••"}" /></label>
    ${reg?`<div class="field"><span>Avatar</span>
      <div>${AVATARS.map(x=>`<button class="chip ${a.avatar===x?"on":""}" data-a="authav" data-v="${x}" style="font-size:1.1rem;padding:5px 10px">${x}</button>`).join("")}</div></div>
     <div class="field"><span>Objectif quotidien</span>
      <div>${[20,50,100,200].map(v=>`<button class="chip ${a.goal===v?"on":""}" data-a="authgoal" data-v="${v}">${v} XP</button>`).join("")}</div></div>`:""}
    ${a.err?`<p class="err">${esc(a.err)}</p>`:""}
    <button class="btn wide" style="margin-top:18px" data-a="authgo" ${a.busy?"disabled":""}>
     ${a.busy?`<span class="spin" style="width:15px;height:15px;border-width:2px"></span>`:(reg?"Créer mon compte":"Entrer")}</button>
    ${!reg&&!S.config.allowRegistration?`<p class="muted tiny" style="margin-top:12px;text-align:center">
      Les inscriptions sont fermées. Demande un compte à ton administrateur.</p>`:""}
   </div>
  </div>`;
}

/* ---------------- accueil ---------------- */
function ringSVG(v, goal) {
  const p = Math.min(1, v/goal), r = 32, c = 2*Math.PI*r;
  return `<svg width="86" height="86" viewBox="0 0 76 76">
   <circle cx="38" cy="38" r="${r}" fill="none" stroke="var(--line)" stroke-width="8"/>
   <circle cx="38" cy="38" r="${r}" fill="none" stroke="var(--green-s)" stroke-width="8" stroke-linecap="round"
    stroke-dasharray="${c}" stroke-dashoffset="${c*(1-p)}" transform="rotate(-90 38 38)"/>
   <text x="38" y="37" text-anchor="middle" font-size="16" font-weight="900" fill="currentColor">${v}</text>
   <text x="38" y="50" text-anchor="middle" font-size="9" font-weight="800" fill="var(--ink-2)">/ ${goal} XP</text></svg>`;
}
function missions() {
  const w = S.prog.week;
  const l = [{ label:"Gagner 300 XP", cur:Math.min(300,w.xp), goal:300 },
             { label:"Terminer 5 leçons", cur:Math.min(5,w.lessons), goal:5 },
             { label:"Réussir 3 sans-faute", cur:Math.min(3,w.perfect), goal:3 }];
  l.forEach(x => x.done = x.cur >= x.goal);
  return { list:l, all:l.every(x=>x.done) };
}
function vHome() {
  const d = S.prog.daily, left = 3 - d.idx, chest = S.prog.chestDay !== today();
  const m = missions(), astuces = (S.content.astuces||["Bon courage."]);
  const lv = level(S.prog.xp);
  return head("Salut " + S.user.name, rankOf(lv) + " · niveau " + lv) + `<div class="wrap pad">
   <div class="card mt" style="display:flex;align-items:center;gap:16px">
    <div>${ringSVG(todayXP(), S.user.goal)}</div>
    <div style="flex:1"><h3>Objectif du jour</h3>
     <p class="muted small" style="margin-top:3px">${todayXP()>=S.user.goal
       ? "Objectif atteint. Le reste est du bonus."
       : "Encore " + (S.user.goal - todayXP()) + " XP pour valider ta journée."}</p>
     <button class="btn sm" style="margin-top:10px" data-a="flash5">Entraînement éclair</button></div></div>

   <span class="section label">Aujourd'hui</span>
   <div class="grid g3">
    <button class="tile" data-a="daily"><div class="ic" style="background:var(--gold-l)">🎯</div>
     <b>Défi du jour</b><small>${d.claimed?"Terminé, à demain":left+" exercice"+(left>1?"s":"")+" · +30 gemmes"}</small>
     ${d.claimed?"":`<span class="pip">${left}</span>`}</button>
    <button class="tile" data-a="chest"><div class="ic" style="background:var(--gold-l)">🎁</div>
     <b>Coffre quotidien</b><small>${chest?"À ouvrir maintenant":"Revient demain"}</small></button>
    <button class="tile" data-a="go" data-v="pomo"><div class="ic" style="background:var(--blue-l)">⏱️</div>
     <b>Pomodoro</b><small>${S.prog.pomo} session${S.prog.pomo>1?"s":""} au compteur</small></button>
   </div>

   <span class="section label">Missions de la semaine</span>
   <div class="card">
    ${m.list.map((x,i)=>`<div style="${i?"margin-top:14px":""}">
     <div class="row small" style="font-weight:800"><span>${x.done?"✓ ":""}${esc(x.label)}</span>
      <div class="sp"></div><span class="muted">${x.cur}/${x.goal}</span></div>
     <div class="bar" style="margin-top:5px"><i style="width:${Math.min(100,x.cur/x.goal*100)}%;background:${x.done?"var(--green-s)":"var(--gold-s)"}"></i></div></div>`).join("")}
    ${m.all && !S.prog.week.claimed
      ? `<button class="btn gold wide" style="margin-top:14px" data-a="claimweek">Récupérer 120 gemmes</button>`
      : `<p class="muted tiny" style="margin-top:12px">${S.prog.week.claimed?"Récompense récupérée cette semaine.":"Trois missions à boucler avant dimanche."}</p>`}
   </div>

   <span class="section label">Astuce du jour</span>
   <div class="card"><p style="font-weight:700">${esc(astuces[new Date().getDate() % astuces.length])}</p></div>
  </div>`;
}

/* ---------------- apprendre ---------------- */
function vLearn() {
  let h = head("Apprendre", "Le parcours complet") + `<div class="wrap pad">`;
  units().forEach((u, i) => {
    const open = unitOpen(i), done = u.lessons.filter(l => S.prog.done[l.slug]).length;
    h += `<div class="unit-head" style="background:${open?esc(u.color):"var(--line)"};color:${open?"#fff":"var(--ink-2)"}">
      <div style="flex:1"><div class="tiny" style="font-weight:800;letter-spacing:.09em;text-transform:uppercase;opacity:.85">Unité ${i+1}</div>
      <h3>${esc(u.title)}</h3><p>${esc(u.subtitle)}</p></div>
      ${open?`<div style="font-weight:900">${done}/${u.lessons.length}</div>`:IC.lock}</div><div class="path">`;
    u.lessons.forEach((l, j) => {
      const dn = !!S.prog.done[l.slug], prev = j===0 || !!S.prog.done[u.lessons[j-1].slug];
      const can = open && (S.set.freeNav || dn || prev), dx = [0,56,0,-56][j%4];
      h += `<div class="node" style="transform:translateX(${dx}px)">
        <button class="ball" style="background:${dn?"#FFC800":can?esc(u.color):"var(--line)"};box-shadow:0 5px 0 ${dn?"#E5A600":can?"rgba(0,0,0,.18)":"var(--line)"}"
          ${can?"":"disabled"} data-a="start" data-v="${esc(l.slug)}">${dn?IC.crown:can?IC.play:IC.lock}</button>
        <span style="color:${can?"var(--ink)":"var(--ink-2)"}">${esc(l.title)}</span></div>`;
    });
    h += `</div>`;
  });
  return h + `</div>`;
}

/* ---------------- pratique ---------------- */
function vTrain() {
  const due = dueItems().length, fav = favItems().length;
  const T = [["flash5","","Entraînement éclair","5 questions au hasard","⚡",0],
   ["review","","À revoir","Répétition espacée","🔁",due],
   ["exam","","Examen blanc","15 questions, 12 min","📝",0],
   ["flashcards","","Flashcards","Question au recto, réponse au verso","🗂️",0],
   ["favrun","","Mes favoris","Rejouer les exercices épinglés","⭐",fav],
   ["go","sandbox","Bac à sable","Exécuter du vrai Python","🐍",0],
   ["go","chat","Poser une question","Un colleur disponible en continu","💬",0],
   ["tool","erreur","Expliquer une erreur","Colle ta trace Python","🐞",0],
   ["tool","complexite","Analyser une complexité","Colle ton code","📈",0]];
  return head("Pratique","Réviser autrement") + `<div class="wrap pad">
   <div class="grid g3 mt">${T.map(([a,v,t,s,e,n])=>`<button class="tile" data-a="${a}" data-v="${v}">
     <div class="ic" style="background:var(--soft)">${e}</div><b>${t}</b><small>${s}</small>
     ${n?`<span class="pip">${n}</span>`:""}</button>`).join("")}</div>
   <span class="section label">Mode de jeu</span>
   <div class="card">
    <div class="list-row"><div style="flex:1"><b>Mode zen</b><div class="muted tiny">Aucun cœur perdu, aucune pression.</div></div>${tg(S.set.zen,"t-zen")}</div>
    <div style="padding-top:13px"><b>Difficulté</b>
     <div style="margin-top:10px">${Object.entries(DIFF).map(([k,v])=>
      `<button class="chip ${S.set.diff===k?"on":""}" data-a="diff" data-v="${k}">${v.lab} · ${v.h} cœurs · XP ×${v.x}</button>`).join("")}</div></div>
   </div></div>`;
}

/* ---------------- ressources ---------------- */
function vRes() {
  return head("Ressources","Fiches, glossaire, outils") + `<div class="wrap pad">
   <input class="in mt" id="q" placeholder="Rechercher un exercice, une fiche, un terme…" value="${esc(S.search)}" />
   ${S.search.trim().length>1 ? searchResults() : `
   <div class="grid g3 mt">
    <button class="tile" data-a="go" data-v="fiches"><div class="ic" style="background:var(--blue-l)">📘</div>
     <b>Fiches de révision</b><small>${S.content.fiches.length} fiches</small></button>
    <button class="tile" data-a="go" data-v="gloss"><div class="ic" style="background:var(--violet-l)">🔤</div>
     <b>Glossaire</b><small>${S.content.glossaire.length} termes</small></button>
    <button class="tile" data-a="go" data-v="cx"><div class="ic" style="background:var(--red-l)">📊</div>
     <b>Complexités</b><small>${S.content.complexites.length} opérations</small></button>
    <button class="tile" data-a="go" data-v="snip"><div class="ic" style="background:var(--green-l)">📋</div>
     <b>Bibliothèque de code</b><small>${S.content.snippets.length} extraits</small></button>
   </div>`}</div>`;
}
function searchResults() {
  const q = S.search.trim().toLowerCase(), R = [];
  allItems(false).forEach(x => { if ((x.item.q+" "+(x.item.code||"")).toLowerCase().includes(q))
    R.push({ t:"Exercice · "+x.lesson.title, l:x.item.q, a:"start", v:x.lesson.slug }); });
  S.content.fiches.forEach(f => { if ((f.title+" "+f.body).toLowerCase().includes(q))
    R.push({ t:"Fiche", l:f.title, a:"fiche", v:f.unit }); });
  S.content.glossaire.forEach(g => { if ((g.title+" "+g.body).toLowerCase().includes(q))
    R.push({ t:"Glossaire", l:g.title+" — "+g.body, a:"go", v:"gloss" }); });
  if (!R.length) return `<p class="muted mt">Aucun résultat pour « ${esc(S.search)} ».</p>`;
  return `<p class="label" style="margin:16px 0 10px">${R.length} résultat${R.length>1?"s":""}</p>` +
   R.slice(0,40).map(r=>`<button class="tile" style="width:100%;margin-bottom:8px" data-a="${r.a}" data-v="${esc(r.v)}">
     <b style="font-weight:700;font-size:.9rem">${esc(r.l.slice(0,120))}</b><small>${esc(r.t)}</small></button>`).join("");
}

/* ---------------- profil ---------------- */
function vMe() {
  const lv = level(S.prog.xp), done = Object.keys(S.prog.done).length;
  const total = units().reduce((n,u)=>n+u.lessons.length,0);
  const badges = [["Première leçon",done>=1],["Cinq leçons",done>=5],["Série de 3 jours",S.prog.streak>=3],
   ["Série de 7 jours",S.prog.streak>=7],["10 sans-faute",S.prog.perfect>=10],["Niveau 5",lv>=5],
   ["Examen à 15/20",S.prog.examBest>=15],["Programme bouclé",total&&done>=total]];
  return head("Profil", S.user.email) + `<div class="wrap pad">
   <div class="card mt" style="text-align:center">
    <div class="avatar" style="margin:0 auto">${S.user.avatar}</div>
    <h2 style="margin-top:8px">${esc(S.user.name)}</h2>
    <p class="muted small">Niveau ${lv} · ${rankOf(lv)} · ${100-(S.prog.xp%100)} XP avant le suivant</p>
    <div class="bar" style="margin-top:10px"><i style="width:${S.prog.xp%100}%;background:var(--violet)"></i></div>
    <div class="row" style="justify-content:center;margin-top:14px">
     <button class="btn ghost sm" data-a="go" data-v="account">Mon compte</button>
     <button class="btn ghost sm" data-a="share">Partager</button></div></div>

   <div class="grid g2 mt">
    <div class="card kpi"><div class="k">XP total</div><div class="v" style="color:var(--blue)">${S.prog.xp}</div></div>
    <div class="card kpi"><div class="k">Gemmes</div><div class="v" style="color:var(--blue)">${S.prog.gems}</div></div>
    <div class="card kpi"><div class="k">Série</div><div class="v" style="color:var(--orange)">${S.prog.streak} j</div></div>
    <div class="card kpi"><div class="k">Record examen</div><div class="v" style="color:var(--violet)">${S.prog.examBest}/20</div></div></div>

   <div class="grid g3 mt">
    <button class="tile" data-a="go" data-v="stats"><b>Statistiques</b><small>Activité, points faibles</small></button>
    <button class="tile" data-a="go" data-v="cal"><b>Calendrier</b><small>12 semaines</small></button>
    <button class="tile" data-a="go" data-v="league"><b>Ligue</b><small>Classement de la semaine</small></button>
    <button class="tile" data-a="go" data-v="fav"><b>Favoris</b><small>${favItems().length} exercice(s)</small></button>
    <button class="tile" data-a="go" data-v="notes"><b>Mes notes</b><small>${Object.keys(S.prog.notes).length} note(s)</small></button>
    <button class="tile" data-a="go" data-v="journal"><b>Journal</b><small>${S.prog.log.length} événement(s)</small></button>
    <button class="tile" data-a="go" data-v="settings"><b>Réglages</b><small>Thème, IA, sauvegarde</small></button>
    <button class="tile" data-a="shop"><b>Boutique</b><small>Cœurs, gel de série</small></button></div>

   <span class="section label">Trophées</span>
   <div class="card">${badges.map(([n,on])=>`<span class="pill ${on?"g":""}" style="margin:0 8px 8px 0">${on?"★":"☆"} ${n}</span>`).join("")}</div>
   <button class="btn ghost wide mt2" data-a="logout">Se déconnecter</button>
  </div>`;
}

/* ---------------- exercice ---------------- */
function vRun() {
  const R = S.run, cur = R.items[R.idx], it = cur.item, pct = R.idx/R.items.length*100, exam = R.mode === "exam";
  let body = "";
  if (it.code && it.t !== "gaps") body += `<pre class="code">${esc(it.code)}</pre>`;
  if (it.t === "qcm") {
    body += it.choices.map((c,i)=>`<button class="choice ${S.choice===i?"sel":""} ${/[=(\[\]%*+]/.test(c)?"mono":""}"
      data-a="pick" data-v="${i}"><span class="kbd">${i+1}</span><span>${esc(c)}</span></button>`).join("");
  } else if (it.t === "gaps") {
    const parts = it.code.split("___"); let pre = "";
    parts.forEach((p,i)=>{ pre += esc(p);
      if (i < parts.length-1) { const v = S.gapFill[i];
        pre += `<span class="gap ${v?"full":""}" data-a="unfill" data-v="${i}">${v?esc(v):"?"}</span>`; } });
    body += `<pre class="code">${pre}</pre><div>` + S.pool.map(b=>`<button class="tok" data-a="fill" data-v="${esc(b)}"
      ${S.gapFill.includes(b)?"disabled":""}>${esc(b)}</button>`).join("") + `</div>`;
  } else if (it.t === "order") {
    body += `<div class="slot">` + (S.orderPick.length===0 ? `<div class="empty">Clique les lignes dans le bon ordre…</div>`
      : S.orderPick.map((o,i)=>`<div class="ln" data-a="unpick" data-v="${i}"><span style="color:#6A7484;margin-right:9px">${String(i+1).padStart(2,"0")}</span>${esc(o.l)}</div>`).join("")) + `</div>`;
    body += S.pool.filter(p=>!S.orderPick.some(o=>o.i===p.i))
      .map(p=>`<button class="lineopt" data-a="pickline" data-v="${p.i}">${esc(p.l)}</button>`).join("");
  } else if (it.t === "code") {
    body += `<textarea class="editor" id="freeinput" rows="9" spellcheck="false" ${S.state!=="answering"?"disabled":""}>${esc(S.text||it.starter||"")}</textarea>`;
    body += `<span class="section label" style="margin:14px 0 8px">Tests</span><div class="tests">` +
      (it.tests||[]).map((t,i)=>{ const r = S.testRes && S.testRes.res && S.testRes.res[i];
        return `<div class="tl ${r?(r.ok?"y":"n"):""}"><span style="flex:1">${esc(t.call)}</span>
          <span style="opacity:.7">→ ${esc(t.expect)}</span>${r?`<b>${r.ok?"✓":"✗ "+esc(r.got)}</b>`:""}</div>`;}).join("") + `</div>`;
    if (S.testRes && S.testRes.fatal) body += `<p class="err" style="font-family:var(--mono);font-size:.8rem">${esc(S.testRes.fatal)}</p>`;
    if (S.testRes && S.testRes.msgAI) body += `<p style="font-weight:700;margin-top:9px">${esc(S.testRes.msgAI)}</p>`;
    if (S.py.state === "loading") body += `<p class="muted small mt"><span class="spin" style="width:14px;height:14px;border-width:2px"></span> Chargement de l'interpréteur…</p>`;
    if (S.py.state === "fail") body += `<p class="muted small mt">Interpréteur indisponible : ton code sera relu par l'IA.</p>`;
  } else {
    body += `<textarea class="in mono" id="freeinput" rows="3" spellcheck="false" placeholder="Écris ton code ici…" ${S.state!=="answering"?"disabled":""}>${esc(S.text)}</textarea>`;
  }
  const ready = it.t==="qcm" ? S.choice!==null
    : it.t==="gaps" ? S.gapFill.length === (it.code.match(/___/g)||[]).length
    : it.t==="order" ? S.orderPick.length === it.lines.length
    : (S.text||it.starter||"").trim().length > 0;
  const cls = S.state==="ok" ? "y" : S.state==="ko" ? "n" : "";
  const fav = !!S.prog.fav[cur.key];
  return `<div class="wrap lg" style="padding-top:14px">
   <div class="row"><button data-a="quit">${IC.x}</button>
    <div class="bar lg" style="flex:1"><i style="width:${pct}%"></i></div>
    ${exam ? `<span class="timer ${S.timeLeft<60?"warn":""}">${fmt(Math.max(0,S.timeLeft))}</span>`
      : S.set.zen ? `<span class="timer">zen</span>` : `<span class="stat">${IC.heart} ${S.prog.hearts}</span>`}</div>
   <div class="row" style="margin-top:16px">
    <span class="label">${esc(R.label)} · ${esc(cur.lesson.title)}</span><div class="sp"></div>
    <button data-a="fav" style="color:${fav?"var(--gold)":"var(--ink-2)"}">${IC.star(fav)}</button>
    <button data-a="modal" data-v="note" style="color:${S.prog.notes[cur.key]?"var(--blue)":"var(--ink-2)"}">${IC.note}</button></div>
   <h2 class="q">${md(it.q)}</h2>
   <div style="padding-bottom:290px;margin-top:14px">${body}</div></div>
  <div class="foot ${cls}"><div class="wrap lg" style="padding:14px 20px">
   ${S.state!=="answering" ? `<div class="verdict">${IC.snake(46, S.state==="ok"?"ok":"ko")}
     <div style="flex:1"><h3>${S.state==="ok"?"Exact.":"Pas encore."}</h3><p>${md(it.ex)}</p>
     ${S.state==="ko"&&it.sol?`<pre class="code" style="margin-top:8px;font-size:.8rem">${esc(it.sol)}</pre>`:""}</div></div>` : ""}
   <div class="row">
    ${S.state==="answering"&&!exam&&S.set.aiHints&&S.config.aiEnabled?`<button class="btn ghost sm" data-a="hint">${IC.bulb} Indice</button>`:""}
    ${S.state==="answering"&&!exam?`<button class="btn ghost sm" data-a="fiche" data-v="${esc(cur.unit.slug)}">${IC.book} Fiche</button>`:""}
    ${(it.t==="code"||it.t==="free")&&!exam&&S.state==="answering"&&S.config.aiEnabled?`<button class="btn ghost sm" data-a="aireview">${IC.wand} Relire</button>`:""}
    <div class="sp"></div>
    ${S.state==="answering"
      ? `<button class="btn" style="min-width:140px" data-a="check" ${ready&&!S.testBusy?"":"disabled"}>${S.testBusy?`<span class="spin" style="width:14px;height:14px;border-width:2px"></span>`:"Vérifier"}</button>`
      : `<button class="btn ${S.state==="ok"||exam?"":"red"}" style="min-width:140px" data-a="next">${exam?"Suivant":S.state==="ok"?"Continuer":"Réessayer"}</button>`}
   </div></div></div>`;
}
function vResult() {
  const r = S.result;
  return `<div class="center">${IC.snake(110)}
   <h1 style="color:var(--green);margin-top:14px">${esc(r.title)}</h1>
   ${r.levelUp?`<p style="font-weight:800;color:var(--violet);margin-top:6px">Niveau ${r.newLevel} · ${rankOf(r.newLevel)}</p>`:""}
   <div class="grid g2 mt2" style="width:100%;max-width:380px">
    <div class="card kpi"><div class="k">XP</div><div class="v" style="color:var(--gold)">${r.xp}</div></div>
    <div class="card kpi"><div class="k">Gemmes</div><div class="v" style="color:var(--blue)">+${r.gems}</div></div>
    <div class="card kpi"><div class="k">Sans faute</div><div class="v" style="color:var(--blue)">${r.pct}%</div></div>
    <div class="card kpi"><div class="k">Objectif</div><div class="v" style="color:var(--green)">${Math.min(100,Math.round(todayXP()/S.user.goal*100))}%</div></div></div>
   <div style="width:100%;max-width:380px;margin-top:24px"><button class="btn wide" data-a="back">Continuer</button></div></div>`;
}
function vExamResult() {
  const r = S.exam, note = Math.round(r.correct/r.total*20*10)/10;
  return sub("Examen blanc", `<div style="text-align:center">${IC.snake(90, note>=10?"ok":"ko")}
   <h1 style="margin-top:10px">${note} / 20</h1>
   <p class="muted">${r.correct} sur ${r.total} · ${r.time}</p>
   ${r.record?`<p style="color:var(--gold);font-weight:800;margin-top:5px">Nouveau record</p>`:""}</div>
   ${r.wrong.length?`<span class="section label">À retravailler (${r.wrong.length})</span>
    ${r.wrong.map(w=>`<div class="recap"><b class="small">${md(w.q)}</b><div class="muted tiny" style="margin-top:3px">${md(w.ex)}</div></div>`).join("")}
    <p class="muted tiny">Ces questions rejoignent ta file de révision.</p>`
   :`<p style="text-align:center;font-weight:800;color:var(--green)" class="mt2">Sans faute.</p>`}
   <button class="btn wide mt2" data-a="back">Retour</button>`);
}

/* ---------------- écrans secondaires ---------------- */
function vStats() {
  const days = []; for (let i=13;i>=0;i--) { const d = new Date(Date.now()-i*864e5).toDateString();
    const s = S.prog.stats.days[d]||{ok:0,ko:0}; days.push({ ok:s.ok||0, n:(s.ok||0)+(s.ko||0) }); }
  const mx = Math.max(1, ...days.map(x=>x.n));
  const bars = days.map((x,i)=>{ const h = x.n?Math.max(6,x.n/mx*88):2, a = x.n?x.ok/x.n:0;
    return `<rect x="${i*26+6}" y="${98-h}" width="16" height="${h}" rx="5" fill="${x.n===0?"var(--line)":a>=.8?"#58CC02":a>=.5?"#FFC800":"#FF5A5A"}"/>`; }).join("");
  const us = Object.entries(S.prog.stats.units).map(([slug,s])=>{ const u = units().find(x=>x.slug===slug), n = s.ok+s.ko;
    return u && n>=3 ? { title:u.title, n, rate:s.ok/n } : null; }).filter(Boolean).sort((a,b)=>a.rate-b.rate);
  return sub("Statistiques", `
   <span class="label">14 derniers jours</span>
   <svg viewBox="0 0 370 104" style="width:100%;margin-top:10px">${bars}</svg>
   <p class="muted tiny">Hauteur : volume de réponses. Couleur : taux de réussite du jour.</p>
   <span class="section label">Réussite par chapitre</span>
   ${us.length ? us.map(u=>`<div class="mt">
     <div class="row small" style="font-weight:800"><span>${esc(u.title)}</span><div class="sp"></div>
      <span class="muted">${Math.round(u.rate*100)}% · ${u.n}</span></div>
     <div class="bar" style="margin-top:5px"><i style="width:${u.rate*100}%;background:${u.rate>=.8?"var(--green-s)":u.rate>=.5?"var(--gold-s)":"#FF5A5A"}"></i></div></div>`).join("")
    : `<p class="muted">Réponds à quelques exercices pour voir tes chiffres.</p>`}
   ${us.length?`<span class="section label">Tes trois points faibles</span>
    <ol style="padding-left:20px">${us.slice(0,3).map(u=>`<li style="font-weight:700;margin-bottom:5px">${esc(u.title)} — ${Math.round(u.rate*100)}%</li>`).join("")}</ol>`:""}
   <span class="section label">File de révision</span>
   <p style="font-weight:700">${Object.keys(S.prog.srs).length} exercices suivis, ${dueItems().length} à revoir aujourd'hui.</p>`);
}
function vCal() {
  const cells = []; const st = new Date(); st.setHours(0,0,0,0);
  for (let i=83;i>=0;i--) { const d = new Date(st-i*864e5).toDateString(); const s = S.prog.stats.days[d];
    const n = s?(s.ok||0)+(s.ko||0):0;
    cells.push(n===0?"var(--line)":n<5?"#BFE8A0":n<12?"#58CC02":"#3FA110"); }
  const rows = []; for (let r=0;r<7;r++){ const row=[]; for(let c=0;c<12;c++) row.push(cells[c*7+r]); rows.push(row); }
  return sub("Calendrier", `<p class="muted small">Douze semaines d'activité. Plus la case est foncée, plus tu as travaillé ce jour-là.</p>
   <div class="mt" style="display:flex;flex-direction:column;gap:3px">
    ${rows.map(r=>`<div class="heat">${r.map(c=>`<i style="background:${c}"></i>`).join("")}</div>`).join("")}</div>
   <div class="grid g2 mt2">
    <div class="card kpi"><div class="k">Série actuelle</div><div class="v" style="color:var(--orange)">${S.prog.streak} j</div></div>
    <div class="card kpi"><div class="k">Meilleure série</div><div class="v" style="color:var(--orange)">${S.prog.best} j</div></div></div>
   <p class="muted tiny mt">Gels de série en stock : ${S.prog.freeze}.</p>`);
}
function vLeague() {
  const r = rng(weekKey()), names = ["Camille","Ibrahim","Léa","Noé","Sarah","Malik","Jeanne","Théo","Anaïs","Yanis","Hugo","Nour"];
  const bots = pickSeeded(names,9,weekKey()).map(n=>({ n, xp:Math.floor(80+r()*520) }));
  const all = [...bots, { n:S.user.name, xp:S.prog.week.xp, me:true }].sort((a,b)=>b.xp-a.xp);
  return sub("Ligue de la semaine", `<p class="muted small">Classement remis à zéro chaque semaine.</p>
   <div class="card mt">${all.map((x,i)=>`<div class="list-row" ${x.me?'style="background:var(--green-l);border-radius:10px;padding-left:10px;padding-right:10px"':""}>
    <span style="width:24px;font-weight:900;color:${i<3?"var(--gold)":"var(--ink-2)"}">${i+1}</span>
    <span style="flex:1;font-weight:800">${esc(x.n)}</span><span class="muted">${x.xp} XP</span></div>`).join("")}</div>
   <p class="muted tiny mt">Les adversaires sont simulés dans ton navigateur : aucune donnée n'est partagée.</p>`);
}
function vFav() {
  const f = favItems();
  return sub("Favoris", f.length ? `<button class="btn wide" data-a="favrun">Réviser mes ${f.length} favoris</button>
   <div class="mt">${f.map(x=>`<div class="card" style="margin-bottom:10px"><div class="row">
    <span style="flex:1;font-weight:700" class="small">${md(x.item.q.slice(0,110))}</span>
    <button data-a="unfav" data-v="${esc(x.key)}" style="color:var(--gold)">${IC.star(1)}</button></div>
    <div class="muted tiny mt">${esc(x.lesson.title)}</div></div>`).join("")}</div>`
   : `<p class="muted">Aucun favori. Pendant un exercice, l'étoile en haut à droite l'épingle ici.</p>`);
}
function vNotes() {
  const ks = Object.keys(S.prog.notes).filter(k=>S.prog.notes[k]), items = allItems(false);
  return sub("Mes notes", ks.length ? ks.map(k=>{ const x = items.find(i=>i.key===k);
    return `<div class="card" style="margin-bottom:12px"><div class="label">${x?esc(x.lesson.title):"Exercice"}</div>
     <p style="font-weight:800" class="small mt">${x?md(x.item.q.slice(0,110)):""}</p>
     <p class="small" style="margin-top:8px;white-space:pre-wrap">${esc(S.prog.notes[k])}</p>
     <button class="btn ghost sm mt" data-a="delnote" data-v="${esc(k)}">Supprimer</button></div>`; }).join("")
   : `<p class="muted">Aucune note. Pendant un exercice, l'icône bloc-notes en ouvre une.</p>`);
}
function vJournal() {
  return sub("Journal", S.prog.log.length ? S.prog.log.map(l=>`<div class="list-row">
    <span style="flex:1;font-weight:700" class="small">${esc(l.txt)}</span>
    <span class="muted tiny">${new Date(l.t).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</span></div>`).join("")
   : `<p class="muted">Rien pour l'instant.</p>`);
}
function ficheHTML(slug) {
  const f = S.content.fiches.filter(x=>!slug || x.unit === slug);
  if (!f.length) return `<p class="muted">Pas de fiche pour ce chapitre.</p>`;
  return f.map(x=>`<div class="card fiche" style="margin-top:12px"><h3>${esc(x.title)}</h3>
    <ul style="margin-top:8px">${x.body.split("\n").filter(Boolean).map(l=>`<li>${md(l)}</li>`).join("")}</ul></div>`).join("");
}
function vFiches() {
  return sub("Fiches de révision", units().map(u=>{
    const f = S.content.fiches.filter(x=>x.unit===u.slug);
    return f.length ? `<span class="section label">${esc(u.title)}</span>${ficheHTML(u.slug)}` : ""; }).join("")
    + `<button class="btn ghost wide mt2" data-a="print">Imprimer ou enregistrer en PDF</button>`);
}
function vGloss() {
  const q = (S.search||"").toLowerCase();
  const L = S.content.glossaire.filter(g=>!q || (g.title+" "+g.body).toLowerCase().includes(q));
  return sub("Glossaire", `<input class="in" id="q" placeholder="Filtrer…" value="${esc(S.search)}" />
   ${L.map(g=>`<div class="card mt"><b>${esc(g.title)}</b><p class="small muted" style="margin-top:4px">${esc(g.body)}</p></div>`).join("")}`);
}
function vCx() {
  return sub("Table des complexités", `<p class="muted small">À connaître par cœur : c'est la question de colle la plus rentable.</p>
   <table class="tb"><tr><th>Opération</th><th>Coût</th><th>Famille</th></tr>
   ${S.content.complexites.map(c=>`<tr><td style="font-family:var(--mono);font-size:.82rem">${esc(c.title)}</td>
    <td style="color:var(--red)">${esc(c.body)}</td><td class="muted">${esc(c.extra)}</td></tr>`).join("")}</table>`);
}
function vSnip() {
  return sub("Bibliothèque de code", S.content.snippets.map((s,i)=>`<div class="mt2">
    <div class="row"><b>${esc(s.title)}</b><div class="sp"></div>
     <button class="btn ghost sm" data-a="copysnip" data-v="${i}">Copier</button></div>
    <pre class="code">${esc(s.body)}</pre></div>`).join(""), true);
}
function vSandbox() {
  return sub("Bac à sable", `<p class="muted small">Du vrai Python, exécuté dans ton navigateur. Le premier lancement télécharge l'interpréteur.</p>
   <textarea class="editor mt" id="sbcode" rows="12" spellcheck="false">${esc(S.sandboxCode || "# Bac à sable Python\nprint(sum(range(1, 11)))\n")}</textarea>
   <div class="row mt"><button class="btn" data-a="runpy" ${S.sbBusy?"disabled":""}>${S.sbBusy?`<span class="spin" style="width:14px;height:14px;border-width:2px"></span>`:"Exécuter"}</button>
    <button class="btn ghost sm" data-a="clearout">Effacer</button></div>
   <span class="section label">Sortie</span><pre class="code" style="min-height:80px">${esc(S.sbOut||"—")}</pre>`, true);
}
function vFlash() {
  const f = S.flash;
  if (!f.deck.length) return sub("Flashcards", `<p class="muted">Aucune carte disponible.</p>`);
  if (f.i >= f.deck.length) return `<div class="center">${IC.snake(95)}
   <h2 class="mt">Paquet terminé</h2><p class="muted">${f.deck.length} cartes passées en revue.</p>
   <div style="width:100%;max-width:340px;margin-top:20px"><button class="btn wide" data-a="flashcards">Nouveau paquet</button>
    <button class="btn ghost wide sm mt" data-a="back">Retour</button></div></div>`;
  const x = f.deck[f.i], it = x.item;
  return sub(`Flashcards ${f.i+1}/${f.deck.length}`, `
   <div class="flip" data-a="flip">${ f.back
     ? `<p style="font-weight:700">${md(it.ex)}</p>
        ${it.sol?`<pre class="code" style="font-size:.8rem;width:100%">${esc(it.sol)}</pre>`:""}
        ${it.t==="qcm"?`<p style="font-weight:900;margin-top:10px;color:var(--green)">${esc(it.choices[it.a])}</p>`:""}`
     : `<p style="font-weight:900;font-size:1.05rem">${md(it.q)}</p>
        ${it.code?`<pre class="code" style="font-size:.78rem;width:100%">${esc(it.code)}</pre>`:""}
        <p class="muted tiny mt">Touche la carte pour la retourner</p>` }</div>
   ${f.back?`<div class="row mt"><button class="btn red wide sm" data-a="fc" data-v="0">À revoir</button>
    <button class="btn wide sm" data-a="fc" data-v="1">Je savais</button></div>`:""}`);
}
function vChat() {
  return sub("Poser une question", `<p class="muted small">Un colleur d'informatique, disponible sans rendez-vous.</p>
   <div class="mt" style="min-height:110px">${ S.chat.length
     ? S.chat.map(m=>`<div class="msg ${m.role==="user"?"u":"a"}">${esc(m.content)}</div>`).join("")
     : `<p class="muted small">Exemples : « différence entre une liste et un tuple ? », « pourquoi mon while ne s'arrête pas ? »</p>` }
    ${S.chatBusy?`<div class="msg a"><span class="spin" style="width:14px;height:14px;border-width:2px"></span></div>`:""}</div>
   <textarea class="in mt" id="chatin" rows="2" placeholder="Ta question…"></textarea>
   <div class="row mt"><button class="btn" data-a="send" ${S.chatBusy?"disabled":""}>Envoyer</button>
    <button class="btn ghost sm" data-a="clearchat">Effacer</button></div>`, true);
}
function vTool() {
  const k = S.tool.kind;
  const m = k==="erreur"
    ? ["Expliquer une erreur","Colle le message d'erreur complet, avec la trace si tu l'as.","Traceback (most recent call last): …"]
    : ["Analyser une complexité","Colle une fonction : tu obtiens son coût en temps et en mémoire.","def f(L): …"];
  return sub(m[0], `<p class="muted small">${m[1]}</p>
   <textarea class="editor mt" id="toolin" rows="8" placeholder="${m[2]}">${esc(S.tool.input)}</textarea>
   <button class="btn wide mt" data-a="dotool" ${S.tool.busy?"disabled":""}>
    ${S.tool.busy?`<span class="spin" style="width:14px;height:14px;border-width:2px"></span> Analyse…`:"Analyser"}</button>
   ${S.tool.out?`<div class="hint last mt">${esc(S.tool.out)}</div>`:""}`, true);
}
function vPomo() {
  const p = S.pomo;
  return sub("Pomodoro", `<div style="text-align:center;margin-top:16px">
    <div style="font-family:var(--mono);font-weight:700;font-size:3.2rem">${fmt(p.left)}</div>
    <p class="label">${p.phase==="focus"?"Travail":"Pause"}</p></div>
   <div class="row" style="justify-content:center;margin-top:20px">
    <button class="btn" data-a="pomo" data-v="toggle">${p.run?"Pause":"Démarrer"}</button>
    <button class="btn ghost sm" data-a="pomo" data-v="reset">Réinitialiser</button></div>
   <p class="muted small mt2">Vingt-cinq minutes de travail, cinq de pause. Le minuteur continue quand tu navigues.</p>
   <div class="card kpi mt"><div class="k">Sessions terminées</div><div class="v">${S.prog.pomo}</div></div>`);
}
function vAccount() {
  return sub("Mon compte", `
   <div style="text-align:center"><div class="avatar" style="margin:0 auto">${S.user.avatar}</div></div>
   <label class="field"><span>Prénom</span><input class="in" id="acname" value="${esc(S.user.name)}" /></label>
   <div class="field"><span>Adresse e-mail</span><input class="in" value="${esc(S.user.email)}" disabled /></div>
   <div class="field"><span>Avatar</span><div>${AVATARS.map(a=>`<button class="chip ${S.user.avatar===a?"on":""}" data-a="setav" data-v="${a}" style="font-size:1.1rem;padding:5px 10px">${a}</button>`).join("")}</div></div>
   <div class="field"><span>Objectif quotidien</span><div>${[20,50,100,200].map(v=>`<button class="chip ${S.user.goal===v?"on":""}" data-a="setgoal" data-v="${v}">${v} XP</button>`).join("")}</div></div>
   <button class="btn wide mt" data-a="saveaccount">Enregistrer</button>
   <button class="btn ghost wide sm mt" data-a="modal" data-v="pwd">Changer de mot de passe</button>
   ${S.accMsg?`<p class="ok">${esc(S.accMsg)}</p>`:""}`);
}
function vSettings() {
  return sub("Réglages", `
   <span class="label">Affichage</span>
   <div class="card mt">
    <div class="list-row"><div style="flex:1"><b>Thème sombre</b></div>${tg(S.set.dark,"t-dark")}</div>
    <div class="list-row"><div style="flex:1"><b>Texte agrandi</b></div>${tg(S.set.big,"t-big")}</div>
    <div class="list-row"><div style="flex:1"><b>Sons</b></div>${tg(S.set.sound,"t-sound")}</div></div>
   <span class="section label">Apprentissage</span>
   <div class="card">
    <div class="list-row"><div style="flex:1"><b>Indices assistés</b><div class="muted tiny">${S.config.aiEnabled?"Disponibles":"Désactivés par l'administrateur"}</div></div>${tg(S.set.aiHints,"t-ai")}</div>
    <div class="list-row"><div style="flex:1"><b>Parcours libre</b><div class="muted tiny">Ouvre toutes les unités.</div></div>${tg(S.set.freeNav,"t-free")}</div>
    <div class="list-row"><div style="flex:1"><b>File de révision</b><div class="muted tiny">${Object.keys(S.prog.srs).length} exercices suivis.</div></div>
     <button class="btn ghost sm" data-a="clearsrs">Vider</button></div></div>
   <span class="section label">Données</span>
   <div class="row" style="flex-wrap:wrap">
    <button class="btn ghost sm" data-a="backup">Exporter ma progression</button>
    <button class="btn red sm" data-a="resetprog">Effacer ma progression</button></div>
   <p class="muted tiny mt2">Raccourcis pendant un exercice : 1 à 4 pour choisir, Entrée pour valider, Échap pour quitter.</p>`);
}

/* ---------------- modales ---------------- */
const veil = (title, inner) => `<div class="veil" data-a="closemodal"><div class="sheet" data-stop>
  <div class="row" style="margin-bottom:12px"><h3>${title}</h3><div class="sp"></div>
   <button data-a="closemodal">${IC.x}</button></div>${inner}</div></div>`;
function mHint() {
  const labs = ["Piste","Démarche","Correction"];
  return veil(`${IC.wand} Coup de pouce`, `
   ${S.hints.map((h,i)=>`<div class="hint ${i===S.hints.length-1?"last":""}"><div class="lab">${labs[i]||"Aide"}</div>${esc(h)}</div>`).join("")}
   ${S.hintErr?`<p class="err">${esc(S.hintErr)}</p>`:""}
   ${S.hints.length<3
     ? `<button class="btn gold wide" data-a="askhint" ${S.hintBusy?"disabled":""}>${S.hintBusy
        ? `<span class="spin" style="width:16px;height:16px;border-width:2px"></span>`
        : ["Donner une piste","Aller plus loin","Voir la correction"][S.hints.length]}</button>`
     : `<button class="btn blue wide" data-a="closemodal">Reprendre</button>`}`);
}
function mReview() {
  const r = S.review;
  return veil(`${IC.wand} Relecture`, r.busy ? `<div style="text-align:center;padding:26px 0"><span class="spin"></span></div>`
   : r.err ? `<p class="err">${esc(r.err)}</p>` : `<div class="hint last">${esc(r.txt||"")}</div>`);
}
function mShop() {
  return veil(`${IC.gem} ${S.prog.gems} gemmes`, `
   <div class="list-row"><div style="flex:1"><b>Plein de cœurs</b><div class="muted tiny">Repars à ${maxHearts()} cœurs.</div></div>
    <button class="btn blue sm" data-a="buyhearts" ${S.prog.gems<COST.hearts||S.prog.hearts>=maxHearts()?"disabled":""}>${COST.hearts}</button></div>
   <div class="list-row"><div style="flex:1"><b>Gel de série</b><div class="muted tiny">Protège une journée d'absence. Stock : ${S.prog.freeze}.</div></div>
    <button class="btn gold sm" data-a="buyfreeze" ${S.prog.gems<COST.freeze?"disabled":""}>${COST.freeze}</button></div>
   <p class="muted tiny mt">5 gemmes par leçon, 12 pour un sans-faute, plus un bonus de série.</p>`);
}
function mFiche() { return veil(`${IC.book} Fiche`, ficheHTML(S.fiche)); }
function mNote() {
  const k = S.run ? S.run.items[S.run.idx].key : "";
  return veil(`${IC.note} Ma note`, `<textarea class="in" id="noteText" rows="5" placeholder="Ce que tu veux retenir…">${esc(S.prog.notes[k]||"")}</textarea>
   <button class="btn wide mt" data-a="savenote">Enregistrer</button>`);
}
function mPwd() {
  return veil("Changer de mot de passe", `
   <label class="field"><span>Mot de passe actuel</span><input class="in" id="p_cur" type="password" /></label>
   <label class="field"><span>Nouveau mot de passe</span><input class="in" id="p_new" type="password" placeholder="8 caractères minimum" /></label>
   ${S.pwdMsg?`<p class="${S.pwdOk?"ok":"err"}">${esc(S.pwdMsg)}</p>`:""}
   <button class="btn wide mt" data-a="dopwd">Valider</button>`);
}

/* ================================================================
   ADMINISTRATION
   ================================================================ */
function vAdmin() {
  const A = S.admin, d = A.data;
  if (!d) { loadAdmin(); return head("Administration","Chargement") + `<div class="wrap pad"><div class="center"><span class="spin"></span></div></div>`; }
  const T = [["users","Comptes"],["content","Contenu"],["resources","Ressources"],["settings","Réglages"],["logs","Journal"]];
  return head("Administration", S.user.email) + `<div class="wrap lg pad">
   <div class="grid g3 mt">
    <div class="card kpi"><div class="k">Comptes</div><div class="v">${d.stats.users}</div></div>
    <div class="card kpi"><div class="k">Actifs (7 j)</div><div class="v" style="color:var(--green)">${d.stats.active7}</div></div>
    <div class="card kpi"><div class="k">Leçons</div><div class="v" style="color:var(--blue)">${d.stats.lessons}</div></div>
    <div class="card kpi"><div class="k">Appels IA</div><div class="v" style="color:var(--violet)">${d.stats.aiCalls}</div></div></div>
   <div class="tabs">${T.map(([k,l])=>`<button class="${A.tab===k?"on":""}" data-a="atab" data-v="${k}">${l}</button>`).join("")}</div>
   ${A.msg?`<p class="ok">${esc(A.msg)}</p>`:""}${A.err?`<p class="err">${esc(A.err)}</p>`:""}
   ${ A.tab==="users" ? aUsers(d) : A.tab==="content" ? aContent(d) : A.tab==="resources" ? aResources(d)
     : A.tab==="settings" ? aSettings(d) : aLogs(d) }
  </div>`;
}
function aUsers(d) {
  return `<div class="card mt">
   <div class="row" style="flex-wrap:wrap"><b>Créer un compte</b><div class="sp"></div></div>
   <div class="grid g2 mt">
    <input class="in" id="nu_name" placeholder="Prénom" />
    <input class="in" id="nu_email" placeholder="e-mail" />
    <input class="in" id="nu_pwd" placeholder="mot de passe (8+)" />
    <select class="in" id="nu_role"><option value="student">Élève</option><option value="admin">Administrateur</option></select></div>
   <button class="btn wide sm mt" data-a="acreateuser">Créer</button></div>

   <div class="card mt">${d.users.map(u=>`<div class="list-row">
    <div class="avatar sm">${u.avatar}</div>
    <div style="flex:1;min-width:0">
     <b class="small">${esc(u.name)}</b> ${u.role==="admin"?`<span class="pill v">admin</span>`:""}${u.active?"":`<span class="pill r">désactivé</span>`}
     <div class="muted tiny" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(u.email)} · ${u.aiCalls} appels IA
      · ${u.lastSeen?("vu le "+new Date(u.lastSeen).toLocaleDateString("fr-FR")):"jamais connecté"}</div></div>
    <button class="btn ghost sm" data-a="auser" data-v="${u.id}">Gérer</button></div>`).join("")}</div>`;
}
function mAdminUser() {
  const u = S.admin.data.users.find(x=>x.id === S.admin.edit);
  if (!u) return "";
  return veil("Compte de " + esc(u.name), `
   <p class="muted small">${esc(u.email)} · créé le ${new Date(u.createdAt).toLocaleDateString("fr-FR")}</p>
   <label class="field"><span>Prénom</span><input class="in" id="au_name" value="${esc(u.name)}" /></label>
   <label class="field"><span>Rôle</span><select class="in" id="au_role">
    <option value="student" ${u.role==="student"?"selected":""}>Élève</option>
    <option value="admin" ${u.role==="admin"?"selected":""}>Administrateur</option></select></label>
   <label class="field"><span>Nouveau mot de passe (facultatif)</span><input class="in" id="au_pwd" type="password" placeholder="laisser vide pour ne pas changer" /></label>
   <div class="list-row mt"><div style="flex:1"><b>Compte actif</b></div>${tg(u.active,"au-active")}</div>
   ${S.admin.err?`<p class="err">${esc(S.admin.err)}</p>`:""}
   <button class="btn wide mt" data-a="ausersave">Enregistrer</button>
   <div class="row mt"><button class="btn ghost sm" data-a="auserreset">Remettre la progression à zéro</button>
    <button class="btn red sm" data-a="auserdel">Supprimer</button></div>`);
}
function aContent(d) {
  return `<div class="card mt"><div class="row"><b>Unités et leçons</b><div class="sp"></div>
    <button class="btn ghost sm" data-a="anewunit">Nouvelle unité</button></div></div>
   ${d.units.map(u=>`<div class="card mt">
    <div class="row"><span style="width:14px;height:14px;border-radius:5px;background:${esc(u.color)}"></span>
     <b>${esc(u.title)}</b>${u.published?"":`<span class="pill r">masquée</span>`}<div class="sp"></div>
     <button class="btn ghost sm" data-a="anewlesson" data-v="${u.id}">+ leçon</button>
     <button class="btn ghost sm" data-a="adelunit" data-v="${u.id}">Supprimer</button></div>
    <div class="muted tiny" style="margin-top:3px">${esc(u.subtitle)} · ${u.lessons.length} leçon(s)</div>
    ${u.lessons.map(l=>`<div class="list-row">
      <span style="flex:1;font-weight:700" class="small">${esc(l.title)} <span class="muted tiny">— ${l.items.length} exercice(s)</span>
       ${l.published?"":`<span class="pill r">masquée</span>`}</span>
      <button class="btn ghost sm" data-a="aeditlesson" data-v="${l.id}">Éditer</button>
      <button class="btn ghost sm" data-a="adellesson" data-v="${l.id}">✕</button></div>`).join("")}</div>`).join("")}`;
}
function mAdminLesson() {
  let lesson = null, unit = null;
  S.admin.data.units.forEach(u => u.lessons.forEach(l => { if (l.id === S.admin.edit) { lesson = l; unit = u; } }));
  if (!lesson) return "";
  return veil("Leçon : " + esc(lesson.title), `
   <p class="muted tiny">Unité ${esc(unit.title)}. Le contenu est un tableau JSON d'exercices.
    Types acceptés : qcm, gaps, order, free, code.</p>
   <label class="field"><span>Titre</span><input class="in" id="al_title" value="${esc(lesson.title)}" /></label>
   <div class="list-row"><div style="flex:1"><b>Visible par les élèves</b></div>${tg(lesson.published,"al-pub")}</div>
   <label class="field"><span>Exercices (JSON)</span>
    <textarea class="in mono" id="al_items" rows="16">${esc(S.admin.draft || JSON.stringify(lesson.items, null, 1))}</textarea></label>
   ${S.admin.err?`<p class="err">${esc(S.admin.err)}</p>`:""}
   <div class="row mt"><button class="btn" data-a="alessonsave">Enregistrer</button>
    <button class="btn ghost sm" data-a="alessonmodel">Insérer un modèle</button></div>`);
}
function aResources(d) {
  const kinds = [["fiche","Fiches",d.fiches],["glossaire","Glossaire",d.glossaire],
                 ["complexite","Complexités",d.complexites],["snippet","Extraits de code",d.snippets]];
  return kinds.map(([k,lab,list])=>`<div class="card mt">
   <div class="row"><b>${lab}</b><div class="sp"></div><span class="muted tiny">${list.length}</span></div>
   <div class="grid g2 mt">
    ${k==="fiche"?`<input class="in" id="nr_${k}_unit" placeholder="unité (u1, u2…)" />`:""}
    <input class="in" id="nr_${k}_title" placeholder="titre" />
    ${k==="complexite"?`<input class="in" id="nr_${k}_extra" placeholder="famille" />`:""}</div>
   <textarea class="in mt" id="nr_${k}_body" rows="3" placeholder="contenu"></textarea>
   <button class="btn ghost sm mt" data-a="anewres" data-v="${k}">Ajouter</button>
   <div class="mt">${list.slice(0,60).map(r=>`<div class="list-row">
     <span style="flex:1" class="small"><b>${esc(r.title||"—")}</b>
      <span class="muted"> ${esc((r.body||"").slice(0,70))}</span></span>
     <button class="btn ghost sm" data-a="adelres" data-v="${r.id}">✕</button></div>`).join("")}</div></div>`).join("");
}
function aSettings(d) {
  const s = d.settings;
  return `<div class="card mt">
   <b>Clé API Anthropic partagée</b>
   <p class="muted tiny" style="margin-top:4px">Elle reste sur le serveur : les élèves ne la voient jamais et n'ont pas à en fournir une.
    Tous les appels d'assistance passent par elle, et sont facturés sur ton compte.</p>
   <div class="row mt"><input class="in" id="s_key" type="password" placeholder="${s.anthropic_key?"clé enregistrée — saisis-en une nouvelle pour la remplacer":"sk-ant-…"}" />
    <button class="btn blue sm" data-a="asavekey">Enregistrer</button></div>
   <div class="row mt"><span class="pill ${s.anthropic_key?"g":"r"}">${s.anthropic_key?"Clé configurée":"Aucune clé"}</span>
    ${s.anthropic_key?`<button class="btn ghost sm" data-a="adelkey">Supprimer la clé</button>`:""}</div>
   <div class="list-row mt"><div style="flex:1"><b>Assistance IA activée</b>
     <div class="muted tiny">Indices, relecture, chat, générateur.</div></div>${tg(s.ai_enabled==="1","s-ai")}</div>
   <label class="field"><span>Quota d'appels IA par élève et par jour</span>
    <input class="in" id="s_limit" value="${esc(s.ai_daily_limit)}" /></label></div>

   <div class="card mt">
    <div class="list-row"><div style="flex:1"><b>Inscriptions ouvertes</b>
      <div class="muted tiny">Si tu fermes, seuls les comptes que tu crées peuvent se connecter.</div></div>${tg(s.allow_registration==="1","s-reg")}</div>
    <label class="field"><span>Nom de l'application</span><input class="in" id="s_name" value="${esc(s.app_name)}" /></label>
    <label class="field"><span>Phrase d'accueil</span><input class="in" id="s_welcome" value="${esc(s.welcome)}" /></label>
    <button class="btn wide mt" data-a="asavesettings">Enregistrer</button></div>`;
}
function aLogs(d) {
  return `<div class="card mt">${d.logs.map(l=>`<div class="list-row">
   <span class="pill">${esc(l.kind)}</span><span style="flex:1" class="small">${esc(l.detail)}</span>
   <span class="muted tiny">${new Date(l.at).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</span></div>`).join("")}</div>`;
}
async function loadAdmin() {
  if (S.admin.busy) return;
  S.admin.busy = true;
  try { const d = await api("/admin/overview"); const c = await api("/admin/content");
    S.admin.data = Object.assign({}, d, c); }
  catch(e){ S.admin.err = e.message; }
  S.admin.busy = false; render();
}
async function adminDo(fn, msg) {
  S.admin.err = ""; S.admin.msg = "";
  try { await fn(); S.admin.msg = msg || "Enregistré."; S.admin.data = null; S.modal = null; await loadAdmin();
    setTimeout(()=>{ S.admin.msg = ""; render(); }, 2500); }
  catch(e){ S.admin.err = e.message; render(); }
}

/* ================================================================
   MOTEUR D'EXERCICES
   ================================================================ */
function startRun(items, mode, label, lessonSlug) {
  if (!items || !items.length) return;
  if (mode !== "exam" && !S.set.zen && S.prog.hearts <= 0) { S.modal = "shop"; render(); return; }
  S.modal = null;
  S.run = { items, mode, label, lessonSlug, idx:0, xp:0, correct:0, wrong:[] };
  S.screen = mode === "exam" ? "exam" : "run";
  if (mode === "exam") { S.timeLeft = 720; clearInterval(S.timer);
    S.timer = setInterval(()=>{ S.timeLeft--;
      if (S.timeLeft <= 0) { clearInterval(S.timer); endExam(); } else if (S.screen === "exam") render(); }, 1000); }
  resetItem(); render();
}
function resetItem() {
  const it = S.run.items[S.run.idx].item;
  S.choice = null; S.gapFill = []; S.orderPick = []; S.text = it.t === "code" ? (it.starter||"") : "";
  S.state = "answering"; S.firstTry = true; S.testRes = null; S.testBusy = false;
  S.pool = it.t === "order" ? shuffle(it.lines.map((l,i)=>({l,i}))) : it.t === "gaps" ? shuffle(it.bank) : [];
  if (it.t === "code" && S.py.state === "idle") loadPy().then(render).catch(render);
}
function startLesson(slug) {
  let L = null, U = null;
  units().forEach(u => u.lessons.forEach(l => { if (l.slug === slug) { L = l; U = u; } }));
  if (!L) return;
  S.screen = null;
  startRun(L.items.map((it,i)=>({ item:it, key:L.slug+"#"+i, unit:U, lesson:L })), "lesson", U.title, L.slug);
}
function recordStat(cur, good, xp) {
  const d = today(), s = S.prog.stats.days[d] || { ok:0, ko:0, xp:0 };
  s[good?"ok":"ko"]++; s.xp = (s.xp||0) + (xp||0); S.prog.stats.days[d] = s;
  const u = S.prog.stats.units[cur.unit.slug] || { ok:0, ko:0 };
  u[good?"ok":"ko"]++; S.prog.stats.units[cur.unit.slug] = u;
}
function updateSRS(key, good) {
  const e = S.prog.srs[key];
  if (!good) { S.prog.srs[key] = { box:0, due:Date.now()+864e5, fails:((e&&e.fails)||0)+1 }; return; }
  if (!e) return;
  if (e.box >= SRSD.length-1) { delete S.prog.srs[key]; return; }
  const box = e.box+1; S.prog.srs[key] = Object.assign({}, e, { box, due:Date.now()+SRSD[box]*864e5 });
}
async function check() {
  const R = S.run, cur = R.items[R.idx], it = cur.item; let good = false;
  if (it.t === "qcm") good = S.choice === it.a;
  else if (it.t === "gaps") good = S.gapFill.join("§") === it.a.join("§");
  else if (it.t === "order") good = S.orderPick.map(o=>o.i).join(",") === it.lines.map((_,i)=>i).join(",");
  else if (it.t === "code") {
    S.testBusy = true; render();
    const code = S.text || it.starter || "";
    if (S.py.state !== "fail") {
      try { const r = await runTests(code, it.tests||[]); S.testRes = r; good = !r.fatal && r.res.every(x=>x.ok); }
      catch(e){ S.py.state = "fail"; }
    }
    if (S.py.state === "fail" && S.config.aiEnabled) {
      try {
        const t = await ai('Tu corriges du code Python d\'élève de prépa. Réponds par un JSON strict {"ok":true|false,"msg":"une phrase"} et rien d\'autre.',
          [{ role:"user", content:"Énoncé : "+it.q+"\nTests : "+JSON.stringify(it.tests||[])+"\nCode :\n"+code }], 300);
        const j = JSON.parse(t.replace(/```(json)?/g,"").trim());
        good = !!j.ok; S.testRes = { msgAI:j.msg };
      } catch(e){ good = norm(code) === norm(it.sol||""); }
    } else if (S.py.state === "fail") good = norm(code) === norm(it.sol||"");
    S.testBusy = false;
  } else { const v = norm(S.text); good = v === norm(it.sol) || (it.accept||[]).some(a=>norm(a)===v); }

  const gain = good ? Math.round((S.firstTry?10:4) * DIFF[S.set.diff].x) : 0;
  recordStat(cur, good && S.firstTry, gain);
  if (R.mode !== "exam") updateSRS(cur.key, good);
  if (good) { R.xp += gain; if (S.firstTry) R.correct++; S.state = "ok"; beep("ok"); }
  else {
    if (R.mode === "exam") { R.wrong.push({ q:it.q, ex:it.ex }); S.prog.srs[cur.key] = { box:0, due:Date.now()+864e5, fails:1 }; }
    else if (!S.set.zen) S.prog.hearts = Math.max(0, S.prog.hearts-1);
    S.firstTry = false; S.state = "ko"; beep("ko");
  }
  saveProgress(); render();
}
function next() {
  const R = S.run;
  if (R.mode === "exam") { if (R.idx+1 >= R.items.length) return endExam(); R.idx++; resetItem(); render(); return; }
  if (S.state === "ko") { S.state = "answering"; render(); return; }
  if (!S.set.zen && S.prog.hearts <= 0) { S.screen = null; S.modal = "shop"; render(); return; }
  if (R.idx+1 >= R.items.length) return finish();
  R.idx++; resetItem(); render();
}
function finish() {
  const R = S.run, total = R.items.length, pct = Math.round(R.correct/total*100), perfect = R.correct === total;
  const t = today(), before = level(S.prog.xp);
  let gems = (perfect?12:5) + Math.min(10, S.prog.streak), title = "Leçon terminée";
  if (R.mode === "lesson" && R.lessonSlug && !S.prog.done[R.lessonSlug]) { S.prog.done[R.lessonSlug] = true; S.prog.week.lessons++; }
  if (R.mode === "review") { title = "Révision terminée"; gems = 6; }
  if (R.mode === "flash") { title = "Entraînement bouclé"; gems = 4; }
  if (R.mode === "fav") { title = "Favoris révisés"; gems = 4; }
  if (R.mode === "daily") {
    S.prog.daily.idx = Math.min(3, S.prog.daily.idx + total);
    if (S.prog.daily.idx >= 3 && !S.prog.daily.claimed) { S.prog.daily.claimed = true; gems += 30; R.xp += 20; title = "Défi du jour relevé"; }
    else title = "Défi avancé";
  }
  S.prog.xp += R.xp; S.prog.gems += gems; S.prog.week.xp += R.xp;
  if (perfect) { S.prog.perfect++; S.prog.week.perfect++; }
  if (S.prog.lastDay !== t) { S.prog.streak++; S.prog.lastDay = t; }
  S.prog.best = Math.max(S.prog.best, S.prog.streak);
  logIt(title + " · " + R.xp + " XP");
  S.result = { title, xp:R.xp, gems, pct, levelUp:level(S.prog.xp) > before, newLevel:level(S.prog.xp) };
  S.screen = "result"; beep("win"); saveProgress(); render();
}
function endExam() {
  clearInterval(S.timer);
  const R = S.run, used = Math.max(0, 720 - S.timeLeft), note = Math.round(R.correct/R.items.length*20*10)/10;
  const record = note > S.prog.examBest;
  S.exam = { correct:R.correct, total:R.items.length, wrong:R.wrong, record, time:fmt(used) };
  S.prog.xp += R.xp; S.prog.gems += Math.round(note*2); S.prog.week.xp += R.xp;
  if (record) S.prog.examBest = note;
  const t = today();
  if (S.prog.lastDay !== t) { S.prog.streak++; S.prog.lastDay = t; S.prog.best = Math.max(S.prog.best, S.prog.streak); }
  logIt("Examen blanc : " + note + "/20");
  S.screen = "examresult"; saveProgress(); render();
}

/* ---------------- IA contextuelle ---------------- */
const describe = it => ["Type : "+it.t, "Énoncé : "+it.q, it.code?"Code :\n"+it.code:"",
  it.choices?"Propositions : "+it.choices.join(" | "):"", it.bank?"Étiquettes : "+it.bank.join(" | "):"",
  it.tests?"Tests : "+JSON.stringify(it.tests):""].filter(Boolean).join("\n");
async function askHint() {
  const it = S.run.items[S.run.idx].item;
  S.hintBusy = true; S.hintErr = ""; render();
  const n = S.hints.length + 1;
  const c = n===1 ? "Donne une piste très légère, une ou deux phrases. Ne révèle rien de la réponse."
    : n===2 ? "Donne un indice plus précis : la démarche pas à pas, sans la réponse finale."
    : "Explique la solution complète, avec le raisonnement.";
  try {
    S.hints.push(await ai("Tu es colleur d'informatique en prépa (Python). 60 mots maximum, en français, ton direct, sans flatterie.",
      [{ role:"user", content: describe(it) + "\n\nConsigne : " + c }], 600));
  } catch(e){ S.hintErr = e.message; }
  S.hintBusy = false; render();
}
async function aiReview() {
  const it = S.run.items[S.run.idx].item;
  S.modal = "review"; S.review = { busy:true }; render();
  try {
    S.review.txt = await ai("Tu relis le code Python d'un élève de prépa. 80 mots maximum, en français : ce qui cloche (indice, cas limite, complexité, style), sans réécrire la solution.",
      [{ role:"user", content:"Énoncé : "+it.q+"\n\nCode :\n"+(S.text||it.starter||"") }], 500);
  } catch(e){ S.review.err = e.message; }
  S.review.busy = false; render();
}
async function sendChat() {
  const el = document.getElementById("chatin"), q = (el && el.value || "").trim();
  if (!q) return;
  S.chat.push({ role:"user", content:q }); S.chatBusy = true; if (el) el.value = ""; render();
  try {
    const a = await ai("Tu es colleur d'informatique en classe préparatoire (Python). Tu réponds en français, 120 mots maximum, de façon directe, avec un exemple de code court si nécessaire.",
      S.chat.slice(-10), 700);
    S.chat.push({ role:"assistant", content:a });
  } catch(e){ S.chat.push({ role:"assistant", content:e.message }); }
  S.chatBusy = false; render();
}
async function doTool() {
  const el = document.getElementById("toolin"), v = (el && el.value || "").trim();
  if (!v) return;
  S.tool.input = v; S.tool.busy = true; S.tool.out = ""; render();
  const sys = S.tool.kind === "erreur"
    ? "Tu expliques une erreur Python à un élève de prépa. En français, 100 mots maximum : nomme l'erreur, dis ce qui la provoque, donne la correction."
    : "Tu analyses la complexité d'une fonction Python. En français, 110 mots maximum : complexité en temps et en mémoire, justification brève, amélioration éventuelle.";
  try { S.tool.out = await ai(sys, [{ role:"user", content:v }], 700); }
  catch(e){ S.tool.out = e.message; }
  S.tool.busy = false; render();
}
async function runSandbox() {
  S.sandboxCode = document.getElementById("sbcode")?.value || S.sandboxCode;
  S.sbBusy = true; S.sbOut = ""; render();
  try {
    const py = await loadPy(); let out = "";
    py.setStdout({ batched:s=>{ out += s+"\n"; } }); py.setStderr({ batched:s=>{ out += s+"\n"; } });
    try { py.runPython(S.sandboxCode); }
    catch(e){ out += String(e.message||e).split("\n").filter(Boolean).slice(-3).join("\n"); }
    S.sbOut = out || "(aucune sortie)";
  } catch(e){ S.sbOut = "Interpréteur Python indisponible depuis cette page."; }
  S.sbBusy = false; render();
}
setInterval(() => {
  if (!S.pomo.run) return;
  S.pomo.left--;
  if (S.pomo.left <= 0) {
    if (S.pomo.phase === "focus") { S.prog.pomo++; logIt("Session Pomodoro terminée"); S.pomo.phase = "pause"; S.pomo.left = 300; beep("win"); saveProgress(); }
    else { S.pomo.phase = "focus"; S.pomo.left = 1500; beep("ok"); }
  }
  if (S.screen === "pomo") render();
}, 1000);

/* ================================================================
   ÉVÉNEMENTS
   ================================================================ */
document.addEventListener("input", e => {
  const t = e.target;
  if (t.id === "freeinput") S.text = t.value;
  if (t.id === "f_email") S.auth.email = t.value;
  if (t.id === "f_password") S.auth.password = t.value;
  if (t.id === "f_name") S.auth.name = t.value;
  if (t.id === "sbcode") S.sandboxCode = t.value;
  if (t.id === "al_items") S.admin.draft = t.value;
  if (t.id === "q") { S.search = t.value; render(); }
});
document.addEventListener("keydown", e => {
  if (!S.user) { if (e.key === "Enter" && document.getElementById("f_email")) doAuth(); return; }
  if (S.screen !== "run" && S.screen !== "exam") return;
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "textarea" || tag === "input") return;
  const it = S.run.items[S.run.idx].item;
  if (e.key === "Escape") { S.screen = null; render(); }
  if (e.key === "Enter") { e.preventDefault(); S.state === "answering" ? check() : next(); }
  if (it.t === "qcm" && ["1","2","3","4"].includes(e.key)) {
    const i = +e.key - 1; if (i < it.choices.length) { S.choice = i; render(); }
  }
});
document.addEventListener("click", async e => {
  const el = e.target.closest("[data-a]"); if (!el) return;
  const a = el.dataset.a, v = el.dataset.v;
  switch (a) {
    /* auth */
    case "authmode": S.auth.mode = v; S.auth.err = ""; render(); break;
    case "authav": S.auth.avatar = v; render(); break;
    case "authgoal": S.auth.goal = +v; render(); break;
    case "authgo": doAuth(); break;
    case "logout": localStorage.removeItem(TOKEN_KEY); location.reload(); break;

    /* navigation */
    case "tab": S.tab = v; S.screen = null; S.search = ""; if (v === "admin") S.admin.data = null; render(); break;
    case "go": S.screen = v; S.search = ""; render(); break;
    case "back": clearInterval(S.timer); S.screen = null; render(); break;
    case "quit": clearInterval(S.timer); S.screen = null; saveProgress(); render(); break;
    case "modal": S.modal = v; render(); break;
    case "closemodal": if (!e.target.closest("[data-stop]") || el.dataset.a === "closemodal") {
      S.modal = null; S.hints = []; S.hintErr = ""; S.admin.err = ""; S.admin.draft = ""; render(); } break;
    case "start": startLesson(v); break;

    /* runs */
    case "daily": { const d = S.prog.daily; if (d.claimed) break; const p = allItems(true); if (!p.length) break;
      startRun(pickSeeded(p,3,today()).slice(d.idx), "daily", "Défi du jour"); break; }
    case "review": { const d = dueItems(); if (d.length) startRun(shuffle(d).slice(0,12), "review", "Révision"); break; }
    case "exam": { const p = allItems(true); if (p.length < 5) break;
      startRun(shuffle(p).slice(0, Math.min(15, p.length)), "exam", "Examen blanc"); break; }
    case "flash5": { const p = allItems(true); if (p.length) startRun(shuffle(p).slice(0,5), "flash", "Entraînement éclair"); break; }
    case "favrun": { const f = favItems(); if (f.length) startRun(shuffle(f), "fav", "Favoris"); break; }
    case "flashcards": { const p = allItems(true); if (!p.length) break;
      S.flash = { deck:shuffle(p).slice(0,12), i:0, back:false }; S.screen = "flash"; render(); break; }
    case "flip": S.flash.back = !S.flash.back; render(); break;
    case "fc": { const x = S.flash.deck[S.flash.i];
      if (v === "1") updateSRS(x.key, true); else S.prog.srs[x.key] = { box:0, due:Date.now()+864e5, fails:1 };
      S.flash.i++; S.flash.back = false; saveProgress(); render(); break; }
    case "check": check(); break;
    case "next": next(); break;
    case "pick": S.choice = +v; render(); break;
    case "fill": { const it = S.run.items[S.run.idx].item, mx = (it.code.match(/___/g)||[]).length;
      if (S.gapFill.length < mx) S.gapFill.push(v); render(); break; }
    case "unfill": S.gapFill.splice(+v,1); render(); break;
    case "pickline": { const p = S.pool.find(x=>x.i === +v); if (p) S.orderPick.push(p); render(); break; }
    case "unpick": S.orderPick.splice(+v,1); render(); break;
    case "hint": S.modal = "hint"; S.hints = []; S.hintErr = ""; render(); break;
    case "askhint": askHint(); break;
    case "aireview": aiReview(); break;
    case "fiche": S.fiche = v; S.modal = "fiche"; render(); break;
    case "fav": { const k = S.run.items[S.run.idx].key;
      S.prog.fav[k] ? delete S.prog.fav[k] : S.prog.fav[k] = 1; saveProgress(); render(); break; }
    case "unfav": delete S.prog.fav[v]; saveProgress(); render(); break;
    case "savenote": { const k = S.run ? S.run.items[S.run.idx].key : "";
      const t = document.getElementById("noteText").value.trim();
      if (t) S.prog.notes[k] = t; else delete S.prog.notes[k];
      S.modal = null; saveProgress(); render(); break; }
    case "delnote": delete S.prog.notes[v]; saveProgress(); render(); break;

    /* récompenses */
    case "shop": S.modal = "shop"; render(); break;
    case "buyhearts": if (S.prog.gems >= COST.hearts && S.prog.hearts < maxHearts()) {
      S.prog.gems -= COST.hearts; S.prog.hearts = maxHearts(); saveProgress(); } render(); break;
    case "buyfreeze": if (S.prog.gems >= COST.freeze) { S.prog.gems -= COST.freeze; S.prog.freeze++; saveProgress(); } render(); break;
    case "chest": { if (S.prog.chestDay === today()) break;
      const g = 10 + Math.floor(Math.random()*41);
      S.prog.chestDay = today(); S.prog.gems += g; logIt("Coffre : +"+g+" gemmes"); beep("win"); saveProgress(); render();
      setTimeout(()=>alert("Coffre ouvert : +"+g+" gemmes."), 80); break; }
    case "claimweek": if (missions().all && !S.prog.week.claimed) {
      S.prog.week.claimed = true; S.prog.gems += 120; logIt("Missions de la semaine : +120 gemmes");
      beep("win"); saveProgress(); render(); } break;

    /* outils */
    case "runpy": runSandbox(); break;
    case "clearout": S.sbOut = ""; render(); break;
    case "send": sendChat(); break;
    case "clearchat": S.chat = []; render(); break;
    case "tool": S.tool = { kind:v, input:"", out:"", busy:false }; S.screen = "tool"; render(); break;
    case "dotool": doTool(); break;
    case "pomo": if (v === "toggle") S.pomo.run = !S.pomo.run;
      else { S.pomo.run = false; S.pomo.phase = "focus"; S.pomo.left = 1500; } render(); break;
    case "copysnip": copy(S.content.snippets[+v].body, "Extrait copié."); break;
    case "print": window.print(); break;
    case "share": copy("PyPrépa · " + S.user.name + " · niveau " + level(S.prog.xp) + " (" + rankOf(level(S.prog.xp)) +
      "), " + S.prog.xp + " XP, série de " + S.prog.streak + " jours.", "Score copié."); break;

    /* compte et réglages */
    case "setav": S.user.avatar = v; render(); break;
    case "setgoal": S.user.goal = +v; render(); break;
    case "saveaccount": { const n = document.getElementById("acname").value.trim();
      if (n) S.user.name = n; saveMe(); S.accMsg = "Compte mis à jour.";
      render(); setTimeout(()=>{ S.accMsg = ""; render(); }, 2500); break; }
    case "dopwd": {
      const cur = document.getElementById("p_cur").value, nx = document.getElementById("p_new").value;
      try { await api("/me/password", { method:"POST", body:{ current:cur, next:nx } });
        S.pwdOk = true; S.pwdMsg = "Mot de passe modifié."; }
      catch(err){ S.pwdOk = false; S.pwdMsg = err.message; }
      render(); break; }
    case "t-dark": S.set.dark = !S.set.dark; applyTheme(); saveMe(); render(); break;
    case "t-big": S.set.big = !S.set.big; applyTheme(); saveMe(); render(); break;
    case "t-sound": S.set.sound = !S.set.sound; saveMe(); render(); break;
    case "t-ai": S.set.aiHints = !S.set.aiHints; saveMe(); render(); break;
    case "t-free": S.set.freeNav = !S.set.freeNav; saveMe(); render(); break;
    case "t-zen": S.set.zen = !S.set.zen; saveMe(); render(); break;
    case "diff": S.set.diff = v; S.prog.hearts = Math.min(S.prog.hearts, maxHearts()); saveMe(); saveProgress(); render(); break;
    case "clearsrs": if (confirm("Vider la file de révision ?")) { S.prog.srs = {}; saveProgress(); render(); } break;
    case "resetprog": if (confirm("Effacer toute ta progression ?")) { S.prog = blank(); S.prog.heartDay = today(); saveProgress(); render(); } break;
    case "backup": { const b = new Blob([JSON.stringify(S.prog)], { type:"application/json" });
      const l = document.createElement("a"); l.href = URL.createObjectURL(b);
      l.download = "pyprepa-progression.json"; l.click(); break; }

    /* administration */
    case "atab": S.admin.tab = v; S.admin.msg = ""; S.admin.err = ""; render(); break;
    case "auser": S.admin.edit = +v; S.admin.err = ""; S.modal = "adminUser"; render(); break;
    case "au-active": { const u = S.admin.data.users.find(x=>x.id === S.admin.edit); u.active = !u.active; render(); break; }
    case "ausersave": { const u = S.admin.data.users.find(x=>x.id === S.admin.edit);
      adminDo(()=>api("/admin/users/" + u.id, { method:"PATCH", body:{
        name:document.getElementById("au_name").value, role:document.getElementById("au_role").value,
        active:u.active, password:document.getElementById("au_pwd").value || undefined } }), "Compte mis à jour."); break; }
    case "auserreset": if (confirm("Remettre la progression de ce compte à zéro ?"))
      adminDo(()=>api("/admin/users/" + S.admin.edit, { method:"PATCH", body:{ resetProgress:true } }), "Progression remise à zéro."); break;
    case "auserdel": if (confirm("Supprimer définitivement ce compte ?"))
      adminDo(()=>api("/admin/users/" + S.admin.edit, { method:"DELETE" }), "Compte supprimé."); break;
    case "acreateuser": adminDo(()=>api("/admin/users", { method:"POST", body:{
      name:document.getElementById("nu_name").value, email:document.getElementById("nu_email").value,
      password:document.getElementById("nu_pwd").value, role:document.getElementById("nu_role").value } }), "Compte créé."); break;
    case "anewunit": { const t = prompt("Titre de la nouvelle unité :"); if (!t) break;
      adminDo(()=>api("/admin/units", { method:"POST", body:{ title:t, slug:"u"+Date.now() } }), "Unité créée."); break; }
    case "adelunit": if (confirm("Supprimer cette unité et toutes ses leçons ?"))
      adminDo(()=>api("/admin/units/" + v, { method:"DELETE" }), "Unité supprimée."); break;
    case "anewlesson": { const t = prompt("Titre de la nouvelle leçon :"); if (!t) break;
      adminDo(()=>api("/admin/lessons", { method:"POST", body:{ unitId:+v, title:t, slug:"l"+Date.now(), items:[] } }), "Leçon créée."); break; }
    case "adellesson": if (confirm("Supprimer cette leçon ?"))
      adminDo(()=>api("/admin/lessons/" + v, { method:"DELETE" }), "Leçon supprimée."); break;
    case "aeditlesson": S.admin.edit = +v; S.admin.draft = ""; S.admin.err = ""; S.modal = "adminLesson"; render(); break;
    case "al-pub": { S.admin.data.units.forEach(u=>u.lessons.forEach(l=>{ if (l.id === S.admin.edit) l.published = !l.published; })); render(); break; }
    case "alessonmodel": { S.admin.draft = JSON.stringify([
      { t:"qcm", q:"Question ?", choices:["a","b","c","d"], a:0, ex:"Explication." },
      { t:"gaps", q:"Complète.", code:"x = ___", bank:["1","2","3","4"], a:["1"], ex:"Explication." },
      { t:"order", q:"Remets dans l'ordre.", lines:["def f():","    return 1"], ex:"Explication." },
      { t:"free", q:"Écris…", sol:"x = 1", accept:[], ex:"Explication." },
      { t:"code", q:"Écris une fonction.", starter:"def f(x):\n    ", tests:[{ call:"f(2)", expect:"4" }], sol:"def f(x):\n    return x*2", ex:"Explication." }
    ], null, 1); render(); break; }
    case "alessonsave": { let lesson = null;
      S.admin.data.units.forEach(u=>u.lessons.forEach(l=>{ if (l.id === S.admin.edit) lesson = l; }));
      const raw = document.getElementById("al_items").value;
      let items; try { items = JSON.parse(raw); } catch(err){ S.admin.err = "JSON invalide : " + err.message; render(); break; }
      adminDo(()=>api("/admin/lessons/" + lesson.id, { method:"PATCH", body:{
        title:document.getElementById("al_title").value, items, published:lesson.published } }), "Leçon enregistrée."); break; }
    case "anewres": { const g = id => (document.getElementById(id) || {}).value || "";
      adminDo(()=>api("/admin/resources", { method:"POST", body:{ kind:v, unit:g("nr_"+v+"_unit"),
        title:g("nr_"+v+"_title"), body:g("nr_"+v+"_body"), extra:g("nr_"+v+"_extra") } }), "Ressource ajoutée."); break; }
    case "adelres": if (confirm("Supprimer cette ressource ?"))
      adminDo(()=>api("/admin/resources/" + v, { method:"DELETE" }), "Ressource supprimée."); break;
    case "asavekey": { const k = document.getElementById("s_key").value.trim();
      if (!k) { S.admin.err = "Saisis une clé."; render(); break; }
      adminDo(()=>api("/admin/settings", { method:"PUT", body:{ anthropic_key:k } }).then(loadConfig), "Clé enregistrée."); break; }
    case "adelkey": if (confirm("Supprimer la clé API partagée ? L'assistance IA sera coupée pour tout le monde."))
      adminDo(()=>api("/admin/settings/key", { method:"DELETE" }).then(loadConfig), "Clé supprimée."); break;
    case "s-ai": adminDo(()=>api("/admin/settings", { method:"PUT", body:{
      ai_enabled: S.admin.data.settings.ai_enabled === "1" ? "0" : "1" } }).then(loadConfig), "Réglage modifié."); break;
    case "s-reg": adminDo(()=>api("/admin/settings", { method:"PUT", body:{
      allow_registration: S.admin.data.settings.allow_registration === "1" ? "0" : "1" } }).then(loadConfig), "Réglage modifié."); break;
    case "asavesettings": adminDo(()=>api("/admin/settings", { method:"PUT", body:{
      app_name:document.getElementById("s_name").value, welcome:document.getElementById("s_welcome").value,
      ai_daily_limit:document.getElementById("s_limit").value } }).then(loadConfig), "Réglages enregistrés."); break;
  }
});

/* ================================================================
   DÉMARRAGE
   ================================================================ */
async function doAuth() {
  const a = S.auth;
  a.email = (document.getElementById("f_email")||{}).value || a.email;
  a.password = (document.getElementById("f_password")||{}).value || a.password;
  const nameEl = document.getElementById("f_name"); if (nameEl) a.name = nameEl.value;
  a.err = ""; a.busy = true; render();
  try {
    const body = a.mode === "register"
      ? { email:a.email, password:a.password, name:a.name, avatar:a.avatar, goal:a.goal }
      : { email:a.email, password:a.password };
    const d = await api("/auth/" + a.mode, { method:"POST", body });
    S.token = d.token; localStorage.setItem(TOKEN_KEY, d.token);
    adopt(d.user); await loadContent();
  } catch(err){ a.err = err.message; }
  a.busy = false; render();
}
function adopt(u) {
  S.user = u;
  S.set = Object.assign(S.set, u.settings || {});
  S.prog = Object.assign(blank(), u.progress || {});
  S.prog.srs = S.prog.srs || {}; S.prog.fav = S.prog.fav || {}; S.prog.notes = S.prog.notes || {};
  S.prog.log = S.prog.log || []; S.prog.stats = S.prog.stats || { days:{}, units:{} };
  S.prog.stats.days = S.prog.stats.days || {}; S.prog.stats.units = S.prog.stats.units || {};
  S.prog.daily = S.prog.daily || { day:null, idx:0, claimed:false };
  S.prog.week = S.prog.week || { key:null, xp:0, lessons:0, perfect:0, claimed:false };
  rollDates(); applyTheme();
}
async function loadContent() { S.content = await api("/content"); }
async function loadConfig() { S.config = await api("/config"); }

(async function boot() {
  try { await loadConfig(); } catch(e){}
  if (S.token) {
    try { const d = await api("/me"); adopt(d.user); await loadContent(); }
    catch(e){ localStorage.removeItem(TOKEN_KEY); S.token = ""; S.user = null; }
  }
  S.boot = false; render();
  if (S.froze) setTimeout(()=>alert("Gel de série utilisé : ta série est préservée."), 400);
})();
