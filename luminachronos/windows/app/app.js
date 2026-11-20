// Lumina Chronos for Windows. A port of the iOS TimerController / screens
// (iOS/LuminaChronos), kept behaviourally identical where the platform allows.
"use strict";

// ---------------------------------------------------------------- i18n
const SUPPORTED = Object.keys(window.LC_STRINGS || {});
function pickLanguage() {
  // ?lang=de forces a language (for store screenshots); otherwise follow Windows' language list.
  const forced = new URLSearchParams(location.search).get("lang");
  for (const raw of forced ? [forced] : navigator.languages || [navigator.language || "en"]) {
    const tag = raw.toLowerCase();
    if (tag.startsWith("en")) return "en";
    const exact = SUPPORTED.find((l) => l.toLowerCase() === tag);
    if (exact) return exact;
    const base = tag.split("-")[0];
    if (base === "zh") {
      if (/-(tw|hk|mo|hant)/.test(tag)) continue; // only Simplified Chinese is translated
      return "zh-CN";
    }
    if (base === "es") return "es-419";
    if (base === "pt") return "pt-BR";
    const byBase = SUPPORTED.find((l) => l.split("-")[0].toLowerCase() === base);
    if (byBase) return byBase;
  }
  return "en";
}
const LANG = pickLanguage();
const TABLE = (window.LC_STRINGS || {})[LANG] || {};
function t(key, ...args) {
  const s = TABLE[key] ?? key;
  return s.replace(/\{(\d+)\}/g, (_, n) => String(args[Number(n) - 1]));
}
document.documentElement.lang = LANG === "en" ? "en" : LANG;
document.documentElement.dir = LANG === "ar" ? "rtl" : "ltr";

// ---------------------------------------------------------------- quotes
const QUOTES = [
  ["The secret of getting ahead is getting started.", "Mark Twain"],
  ["It always seems impossible until it's done.", "Nelson Mandela"],
  ["Focus on being productive instead of busy.", "Tim Ferriss"],
  ["Your limitation—it's only your imagination.", "Unknown"],
  ["Push yourself, because no one else is going to do it for you.", "Unknown"],
  ["Sometimes later becomes never. Do it now.", "Unknown"],
  ["Great things never come from comfort zones.", "Unknown"],
  ["Dream it. Wish it. Do it.", "Unknown"],
  ["Success doesn't just find you. You have to go out and get it.", "Unknown"],
  ["The harder you work for something, the greater you'll feel when you achieve it.", "Unknown"],
  ["Don't stop when you're tired. Stop when you're done.", "Unknown"],
  ["Wake up with determination. Go to bed with satisfaction.", "Unknown"],
  ["Do something today that your future self will thank you for.", "Sean Patrick Flanery"],
  ["Little things make big days.", "Unknown"],
  ["It's going to be hard, but hard does not mean impossible.", "Unknown"],
  ["Don't wait for opportunity. Create it.", "Unknown"],
  ["The only way to do great work is to love what you do.", "Steve Jobs"],
  ["Believe you can and you're halfway there.", "Theodore Roosevelt"],
  ["Act as if what you do makes a difference. It does.", "William James"],
  ["What you get by achieving your goals is not as important as what you become.", "Zig Ziglar"],
  ["Start where you are. Use what you have. Do what you can.", "Arthur Ashe"],
  ["Productivity is never an accident.", "Paul J. Meyer"],
  ["You don't have to be great to start, but you have to start to be great.", "Zig Ziglar"],
  ["The way to get started is to quit talking and begin doing.", "Walt Disney"],
  ["Don't count the days, make the days count.", "Muhammad Ali"],
  ["The future depends on what you do today.", "Mahatma Gandhi"],
  ["Strive not to be a success, but rather to be of value.", "Albert Einstein"],
  ["In the middle of every difficulty lies opportunity.", "Albert Einstein"],
  ["Setting goals is the first step in turning the invisible into the visible.", "Tony Robbins"],
  ["Success is not final, failure is not fatal: it is the courage to continue that counts.", "Winston Churchill"],
  ["Quality is not an act, it is a habit.", "Aristotle"],
  ["Well done is better than well said.", "Benjamin Franklin"],
  ["It does not matter how slowly you go as long as you do not stop.", "Confucius"],
  ["Everything you've ever wanted is on the other side of fear.", "George Addair"],
  ["Concentrate all your thoughts upon the work at hand.", "Alexander Graham Bell"],
  ["Either you run the day, or the day runs you.", "Jim Rohn"],
  ["The best time to plant a tree was 20 years ago. The second best time is now.", "Chinese Proverb"],
  ["You are never too old to set another goal or to dream a new dream.", "C.S. Lewis"],
  ["Only put off until tomorrow what you are willing to die having left undone.", "Pablo Picasso"],
  ["If you spend too much time thinking about a thing, you'll never get it done.", "Bruce Lee"],
  ["One day or day one. You decide.", "Unknown"],
  ["Knowing is not enough; we must apply. Willing is not enough; we must do.", "Johann Wolfgang von Goethe"],
  ["The best revenge is massive success.", "Frank Sinatra"],
  ["If people are doubting how far you can go, go so far that you can't hear them anymore.", "Michele Ruiz"],
  ["Hustle in silence and let your success make the noise.", "Unknown"],
  ["Work hard in silence, let success be your noise.", "Frank Ocean"],
  ["Nature does not hurry, yet everything is accomplished.", "Lao Tzu"],
  ["Find peace in the process, not just the results.", "Unknown"],
  ["What we fear doing most is usually what we most need to do.", "Tim Ferriss"],
  ["The man who moves a mountain begins by carrying away small stones.", "Confucius"],
].map(([text, author]) => ({ text: t(text), author: t(author) }));
const randomQuote = () => QUOTES[Math.floor(Math.random() * QUOTES.length)];

// ---------------------------------------------------------------- colours
const COLORS = {
  green:  { ring: "#66BB6A", glow: "#69A135", dim: "#2E7D32" },
  yellow: { ring: "#FFD54F", glow: "#FFCA28", dim: "#F9A825" },
  red:    { ring: "#E57373", glow: "#BD3E3E", dim: "#C62828" },
  blue:   { ring: "#64B5F6", glow: "#42BEBE", dim: "#1565C0" },
};
const WORK = "work", SHORT = "SHORT_BREAK", LONG = "LONG_BREAK";

// ---------------------------------------------------------------- storage
const DEFAULT_SETTINGS = {
  workDurationMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, roundsPerCycle: 4,
  soundLevel: 8, countdownTickerEnabled: true, autoStartBreaks: false,
  backgroundAnimationEnabled: true, pauseOnMinimize: true,
};
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ } },
  remove(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } },
};

// ---------------------------------------------------------------- sound
const sound = (() => {
  let ctx = null;
  const buffers = {};
  const names = ["complete", "tick", "button_click", "ding"];
  const raw = Promise.all(names.map((n) =>
    fetch(`sounds/${n}.wav`).then((r) => r.arrayBuffer()).then((b) => [n, b]).catch(() => [n, null])));

  function ensure() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    raw.then((list) => list.forEach(([n, b]) => {
      if (b) ctx.decodeAudioData(b.slice(0)).then((buf) => { buffers[n] = buf; }).catch(() => {});
    }));
  }
  function play(name, volume, rate = 1) {
    ensure();
    if (ctx.state === "suspended") ctx.resume();
    const buf = buffers[name];
    if (!buf) return;
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    src.playbackRate.value = rate;
    gain.gain.value = Math.max(0, Math.min(1, volume));
    src.connect(gain).connect(ctx.destination);
    src.start();
  }
  // Audio may only start after a user gesture; unlock it on the first one.
  ["pointerdown", "keydown"].forEach((e) => window.addEventListener(e, ensure, { once: true, capture: true }));
  return {
    complete: (lvl) => lvl > 0 && play("complete", lvl / 15),
    tick: (lvl) => lvl > 0 && play("tick", (lvl / 15) * 0.5),
    click: (lvl) => lvl > 0 && play("button_click", lvl / 15),
    start: (lvl) => lvl > 0 && play("button_click", lvl / 15, 1.2),
    ding: (lvl) => lvl > 0 && play("ding", lvl / 15),
  };
})();

// ---------------------------------------------------------------- notifications
const notify = {
  async requestIfNeeded() {
    if ("Notification" in window && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch { /* ignore */ }
    }
  },
  async sessionComplete(type) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const body = type === WORK ? t("Focus session complete — time for a break.")
      : type === SHORT ? t("Break over — ready for the next round?")
      : t("Long break finished — back to focus.");
    const opts = { body, icon: "icons/icon-192.png", tag: "lc.session-complete" };
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg) await reg.showNotification("Lumina Chronos", opts);
      else new Notification("Lumina Chronos", opts);
    } catch { /* ignore */ }
  },
};

// ---------------------------------------------------------------- wake lock
const wake = {
  lock: null,
  async set(on) {
    if (!("wakeLock" in navigator)) return;
    if (on && !this.lock && document.visibilityState === "visible") {
      try {
        this.lock = await navigator.wakeLock.request("screen");
        this.lock.addEventListener("release", () => { this.lock = null; });
      } catch { /* denied, e.g. battery saver */ }
    } else if (!on && this.lock) {
      this.lock.release().catch(() => {});
      this.lock = null;
    }
  },
};

// ---------------------------------------------------------------- timer controller
const ticker = new Worker("ticker.js");
const timer = {
  settings: { ...DEFAULT_SETTINGS, ...store.get("lc.settings", {}) },
  state: null,
  quote: randomQuote(),
  wallStart: 0,
  initialRemaining: 0,
  previousColor: "green",

  init() {
    const total = this.settings.workDurationMinutes * 60;
    this.state = {
      sessionType: WORK, phase: "idle", totalSeconds: total, remainingSeconds: total,
      currentRound: store.get("lc.currentRound", 1), completedRounds: store.get("lc.completedRounds", 0),
      colorState: "green",
    };
    ticker.onmessage = () => this.tick();
  },

  saveRounds() {
    store.set("lc.currentRound", this.state.currentRound);
    store.set("lc.completedRounds", this.state.completedRounds);
  },

  duration(type) {
    const s = this.settings;
    return (type === WORK ? s.workDurationMinutes : type === SHORT ? s.shortBreakMinutes : s.longBreakMinutes) * 60;
  },

  idleWork(currentRound, completedRounds) {
    const total = this.settings.workDurationMinutes * 60;
    this.state = { sessionType: WORK, phase: "idle", totalSeconds: total, remainingSeconds: total, currentRound, completedRounds, colorState: "green" };
  },

  start() {
    const s = this.state;
    if (s.phase === "running") return;
    sound.start(this.settings.soundLevel);
    if (!this.settings.pauseOnMinimize) notify.requestIfNeeded();
    if (s.phase === "idle" || s.phase === "finished") {
      const total = this.duration(s.sessionType);
      Object.assign(s, { phase: "running", totalSeconds: total, remainingSeconds: total, colorState: s.sessionType === WORK ? "green" : "blue" });
    } else {
      s.phase = "running";
    }
    this.startCountdown();
    render();
  },

  pause() {
    this.stopCountdown();
    this.state.phase = "paused";
    render();
  },

  resume() {
    if (this.state.phase !== "paused") return;
    sound.start(this.settings.soundLevel);
    this.state.phase = "running";
    this.startCountdown();
    render();
  },

  stop() {
    this.stopCountdown();
    const s = this.state;
    if (s.sessionType !== WORK) {
      // Stopping a break completes the round.
      const cycle = Math.max(1, this.settings.roundsPerCycle);
      const next = s.currentRound % cycle === 0 ? 1 : s.currentRound + 1;
      this.idleWork(next, s.completedRounds + 1);
      this.saveRounds();
    } else {
      // Aborting work: no round completion, just reset the timer.
      this.idleWork(s.currentRound, s.completedRounds);
    }
    render();
  },

  resetRounds() {
    this.stopCountdown();
    this.idleWork(1, 0);
    this.saveRounds();
    render();
  },

  skip() {
    this.stopCountdown();
    this.advance();
    render();
  },

  nextQuote() {
    this.quote = randomQuote();
    renderQuotes();
  },

  click(level) { sound.click(level ?? this.settings.soundLevel); },

  updateSettings(patch) {
    const next = { ...this.settings, ...patch };
    const cycle = Math.max(1, next.roundsPerCycle);
    const pos = ((this.state.currentRound - 1) % cycle) + 1;
    if (pos !== this.state.currentRound && this.state.phase !== "idle") {
      this.state.currentRound = pos;
      this.saveRounds();
    }
    this.settings = next;
    store.set("lc.settings", next);
    if (this.state.phase === "idle") {
      const total = next.workDurationMinutes * 60;
      this.state.totalSeconds = total;
      this.state.remainingSeconds = total;
    }
    render();
  },

  startCountdown() {
    this.wallStart = Date.now();
    this.initialRemaining = this.state.remainingSeconds;
    this.previousColor = this.state.colorState;
    ticker.postMessage("start");
    wake.set(true);
  },

  stopCountdown() {
    ticker.postMessage("stop");
    wake.set(false);
  },

  tick() {
    const s = this.state;
    if (s.phase !== "running") return;
    const elapsed = Math.floor((Date.now() - this.wallStart) / 1000);
    const remaining = Math.max(0, this.initialRemaining - elapsed);
    if (remaining !== s.remainingSeconds) {
      const color = colorFor(s.sessionType, remaining, s.totalSeconds);
      s.remainingSeconds = remaining;
      s.colorState = color;
      if (color !== this.previousColor) {
        const p = this.previousColor;
        const upward = (p === "green" && color === "yellow") || (p === "yellow" && color === "red") || (p === "green" && color === "red");
        if (upward) sound.ding(this.settings.soundLevel);
        this.previousColor = color;
      }
      if (remaining >= 1 && remaining <= 5 && this.settings.countdownTickerEnabled) sound.tick(this.settings.soundLevel);
      render();
    }
    if (remaining <= 0) this.finish(s.sessionType);
  },

  finish(type) {
    this.stopCountdown();
    Object.assign(this.state, { phase: "finished", colorState: "red" });
    sound.complete(this.settings.soundLevel);
    if (document.visibilityState === "hidden") notify.sessionComplete(type);
    this.advance();
    render();
  },

  advance() {
    const s = this.state;
    const cycle = Math.max(1, this.settings.roundsPerCycle);
    if (s.sessionType === WORK) {
      const isLong = s.currentRound % cycle === 0;
      const total = (isLong ? this.settings.longBreakMinutes : this.settings.shortBreakMinutes) * 60;
      Object.assign(s, {
        sessionType: isLong ? LONG : SHORT,
        phase: this.settings.autoStartBreaks ? "running" : "idle",
        totalSeconds: total, remainingSeconds: total, colorState: "blue",
      });
      if (this.settings.autoStartBreaks) this.startCountdown();
    } else {
      const next = s.currentRound % cycle === 0 ? 1 : s.currentRound + 1;
      this.idleWork(next, s.completedRounds + 1);
      this.saveRounds();
    }
  },

  // Closing the window while a session runs with "Pause on Minimize" off: keep the
  // countdown going on the wall clock and pick it up on the next launch (iOS does
  // the same when the app is backgrounded).
  suspend() {
    const s = this.state;
    if (s.phase !== "running" || this.settings.pauseOnMinimize) return;
    store.set("lc.running", {
      remaining: s.remainingSeconds, total: s.totalSeconds, sessionType: s.sessionType, wall: Date.now(),
    });
  },

  restore() {
    const saved = store.get("lc.running", null);
    store.remove("lc.running");
    if (!saved) return;
    const elapsed = Math.floor((Date.now() - saved.wall) / 1000);
    const left = Math.max(0, saved.remaining - elapsed);
    Object.assign(this.state, { sessionType: saved.sessionType, totalSeconds: saved.total });
    if (left > 0) {
      Object.assign(this.state, { phase: "running", remainingSeconds: left, colorState: colorFor(saved.sessionType, left, saved.total) });
      this.startCountdown();
    } else {
      Object.assign(this.state, { phase: "finished", remainingSeconds: 0, colorState: "red" });
      this.advance();
    }
  },
};

function colorFor(type, remaining, total) {
  if (type !== WORK) return "blue";
  const yellow = Math.floor(total * 0.38);
  const red = Math.floor(yellow * 0.38);
  if (remaining <= red) return "red";
  if (remaining <= yellow) return "yellow";
  return "green";
}

// ---------------------------------------------------------------- DOM helpers
const $ = (sel) => document.querySelector(sel);
const pad = (n) => String(n).padStart(2, "0");
const cyclePos = () => {
  const cycle = Math.max(1, timer.settings.roundsPerCycle);
  return [((timer.state.currentRound - 1) % cycle) + 1, cycle];
};

function statusText() {
  const s = timer.state;
  switch (s.phase) {
    case "idle": return t("Ready");
    case "paused": return t("Paused");
    case "running":
      if (s.sessionType === WORK) return t({ green: "Run", yellow: "Slow Down", red: "Finish", blue: "Break" }[s.colorState]);
      return t(s.sessionType === SHORT ? "Short Break" : "Long Break");
    case "finished":
      return s.sessionType === WORK ? t("Round {1}, Finish!", cyclePos()[0]) : t("Break Over!");
  }
  return "";
}

// ---------------------------------------------------------------- render
let lastGlow = null;
function render() {
  const s = timer.state;
  const set = timer.settings;
  const glow = COLORS[s.colorState].glow;
  if (glow !== lastGlow) { document.documentElement.style.setProperty("--glow", glow); lastGlow = glow; }
  document.body.classList.toggle("no-anim", !set.backgroundAnimationEnabled);

  // Timer screen
  const timeText = `${pad(Math.floor(s.remainingSeconds / 60))}:${pad(s.remainingSeconds % 60)}`;
  $("#time").textContent = timeText;
  const [pos, cycle] = cyclePos();
  $("#round").textContent = t("Round {1}/{2}", pos, cycle);
  $("#status").textContent = statusText();
  document.title = s.phase === "running" || s.phase === "paused" ? `${timeText} · Lumina Chronos` : "Lumina Chronos";

  const main = $("#btn-main");
  const running = s.phase === "running";
  main.classList.toggle("running", running);
  labelButton(main, running ? "Pause" : "Play", "Space");

  const right = $("#btn-right");
  const isBreak = s.sessionType !== WORK;
  right.classList.toggle("break", isBreak);
  right.classList.toggle("blank", !isBreak && s.phase === "finished");
  labelButton(right, isBreak ? "Stop" : "Skip", isBreak ? "S" : "N");
  labelButton($("#btn-reset"), "Reset", "R");

  $("#quote-text").textContent = `"${timer.quote.text}"`;
  $("#quote-author").textContent = `— ${timer.quote.author}`;

  // Settings screen
  document.querySelectorAll(".stepper").forEach((row) => {
    const key = row.dataset.key;
    const v = set[key];
    row.querySelector("output").textContent = row.dataset.format === "mm" ? `${pad(v)}:00` : String(v);
    row.querySelector(".minus").disabled = v <= Number(row.dataset.min);
    row.querySelector(".plus").disabled = v >= Number(row.dataset.max);
  });
  document.querySelectorAll(".toggle").forEach((row) => {
    row.querySelector(".switch").setAttribute("aria-checked", String(!!set[row.dataset.key]));
  });
  const vol = $("#volume");
  vol.value = set.soundLevel;
  vol.style.setProperty("--pct", `${(set.soundLevel / 15) * 100}%`);
  $("#completed").textContent = t("Completed Rounds: {1}", s.completedRounds);

  ring.draw();
}

function labelButton(btn, key, shortcut) {
  const label = t(key);
  btn.setAttribute("aria-label", label);
  btn.title = `${label} (${shortcut})`;
  btn.setAttribute("aria-keyshortcuts", shortcut === "Space" ? "Space" : shortcut);
}

function renderQuotes() {
  $("#featured-text").textContent = timer.quote.text;
  $("#featured-author").textContent = `— ${timer.quote.author}`;
  $("#quote-text").textContent = `"${timer.quote.text}"`;
  $("#quote-author").textContent = `— ${timer.quote.author}`;
}

// ---------------------------------------------------------------- timer ring (canvas)
const ring = {
  canvas: $("#ring"),
  size: 280,

  resize(px) {
    this.size = px;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(px * dpr);
    this.canvas.height = Math.round(px * dpr);
    document.documentElement.style.setProperty("--ring", `${px}px`);
    this.draw();
  },

  draw(now = performance.now()) {
    const s = timer.state;
    const c = this.canvas.getContext("2d");
    const dpr = this.canvas.width / this.size;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, this.size, this.size);

    const k = this.size / 280; // stroke widths scale with the ring
    const stroke = 12 * k, glowStroke = 24 * k;
    const radius = (this.size - glowStroke) / 2;
    const cx = this.size / 2, cy = this.size / 2;
    const progress = s.totalSeconds > 0 ? s.remainingSeconds / s.totalSeconds : 1;
    const sweep = progress * Math.PI * 2;
    const col = COLORS[s.colorState];
    const phase = (Math.sin((now / 1000) * Math.PI / 2) + 1) / 2;
    const glowAlpha = 0.4 + phase * ((s.phase === "running" ? 0.8 : 0.5) - 0.4);
    const top = -Math.PI / 2;

    c.lineCap = "round";
    // 1. Track
    c.beginPath(); c.arc(cx, cy, radius, 0, Math.PI * 2);
    c.strokeStyle = rgba(col.dim, 0.15); c.lineWidth = stroke; c.stroke();

    if (sweep > 0) {
      const arc = () => { c.beginPath(); c.arc(cx, cy, radius, top, top + sweep); };
      // 2. Outer glow
      const g = c.createConicGradient(top, cx, cy);
      g.addColorStop(0, rgba(col.glow, glowAlpha * 0.3));
      g.addColorStop(Math.max(0.001, progress), rgba(col.glow, glowAlpha * 0.6));
      g.addColorStop(Math.min(1, Math.max(0.002, progress) + 0.001), "transparent");
      g.addColorStop(1, "transparent");
      arc(); c.strokeStyle = g; c.lineWidth = glowStroke; c.stroke();
      // 3. Main arc
      const m = c.createConicGradient(top, cx, cy);
      m.addColorStop(0, col.dim);
      m.addColorStop(Math.max(0.001, progress * 0.5), col.ring);
      m.addColorStop(Math.max(0.002, progress), col.ring);
      m.addColorStop(Math.min(1, Math.max(0.003, progress) + 0.001), "transparent");
      m.addColorStop(1, "transparent");
      arc(); c.strokeStyle = m; c.lineWidth = stroke; c.stroke();
    }

    const dotR = radius - stroke * 1.2;
    const dot = (angle, outerR, outerC, innerR, innerC) => {
      const x = cx + dotR * Math.cos(angle), y = cy + dotR * Math.sin(angle);
      c.beginPath(); c.arc(x, y, outerR, 0, Math.PI * 2); c.fillStyle = outerC; c.fill();
      c.beginPath(); c.arc(x, y, innerR, 0, Math.PI * 2); c.fillStyle = innerC; c.fill();
    };
    // 4. Tip dot
    if (progress > 0.01) dot(top + sweep, stroke * 0.8, rgba(col.ring, glowAlpha), stroke * 0.3, `rgba(255,255,255,${glowAlpha * 0.6})`);
    // 5. Threshold dots (work only)
    if (s.sessionType === WORK) {
      const yellowT = 0.38, redT = 0.38 * 0.38;
      const yA = s.colorState === "green", rA = s.colorState !== "red";
      dot(top + yellowT * Math.PI * 2, stroke * 0.7, rgba(COLORS.yellow.glow, yA ? 0.35 : 0.15), stroke * 0.3, rgba(COLORS.yellow.ring, yA ? 0.9 : 0.3));
      dot(top + redT * Math.PI * 2, stroke * 0.7, rgba(COLORS.red.glow, rA ? 0.35 : 0.15), stroke * 0.3, rgba(COLORS.red.ring, rA ? 0.9 : 0.3));
    }
  },
};

function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a))})`;
}

// ---------------------------------------------------------------- floating particles
const particles = (() => {
  // SplitMix64 seeded with 42, as on iOS, so the layout is the same on every launch.
  let state = 42n;
  const M = (1n << 64n) - 1n;
  const next = () => {
    state = (state + 0x9E3779B97F4A7C15n) & M;
    let z = state;
    z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & M;
    z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & M;
    z = z ^ (z >> 31n);
    return Number(z >> 40n) / 16777216;
  };
  const list = Array.from({ length: 15 }, () => ({
    x: next(), r: 0.7 + next() * 1.4, a: 0.15 + next() * 0.25, drift: 0.01 + next() * 0.03,
    phase: next() * 6.28, sway: 0.8 + next() * 0.4, base: next(),
  }));
  const speedOf = { green: 1.8, yellow: 0.8, red: 0.3, blue: 0.8 };
  const canvas = $("#particles");
  let pivotReal = performance.now() / 1000, pivotScaled = 0, lastColor = "green";

  return {
    resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
    },
    draw(nowMs) {
      const now = nowMs / 1000;
      const color = timer.state.colorState;
      if (color !== lastColor) { // keep positions continuous when the speed changes
        pivotScaled += (now - pivotReal) * speedOf[lastColor];
        pivotReal = now; lastColor = color;
      }
      const c = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      const w = innerWidth, h = innerHeight;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, w, h);
      if (!timer.settings.backgroundAnimationEnabled || document.body.dataset.tab !== "timer") return;
      const scaled = pivotScaled + (now - pivotReal) * speedOf[color];
      const glow = COLORS[color].glow;
      // Desktop windows are larger than phones; scale dots up gently with the window.
      const scale = Math.max(1, Math.min(2, Math.min(w, h) / 400));
      for (const p of list) {
        let v = (p.base + scaled * 0.12) % 1; if (v < 0) v += 1;
        const y = (1 - v) * h;
        const x = (p.x + p.drift * Math.sin(scaled * p.sway + p.phase)) * w;
        const yf = y / h;
        const fade = yf < 0.1 ? Math.max(0, yf / 0.1) : yf > 0.92 ? Math.max(0, (1 - yf) / 0.08) : 1;
        const alpha = p.a * fade;
        const r = p.r * scale;
        c.beginPath(); c.arc(x, y, r * 2.5, 0, Math.PI * 2); c.fillStyle = rgba(glow, alpha * 0.4); c.fill();
        c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = `rgba(255,255,255,${alpha * 0.7})`; c.fill();
      }
    },
  };
})();

function frame(now) {
  if (document.visibilityState === "visible") {
    particles.draw(now);
    if (document.body.dataset.tab === "timer") ring.draw(now);
  }
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------- layout
function layout() {
  const main = document.querySelector("main");
  const w = main.clientWidth, h = main.clientHeight;
  // Room left after header, status, controls and quote card.
  const px = Math.round(Math.max(200, Math.min(w - 48, h - 380, 420)));
  ring.resize(px);
  particles.resize();
}

// ---------------------------------------------------------------- tabs
const TABS = ["timer", "quotes", "settings"];
function showTab(name) {
  if (!TABS.includes(name)) name = "timer";
  document.body.dataset.tab = name;
  for (const tab of TABS) $(`#screen-${tab}`).hidden = tab !== name;
  document.querySelectorAll(".tab").forEach((b) => {
    if (b.dataset.tab === name) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  if (location.hash.slice(1) !== name) history.replaceState(null, "", name === "timer" ? location.pathname : `#${name}`);
}

// ---------------------------------------------------------------- build static UI
function buildUI() {
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });

  // Steppers
  const minus = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>';
  const plus = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg>';
  document.querySelectorAll(".stepper").forEach((row) => {
    const label = row.querySelector(".label").textContent;
    const wrap = document.createElement("div");
    wrap.className = "stepper-ctl";
    wrap.innerHTML = `<button class="minus" aria-label="${label} −">${minus}</button><output aria-live="polite"></output><button class="plus" aria-label="${label} +">${plus}</button>`;
    row.appendChild(wrap);
    const step = Number(row.dataset.step), min = Number(row.dataset.min), max = Number(row.dataset.max), key = row.dataset.key;
    const change = (dir) => {
      const v = timer.settings[key] + dir * step;
      if (v < min || v > max) return;
      timer.click();
      timer.updateSettings({ [key]: v });
    };
    wrap.querySelector(".minus").addEventListener("click", () => change(-1));
    wrap.querySelector(".plus").addEventListener("click", () => change(1));
  });

  // Toggles
  document.querySelectorAll(".toggle").forEach((row) => {
    const sw = document.createElement("button");
    sw.className = "switch";
    sw.setAttribute("role", "switch");
    sw.setAttribute("aria-label", row.querySelector(".label").textContent);
    row.appendChild(sw);
    row.addEventListener("click", () => {
      timer.click();
      timer.updateSettings({ [row.dataset.key]: !timer.settings[row.dataset.key] });
    });
  });

  // Volume
  $("#volume").addEventListener("input", (e) => {
    const v = Number(e.target.value);
    if (v !== timer.settings.soundLevel) {
      timer.updateSettings({ soundLevel: v });
      timer.click(v);
    }
  });

  $("#btn-reset-rounds").addEventListener("click", () => { timer.click(); timer.resetRounds(); });

  // Timer controls
  const mainAction = () => {
    timer.click();
    const p = timer.state.phase;
    if (p === "running") timer.pause();
    else if (p === "paused") timer.resume();
    else timer.start();
  };
  const rightAction = () => {
    if ($("#btn-right").classList.contains("blank")) return;
    timer.click();
    if (timer.state.sessionType !== WORK) timer.stop(); else timer.skip();
  };
  $("#btn-main").addEventListener("click", mainAction);
  $("#btn-reset").addEventListener("click", () => { timer.click(); timer.stop(); });
  $("#btn-right").addEventListener("click", rightAction);
  $("#featured").addEventListener("click", () => timer.nextQuote());

  document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));

  // Quote list
  const ul = $("#quote-list");
  for (const q of QUOTES) {
    const li = document.createElement("li");
    li.innerHTML = '<div><div class="q"></div><div class="a"></div></div>';
    li.querySelector(".q").textContent = q.text;
    li.querySelector(".a").textContent = `— ${q.author}`;
    ul.appendChild(li);
  }

  setupOtherStores();

  // Keyboard shortcuts: Space play/pause, R reset, N skip, S stop break, Ctrl+1/2/3 tabs.
  window.addEventListener("keydown", (e) => {
    if (e.altKey || e.metaKey) return;
    if (e.ctrlKey) {
      const i = ["1", "2", "3"].indexOf(e.key);
      if (i >= 0) { e.preventDefault(); showTab(TABS[i]); }
      return;
    }
    const target = e.target;
    if (target instanceof HTMLInputElement) return;
    const onTimer = document.body.dataset.tab === "timer";
    if (e.code === "Space" && onTimer && !(target instanceof HTMLButtonElement)) {
      e.preventDefault(); mainAction();
    } else if (!onTimer) {
      return;
    } else if (e.key === "r" || e.key === "R") {
      timer.click(); timer.stop();
    } else if ((e.key === "n" || e.key === "N") && timer.state.sessionType === WORK) {
      rightAction();
    } else if ((e.key === "s" || e.key === "S") && timer.state.sessionType !== WORK) {
      rightAction();
    }
  });
}

// ---------------------------------------------------------------- "Also on iPhone and Android"
// Settings row + panel with a QR code and link per store, configured in other-stores.js.
function setupOtherStores() {
  const cfg = window.LC_OTHER_STORES;
  const stores = (cfg && Array.isArray(cfg.stores) ? cfg.stores : [])
    .filter((s) => s && typeof s.name === "string" && /^https:\/\/[^\s"'<>]+$/.test(s.url || ""));
  if (!stores.length) return;
  const words = { ...cfg, notes: null, ...((cfg.translations || {})[LANG] || {}) };

  $("#other-stores-button").textContent = words.button;
  $("#other-stores-hint").textContent = words.hint;
  $("#stores-title").textContent = words.title;
  $("#stores-text").textContent = words.text;
  $("#stores-close").textContent = words.close;

  const row = $("#stores");
  stores.forEach((s, i) => {
    const a = document.createElement("a");
    a.className = "store";
    a.href = s.url;
    a.target = "_blank"; // opens the store page in the browser
    a.rel = "noopener";
    if (s.qr) {
      const img = document.createElement("img");
      img.src = s.qr;
      img.alt = `QR code: ${s.name}`;
      a.appendChild(img);
    }
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = s.name;
    const note = document.createElement("span");
    note.className = "sub";
    note.textContent = (Array.isArray(words.notes) && words.notes[i]) || s.note || "";
    a.append(name, note);
    row.appendChild(a);
  });

  const dialog = $("#stores-dialog");
  $("#other-stores-section").hidden = false;
  $("#btn-other-stores").addEventListener("click", () => { timer.click(); dialog.showModal(); });
  $("#stores-close").addEventListener("click", () => dialog.close());
  // A click on the dimmed backdrop closes it too.
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
}

// ---------------------------------------------------------------- lifecycle
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    if (timer.state.phase === "running" && timer.settings.pauseOnMinimize) timer.pause();
  } else if (timer.state.phase === "running") {
    wake.set(true); // the lock is dropped while hidden
  }
});
window.addEventListener("pagehide", () => timer.suspend());
window.addEventListener("resize", layout);
window.addEventListener("hashchange", () => showTab(location.hash.slice(1)));

timer.init();
timer.restore();
buildUI();
showTab(location.hash.slice(1));
renderQuotes();
render();
layout();
requestAnimationFrame(frame);

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
