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

  return {
    navigate: navigate,
    init: init,
    showMotivation: showMotivation,
    closeMotivation: closeMotivation,
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
