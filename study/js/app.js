/* ═══════════════════════════════════════════
   app.js — SPA Router & Dashboard
   ═══════════════════════════════════════════ */

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

  return { navigate: navigate, init: init };
})();

/* ─── Dashboard Timer (mini ring on home) ─── */
var DashboardTimer = (function () {
  var circ = 2 * Math.PI * 34; // r=34 mini ring

  function sync() {
    var s = Pomodoro.getState();
    var card = document.getElementById("dash-timer-card");
    var quickBtn = document.getElementById("quick-start-btn");
    if (!card) return;

    if (s.running || s.paused) {
      card.style.display = "flex";
      if (quickBtn) quickBtn.style.display = "none";

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
      card.style.display = "none";
      if (quickBtn) quickBtn.style.display = "flex";
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
  App.init();
});
