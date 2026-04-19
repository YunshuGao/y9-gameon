/* Python Arcade — The Gauntlet
 * Core SPA for Y9 Game On Term 2 exercise system.
 * All progress in localStorage. No backend. No PII.
 */

const STORAGE_KEY = "py_arcade_v1";
const ALL_LEADERBOARD_KEY = "py_arcade_leaderboard_v1";

// ---------- LESSON METADATA (mirrors lesson_data.py) ----------
const LESSONS = [
  { id: "L01", week: "Week 1", title: "Hello Python — setting up your editor", phase: "Python Foundations" },
  { id: "L02", week: "Week 1", title: "Variables and Strings", phase: "Python Foundations" },
  { id: "L03", week: "Week 2", title: "Numbers and Maths", phase: "Python Foundations" },
  { id: "L04", week: "Week 2", title: "Lists — storing many things in order", phase: "Python Foundations" },
  { id: "L05", week: "Week 3", title: "Loops — making Python repeat itself", phase: "Python Foundations" },
  { id: "L06", week: "Week 3", title: "If statements — making decisions", phase: "Python Foundations" },
  { id: "L07", week: "Week 4", title: "User input and while loops", phase: "Python Foundations" },
  { id: "L08", week: "Week 4", title: "Functions — reusable code blocks", phase: "Python Foundations" },
  { id: "L09", week: "Week 5", title: "Classes — building your own objects", phase: "Python Foundations" },
  { id: "L10", week: "Week 5", title: "Checkpoint 1 — Text Adventure submission", phase: "Python Foundations" },
  { id: "L11", week: "Week 6", title: "Installing Pygame + first window", phase: "Pygame Foundations" },
  { id: "L12", week: "Week 6", title: "Drawing and moving your ship", phase: "Pygame Foundations" },
  { id: "L13", week: "Week 7", title: "Firing bullets", phase: "Pygame Foundations" },
  { id: "L14", week: "Week 7", title: "Aliens appear!", phase: "Pygame Foundations" },
  { id: "L15", week: "Week 8", title: "The alien fleet", phase: "Alien Invasion Mechanics" },
  { id: "L16", week: "Week 8", title: "Alien movement", phase: "Alien Invasion Mechanics" },
  { id: "L17", week: "Week 9", title: "Shooting aliens — collisions", phase: "Alien Invasion Mechanics" },
  { id: "L18", week: "Week 9", title: "Ship hits and game over", phase: "Alien Invasion Mechanics" },
  { id: "L19", week: "Week 10", title: "Scoring + play button", phase: "Polish" },
  { id: "L20", week: "Week 10", title: "YOUR TWIST — original feature", phase: "Polish" },
  { id: "L21", week: "Week 11", title: "Playtest Day", phase: "Showcase" },
  { id: "L22", week: "Week 11", title: "Showcase + evaluation", phase: "Showcase" },
  { id: "EXT", week: "Bonus", title: "Extension Arena (Ch 6 Dicts + Ch 10 Files)", phase: "Bonus" },
];

// ---------- BADGES ----------
const BADGES = [
  { id: "first-steps",  emoji: "🐣", name: "First Steps", test: (s) => s.completed.length >= 1 },
  { id: "on-fire",      emoji: "🔥", name: "On Fire",     test: (s) => s.todayCount() >= 5 },
  { id: "bookworm",     emoji: "📚", name: "Bookworm",    test: (s) => s.chapterDone(2) },
  { id: "collector",    emoji: "🧰", name: "List Collector", test: (s) => s.chapterDone(3) },
  { id: "loop-master",  emoji: "🔁", name: "Loop Master", test: (s) => s.chapterDone(4) },
  { id: "detective",    emoji: "🔍", name: "Conditional Detective", test: (s) => s.chapterDone(5) },
  { id: "interview-pro", emoji: "🗣️", name: "Input Pro",  test: (s) => s.chapterDone(7) },
  { id: "function-forge", emoji: "⚙️", name: "Function Forger", test: (s) => s.chapterDone(8) },
  { id: "class-act",    emoji: "🎩", name: "Class Act",   test: (s) => s.chapterDone(9) },
  { id: "boss-slayer",  emoji: "💥", name: "Boss Slayer", test: (s) => s.bossesDefeated() >= 3 },
  { id: "epic-slayer",  emoji: "👑", name: "Epic Slayer", test: (s) => s.bossesDefeated() >= 7 },
  { id: "pygame-pro",   emoji: "🕹️", name: "Pygame Pro",  test: (s) => [12,13,14].every(c => s.chapterDone(c)) },
  { id: "speedrunner",  emoji: "⚡", name: "Speedrunner", test: (s) => s.fastestStreak() >= 3 },
  { id: "streak-3",     emoji: "📅", name: "3-Day Streak", test: (s) => s.streak >= 3 },
  { id: "champion",     emoji: "🏆", name: "Arcade Champion", test: (s) => s.completed.length >= 100 },
];

// ---------- COMMON PYTHON ERRORS (Error Dictionary) ----------
const ERRORS = [
  { name: "NameError",  monster: "NameError Goblin",
    code: "NameError: name 'x' is not defined",
    cause: "You used a variable before defining it, or typed the name wrong.",
    fix: "Define the variable first (x = 5) OR check your spelling (Python is case-sensitive). Remember: print(name) uses the variable called name, but print(\"name\") prints the word."},
  { name: "IndentationError", monster: "Indentation Ogre",
    code: "IndentationError: expected an indented block",
    cause: "Python uses indentation to group code. After : (colon), the next line MUST be indented by 4 spaces.",
    fix: "Indent the line after if/else/for/while/def with 4 spaces. Make sure you use spaces consistently (not a mix of tabs and spaces)."},
  { name: "SyntaxError", monster: "Syntax Serpent",
    code: "SyntaxError: invalid syntax",
    cause: "Typo. Missing colon after if/for/def. Missing closing quote/paren/bracket.",
    fix: "Look at the line Python points to. Then look at the line ABOVE it. Common fixes: add a : at the end of if/for/def, close all ( ), close all quotes."},
  { name: "TypeError", monster: "Type Troll",
    code: "TypeError: unsupported operand type(s) for +: 'int' and 'str'",
    cause: "You're mixing types that don't go together (e.g. adding a number to a string).",
    fix: "Convert with int() or str(). Classic example: age + 5 fails if age came from input(). Fix: int(age) + 5."},
  { name: "IndexError", monster: "Index Imp",
    code: "IndexError: list index out of range",
    cause: "You tried to access list item number 5 but the list only has 3 items.",
    fix: "Use len(list) to check size. Remember: if len is 3, valid indexes are 0, 1, 2 (not 3)."},
  { name: "KeyError", monster: "Key Kraken",
    code: "KeyError: 'banana'",
    cause: "You tried to access a dictionary key that doesn't exist.",
    fix: "Check the key exists first with if 'banana' in my_dict. Or use my_dict.get('banana', 'default')."},
  { name: "AttributeError", monster: "Attribute Arachnid",
    code: "AttributeError: 'str' object has no attribute 'length'",
    cause: "You called a method that doesn't exist on this type.",
    fix: "Python uses len(s), not s.length(). Check spelling. str has .upper() .lower(), lists have .append(), etc."},
  { name: "ValueError", monster: "Value Voidling",
    code: "ValueError: invalid literal for int() with base 10: 'hello'",
    cause: "You tried to convert a value that doesn't fit — usually int('hello').",
    fix: "Only convert to int if the string is actually a number. Use try/except or validate input first."},
  { name: "ZeroDivisionError", monster: "Zero Zombie",
    code: "ZeroDivisionError: division by zero",
    cause: "You divided by zero.",
    fix: "Check your divisor isn't 0 before dividing. if b != 0: result = a / b"},
  { name: "FileNotFoundError", monster: "File Phantom",
    code: "FileNotFoundError: [Errno 2] No such file or directory: 'notes.txt'",
    cause: "The file you're trying to open doesn't exist at that path.",
    fix: "Check your working directory. Use the full path or put the file next to your .py script."},
  { name: "ModuleNotFoundError", monster: "Module Mimic",
    code: "ModuleNotFoundError: No module named 'pygame'",
    cause: "The library isn't installed.",
    fix: "Run: pip install pygame  (in terminal, not in Python). Check pip is working: pip --version."},
  { name: "UnboundLocalError", monster: "Scope Spectre",
    code: "UnboundLocalError: local variable 'x' referenced before assignment",
    cause: "You're trying to use a variable inside a function before setting it (often in an if-branch that didn't run).",
    fix: "Initialise the variable at the top of the function. x = 0 before the if-statement."},
];

// ---------- STATE ----------
class State {
  constructor() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const d = raw ? JSON.parse(raw) : {};
    this.nickname = d.nickname || "";
    this.completed = d.completed || []; // array of {id, ts}
    this.hintsUsed = d.hintsUsed || [];
    this.lastActive = d.lastActive || null;
    this.streak = d.streak || 0;
    this.exercises = [];  // filled by loader
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      nickname: this.nickname,
      completed: this.completed,
      hintsUsed: this.hintsUsed,
      lastActive: this.lastActive,
      streak: this.streak,
    }));
    this.updateLeaderboard();
  }

  updateLeaderboard() {
    if (!this.nickname) return;
    const board = JSON.parse(localStorage.getItem(ALL_LEADERBOARD_KEY) || "{}");
    board[this.nickname] = {
      xp: this.totalXP(),
      count: this.completed.length,
      level: this.level(),
      badges: this.earnedBadges().length,
      lastActive: new Date().toISOString(),
    };
    localStorage.setItem(ALL_LEADERBOARD_KEY, JSON.stringify(board));
  }

  totalXP() {
    return this.completed.reduce((sum, c) => {
      const ex = this.exercises.find(e => e.id === c.id);
      return sum + (ex ? ex.xp : 10);
    }, 0);
  }

  level() { return Math.floor(this.totalXP() / 150) + 1; }
  xpIntoLevel() { return this.totalXP() % 150; }
  xpToNextLevel() { return 150 - this.xpIntoLevel(); }

  isDone(exId) { return this.completed.some(c => c.id === exId); }

  todayCount() {
    const today = new Date().toDateString();
    return this.completed.filter(c => new Date(c.ts).toDateString() === today).length;
  }

  chapterDone(ch) {
    const chExs = this.exercises.filter(e => e.chapter === ch && e.num !== 999);
    if (chExs.length === 0) return false;
    return chExs.every(e => this.isDone(e.id));
  }

  bossesDefeated() {
    return this.exercises.filter(e => e.num === 999 && this.isDone(e.id)).length;
  }

  fastestStreak() {
    // count most exercises in any 10-minute window
    if (this.completed.length < 3) return 0;
    const times = this.completed.map(c => new Date(c.ts).getTime()).sort();
    let max = 0;
    for (let i = 0; i < times.length; i++) {
      let count = 1;
      for (let j = i+1; j < times.length; j++) {
        if (times[j] - times[i] <= 10 * 60 * 1000) count++;
        else break;
      }
      if (count > max) max = count;
    }
    return max;
  }

  earnedBadges() {
    return BADGES.filter(b => b.test(this));
  }

  lessonProgress(lessonId) {
    const exs = this.exercises.filter(e => e.lesson === lessonId);
    if (exs.length === 0) return { done: 0, total: 0, pct: 0 };
    const done = exs.filter(e => this.isDone(e.id)).length;
    return { done, total: exs.length, pct: Math.round(done / exs.length * 100) };
  }

  markComplete(exId) {
    if (this.isDone(exId)) return;
    const now = new Date();
    this.completed.push({ id: exId, ts: now.toISOString() });
    // Streak logic: if lastActive was yesterday, streak++; if today, unchanged; else reset to 1.
    const today = now.toDateString();
    if (!this.lastActive) {
      this.streak = 1;
    } else {
      const last = new Date(this.lastActive).toDateString();
      if (last === today) {
        // same day, streak unchanged
      } else {
        const yesterday = new Date(now.getTime() - 24*3600*1000).toDateString();
        this.streak = (last === yesterday) ? this.streak + 1 : 1;
      }
    }
    this.lastActive = now.toISOString();
    this.save();
  }

  markHintUsed(exId) {
    if (!this.hintsUsed.includes(exId)) {
      this.hintsUsed.push(exId);
      this.save();
    }
  }
}

const state = new State();
let EXERCISES = [];

// ---------- ROUTER ----------
function route() {
  const hash = location.hash.slice(1) || "dashboard";
  const [view, ...args] = hash.split("/");
  // Hide all views
  document.querySelectorAll(".view").forEach(v => v.hidden = true);
  const target = document.getElementById(`view-${view}`);
  if (target) {
    target.hidden = false;
  }
  if (view === "dashboard") renderDashboard();
  else if (view === "lesson") renderLesson(args[0]);
  else if (view === "exercise") renderExercise(args[0]);
  else if (view === "hallfame") renderHallFame();
  else if (view === "errors") renderErrors();
  else {
    location.hash = "#dashboard";
  }
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", route);

// ---------- RENDERERS ----------
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function renderDashboard() {
  const v = document.getElementById("view-dashboard");
  const xp = state.totalXP();
  const lvl = state.level();
  const nextXp = state.xpToNextLevel();
  const into = state.xpIntoLevel();
  const streak = state.streak;
  const badgesEarned = state.earnedBadges();
  const doneCount = state.completed.length;
  const totalCount = state.exercises.length;

  // Pick a daily challenge based on day-of-year so all students see same
  const doy = Math.floor((Date.now() / 86400000) % state.exercises.length);
  const daily = state.exercises[doy] || state.exercises[0];

  // Last exercise attempted → continue
  let lastEx = null;
  if (state.completed.length > 0) {
    const lastDoneId = state.completed[state.completed.length - 1].id;
    const lastDone = state.exercises.find(e => e.id === lastDoneId);
    if (lastDone) {
      // Suggest next: same lesson, next undone
      const nextInLesson = state.exercises.find(e => e.lesson === lastDone.lesson && !state.isDone(e.id));
      lastEx = nextInLesson || null;
    }
  } else {
    lastEx = state.exercises.find(e => e.id === "1-1");
  }

  const nickBar = state.nickname
    ? `<div class="nickname-bar"><span class="nickname-chip" onclick="changeNickname()">🎮 ${esc(state.nickname)} · edit</span></div>`
    : '';

  v.innerHTML = `
    ${nickBar}
    <div class="arcade-banner">
      <h1>🐍 PYTHON ARCADE</h1>
      <p class="subtitle">The Gauntlet · 139 quests · 3900 XP up for grabs</p>
      <p class="tagline">"Defeat the errors. Conquer the concepts. Ship your game."</p>
    </div>

    <div class="stat-bar">
      <div class="stat-card xp">
        <div class="label">Total XP</div>
        <div class="value">${xp}</div>
        <div class="xp-track"><div class="xp-fill" style="width:${into/150*100}%"></div></div>
        <div class="xp-next">${nextXp} to level ${lvl + 1}</div>
      </div>
      <div class="stat-card level">
        <div class="label">Level</div>
        <div class="value">${lvl}</div>
        <div class="xp-next">${doneCount}/${totalCount} quests</div>
      </div>
      <div class="stat-card streak">
        <div class="label">Streak</div>
        <div class="value">${streak}🔥</div>
        <div class="xp-next">consecutive days</div>
      </div>
      <div class="stat-card badges">
        <div class="label">Badges</div>
        <div class="value">${badgesEarned.length} / ${BADGES.length}</div>
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
        <div class="cta-sub">${esc(daily.flavour)} · ${daily.xp} XP · 2x bonus today!</div>
      </a>

      <a class="cta-card random" onclick="randomEncounter()">
        <h3>🎲 Random Encounter</h3>
        <div class="cta-sub">Pick a random undefeated quest</div>
      </a>
    </div>

    <h2>Earned Badges</h2>
    <div class="badges-strip">
      ${BADGES.map(b => `
        <span class="badge ${state.earnedBadges().some(eb => eb.id === b.id) ? "" : "locked"}" title="${esc(b.name)}">
          <span class="badge-emoji">${b.emoji}</span> ${esc(b.name)}
        </span>
      `).join("")}
    </div>

    <h2>The 22-Lesson Gauntlet</h2>
    <p class="subtitle">Work through in order, or jump to any lesson. Lessons unlock as the class reaches them.</p>
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
            <span>${p.total > 0 ? p.pct + "%" : "no quests"}</span>
          </div>
          <div class="progress-bar"><div class="progress-bar-fill" style="width:${p.pct}%"></div></div>
          ${hasBoss ? '<span class="boss-flag">BOSS</span>' : ''}
        </a>`;
      }).join("")}
    </div>
  `;
}

function renderLesson(lessonId) {
  const v = document.getElementById("view-lesson");
  const lesson = LESSONS.find(l => l.id === lessonId);
  if (!lesson) { location.hash = "#dashboard"; return; }

  const exs = state.exercises.filter(e => e.lesson === lessonId && e.num !== 999);
  const boss = state.exercises.find(e => e.lesson === lessonId && e.num === 999);
  const progress = state.lessonProgress(lessonId);

  v.innerHTML = `
    <a href="#dashboard" class="btn-ghost" style="display:inline-block;text-decoration:none;margin-bottom:10px;">← Back to Dashboard</a>
    <div class="arcade-banner">
      <h1>${esc(lesson.id)} · ${esc(lesson.title)}</h1>
      <p class="subtitle">${esc(lesson.week)} · ${esc(lesson.phase)}</p>
      <p class="tagline">${progress.done}/${progress.total} quests completed · ${progress.pct}%</p>
    </div>

    ${exs.length === 0 ? '<p>No exercises mapped to this lesson yet. Check the hub for the lesson page.</p>' : ''}

    <div class="exercise-list">
      ${exs.map(e => `
        <a class="exercise-card ${state.isDone(e.id) ? "done" : ""}" href="#exercise/${e.id}">
          <div class="ex-id">Quest ${e.id}</div>
          <div class="ex-title">${esc(e.flavour || e.name)}</div>
          <div class="ex-meta">
            <span class="diff-badge diff-${e.difficulty}">${e.difficulty}</span>
            <span class="xp-badge">${e.xp} XP</span>
          </div>
        </a>
      `).join("")}
    </div>

    ${boss ? `
    <a class="boss-card" href="#exercise/${boss.id}">
      <h3>${boss.flavour ? esc(boss.flavour) : "BOSS: " + esc(boss.name)}</h3>
      <p>${esc(boss.text)}</p>
      <span class="boss-reward">${boss.xp} XP · ${state.isDone(boss.id) ? "✓ DEFEATED" : "Click to enter arena"}</span>
    </a>` : ''}
  `;
}

function renderExercise(exId) {
  const v = document.getElementById("view-exercise");
  const ex = state.exercises.find(e => e.id === exId);
  if (!ex) { location.hash = "#dashboard"; return; }

  const done = state.isDone(exId);
  const hintShown = state.hintsUsed.includes(exId);
  const lesson = LESSONS.find(l => l.id === ex.lesson);
  const lessonExs = state.exercises.filter(e => e.lesson === ex.lesson);
  const prevIdx = lessonExs.findIndex(e => e.id === exId);
  const prev = prevIdx > 0 ? lessonExs[prevIdx - 1] : null;
  const next = prevIdx < lessonExs.length - 1 ? lessonExs[prevIdx + 1] : null;

  const isBoss = ex.num === 999;

  v.innerHTML = `
    <a href="#lesson/${ex.lesson}" class="btn-ghost" style="display:inline-block;text-decoration:none;margin-bottom:10px;">← Back to ${lesson ? lesson.id : "Lesson"}</a>
    <div class="exercise-detail ${isBoss ? "boss-detail" : ""}">
      <h1>${isBoss ? "💥 " : ""}Quest ${esc(ex.id)}: ${esc(ex.flavour || ex.name)}</h1>
      <div class="detail-meta">
        <span class="diff-badge diff-${ex.difficulty}">${ex.difficulty}</span>
        <span class="xp-badge">🪙 ${ex.xp} XP</span>
        ${isBoss ? '<span class="diff-badge diff-hard">BOSS FIGHT</span>' : ''}
        ${done ? '<span class="diff-badge diff-easy">✓ DEFEATED</span>' : ''}
      </div>

      <h3>The Quest</h3>
      <div class="problem">${esc(ex.text)}</div>

      <div>
        <button class="btn-secondary" onclick="toggleHint('${ex.id}')" id="hint-btn">
          ${hintShown ? '🔍 Show Hint' : '💡 Reveal Hint'}
        </button>
      </div>

      <div class="hint ${hintShown ? 'visible' : ''}" id="hint-box">
        <h4>💡 Hint</h4>
        <div>${esc(ex.hint || "Check the book section linked in the Term 2 hub.")}</div>
      </div>

      <h3>Your workbench</h3>
      <div class="code-area">
        <textarea id="code-${ex.id}" placeholder="# write your code here (copy to VS Code to run)
# this workbench saves locally as you type
"></textarea>
        <div class="code-area-actions">
          <button class="btn-secondary" onclick="copyCode('${ex.id}')">📋 Copy to clipboard</button>
          <button class="btn-secondary" onclick="openVSCode('${ex.id}')">💻 How to run in VS Code</button>
        </div>
      </div>

      <div style="margin-top:1.5rem;display:flex;gap:10px;flex-wrap:wrap;">
        ${done ? `
          <button class="btn-ghost" onclick="undoComplete('${ex.id}')">↺ Unmark (try again)</button>
        ` : `
          <button class="btn-primary" onclick="completeExercise('${ex.id}')">✅ Mark as defeated! +${ex.xp} XP</button>
        `}
        ${prev ? `<a class="btn-ghost" href="#exercise/${prev.id}">← Previous</a>` : ''}
        ${next ? `<a class="btn-secondary" href="#exercise/${next.id}">Next quest →</a>` : ''}
        <button class="btn-ghost" onclick="randomEncounter()">🎲 Random instead</button>
      </div>
    </div>
  `;

  // Load saved code
  const saved = localStorage.getItem(`code_${ex.id}`);
  if (saved) document.getElementById(`code-${ex.id}`).value = saved;

  // Save code on input
  document.getElementById(`code-${ex.id}`).addEventListener("input", (ev) => {
    localStorage.setItem(`code_${ex.id}`, ev.target.value);
  });
}

function renderHallFame() {
  const v = document.getElementById("view-hallfame");
  const board = JSON.parse(localStorage.getItem(ALL_LEADERBOARD_KEY) || "{}");
  const entries = Object.entries(board)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.xp - a.xp);

  v.innerHTML = `
    <a href="#dashboard" class="btn-ghost" style="display:inline-block;text-decoration:none;margin-bottom:10px;">← Back</a>
    <div class="arcade-banner">
      <h1>🏆 HALL OF FAME</h1>
      <p class="subtitle">Top legends on this laptop</p>
      <p class="tagline">(One entry per nickname; same laptop shares a leaderboard)</p>
    </div>
    ${entries.length === 0 ? '<p>No entries yet. Be the first hero to claim your spot!</p>' : `
    <div class="leaderboard">
      <table>
        <thead>
          <tr><th>Rank</th><th>Hero</th><th>Level</th><th>XP</th><th>Quests</th><th>Badges</th></tr>
        </thead>
        <tbody>
          ${entries.slice(0, 20).map((e, i) => `
            <tr>
              <td class="rank-col">#${i+1}</td>
              <td><strong>${esc(e.name)}</strong></td>
              <td>${e.level}</td>
              <td>${e.xp}</td>
              <td>${e.count}</td>
              <td>${e.badges}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`}
    <div style="margin-top:1.5rem;">
      <button class="btn-ghost" onclick="clearLeaderboard()">🗑 Clear leaderboard (teacher only)</button>
    </div>
  `;
}

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
        </div>
      `).join("")}
    </div>
  `;
}

// ---------- ACTIONS ----------
function toggleHint(exId) {
  state.markHintUsed(exId);
  const box = document.getElementById("hint-box");
  box.classList.add("visible");
  const btn = document.getElementById("hint-btn");
  if (btn) btn.textContent = "🔍 Hint shown";
}

function completeExercise(exId) {
  state.markComplete(exId);
  // Show XP burst
  const ex = state.exercises.find(e => e.id === exId);
  const burst = document.getElementById("xp-burst");
  burst.hidden = false;
  burst.textContent = `+${ex.xp} XP!`;
  setTimeout(() => { burst.hidden = true; }, 1200);
  // Refresh view
  setTimeout(() => renderExercise(exId), 300);
}

function undoComplete(exId) {
  state.completed = state.completed.filter(c => c.id !== exId);
  state.save();
  renderExercise(exId);
}

function randomEncounter() {
  const pending = state.exercises.filter(e => !state.isDone(e.id));
  if (pending.length === 0) {
    alert("You've defeated everything, champion! 🏆");
    return;
  }
  const pick = pending[Math.floor(Math.random() * pending.length)];
  location.hash = `#exercise/${pick.id}`;
}

function copyCode(exId) {
  const code = document.getElementById(`code-${exId}`).value;
  if (!code) {
    alert("Nothing to copy yet — write some code first.");
    return;
  }
  navigator.clipboard.writeText(code).then(() => {
    alert("Copied! Paste into VS Code and hit F5 (or Run Python File).");
  });
}

function openVSCode(exId) {
  alert(
    "How to run your code:\n\n" +
    "1. Open VS Code\n" +
    "2. Create a new file (Ctrl+N)\n" +
    "3. Save as exercise_" + exId + ".py\n" +
    "4. Paste your code (Ctrl+V)\n" +
    "5. Press F5 to run (or click ▶ top-right)\n\n" +
    "If you see an error — check the Error Bestiary! (Top nav)"
  );
}

function changeNickname() {
  const newName = prompt("New nickname (max 16 chars):", state.nickname);
  if (newName && newName.trim()) {
    state.nickname = newName.trim().slice(0, 16);
    state.save();
    renderDashboard();
  }
}

function clearLeaderboard() {
  if (confirm("Clear the entire leaderboard on this laptop? (Teacher only — students don't do this.)")) {
    localStorage.removeItem(ALL_LEADERBOARD_KEY);
    renderHallFame();
  }
}

// ---------- BOOT ----------
async function boot() {
  try {
    const res = await fetch("exercises.json");
    EXERCISES = await res.json();
    state.exercises = EXERCISES;
  } catch (e) {
    document.body.innerHTML = "<h1 style='padding:2rem;color:red;'>Failed to load exercises.json</h1><pre>" + e + "</pre>";
    return;
  }

  // First-visit nickname
  if (!state.nickname) {
    document.getElementById("nickname-modal").hidden = false;
    document.getElementById("nickname-save").addEventListener("click", () => {
      const val = document.getElementById("nickname-input").value.trim();
      if (!val) return alert("Please pick a nickname!");
      state.nickname = val.slice(0, 16);
      state.save();
      document.getElementById("nickname-modal").hidden = true;
      route();
    });
    document.getElementById("nickname-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("nickname-save").click();
    });
  }

  route();
}

window.completeExercise = completeExercise;
window.undoComplete = undoComplete;
window.toggleHint = toggleHint;
window.randomEncounter = randomEncounter;
window.copyCode = copyCode;
window.openVSCode = openVSCode;
window.changeNickname = changeNickname;
window.clearLeaderboard = clearLeaderboard;

boot();
