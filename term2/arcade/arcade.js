/* Python Arcade — The Gauntlet (v2)
 * 559 quests across 9 types: code, drill, predict, debug, modify, write,
 * multi, mini, boss.
 * Optional Google Sheets backend for teacher monitoring.
 * localStorage-first — works offline; backend mirrors progress.
 */

const STORAGE_KEY = "py_arcade_v2";
const LEGACY_KEY = "py_arcade_v1";  // migrate from v1
const ALL_LEADERBOARD_KEY = "py_arcade_leaderboard_v1";
const SETTINGS_KEY = "py_arcade_settings_v1";

// ---------- LESSON METADATA ----------
// Matches the new teacher-led Alien Invasion walkthrough (no own-game sprints).
// Every lesson is I Do / We Do — students code along live.
const LESSONS = [
  { id: "L01", week: "Week 1", title: "Diagnostic Test + Python Refresher", phase: "Python Refresher" },
  { id: "L02", week: "Week 1", title: "Loops + Functions (Faster Pace)", phase: "Python Refresher" },
  { id: "L03", week: "Week 2", title: "Classes Part 1 — Attributes + Methods", phase: "Python Refresher" },
  { id: "L04", week: "Week 2", title: "Classes Part 2 + Text Adventure Checkpoint", phase: "Python Refresher" },
  { id: "L05", week: "Week 3", title: "Pygame Setup + First Window (Ch 12 §1-2)", phase: "Alien Invasion Core" },
  { id: "L06", week: "Week 3", title: "Ship Class + Image Loading (Ch 12 §3)", phase: "Alien Invasion Core" },
  { id: "L07", week: "Week 4", title: "Ship Movement — Keyboard + Float (Ch 12 §4)", phase: "Alien Invasion Core" },
  { id: "L08", week: "Week 4", title: "Bullet Class + Sprite Inheritance (Ch 12 §5)", phase: "Alien Invasion Core" },
  { id: "L09", week: "Week 5", title: "Sprite Groups + Firing + Cleanup (Ch 12 §6)", phase: "Alien Invasion Core" },
  { id: "L10", week: "Week 5", title: "Alien Class + Fleet Creation (Ch 13 §1-2)", phase: "Alien Invasion Core" },
  { id: "L11", week: "Week 6", title: "Fleet Movement + Edges + Flip (Ch 13 §3)", phase: "Alien Invasion Core" },
  { id: "L12", week: "Week 6", title: "Collisions + Fleet Respawn (Ch 13 §4)", phase: "Alien Invasion Core" },
  { id: "L13", week: "Week 7", title: "Ship Hits + GameStats + Lives (Ch 14 §1-2)", phase: "Alien Invasion Core" },
  { id: "L14", week: "Week 7", title: "Scoring + Play Button + States (Ch 14 §3-4)", phase: "Alien Invasion Core" },
  { id: "L15", week: "Week 8", title: "Difficulty Ramp + Level Progression", phase: "Alien Invasion Extensions" },
  { id: "L16", week: "Week 8", title: "Scoring Display + High Score Persistence", phase: "Alien Invasion Extensions" },
  { id: "L17", week: "Week 9", title: "Sound Effects + Explosion Particles", phase: "Alien Invasion Extensions" },
  { id: "L18", week: "Week 9", title: "Multiple Alien Types + Boss Alien", phase: "Alien Invasion Extensions" },
  { id: "L19", week: "Week 10", title: "Power-ups + Shield Mechanic", phase: "Alien Invasion Extensions" },
  { id: "L20", week: "Week 10", title: "Custom Sprite Art + Reskin Prep", phase: "Alien Invasion Extensions" },
  { id: "L21", week: "Week 11", title: "Personal Reskin Workshop Day", phase: "Reskin + Showcase" },
  { id: "L22", week: "Week 11", title: "Showcase + Written Evaluation", phase: "Reskin + Showcase" },
  { id: "EXT", week: "Bonus", title: "Extension Arena (Ch 6 Dicts + Ch 10 Files)", phase: "Bonus" },
];

// ---------- BADGES ----------
const BADGES = [
  { id: "first-steps",  emoji: "🐣", name: "First Steps", test: (s) => s.completed.length >= 1 },
  { id: "on-fire",      emoji: "🔥", name: "On Fire (5 in a day)", test: (s) => s.todayCount() >= 5 },
  { id: "marathon",     emoji: "🏃", name: "Marathon (20 in a day)", test: (s) => s.todayCount() >= 20 },
  { id: "variety",      emoji: "🌈", name: "Variety Pack (5 types)", test: (s) => s.typesUsed() >= 5 },
  { id: "typist",       emoji: "⌨️", name: "Typist (20 drills)", test: (s) => s.countByType("drill") >= 20 },
  { id: "oracle",       emoji: "🔮", name: "Oracle (30 predictions)", test: (s) => s.countByType("predict") >= 30 },
  { id: "debugger",     emoji: "🔧", name: "Debugger (20 fixes)", test: (s) => s.countByType("debug") >= 20 },
  { id: "writer",       emoji: "✍️", name: "Writer (10 reflections)", test: (s) => s.countByType("write") >= 10 },
  { id: "loop-master",  emoji: "🔁", name: "Loop Master (all Ch 4)", test: (s) => s.chapterDone(4) },
  { id: "class-act",    emoji: "🎩", name: "Class Act (all Ch 9)", test: (s) => s.chapterDone(9) },
  { id: "boss-slayer",  emoji: "💥", name: "Boss Slayer (3 bosses)", test: (s) => s.bossesDefeated() >= 3 },
  { id: "pygame-pro",   emoji: "🕹️", name: "Pygame Pro (all Ch 12-14)", test: (s) => [12,13,14].every(c => s.chapterDone(c)) },
  { id: "streak-3",     emoji: "📅", name: "3-Day Streak", test: (s) => s.streak >= 3 },
  { id: "streak-7",     emoji: "📆", name: "7-Day Streak", test: (s) => s.streak >= 7 },
  { id: "champion",     emoji: "🏆", name: "Arcade Champion (200 quests)", test: (s) => s.completed.length >= 200 },
];

// ---------- ERROR BESTIARY ----------
const ERRORS = [
  { name: "NameError",  monster: "NameError Goblin", code: "NameError: name 'x' is not defined",
    cause: "You used a variable before defining it, or typed the name wrong.",
    fix: "Define the variable first (x = 5) OR check your spelling (Python is case-sensitive)." },
  { name: "IndentationError", monster: "Indentation Ogre", code: "IndentationError: expected an indented block",
    cause: "Python uses indentation to group code. After : the next line MUST be indented by 4 spaces.",
    fix: "Indent the line after if/else/for/while/def with 4 spaces. Don't mix tabs + spaces." },
  { name: "SyntaxError", monster: "Syntax Serpent", code: "SyntaxError: invalid syntax",
    cause: "Typo. Missing colon after if/for/def. Missing closing quote/paren/bracket.",
    fix: "Look at the line Python points to + the line above. Add : at the end of if/for/def, close all ( ), close all quotes." },
  { name: "TypeError", monster: "Type Troll", code: "TypeError: unsupported operand type(s) for +: 'int' and 'str'",
    cause: "You're mixing types that don't go together (e.g. adding a number to a string).",
    fix: "Convert with int() or str(). Classic: age + 5 fails if age came from input(). Fix: int(age) + 5." },
  { name: "IndexError", monster: "Index Imp", code: "IndexError: list index out of range",
    cause: "You tried to access list item number 5 but the list only has 3 items.",
    fix: "Use len(list) to check size. If len is 3, valid indexes are 0, 1, 2." },
  { name: "KeyError", monster: "Key Kraken", code: "KeyError: 'banana'",
    cause: "You tried to access a dictionary key that doesn't exist.",
    fix: "Check the key exists first with if 'banana' in my_dict. Or use my_dict.get('banana', 'default')." },
  { name: "AttributeError", monster: "Attribute Arachnid", code: "AttributeError: 'str' object has no attribute 'length'",
    cause: "You called a method that doesn't exist on this type.",
    fix: "Python uses len(s), not s.length(). Check spelling." },
  { name: "ValueError", monster: "Value Voidling", code: "ValueError: invalid literal for int() with base 10: 'hello'",
    cause: "You tried to convert a value that doesn't fit — usually int('hello').",
    fix: "Only convert to int if the string is actually a number. Validate input first." },
  { name: "ZeroDivisionError", monster: "Zero Zombie", code: "ZeroDivisionError: division by zero",
    cause: "You divided by zero.",
    fix: "Check your divisor isn't 0 before dividing." },
  { name: "FileNotFoundError", monster: "File Phantom", code: "FileNotFoundError: [Errno 2] No such file",
    cause: "The file you're trying to open doesn't exist at that path.",
    fix: "Check your working directory. Put the file next to your .py script." },
  { name: "ModuleNotFoundError", monster: "Module Mimic", code: "ModuleNotFoundError: No module named 'pygame'",
    cause: "The library isn't installed.",
    fix: "Run: pip install pygame  (in terminal, not Python)." },
  { name: "UnboundLocalError", monster: "Scope Spectre", code: "UnboundLocalError: local variable referenced before assignment",
    cause: "You're trying to use a variable inside a function before setting it.",
    fix: "Initialise the variable at the top of the function." },
];

// ---------- STATE ----------
class State {
  constructor() {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const old = JSON.parse(legacy);
        raw = JSON.stringify({
          firstName: old.nickname || "", lastName: "", classCode: "9GAMZA",
          completed: old.completed || [], hintsUsed: old.hintsUsed || [],
          flagged: [], writings: {},
          lastActive: old.lastActive, streak: old.streak,
        });
        localStorage.setItem(STORAGE_KEY, raw);
      }
    }
    const d = raw ? JSON.parse(raw) : {};
    this.firstName = d.firstName || "";
    this.lastName = d.lastName || "";
    this.classCode = d.classCode || "9GAMZA";
    this.completed = d.completed || [];
    this.hintsUsed = d.hintsUsed || [];
    this.flagged = d.flagged || [];
    this.writings = d.writings || {};   // exId -> text
    this.lastActive = d.lastActive || null;
    this.streak = d.streak || 0;
    this.exercises = [];

    const s = localStorage.getItem(SETTINGS_KEY);
    const sd = s ? JSON.parse(s) : {};
    this.backendUrl = sd.backendUrl || "";
  }

  get studentName() {
    const fn = (this.firstName || "").trim();
    const ln = (this.lastName || "").trim();
    return [fn, ln].filter(x => x).join(" ") || "(anonymous)";
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      firstName: this.firstName, lastName: this.lastName, classCode: this.classCode,
      completed: this.completed, hintsUsed: this.hintsUsed,
      flagged: this.flagged, writings: this.writings,
      lastActive: this.lastActive, streak: this.streak,
    }));
    this.updateLeaderboard();
  }

  saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ backendUrl: this.backendUrl }));
  }

  updateLeaderboard() {
    if (!this.firstName) return;
    const board = JSON.parse(localStorage.getItem(ALL_LEADERBOARD_KEY) || "{}");
    board[this.studentName] = {
      xp: this.totalXP(), count: this.completed.length, level: this.level(),
      badges: this.earnedBadges().length, lastActive: new Date().toISOString(),
    };
    localStorage.setItem(ALL_LEADERBOARD_KEY, JSON.stringify(board));
  }

  totalXP() { return this.completed.reduce((s, c) => s + (c.xp || this._xpFor(c.id)), 0); }
  _xpFor(id) { const e = this.exercises.find(x => x.id === id); return e ? e.xp : 10; }

  level() { return Math.floor(this.totalXP() / 150) + 1; }
  xpIntoLevel() { return this.totalXP() % 150; }
  xpToNextLevel() { return 150 - this.xpIntoLevel(); }

  isDone(id) { return this.completed.some(c => c.id === id); }
  isFlagged(id) { return this.flagged.includes(id); }

  todayCount() {
    const today = new Date().toDateString();
    return this.completed.filter(c => new Date(c.ts).toDateString() === today).length;
  }

  typesUsed() {
    const types = new Set();
    for (const c of this.completed) {
      const ex = this.exercises.find(e => e.id === c.id);
      if (ex) types.add(ex.type);
    }
    return types.size;
  }

  countByType(type) {
    return this.completed.filter(c => {
      const ex = this.exercises.find(e => e.id === c.id);
      return ex && ex.type === type;
    }).length;
  }

  chapterDone(ch) {
    const chExs = this.exercises.filter(e => e.chapter === ch && e.num !== 999);
    if (!chExs.length) return false;
    return chExs.every(e => this.isDone(e.id));
  }

  bossesDefeated() {
    return this.exercises.filter(e => e.num === 999 && this.isDone(e.id)).length;
  }

  earnedBadges() { return BADGES.filter(b => b.test(this)); }

  lessonProgress(lessonId) {
    const exs = this.exercises.filter(e => e.lesson === lessonId);
    if (!exs.length) return { done: 0, total: 0, pct: 0 };
    const done = exs.filter(e => this.isDone(e.id)).length;
    return { done, total: exs.length, pct: Math.round(done / exs.length * 100) };
  }

  markComplete(id, xp, payload) {
    if (this.isDone(id)) return false;
    const now = new Date();
    this.completed.push({ id, ts: now.toISOString(), xp: xp || this._xpFor(id), payload: payload || {} });
    // Streak logic
    const today = now.toDateString();
    if (!this.lastActive) { this.streak = 1; }
    else {
      const last = new Date(this.lastActive).toDateString();
      if (last !== today) {
        const y = new Date(now.getTime() - 86400000).toDateString();
        this.streak = (last === y) ? this.streak + 1 : 1;
      }
    }
    this.lastActive = now.toISOString();
    this.save();
    postToBackend(id, xp, payload);
    return true;
  }

  toggleFlag(id) {
    if (this.flagged.includes(id)) this.flagged = this.flagged.filter(x => x !== id);
    else this.flagged.push(id);
    this.save();
  }

  saveWriting(id, text) { this.writings[id] = text; this.save(); }
  getWriting(id) { return this.writings[id] || ""; }

  markHintUsed(id) {
    if (!this.hintsUsed.includes(id)) { this.hintsUsed.push(id); this.save(); }
  }
}

// ---------- BACKEND (Google Sheets / Apps Script) ----------
function postToBackend(exId, xp, payload) {
  if (!state.backendUrl) return;
  const ex = state.exercises.find(e => e.id === exId);
  if (!ex) return;
  const body = {
    student: state.studentName,
    class_code: state.classCode,
    quest_id: exId,
    quest_type: ex.type,
    lesson: ex.lesson,
    xp: xp || ex.xp,
    difficulty: ex.difficulty,
    payload: payload || {},
  };
  // Fire-and-forget; use no-cors to avoid preflight issues with Apps Script
  fetch(state.backendUrl, {
    method: "POST", mode: "no-cors",
    headers: {"Content-Type": "text/plain;charset=utf-8"},
    body: JSON.stringify(body),
  }).catch(() => {});
}

const state = new State();

// ---------- ROUTER ----------
function route() {
  const hash = location.hash.slice(1) || "dashboard";
  const [view, ...args] = hash.split("/");
  document.querySelectorAll(".view").forEach(v => v.hidden = true);
  // Make sure settings/errors/hallfame views exist dynamically
  ensureView("settings");
  const target = document.getElementById(`view-${view}`);
  if (target) target.hidden = false;
  if (view === "dashboard") renderDashboard();
  else if (view === "lesson") renderLesson(args[0]);
  else if (view === "exercise") renderExercise(args[0]);
  else if (view === "hallfame") renderHallFame();
  else if (view === "errors") renderErrors();
  else if (view === "settings") renderSettings();
  else location.hash = "#dashboard";
  window.scrollTo(0, 0);
}

function ensureView(name) {
  if (!document.getElementById(`view-${name}`)) {
    const main = document.querySelector("main.container.arcade");
    const div = document.createElement("div");
    div.id = `view-${name}`; div.className = "view"; div.hidden = true;
    main.appendChild(div);
  }
}

window.addEventListener("hashchange", route);

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

// ---------- DASHBOARD ----------
function renderDashboard() {
  const v = document.getElementById("view-dashboard");
  const xp = state.totalXP();
  const lvl = state.level();
  const into = state.xpIntoLevel();
  const doneCount = state.completed.length;
  const totalCount = state.exercises.length;

  // Daily challenge — rotates
  const doy = Math.floor((Date.now() / 86400000) % Math.max(1, state.exercises.length));
  const daily = state.exercises[doy] || state.exercises[0];

  // Resume card
  let lastEx = null;
  if (state.completed.length) {
    const lastDone = state.exercises.find(e => e.id === state.completed[state.completed.length-1].id);
    if (lastDone) lastEx = state.exercises.find(e => e.lesson === lastDone.lesson && !state.isDone(e.id));
  } else {
    lastEx = state.exercises.find(e => e.id === "1-1") || state.exercises[0];
  }

  const nameBar = state.firstName ? `
    <div class="nickname-bar">
      <span class="nickname-chip" onclick="changeStudent()">🎮 ${esc(state.studentName)} · ${esc(state.classCode)} · edit</span>
      <span class="nickname-chip" onclick="location.hash='#settings'" style="color:var(--text-muted);">⚙️ Settings</span>
    </div>` : "";

  const badgesEarned = state.earnedBadges();

  v.innerHTML = `
    ${nameBar}
    <div class="arcade-banner">
      <h1>🐍 PYTHON ARCADE</h1>
      <p class="subtitle">The Gauntlet · ${state.exercises.length} quests · ${state.exercises.reduce((a,b)=>a+b.xp,0)} XP up for grabs</p>
      <p class="tagline">"Defeat the errors. Conquer the concepts. Ship your game."</p>
    </div>

    <div class="stat-bar">
      <div class="stat-card xp">
        <div class="label">Total XP</div><div class="value">${xp}</div>
        <div class="xp-track"><div class="xp-fill" style="width:${into/150*100}%"></div></div>
        <div class="xp-next">${state.xpToNextLevel()} to level ${lvl + 1}</div>
      </div>
      <div class="stat-card level">
        <div class="label">Level</div><div class="value">${lvl}</div>
        <div class="xp-next">${doneCount}/${totalCount} quests</div>
      </div>
      <div class="stat-card streak">
        <div class="label">Streak</div><div class="value">${state.streak}🔥</div>
        <div class="xp-next">consecutive days</div>
      </div>
      <div class="stat-card badges">
        <div class="label">Badges</div><div class="value">${badgesEarned.length}/${BADGES.length}</div>
        <div class="xp-next">${badgesEarned.slice(-3).map(b => b.emoji).join(" ") || "earn your first!"}</div>
      </div>
    </div>

    <div class="cta-row">
      ${lastEx ? `
      <a class="cta-card" href="#exercise/${lastEx.id}">
        <h3>▶ Continue: ${esc(lastEx.flavour)}</h3>
        <div class="cta-sub">Quest ${lastEx.id} · ${lastEx.difficulty} · ${lastEx.xp} XP</div>
      </a>` : ""}
      <a class="cta-card daily" href="#exercise/${daily.id}">
        <h3>⚡ Daily Challenge</h3>
        <div class="cta-sub">${esc(daily.flavour)} · ${daily.xp} XP</div>
      </a>
      <a class="cta-card random" onclick="randomEncounter()">
        <h3>🎲 Random Encounter</h3>
        <div class="cta-sub">Pick a random undefeated quest</div>
      </a>
      <a class="cta-card" onclick="exportProgress()" style="background:linear-gradient(135deg,rgba(74,222,128,0.15),rgba(20,184,166,0.1));">
        <h3>📥 Export my progress</h3>
        <div class="cta-sub">Download a summary to paste into Classroom</div>
      </a>
    </div>

    <h2>Earned Badges</h2>
    <div class="badges-strip">
      ${BADGES.map(b => `<span class="badge ${badgesEarned.some(eb => eb.id === b.id) ? "" : "locked"}" title="${esc(b.name)}">
        <span class="badge-emoji">${b.emoji}</span> ${esc(b.name)}</span>`).join("")}
    </div>

    <h2>Quest Types</h2>
    <div class="type-legend">
      ${typeLegend("code", "💻", "Code", "External — copy to VS Code + run")}
      ${typeLegend("drill", "⌨️", "Drill", "Retype exact code — auto-checked")}
      ${typeLegend("predict", "🔮", "Predict", "What will this print? multi-choice")}
      ${typeLegend("debug", "🔧", "Debug", "Fix broken code + explain the bug")}
      ${typeLegend("modify", "🔨", "Modify", "Change existing code to do X")}
      ${typeLegend("write", "✍️", "Write", "Prose reflection (min chars)")}
      ${typeLegend("multi", "✅", "Quiz", "Multiple choice concept check")}
      ${typeLegend("mini", "🎯", "Mini-Game", "Small Pygame challenge")}
      ${typeLegend("boss", "💥", "Boss", "Chapter capstone — high XP")}
    </div>

    <h2>The 22-Lesson Gauntlet</h2>
    <p class="subtitle">Work through in order, or jump to any lesson. Click a lesson to see its quests.</p>
    <div class="lesson-grid">
      ${LESSONS.map(l => {
        const p = state.lessonProgress(l.id);
        const isDone = p.total > 0 && p.done === p.total;
        const hasBoss = state.exercises.some(e => e.lesson === l.id && e.num === 999);
        return `
        <a class="lesson-card ${isDone ? "done" : ""}" href="#lesson/${l.id}">
          <div class="lesson-id">${l.id} · ${l.week}</div>
          <div class="lesson-title">${esc(l.title)}</div>
          <div class="lesson-meta">
            <span>${p.done}/${p.total} quests</span>
            <span>${p.total > 0 ? p.pct + "%" : "none"}</span>
          </div>
          <div class="progress-bar"><div class="progress-bar-fill" style="width:${p.pct}%"></div></div>
          ${hasBoss ? '<span class="boss-flag">BOSS</span>' : ''}
        </a>`;
      }).join("")}
    </div>
  `;
}

function typeLegend(cls, emoji, name, desc) {
  const count = state.exercises.filter(e => e.type === cls).length;
  const done = state.exercises.filter(e => e.type === cls && state.isDone(e.id)).length;
  return `<div class="type-legend-item">
    <span class="type-emoji">${emoji}</span>
    <div>
      <div class="type-name">${name} · ${done}/${count}</div>
      <div class="type-desc">${desc}</div>
    </div>
  </div>`;
}

// ---------- LESSON ----------
function renderLesson(lessonId) {
  const v = document.getElementById("view-lesson");
  const lesson = LESSONS.find(l => l.id === lessonId);
  if (!lesson) { location.hash = "#dashboard"; return; }

  const exs = state.exercises.filter(e => e.lesson === lessonId && e.num !== 999);
  const boss = state.exercises.find(e => e.lesson === lessonId && e.num === 999);
  const progress = state.lessonProgress(lessonId);

  const typeGroups = {};
  for (const e of exs) {
    const t = e.type;
    if (!typeGroups[t]) typeGroups[t] = [];
    typeGroups[t].push(e);
  }
  const typeOrder = ["drill", "multi", "predict", "code", "modify", "debug", "mini", "write"];

  v.innerHTML = `
    <a href="#dashboard" class="btn-ghost" style="display:inline-block;text-decoration:none;margin-bottom:10px;">← Dashboard</a>
    <div class="arcade-banner">
      <h1>${esc(lesson.id)} · ${esc(lesson.title)}</h1>
      <p class="subtitle">${esc(lesson.week)} · ${esc(lesson.phase)}</p>
      <p class="tagline">${progress.done}/${progress.total} quests completed · ${progress.pct}%</p>
    </div>
    ${typeOrder.filter(t => typeGroups[t]).map(t => `
      <h3 style="margin-top:1.5rem;color:var(--py-gold);">${typeEmoji(t)} ${typeLabel(t)} · ${typeGroups[t].length}</h3>
      <div class="exercise-list">
        ${typeGroups[t].map(e => exerciseCard(e)).join("")}
      </div>
    `).join("")}
    ${boss ? `
    <a class="boss-card" href="#exercise/${boss.id}">
      <h3>${esc(boss.flavour || "BOSS: " + boss.name)}</h3>
      <p>${esc(boss.text)}</p>
      <span class="boss-reward">${boss.xp} XP · ${state.isDone(boss.id) ? "✓ DEFEATED" : "Click to enter arena"}</span>
    </a>` : ''}
  `;
}

function exerciseCard(e) {
  return `
  <a class="exercise-card ${state.isDone(e.id) ? "done" : ""}" href="#exercise/${e.id}">
    <div class="ex-id">${typeEmoji(e.type)} ${e.id}</div>
    <div class="ex-title">${esc(e.flavour || e.name)}</div>
    <div class="ex-meta">
      <span class="diff-badge diff-${e.difficulty}">${e.difficulty}</span>
      <span class="xp-badge">${e.xp} XP</span>
      ${state.isFlagged(e.id) ? '<span class="flag-chip">🚩 stuck</span>' : ''}
    </div>
  </a>`;
}

function typeEmoji(t) {
  return {code:"💻",drill:"⌨️",predict:"🔮",debug:"🔧",modify:"🔨",write:"✍️",multi:"✅",mini:"🎯",boss:"💥"}[t] || "❓";
}
function typeLabel(t) {
  return {code:"Code",drill:"Typing drills",predict:"Predict the output",debug:"Debug",modify:"Modify",
          write:"Writing",multi:"Quiz",mini:"Mini-game",boss:"Boss"}[t] || t;
}

// ---------- EXERCISE DETAIL ----------
function renderExercise(exId) {
  const v = document.getElementById("view-exercise");
  const ex = state.exercises.find(e => e.id === exId);
  if (!ex) { location.hash = "#dashboard"; return; }

  const done = state.isDone(exId);
  const flagged = state.isFlagged(exId);
  const hintShown = state.hintsUsed.includes(exId);
  const lesson = LESSONS.find(l => l.id === ex.lesson);
  const lessonExs = state.exercises.filter(e => e.lesson === ex.lesson);
  const idx = lessonExs.findIndex(e => e.id === exId);
  const prev = idx > 0 ? lessonExs[idx - 1] : null;
  const next = idx < lessonExs.length - 1 ? lessonExs[idx + 1] : null;

  v.innerHTML = `
    <a href="#lesson/${ex.lesson}" class="btn-ghost" style="display:inline-block;text-decoration:none;margin-bottom:10px;">← Back to ${lesson ? lesson.id : "Lesson"}</a>
    <div class="exercise-detail">
      <h1>${typeEmoji(ex.type)} Quest ${esc(ex.id)}: ${esc(ex.flavour || ex.name)}</h1>
      <div class="detail-meta">
        <span class="diff-badge diff-${ex.difficulty}">${ex.difficulty}</span>
        <span class="xp-badge">🪙 ${ex.xp} XP</span>
        <span class="diff-badge">${typeLabel(ex.type).toUpperCase()}</span>
        ${done ? '<span class="diff-badge diff-easy">✓ DEFEATED</span>' : ''}
        <button class="flag-btn ${flagged ? 'flagged' : ''}" onclick="flagQuest('${ex.id}')">${flagged ? '🚩 Flagged' : '🚩 Flag: I\'m stuck'}</button>
      </div>

      <h3>The Quest</h3>
      <div class="problem">${esc(ex.text).replace(/\n/g, '<br>')}</div>

      <div>
        <button class="btn-secondary" onclick="toggleHint('${ex.id}')" id="hint-btn">
          ${hintShown ? '🔍 Hint shown' : '💡 Reveal Hint'}
        </button>
      </div>

      <div class="hint ${hintShown ? 'visible' : ''}" id="hint-box">
        <h4>💡 Hint</h4>
        <div>${esc(ex.hint || "Check the book or hub lesson page.")}</div>
      </div>

      <div id="quest-body">
        ${renderQuestBody(ex, done)}
      </div>

      <div style="margin-top:1.5rem;display:flex;gap:10px;flex-wrap:wrap;">
        ${prev ? `<a class="btn-ghost" href="#exercise/${prev.id}">← Previous</a>` : ''}
        ${next ? `<a class="btn-secondary" href="#exercise/${next.id}">Next quest →</a>` : ''}
        <button class="btn-ghost" onclick="randomEncounter()">🎲 Random instead</button>
      </div>
    </div>
  `;

  // Attach type-specific listeners
  bindQuestHandlers(ex, done);
}

function renderQuestBody(ex, done) {
  if (ex.type === "drill") return drillBody(ex, done);
  if (ex.type === "predict") return predictBody(ex, done);
  if (ex.type === "debug") return debugBody(ex, done);
  if (ex.type === "modify") return modifyBody(ex, done);
  if (ex.type === "write") return writeBody(ex, done);
  if (ex.type === "multi") return multiBody(ex, done);
  if (ex.type === "mini" || ex.type === "code" || ex.type === "boss") return codeBody(ex, done);
  return codeBody(ex, done);
}

// ---------- DRILL: retype exact code ----------
function drillBody(ex, done) {
  return `
    <h3>Copy this code EXACTLY:</h3>
    <pre><code>${esc(ex.drill_code || "")}</code></pre>
    <h3>Your typing:</h3>
    <div class="code-area">
      <textarea id="drill-input-${ex.id}" placeholder="Type the code above — spaces + newlines must match">${esc(state.getWriting(ex.id))}</textarea>
      <div class="code-area-actions">
        <button class="btn-primary" onclick="checkDrill('${ex.id}')">✅ Check my typing</button>
        <button class="btn-secondary" onclick="copyDrillTarget('${ex.id}')">📋 Copy the target (give up)</button>
      </div>
      <div id="drill-feedback-${ex.id}" class="drill-feedback"></div>
    </div>
  `;
}

function checkDrill(exId) {
  const ex = state.exercises.find(e => e.id === exId);
  const input = document.getElementById(`drill-input-${exId}`).value;
  state.saveWriting(exId, input);
  const norm = (s) => s.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").replace(/\n+$/, "").trim();
  const got = norm(input);
  const want = norm(ex.drill_code || "");
  const fb = document.getElementById(`drill-feedback-${exId}`);
  if (got === want) {
    fb.innerHTML = `<div class="feedback-ok">✅ Perfect typing! Quest defeated.</div>`;
    if (!state.isDone(exId)) completeWithBurst(exId, {typed: input});
  } else {
    const diffLine = firstDiffLine(got, want);
    fb.innerHTML = `<div class="feedback-no">❌ Not quite. Check line ${diffLine + 1}. Spaces, quotes, and capitalisation all matter.</div>`;
  }
}
function firstDiffLine(a, b) {
  const la = a.split("\n"), lb = b.split("\n");
  for (let i = 0; i < Math.max(la.length, lb.length); i++) {
    if ((la[i] || "") !== (lb[i] || "")) return i;
  }
  return 0;
}
window.checkDrill = checkDrill;
window.copyDrillTarget = function(exId) {
  const ex = state.exercises.find(e => e.id === exId);
  document.getElementById(`drill-input-${exId}`).value = ex.drill_code || "";
  state.saveWriting(exId, ex.drill_code || "");
};

// ---------- PREDICT: choose output + explain why ----------
function predictBody(ex, done) {
  const choices = ex.choices || [];
  return `
    <h3>Read the code:</h3>
    <pre><code>${esc(ex.predict_code || "")}</code></pre>
    <h3>What will print?</h3>
    <div class="choices">
      ${choices.map((c, i) => `
        <label class="choice">
          <input type="radio" name="predict-${ex.id}" value="${i}"> <code>${esc(c)}</code>
        </label>`).join("")}
    </div>
    <h3>Explain WHY (one sentence — can't skip this):</h3>
    <textarea id="predict-why-${ex.id}" class="small-text" placeholder="In your own words, why does that happen?">${esc(state.getWriting(ex.id))}</textarea>
    <div class="code-area-actions">
      <button class="btn-primary" onclick="submitPredict('${ex.id}')">Submit prediction</button>
    </div>
    <div id="predict-feedback-${ex.id}" class="drill-feedback"></div>
  `;
}

function submitPredict(exId) {
  const ex = state.exercises.find(e => e.id === exId);
  const chosen = document.querySelector(`input[name=predict-${exId}]:checked`);
  const why = document.getElementById(`predict-why-${exId}`).value.trim();
  const fb = document.getElementById(`predict-feedback-${exId}`);
  if (!chosen) { fb.innerHTML = `<div class="feedback-no">Pick an answer first.</div>`; return; }
  if (why.length < 15) { fb.innerHTML = `<div class="feedback-no">Write at least 15 chars for your reason (this is the learning part).</div>`; return; }
  state.saveWriting(exId, why);
  const correct = parseInt(chosen.value) === ex.correct_index;
  if (correct) {
    fb.innerHTML = `<div class="feedback-ok">✅ Correct! ${esc(ex.explanation || "")}</div>`;
    if (!state.isDone(exId)) completeWithBurst(exId, {choice: parseInt(chosen.value), why, correct: true});
  } else {
    fb.innerHTML = `<div class="feedback-no">❌ Not quite. Correct answer: <code>${esc(ex.choices[ex.correct_index])}</code>. ${esc(ex.explanation || "")}</div>
      <p class="callout-note" style="margin-top:0.5rem;">Once you've read why, tick Mark complete anyway to earn partial XP — you learned something.</p>
      <button class="btn-secondary" onclick="completePredictAnyway('${exId}', ${parseInt(chosen.value)})">Mark complete anyway (partial XP)</button>`;
  }
}
window.submitPredict = submitPredict;
window.completePredictAnyway = function(exId, choice) {
  if (!state.isDone(exId)) {
    const ex = state.exercises.find(e => e.id === exId);
    completeWithBurst(exId, {choice, why: state.getWriting(exId), correct: false}, Math.floor(ex.xp / 2));
  }
};

// ---------- DEBUG: fix + explain ----------
function debugBody(ex, done) {
  return `
    <h3>Broken code:</h3>
    <pre><code>${esc(ex.debug_code || "")}</code></pre>
    <h3>Goal:</h3>
    <div class="problem">${esc(ex.goal || "")}</div>
    <h3>Your fixed code:</h3>
    <textarea id="debug-code-${ex.id}" placeholder="Paste the FIXED version here">${esc(state.getWriting(ex.id + "_code"))}</textarea>
    <h3>In your own words: what was the bug? (min 30 chars)</h3>
    <textarea id="debug-why-${ex.id}" class="small-text" placeholder="e.g. 'The if statement used = instead of ==, which tries to ASSIGN rather than COMPARE.'">${esc(state.getWriting(ex.id + "_why"))}</textarea>
    <div class="code-area-actions">
      <button class="btn-primary" onclick="submitDebug('${ex.id}')">Submit fix</button>
    </div>
    <div id="debug-feedback-${ex.id}" class="drill-feedback"></div>
  `;
}
function submitDebug(exId) {
  const code = document.getElementById(`debug-code-${exId}`).value.trim();
  const why = document.getElementById(`debug-why-${exId}`).value.trim();
  const fb = document.getElementById(`debug-feedback-${exId}`);
  if (code.length < 10) { fb.innerHTML = `<div class="feedback-no">Paste your fixed code (at least 10 chars).</div>`; return; }
  if (why.length < 30) { fb.innerHTML = `<div class="feedback-no">Explain the bug in at least 30 chars. This is the point.</div>`; return; }
  state.saveWriting(exId + "_code", code);
  state.saveWriting(exId + "_why", why);
  if (!state.isDone(exId)) completeWithBurst(exId, {fixed_code: code, explanation: why});
  fb.innerHTML = `<div class="feedback-ok">✅ Submitted. Teacher will review your explanation. (If the bug description looks AI-generated, expect a 1:1 chat.)</div>`;
}
window.submitDebug = submitDebug;

// ---------- MODIFY: change existing code ----------
function modifyBody(ex, done) {
  return `
    <h3>Starting code:</h3>
    <pre><code>${esc(ex.starter_code || "")}</code></pre>
    <h3>Your task:</h3>
    <div class="problem">${esc(ex.instruction || ex.text)}</div>
    <h3>Your modified code:</h3>
    <textarea id="mod-code-${ex.id}" placeholder="Paste your modified version">${esc(state.getWriting(ex.id + "_code"))}</textarea>
    <h3>What did you change? (one sentence)</h3>
    <textarea id="mod-why-${ex.id}" class="small-text" placeholder="e.g. 'I changed fruits[0] to fruits[-1] to get the last item.'">${esc(state.getWriting(ex.id + "_why"))}</textarea>
    <div class="code-area-actions">
      <button class="btn-primary" onclick="submitModify('${ex.id}')">Submit modification</button>
    </div>
    <div id="mod-feedback-${ex.id}" class="drill-feedback"></div>
  `;
}
function submitModify(exId) {
  const code = document.getElementById(`mod-code-${exId}`).value.trim();
  const why = document.getElementById(`mod-why-${exId}`).value.trim();
  const fb = document.getElementById(`mod-feedback-${exId}`);
  if (code.length < 10) { fb.innerHTML = `<div class="feedback-no">Paste your modified code.</div>`; return; }
  if (why.length < 15) { fb.innerHTML = `<div class="feedback-no">Describe your change in at least 15 chars.</div>`; return; }
  state.saveWriting(exId + "_code", code);
  state.saveWriting(exId + "_why", why);
  if (!state.isDone(exId)) completeWithBurst(exId, {modified: code, change: why});
  fb.innerHTML = `<div class="feedback-ok">✅ Submitted.</div>`;
}
window.submitModify = submitModify;

// ---------- WRITE: prose reflection ----------
function writeBody(ex, done) {
  const minChars = ex.min_chars || 200;
  const saved = state.getWriting(ex.id);
  return `
    <h3>Your task:</h3>
    <div class="problem">${esc(ex.text)}</div>
    <h3>Your response (minimum ${minChars} characters):</h3>
    <textarea id="write-text-${ex.id}" class="long-text" oninput="updateWriteCount('${ex.id}', ${minChars})" placeholder="Your own words — AI-written answers are easy to spot because they're generic.">${esc(saved)}</textarea>
    <div id="write-count-${ex.id}" class="char-count">${saved.length} / ${minChars} characters</div>
    <div class="code-area-actions">
      <button class="btn-primary" onclick="submitWrite('${ex.id}', ${minChars})">Submit reflection</button>
    </div>
    <div id="write-feedback-${ex.id}" class="drill-feedback"></div>
  `;
}
window.updateWriteCount = function(exId, minChars) {
  const text = document.getElementById(`write-text-${exId}`).value;
  const el = document.getElementById(`write-count-${exId}`);
  el.textContent = `${text.length} / ${minChars} characters`;
  el.style.color = text.length >= minChars ? "var(--green)" : "var(--text-muted)";
  state.saveWriting(exId, text);
};
function submitWrite(exId, minChars) {
  const text = document.getElementById(`write-text-${exId}`).value.trim();
  const fb = document.getElementById(`write-feedback-${exId}`);
  if (text.length < minChars) {
    fb.innerHTML = `<div class="feedback-no">You've written ${text.length} chars. Need ${minChars}. Keep going.</div>`;
    return;
  }
  state.saveWriting(exId, text);
  if (!state.isDone(exId)) completeWithBurst(exId, {writing: text, length: text.length});
  fb.innerHTML = `<div class="feedback-ok">✅ Submitted. Your words go to Ms Gao via the progress tracker.</div>`;
}
window.submitWrite = submitWrite;

// ---------- MULTI: multiple choice ----------
function multiBody(ex, done) {
  const choices = ex.choices || [];
  return `
    <h3>${esc(ex.text)}</h3>
    <div class="choices">
      ${choices.map((c, i) => `<label class="choice"><input type="radio" name="multi-${ex.id}" value="${i}"> ${esc(c)}</label>`).join("")}
    </div>
    <div class="code-area-actions">
      <button class="btn-primary" onclick="submitMulti('${ex.id}')">Check answer</button>
    </div>
    <div id="multi-feedback-${ex.id}" class="drill-feedback"></div>
  `;
}
function submitMulti(exId) {
  const ex = state.exercises.find(e => e.id === exId);
  const chosen = document.querySelector(`input[name=multi-${exId}]:checked`);
  const fb = document.getElementById(`multi-feedback-${exId}`);
  if (!chosen) { fb.innerHTML = `<div class="feedback-no">Pick an answer first.</div>`; return; }
  const correct = parseInt(chosen.value) === ex.correct_index;
  if (correct) {
    fb.innerHTML = `<div class="feedback-ok">✅ Correct!</div>`;
    if (!state.isDone(exId)) completeWithBurst(exId, {choice: parseInt(chosen.value)});
  } else {
    fb.innerHTML = `<div class="feedback-no">❌ Wrong. Correct answer: <code>${esc(ex.choices[ex.correct_index])}</code>. Try again after reading the hint.</div>`;
  }
}
window.submitMulti = submitMulti;

// ---------- CODE / MINI / BOSS ----------
function codeBody(ex, done) {
  return `
    <h3>Your workbench</h3>
    <div class="code-area">
      <textarea id="code-${ex.id}" placeholder="# write your code here (copy to VS Code to run)
# saves locally as you type">${esc(state.getWriting(ex.id))}</textarea>
      <div class="code-area-actions">
        <button class="btn-secondary" onclick="copyCode('${ex.id}')">📋 Copy to clipboard</button>
        <button class="btn-secondary" onclick="openVSCode('${ex.id}')">💻 How to run in VS Code</button>
      </div>
    </div>
    <div style="margin-top:1rem;">
      ${done ? `<button class="btn-ghost" onclick="undoComplete('${ex.id}')">↺ Unmark (try again)</button>` :
        `<button class="btn-primary" onclick="completeCode('${ex.id}')">✅ Mark as defeated! +${ex.xp} XP</button>`}
    </div>
  `;
}
function completeCode(exId) {
  const code = document.getElementById(`code-${exId}`).value;
  state.saveWriting(exId, code);
  completeWithBurst(exId, {code_length: code.length});
}
window.completeCode = completeCode;
window.copyCode = function(exId) {
  const code = document.getElementById(`code-${exId}`).value;
  if (!code) return alert("Nothing to copy yet.");
  navigator.clipboard.writeText(code).then(() => alert("Copied. Paste into VS Code."));
};
window.openVSCode = function(exId) {
  alert("1. Open VS Code\n2. New file (Ctrl+N)\n3. Save as " + exId + ".py\n4. Paste (Ctrl+V)\n5. Press F5 to run");
};

function bindQuestHandlers(ex, done) {
  // Attach save-on-input for code/modify/debug/write boxes
  const ids = [`code-${ex.id}`, `drill-input-${ex.id}`, `mod-code-${ex.id}`,
               `mod-why-${ex.id}`, `debug-code-${ex.id}`, `debug-why-${ex.id}`];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => state.saveWriting(id.replace(/^[a-z]+-/, "").split("-").slice(0, -1).join("-") || ex.id, el.value));
  });
}

// ---------- SHARED ----------
function completeWithBurst(exId, payload, xpOverride) {
  const ex = state.exercises.find(e => e.id === exId);
  const xp = xpOverride || ex.xp;
  state.markComplete(exId, xp, payload);
  const burst = document.getElementById("xp-burst");
  burst.hidden = false; burst.textContent = `+${xp} XP!`;
  setTimeout(() => burst.hidden = true, 1200);
  setTimeout(() => renderExercise(exId), 250);
}
function undoComplete(exId) {
  state.completed = state.completed.filter(c => c.id !== exId);
  state.save(); renderExercise(exId);
}
window.undoComplete = undoComplete;

function toggleHint(exId) {
  state.markHintUsed(exId);
  const box = document.getElementById("hint-box");
  if (box) box.classList.add("visible");
  const btn = document.getElementById("hint-btn");
  if (btn) btn.textContent = "🔍 Hint shown";
}
window.toggleHint = toggleHint;

function flagQuest(exId) {
  const ex = state.exercises.find(e => e.id === exId);
  const wasFlagged = state.isFlagged(exId);
  state.toggleFlag(exId);
  postToBackend(exId, 0, { flagged: !wasFlagged });
  renderExercise(exId);

  // Only prompt when NEWLY flagging (not un-flagging)
  if (!wasFlagged) {
    const lesson = LESSONS.find(l => l.id === ex.lesson);
    const lessonTitle = lesson ? lesson.title : ex.lesson;
    const msg = "🚩 Stuck on Quest " + exId + " — " + (ex.flavour || ex.name) +
                " (Lesson " + ex.lesson + ": " + lessonTitle + "). " +
                "What I tried: [write what you tried, 1 sentence]. " +
                "Where I'm stuck: [what's confusing]";
    // Try to copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg).then(() => {
        alert(`✅ Flagged! To get help:

1. Open Google Classroom.
2. Find today's lesson assignment.
3. Click 'Add private comment' or 'Class comments'.
4. Paste (Ctrl+V) — your message is already on your clipboard.
5. Fill in the two [...] parts so I know what you tried.

I check Classroom every break and lunch. I'll get to you.`);
      }).catch(() => {
        prompt("Copy this message and paste into Google Classroom:", msg);
      });
    } else {
      prompt("Copy this message and paste into Google Classroom:", msg);
    }
  }
}
window.flagQuest = flagQuest;

function randomEncounter() {
  const pending = state.exercises.filter(e => !state.isDone(e.id));
  if (!pending.length) { alert("You've defeated everything, champion! 🏆"); return; }
  location.hash = `#exercise/${pending[Math.floor(Math.random() * pending.length)].id}`;
}
window.randomEncounter = randomEncounter;

function changeStudent() {
  const fn = prompt("First name:", state.firstName);
  if (!fn) return;
  const ln = prompt("Last name:", state.lastName);
  const cc = prompt("Class code (e.g. 9GAMZA):", state.classCode) || "9GAMZA";
  state.firstName = fn.trim().slice(0, 32);
  state.lastName = (ln || "").trim().slice(0, 32);
  state.classCode = cc.trim().slice(0, 16);
  state.save(); renderDashboard();
}
window.changeStudent = changeStudent;

// ---------- EXPORT ----------
function exportProgress() {
  const now = new Date();

  // Build a human-readable TXT summary for easy Classroom upload
  const lines = [];
  lines.push("=== WEEKLY PROGRESS REPORT ===");
  lines.push(`Student: ${state.studentName}   Class: ${state.classCode}`);
  lines.push(`Exported: ${now.toLocaleString()}`);
  lines.push("");
  lines.push(`Level: ${state.level()}   Total XP: ${state.totalXP()}`);
  lines.push(`Quests defeated: ${state.completed.length} / ${state.exercises.length}`);
  lines.push(`Current streak: ${state.streak} days`);
  lines.push(`Badges earned: ${state.earnedBadges().length} / ${BADGES.length}`);
  lines.push("");

  // Group completions by lesson
  const byLesson = {};
  for (const c of state.completed) {
    const ex = state.exercises.find(e => e.id === c.id);
    const lesson = ex ? ex.lesson : "?";
    if (!byLesson[lesson]) byLesson[lesson] = [];
    byLesson[lesson].push({ id: c.id, ts: c.ts, xp: c.xp, name: ex ? ex.flavour || ex.name : c.id, type: ex ? ex.type : "?" });
  }
  const sortedLessons = Object.keys(byLesson).sort();
  if (sortedLessons.length) {
    lines.push("=== Quests by lesson ===");
    for (const lesson of sortedLessons) {
      lines.push(`
[${lesson}] ${byLesson[lesson].length} quests`);
      for (const q of byLesson[lesson]) {
        const date = new Date(q.ts).toLocaleDateString();
        lines.push(`  ${q.id} [${q.type}] ${q.name} +${q.xp} XP  (${date})`);
      }
    }
    lines.push("");
  }

  // Flagged stuck quests
  if (state.flagged.length) {
    lines.push("=== I need help with ===");
    for (const id of state.flagged) {
      const ex = state.exercises.find(e => e.id === id);
      lines.push(`  🚩 ${id} — ${ex ? ex.flavour || ex.name : id} (Lesson ${ex ? ex.lesson : "?"})`);
    }
    lines.push("");
  }

  // Writing submissions — include anything students wrote (predict explanations, debug reasoning, reflections)
  const writingKeys = Object.keys(state.writings).filter(k => state.writings[k] && state.writings[k].length > 30);
  if (writingKeys.length) {
    lines.push("=== My written work this week ===");
    for (const k of writingKeys) {
      const text = state.writings[k];
      lines.push(`
[Quest ${k}]`);
      lines.push(text.length > 500 ? text.slice(0, 500) + "…" : text);
    }
    lines.push("");
  }

  // Badges earned
  if (state.earnedBadges().length) {
    lines.push("=== Badges earned ===");
    state.earnedBadges().forEach(b => {
      lines.push(`  ${b.emoji} ${b.name}`);
    });
    lines.push("");
  }

  lines.push("=== How to submit ===");
  lines.push("1. Open Google Classroom → today's 'Weekly Progress' assignment");
  lines.push("2. Attach this .txt file");
  lines.push("3. Click 'Mark as done'");
  lines.push("");
  lines.push("Ms Gao reviews these every Friday to see who needs help.");

  const txt = lines.join("\n");
  const safe = state.studentName.replace(/\s+/g, "_") || "student";
  const date = now.toISOString().slice(0, 10);

  // Download the TXT file
  const blob = new Blob([txt], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `progress_${safe}_${date}.txt`;
  a.click();
  URL.revokeObjectURL(url);

  // Show the Classroom-submit reminder
  setTimeout(() => {
    alert(`✅ Downloaded!

Next step:
1. Open Google Classroom.
2. Find 'Weekly Progress' assignment.
3. Attach the .txt file I just downloaded.
4. Click 'Mark as done'.

Ms Gao will check it over the weekend.`);
  }, 300);
}
window.exportProgress = exportProgress;

// ---------- HALL OF FAME ----------
function renderHallFame() {
  const v = document.getElementById("view-hallfame");
  const board = JSON.parse(localStorage.getItem(ALL_LEADERBOARD_KEY) || "{}");
  const entries = Object.entries(board).map(([name, d]) => ({name, ...d})).sort((a, b) => b.xp - a.xp);
  v.innerHTML = `
    <a href="#dashboard" class="btn-ghost" style="display:inline-block;text-decoration:none;margin-bottom:10px;">← Back</a>
    <div class="arcade-banner">
      <h1>🏆 HALL OF FAME</h1>
      <p class="subtitle">Top legends on this laptop</p>
    </div>
    ${entries.length === 0 ? '<p>No entries yet.</p>' : `
    <div class="leaderboard"><table>
      <thead><tr><th>Rank</th><th>Hero</th><th>Level</th><th>XP</th><th>Quests</th><th>Badges</th></tr></thead>
      <tbody>${entries.slice(0, 20).map((e, i) => `
        <tr><td class="rank-col">#${i+1}</td><td><strong>${esc(e.name)}</strong></td>
        <td>${e.level}</td><td>${e.xp}</td><td>${e.count}</td><td>${e.badges}</td></tr>`).join("")}
      </tbody></table></div>`}
    <div style="margin-top:1.5rem;">
      <button class="btn-ghost" onclick="clearLeaderboard()">🗑 Clear leaderboard (teacher only)</button>
    </div>
  `;
}
window.clearLeaderboard = function() {
  if (confirm("Clear the leaderboard on this laptop?")) {
    localStorage.removeItem(ALL_LEADERBOARD_KEY); renderHallFame();
  }
};

// ---------- ERRORS ----------
function renderErrors() {
  const v = document.getElementById("view-errors");
  v.innerHTML = `
    <a href="#dashboard" class="btn-ghost" style="display:inline-block;text-decoration:none;margin-bottom:10px;">← Back</a>
    <div class="arcade-banner">
      <h1>📖 ERROR BESTIARY</h1>
      <p class="subtitle">Know your enemies · every monster has a weakness</p>
    </div>
    <div class="error-grid">
      ${ERRORS.map(e => `
        <div class="error-card">
          <h4>${esc(e.monster)}</h4>
          <pre><code>${esc(e.code)}</code></pre>
          <p><strong>Why it attacks:</strong> ${esc(e.cause)}</p>
          <p class="fix"><strong>How to defeat:</strong> ${esc(e.fix)}</p>
        </div>`).join("")}
    </div>
  `;
}

// ---------- SETTINGS ----------
function renderSettings() {
  const v = document.getElementById("view-settings");
  v.innerHTML = `
    <a href="#dashboard" class="btn-ghost" style="display:inline-block;text-decoration:none;margin-bottom:10px;">← Dashboard</a>
    <div class="arcade-banner">
      <h1>⚙️ Settings</h1>
      <p class="subtitle">Student account + teacher backend</p>
    </div>
    <h2>Your details</h2>
    <div class="settings-card">
      <label>First name: <input id="s-fn" value="${esc(state.firstName)}"></label>
      <label>Last name: <input id="s-ln" value="${esc(state.lastName)}"></label>
      <label>Class code: <input id="s-cc" value="${esc(state.classCode)}"></label>
    </div>

    <h2>Teacher: Progress tracker URL</h2>
    <div class="settings-card">
      <p>Paste the Google Apps Script Web App URL from your teacher setup. Leave blank to disable cloud sync.</p>
      <label>Backend URL:
        <input id="s-url" value="${esc(state.backendUrl)}" style="width:100%;" placeholder="https://script.google.com/macros/s/AK.../exec">
      </label>
      <div style="margin-top:10px;display:flex;gap:10px;">
        <button class="btn-primary" onclick="saveSettings()">Save</button>
        <button class="btn-secondary" onclick="testBackend()">Test backend</button>
      </div>
      <div id="backend-status" class="drill-feedback"></div>
    </div>

    <h2>Danger zone</h2>
    <div class="settings-card">
      <button class="btn-danger" onclick="wipeProgress()">🗑 Wipe my progress</button>
      <p class="callout-note">Deletes all local XP, completions, writings. Cannot be undone. Teacher's backend copy is NOT affected.</p>
    </div>
  `;
}
window.saveSettings = function() {
  state.firstName = document.getElementById("s-fn").value.trim().slice(0, 32);
  state.lastName = document.getElementById("s-ln").value.trim().slice(0, 32);
  state.classCode = document.getElementById("s-cc").value.trim().slice(0, 16);
  state.backendUrl = document.getElementById("s-url").value.trim();
  state.save(); state.saveSettings();
  document.getElementById("backend-status").innerHTML = `<div class="feedback-ok">✅ Saved.</div>`;
};
window.testBackend = async function() {
  const url = document.getElementById("s-url").value.trim();
  const status = document.getElementById("backend-status");
  if (!url) { status.innerHTML = `<div class="feedback-no">No URL set.</div>`; return; }
  status.innerHTML = `Testing…`;
  try {
    const r = await fetch(url, { method: "GET" });
    if (r.ok) { status.innerHTML = `<div class="feedback-ok">✅ Reachable (HTTP 200). Try completing a quest to confirm writes.</div>`; }
    else { status.innerHTML = `<div class="feedback-no">HTTP ${r.status}. Check the URL ends in /exec and the deployment is set to "Anyone".</div>`; }
  } catch (e) {
    status.innerHTML = `<div class="feedback-no">Network error. URL may be wrong, or CORS blocked. Try /test in Apps Script.</div>`;
  }
};
window.wipeProgress = function() {
  if (!confirm("Wipe ALL your local progress? This cannot be undone.")) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
};

// ---------- BOOT ----------
async function boot() {
  try {
    const res = await fetch("exercises.json?v=" + Date.now());
    state.exercises = await res.json();
  } catch (e) {
    document.body.innerHTML = `<h1 style='padding:2rem;color:red;'>Failed to load exercises.json</h1><pre>${e}</pre>`;
    return;
  }

  if (!state.firstName) {
    const modal = document.getElementById("nickname-modal");
    modal.hidden = false;
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Welcome to the Arcade, hero!</h2>
        <p>So Ms Gao can track your progress, please enter your real name + class code.</p>
        <label style="display:block;text-align:left;font-size:0.85rem;color:var(--text-muted);">First name</label>
        <input type="text" id="fn-input" maxlength="32" placeholder="e.g. Aarush">
        <label style="display:block;text-align:left;font-size:0.85rem;color:var(--text-muted);margin-top:6px;">Last name</label>
        <input type="text" id="ln-input" maxlength="32" placeholder="e.g. Sharma">
        <label style="display:block;text-align:left;font-size:0.85rem;color:var(--text-muted);margin-top:6px;">Class code</label>
        <input type="text" id="cc-input" maxlength="16" value="9GAMZA">
        <button id="save-btn" class="btn-primary" style="margin-top:12px;">Enter the gauntlet →</button>
        <p class="callout-note" style="margin-top:12px;">You can change these any time from the ⚙️ Settings page.</p>
      </div>
    `;
    document.getElementById("save-btn").addEventListener("click", () => {
      const fn = document.getElementById("fn-input").value.trim();
      if (!fn) return alert("First name required.");
      state.firstName = fn.slice(0, 32);
      state.lastName = document.getElementById("ln-input").value.trim().slice(0, 32);
      state.classCode = document.getElementById("cc-input").value.trim().slice(0, 16) || "9GAMZA";
      state.save();
      modal.hidden = true;
      route();
    });
    document.getElementById("fn-input").focus();
  }

  route();
}

boot();
