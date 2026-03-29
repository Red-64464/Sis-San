/* ═══════════════════════════════════════════
   app.js — SPA Router & Dashboard
   ═══════════════════════════════════════════ */

/* ─── Motivation Quotes ─── */
var QUOTES = [
  {
    icon: "🧠",
    text: "Le génie, c'est 1% d'inspiration et 99% de transpiration.",
    author: "Thomas Edison",
  },
  {
    icon: "🚀",
    text: "La seule façon de faire du bon travail, c'est d'aimer ce que vous faites.",
    author: "Steve Jobs",
  },
  {
    icon: "🌟",
    text: "Chaque expert a d'abord été un débutant.",
    author: "Helen Hayes",
  },
  {
    icon: "🏆",
    text: "Le succès, c'est tomber sept fois, se relever huit.",
    author: "Proverbe japonais",
  },
  {
    icon: "💪",
    text: "Tu n'as pas à être excellent pour commencer, mais tu dois commencer pour être excellent.",
    author: "Zig Ziglar",
  },
  {
    icon: "🔥",
    text: "Peu importe ta vitesse, tu avances quand même.",
    author: "Proverbe",
  },
  {
    icon: "⭐",
    text: "L'éducation est l'arme la plus puissante pour changer le monde.",
    author: "Nelson Mandela",
  },
  {
    icon: "🎯",
    text: "Fixe-toi des objectifs élevés, et les obstacles disparaîtront.",
    author: "Andrew Carnegie",
  },
  {
    icon: "💎",
    text: "Le diamant, c'est un morceau de charbon qui a tenu bon.",
    author: "Winston Churchill",
  },
  {
    icon: "🧭",
    text: "Le chemin de mille lieues commence par un seul pas.",
    author: "Lao Tseu",
  },
  {
    icon: "🌊",
    text: "Ne regarde pas l'horloge – fais comme elle : avance.",
    author: "Sam Levenson",
  },
  {
    icon: "☀️",
    text: "Chaque matin est une nouvelle chance de tout recommencer.",
    author: "Proverbe",
  },
  {
    icon: "🎓",
    text: "Investir dans la connaissance rapporte toujours les meilleurs intérêts.",
    author: "Benjamin Franklin",
  },
  {
    icon: "⚡",
    text: "Tu es plus forte que tu ne le crois, plus talentueuse que tu ne le penses.",
    author: "A.A. Milne",
  },
  {
    icon: "🦋",
    text: "Ne compte pas les jours, fais que les jours comptent.",
    author: "Muhammad Ali",
  },
  {
    icon: "🌙",
    text: "Même les journées difficiles sont une étape vers ta réussite.",
    author: "Proverbe",
  },
  {
    icon: "🏅",
    text: "Les gagnants font les choses que les perdants refusent de faire.",
    author: "Proverbe",
  },
  {
    icon: "🌱",
    text: "Une petite graine d'effort peut donner un arbre de résultats.",
    author: "Proverbe",
  },
  {
    icon: "🎵",
    text: "La discipline, c'est choisir entre ce que tu veux maintenant et ce que tu veux le plus.",
    author: "Abraham Lincoln",
  },
  {
    icon: "💡",
    text: "Chaque heure de travail aujourd'hui est une heure de liberté demain.",
    author: "Proverbe",
  },
];

/* ─── Navigation ─── */
var App = (function () {
  var currentPage = "home";

  function navigate(page) {
    currentPage = page;
    // Hide all sections
    document.querySelectorAll(".page-section").forEach(function (s) {
      s.classList.remove("active");
    });
    // Show target
    var target = document.getElementById("page-" + page);
    if (target) target.classList.add("active");
    // Update nav
    document.querySelectorAll(".nav-btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.page === page);
    });
    // Refresh section data
    if (page === "home") Dashboard.refresh();
    else if (page === "focus") {
      Pomodoro.init();
    } else if (page === "tasks") {
      Todo.render();
      Calendar.render();
    } else if (page === "profile") {
      Profile.refresh();
    } else if (page === "flashcards") {
      Flashcards.init();
    } else if (page === "notes") {
      Notes.init();
    }
    // Scroll to top
    window.scrollTo(0, 0);
  }

  function init() {
    // Attach nav listeners
    document.querySelectorAll(".nav-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        navigate(btn.dataset.page);
      });
    });
    // Start on home
    navigate("home");
  }

  function showMotivation() {
    if (sessionStorage.getItem("motivation-shown")) return;
    sessionStorage.setItem("motivation-shown", "1");
    var q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    var iconEl = document.getElementById("motivation-icon");
    var textEl = document.getElementById("motivation-quote");
    var authorEl = document.getElementById("motivation-author");
    if (iconEl) iconEl.textContent = q.icon;
    if (textEl) textEl.textContent = "\u201C" + q.text + "\u201D";
    if (authorEl) authorEl.textContent = "\u2014 " + q.author;
    var modal = document.getElementById("motivation-modal");
    if (modal) modal.classList.add("show");
  }

  function closeMotivation(e) {
    if (
      e &&
      e.target !== document.getElementById("motivation-modal") &&
      e.type !== "click"
    )
      return;
    var modal = document.getElementById("motivation-modal");
    if (modal) modal.classList.remove("show");
  }

  /* ── Dark Mode ── */
  function toggleDarkMode() {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
    var settings = Storage.getSettings();
    settings.darkMode = !isDark;
    Storage.setSettings(settings);
    // Sync toggle visual
    var toggle = document.getElementById("toggle-dark-mode");
    if (toggle) toggle.classList.toggle("on", !isDark);
  }

  /* ── Wallpaper ── */
  var WALLPAPERS = [
    { id: "none", label: "Aucun", bg: "", thumb: "#f5f5f5" },
    {
      id: "rosepink",
      label: "Rose",
      bg: "linear-gradient(135deg,#fce4ec 0%,#f8bbd0 50%,#f3e5f5 100%)",
      thumb: "linear-gradient(135deg,#fce4ec,#f8bbd0)",
    },
    {
      id: "peach",
      label: "Pêche",
      bg: "linear-gradient(135deg,#fff0f5 0%,#ffe4e8 40%,#ffd6e0 100%)",
      thumb: "linear-gradient(135deg,#ffe4e8,#ffd6e0)",
    },
    {
      id: "lavender",
      label: "Lavande",
      bg: "linear-gradient(135deg,#f3e5f5 0%,#e8d5f5 50%,#fce4ec 100%)",
      thumb: "linear-gradient(135deg,#e8d5f5,#fce4ec)",
    },
    {
      id: "mint",
      label: "Menthe",
      bg: "linear-gradient(135deg,#e0f7f4 0%,#b2dfdb 60%,#e8f5e9 100%)",
      thumb: "linear-gradient(135deg,#b2dfdb,#e8f5e9)",
    },
    {
      id: "night",
      label: "Nuit",
      bg: "linear-gradient(135deg,#0d0d2b 0%,#1a1a40 100%)",
      thumb: "linear-gradient(135deg,#0d0d2b,#1a1a40)",
    },
  ];

  function renderWallpaperPicker() {
    var wrap = document.getElementById("wallpaper-picker");
    if (!wrap) return;
    var settings = Storage.getSettings();
    var activeId = settings.wallpaperId || "none";
    var html = WALLPAPERS.map(function (w) {
      return (
        "<button class='wallpaper-swatch" +
        (w.id === activeId ? " active" : "") +
        "' style='background:" +
        w.thumb +
        "' title='" +
        w.label +
        "' onclick=\"App.setWallpaper('" +
        w.id +
        "')\"></button>"
      );
    }).join("");
    html +=
      "<button class='wallpaper-upload-btn' onclick='App.uploadWallpaper()'>🖼 Upload</button>";
    wrap.innerHTML = html;
  }

  function setWallpaper(id) {
    var w = WALLPAPERS.find(function (x) {
      return x.id === id;
    });
    var bg = w ? w.bg : "";
    _applyWallpaper(bg);
    var settings = Storage.getSettings();
    settings.wallpaperId = id;
    settings.wallpaper = bg;
    Storage.setSettings(settings);
    renderWallpaperPicker();
  }

  function uploadWallpaper() {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = function () {
      var file = input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        var bg = "url(" + e.target.result + ")";
        _applyWallpaper(bg);
        var settings = Storage.getSettings();
        settings.wallpaperId = "custom";
        settings.wallpaper = bg;
        Storage.setSettings(settings);
        renderWallpaperPicker();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  function _applyWallpaper(bg) {
    document.body.style.setProperty("--wallpaper", bg || "none");
  }

  /* ── Pomodoro Settings ── */
  var SETTING_LIMITS = {
    pomoDuration: { min: 1, max: 120, suffix: " min" },
    shortBreak: { min: 1, max: 60, suffix: " min" },
    cycles: { min: 1, max: 10, suffix: "x" },
  };
  var SETTING_ELEMENTS = {
    pomoDuration: "setting-pomo-dur",
    shortBreak: "setting-break-dur",
    cycles: "setting-cycles",
  };

  function adjustSetting(key, delta) {
    var settings = Storage.getSettings();
    var defaults = { pomoDuration: 25, shortBreak: 5, cycles: 1 };
    var current = settings[key] || defaults[key] || 1;
    var limits = SETTING_LIMITS[key];
    var next = Math.min(limits.max, Math.max(limits.min, current + delta));
    settings[key] = next;
    Storage.setSettings(settings);
    var el = document.getElementById(SETTING_ELEMENTS[key]);
    if (el) el.textContent = next + limits.suffix;
    // Reset Pomodoro to pick up new settings
    Pomodoro.applySettings(settings);
  }

  /* ── Accent Color ── */
  var ACCENT_COLORS = [
    { id: "pink", label: "Rose", c1: "#e8739a", c2: "#d45c87" },
    { id: "purple", label: "Violet", c1: "#a78bfa", c2: "#8b5cf6" },
    { id: "blue", label: "Bleu", c1: "#60a5fa", c2: "#3b82f6" },
    { id: "mint", label: "Menthe", c1: "#34d399", c2: "#10b981" },
    { id: "orange", label: "Orange", c1: "#fb923c", c2: "#f97316" },
    { id: "red", label: "Rouge", c1: "#f87171", c2: "#ef4444" },
  ];

  function renderAccentPicker() {
    var wrap = document.getElementById("accent-picker");
    if (!wrap) return;
    var settings = Storage.getSettings();
    var activeId = settings.accentId || "pink";
    wrap.innerHTML = ACCENT_COLORS.map(function (a) {
      return (
        "<button class='accent-swatch" +
        (a.id === activeId ? " active" : "") +
        "' style='background:" +
        a.c1 +
        "' title='" +
        a.label +
        "' onclick=\"App.setAccent('" +
        a.id +
        "')\"></button>"
      );
    }).join("");
  }

  function setAccent(id) {
    var ac = ACCENT_COLORS.find(function (a) {
      return a.id === id;
    });
    if (!ac) return;
    document.documentElement.style.setProperty("--accent", ac.c1);
    document.documentElement.style.setProperty("--accent2", ac.c2);
    var settings = Storage.getSettings();
    settings.accentId = id;
    settings.accentC1 = ac.c1;
    settings.accentC2 = ac.c2;
    Storage.setSettings(settings);
    renderAccentPicker();
  }

  /* ── Ambient Sounds ── */
  var _ambientCtx = null;
  var _ambientNodes = {}; // id -> { source, gainNode }
  var _ambientVolume = 0.4;
  var _ambientActive = null;

  var AMBIENT_URLS = {
    rain: "https://www.soundjay.com/nature/sounds/rain-01.mp3",
    cafe: "https://www.soundjay.com/misc/sounds/cafe-ambience-1.mp3",
    forest: "https://www.soundjay.com/nature/sounds/birds-chirping-1.mp3",
    fire: "https://www.soundjay.com/nature/sounds/fireplace-1.mp3",
    waves: "https://www.soundjay.com/nature/sounds/waves-1.mp3",
    lofi: "https://www.soundjay.com/misc/sounds/lofi-1.mp3",
  };

  // Procedural ambient using Web Audio (offline fallback)
  function _makeAmbientNode(ctx, type) {
    var gainNode = ctx.createGain();
    gainNode.gain.value = _ambientVolume;
    gainNode.connect(ctx.destination);

    if (
      type === "rain" ||
      type === "waves" ||
      type === "forest" ||
      type === "fire"
    ) {
      var bufferSize = 4096;
      var node = ctx.createScriptProcessor(bufferSize, 1, 1);
      var lastOut = 0;
      node.onaudioprocess = function (e) {
        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
          var white = Math.random() * 2 - 1;
          if (type === "rain") {
            output[i] = (lastOut + 0.02 * white) / 1.02;
          } else if (type === "waves") {
            output[i] = (lastOut + 0.005 * white) / 1.005;
          } else if (type === "forest") {
            output[i] = white * 0.05;
          } else {
            output[i] = (lastOut + 0.01 * white) / 1.01;
          }
          lastOut = output[i];
        }
      };
      node.connect(gainNode);
      return { source: node, gainNode: gainNode };
    } else if (type === "lofi" || type === "cafe") {
      var osc = ctx.createOscillator();
      osc.type = type === "lofi" ? "sine" : "triangle";
      osc.frequency.value = type === "lofi" ? 60 : 80;
      osc.connect(gainNode);
      osc.start();
      return { source: osc, gainNode: gainNode };
    }
    return null;
  }

  function toggleAmbient(btn, type) {
    if (!_ambientCtx) {
      _ambientCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Deactivate current
    if (_ambientActive === type) {
      _stopAmbient(type);
      btn.classList.remove("active");
      _ambientActive = null;
      return;
    }
    // Stop previous
    if (_ambientActive) {
      _stopAmbient(_ambientActive);
      document.querySelectorAll(".ambient-btn").forEach(function (b) {
        b.classList.remove("active");
      });
    }
    _ambientActive = type;
    btn.classList.add("active");
    var node = _makeAmbientNode(_ambientCtx, type);
    if (node) _ambientNodes[type] = node;
  }

  function _stopAmbient(type) {
    var n = _ambientNodes[type];
    if (!n) return;
    try {
      if (n.source.stop) n.source.stop();
      else if (n.source.disconnect) n.source.disconnect();
      n.gainNode.disconnect();
    } catch (e) {}
    delete _ambientNodes[type];
  }

  function setAmbientVolume(val) {
    _ambientVolume = val / 100;
    Object.keys(_ambientNodes).forEach(function (type) {
      var n = _ambientNodes[type];
      if (n && n.gainNode) n.gainNode.gain.value = _ambientVolume;
    });
  }

  return {
    navigate: navigate,
    init: init,
    showMotivation: showMotivation,
    closeMotivation: closeMotivation,
    toggleDarkMode: toggleDarkMode,
    setWallpaper: setWallpaper,
    uploadWallpaper: uploadWallpaper,
    renderWallpaperPicker: renderWallpaperPicker,
    adjustSetting: adjustSetting,
    renderAccentPicker: renderAccentPicker,
    setAccent: setAccent,
    toggleAmbient: toggleAmbient,
    setAmbientVolume: setAmbientVolume,
  };
})();

/* ─── Dashboard Timer (mini ring on home) ─── */
var DashboardTimer = (function () {
  var circ = 2 * Math.PI * 34; // r=34 mini ring

  function sync() {
    var s = Pomodoro.getState();
    var card = document.getElementById("dash-timer-card");
    var quickBtn = document.getElementById("quick-start-btn");
    if (!card) return;

    // Always show the timer ring card
    card.style.display = "flex";
    if (quickBtn) quickBtn.style.display = "none";

    if (s.running || s.paused) {
      // Active state
      var min = Math.floor(s.remaining / 60);
      var sec = s.remaining % 60;
      var el = document.getElementById("dash-pomo-time");
      if (el)
        el.textContent =
          String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");

      var pct = s.totalSeconds > 0 ? s.remaining / s.totalSeconds : 1;
      var prog = document.getElementById("dash-pomo-progress");
      if (prog) {
        prog.style.strokeDasharray = circ;
        prog.style.strokeDashoffset = circ * (1 - pct);
        prog.style.stroke =
          s.mode === "work" ? "var(--accent)" : "var(--purple)";
      }

      var label = document.getElementById("dash-pomo-label");
      if (label) label.textContent = s.label || "Session";
      var phase = document.getElementById("dash-pomo-phase");
      if (phase) phase.textContent = s.mode === "work" ? "Focus" : "Pause";
    } else {
      // Idle state — show default time, full ring
      var settings = Storage.getSettings();
      var idleMins = settings.pomoDuration || 25;
      var idleEl = document.getElementById("dash-pomo-time");
      if (idleEl)
        idleEl.textContent = String(idleMins).padStart(2, "0") + ":00";

      var idleProg = document.getElementById("dash-pomo-progress");
      if (idleProg) {
        idleProg.style.strokeDasharray = circ;
        idleProg.style.strokeDashoffset = 0; // full ring = ready
        idleProg.style.stroke = "var(--muted)";
      }

      var idleLabel = document.getElementById("dash-pomo-label");
      if (idleLabel) idleLabel.textContent = "Prête à focus ?";
      var idlePhase = document.getElementById("dash-pomo-phase");
      if (idlePhase) idlePhase.textContent = "Toucher pour démarrer";
    }
  }

  return { sync: sync };
})();

/* ─── Dashboard ─── */
var Dashboard = (function () {
  function refresh() {
    // Streak
    var streak = Storage.getStreak();
    Storage.updateBestStreak(streak);
    var el = document.getElementById("dash-streak");
    if (el) el.textContent = streak;

    // Today minutes
    var mins = Storage.getTodayMinutes();
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var el2 = document.getElementById("dash-focus-time");
    if (el2)
      el2.textContent =
        h > 0 ? h + "h" + String(m).padStart(2, "0") : m + "min";

    // Today tasks
    var el3 = document.getElementById("dash-tasks-done");
    if (el3) el3.textContent = Storage.getTodayCompletedCount();

    // Sessions count today
    var el4 = document.getElementById("dash-session-count");
    if (el4)
      el4.textContent = Storage.getSessionsByDate(Storage.todayStr()).length;

    // Mood
    Mood.renderPicker();

    // Mini timer sync
    DashboardTimer.sync();

    // Upcoming tasks
    renderUpcoming();
  }

  function renderUpcoming() {
    var wrap = document.getElementById("dash-upcoming");
    if (!wrap) return;
    var todos = Storage.getTodos().filter(function (t) {
      return !t.done;
    });
    todos.sort(function (a, b) {
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return b.id - a.id;
    });
    todos = todos.slice(0, 3);
    if (todos.length === 0) {
      wrap.innerHTML =
        '<p style="color:var(--muted);font-size:.82rem;padding:12px 0">Aucune tâche en cours</p>';
      return;
    }
    wrap.innerHTML = todos
      .map(function (t) {
        return (
          '<div class="todo-item" data-id="' +
          t.id +
          '">' +
          '<button class="todo-check" onclick="Todo.toggleDone(' +
          t.id +
          ')"></button>' +
          '<span class="todo-text">' +
          _escHtml(t.text) +
          "</span>" +
          (t.deadline
            ? '<span class="todo-date">' +
              t.deadline.split("-").slice(1).reverse().join("/") +
              "</span>"
            : "") +
          "</div>"
        );
      })
      .join("");
  }

  function _escHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  return { refresh: refresh };
})();

/* ─── Profile ─── */
var Profile = (function () {
  function refresh() {
    // XP & Level
    var xp = Storage.getXP();
    var level = Gamification.getLevel(xp);
    var xpInLevel = Gamification.getXPInLevel(xp);

    var el = document.getElementById("profile-level");
    if (el) el.textContent = "Niveau " + level;
    var bar = document.getElementById("profile-xp-fill");
    if (bar) bar.style.width = xpInLevel + "%";
    var xpText = document.getElementById("profile-xp-text");
    if (xpText) xpText.textContent = xpInLevel + " / 100 XP";

    // Streak
    var streak = Storage.getStreak();
    var best = Storage.getBestStreak();
    var el2 = document.getElementById("profile-streak");
    if (el2) el2.textContent = streak + " jours";
    var el3 = document.getElementById("profile-best-streak");
    if (el3) el3.textContent = "Record : " + best + " jours";

    // Stats
    Stats.refreshAll();

    // Settings display
    var settings = Storage.getSettings();
    var pomoDur = document.getElementById("setting-pomo-dur");
    if (pomoDur) pomoDur.textContent = (settings.pomoDuration || 25) + " min";
    var breakDur = document.getElementById("setting-break-dur");
    if (breakDur) breakDur.textContent = (settings.shortBreak || 5) + " min";
    var cyclesEl = document.getElementById("setting-cycles");
    if (cyclesEl) cyclesEl.textContent = (settings.cycles || 1) + "x";

    // Dark mode toggle
    var toggle = document.getElementById("toggle-dark-mode");
    if (toggle) toggle.classList.toggle("on", !!settings.darkMode);

    // Wallpaper picker
    App.renderWallpaperPicker();

    // Accent color picker
    App.renderAccentPicker();

    // Badges
    Gamification.checkBadges();
    renderBadges();

    // Mood history
    Mood.renderHistory();
  }

  function renderBadges() {
    var wrap = document.getElementById("badges-grid");
    if (!wrap) return;
    var badges = Gamification.getAllBadges();
    wrap.innerHTML = badges
      .map(function (b) {
        return (
          '<div class="badge-item' +
          (b.unlocked ? "" : " locked") +
          '">' +
          '<span class="badge-icon">' +
          b.icon +
          "</span>" +
          '<span class="badge-name">' +
          b.name +
          "</span></div>"
        );
      })
      .join("");
  }

  return { refresh: refresh };
})();

/* ─── Boot ─── */
document.addEventListener("DOMContentLoaded", function () {
  // Register service worker (PWA + push)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("../sw.js", { scope: "/" })
      .catch(function () {});
  }

  App.init();
  Gamification.checkBadges(); // unlock "Bienvenue !" badge on first visit

  // Apply saved theme (dark/light)
  var _bootSettings = Storage.getSettings();
  if (_bootSettings.darkMode) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
  // Apply saved wallpaper
  if (_bootSettings.wallpaper) {
    document.body.style.setProperty("--wallpaper", _bootSettings.wallpaper);
  }
  // Apply saved accent color
  if (_bootSettings.accentC1) {
    document.documentElement.style.setProperty(
      "--accent",
      _bootSettings.accentC1,
    );
    document.documentElement.style.setProperty(
      "--accent2",
      _bootSettings.accentC2 || _bootSettings.accentC1,
    );
  }

  // Show daily motivation quote (once per session)
  setTimeout(function () {
    App.showMotivation();
  }, 800);

  // ── OneSignal Push Notifications ──
  // SETUP: create a free account at onesignal.com → New App → Web → copy your App ID below
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(function (OneSignal) {
    OneSignal.init({
      appId: "c01fd3cb-203b-46d1-8a9f-f73df2050fba",
      serviceWorkerPath: "/sw.js",
      notifyButton: { enable: false },
      promptOptions: {
        slidedown: {
          prompts: [
            {
              type: "push",
              autoPrompt: false,
              text: {
                actionMessage:
                  "Reçois des notifications quand ton timer se termine !",
                acceptButton: "Oui !",
                cancelButton: "Non merci",
              },
            },
          ],
        },
      },
    });
  });
});
