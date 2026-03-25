/* ═══════════════════════════════════════════
   pomodoro.js — Focus Timer with Cycles
   ═══════════════════════════════════════════ */
var Pomodoro = (function () {
  var state = {
    running: false,
    paused: false,
    mode: "work", // 'work' | 'break'
    totalSeconds: 25 * 60,
    remaining: 25 * 60,
    interval: null,
    label: "",
    preset: 25, // work minutes
    breakMinutes: 5,
    totalCycles: 1,
    currentCycle: 1,
    configOpen: false,
    isCustom: false, // true when custom HH:MM:SS time is active
  };

  var circumference = 2 * Math.PI * 108; // r=108 in SVG

  function init() {
    var settings = Storage.getSettings();
    state.preset = settings.pomoDuration || 25;
    state.breakMinutes = settings.shortBreak || 5;
    state.totalCycles = settings.cycles || 1;
    state.currentCycle = 1;
    state.totalSeconds = state.preset * 60;
    state.remaining = state.totalSeconds;
    renderPresets();
    renderCycleConfig();
    render();
    renderSessionLog();
  }

  function setPreset(minutes) {
    if (state.running) return;
    state.preset = minutes;
    state.isCustom = false;
    state.totalSeconds = minutes * 60;
    state.remaining = state.totalSeconds;
    state.mode = "work";
    state.currentCycle = 1;
    var wrap = document.getElementById("custom-wrap");
    if (wrap) wrap.classList.remove("visible");
    renderPresets();
    render();
  }

  function toggleConfig() {
    state.configOpen = !state.configOpen;
    renderCycleConfig();
  }

  function setCycleConfig(field, value) {
    if (state.running) return;
    var v = parseInt(value);
    if (isNaN(v) || v < 1) return;
    var settings = Storage.getSettings();
    if (field === "work") {
      state.preset = v;
      state.isCustom = false;
      state.totalSeconds = v * 60;
      state.remaining = v * 60;
      settings.pomoDuration = v;
    } else if (field === "break") {
      state.breakMinutes = v;
      settings.shortBreak = v;
    } else if (field === "cycles") {
      state.totalCycles = v;
      settings.cycles = v;
    }
    Storage.setSettings(settings);
    state.mode = "work";
    state.currentCycle = 1;
    render();
    renderPresets();
  }

  function toggle() {
    if (state.running && !state.paused) {
      state.paused = true;
      clearInterval(state.interval);
      render();
    } else if (state.paused) {
      state.paused = false;
      startCountdown();
      render();
    } else {
      state.label =
        document.getElementById("pomo-label").value.trim() || "Session";
      state.running = true;
      state.paused = false;
      state.currentCycle = 1;
      state.mode = "work";
      startCountdown();
      render();
      _sendStartNotif();
    }
  }

  function reset() {
    clearInterval(state.interval);
    state.running = false;
    state.paused = false;
    state.mode = "work";
    state.currentCycle = 1;
    state.remaining = state.totalSeconds;
    render();
  }

  function startCountdown() {
    state.interval = setInterval(function () {
      state.remaining--;
      if (state.remaining <= 0) {
        clearInterval(state.interval);
        onTimerEnd();
      }
      render();
    }, 1000);
  }

  function onTimerEnd() {
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

    // Send local notification
    sendTimerNotification(
      state.mode === "work"
        ? "Session Focus terminée ! 🎉"
        : "Pause terminée ✅",
      state.mode === "work"
        ? "Tu as tenu " +
            _fmtDuration(state.totalSeconds) +
            " de focus. Bravo !"
        : "La pause est finie. Retour au focus !",
    );

    if (state.mode === "work") {
      // Record session
      var now = new Date();
      Storage.addSession({
        date: Storage.todayStr(),
        time:
          String(now.getHours()).padStart(2, "0") +
          ":" +
          String(now.getMinutes()).padStart(2, "0"),
        label: state.label,
        duration: state.preset,
        mood: null,
      });
      Storage.addXP(25);
      Gamification.checkBadges();
      renderSessionLog();

      // Confetti celebration
      if (typeof Confetti !== "undefined") Confetti.launch();

      // Show mood modal
      showMoodModal();

      // Check if more cycles remain
      if (state.currentCycle < state.totalCycles) {
        // Switch to break
        state.mode = "break";
        state.totalSeconds = state.breakMinutes * 60;
        state.remaining = state.totalSeconds;
        state.running = true;
        state.paused = false;
        startCountdown();
      } else {
        // All cycles done
        state.mode = "break";
        state.totalSeconds = state.breakMinutes * 60;
        state.remaining = state.totalSeconds;
        state.running = false;
        state.paused = false;
      }
    } else {
      // Break done
      state.currentCycle++;
      state.mode = "work";
      state.totalSeconds = state.preset * 60;
      state.remaining = state.totalSeconds;
      if (state.currentCycle <= state.totalCycles) {
        // Auto-start next work cycle
        state.running = true;
        state.paused = false;
        startCountdown();
      } else {
        state.running = false;
        state.paused = false;
        state.currentCycle = 1;
      }
    }
    render();
  }

  function showMoodModal() {
    var overlay = document.getElementById("mood-modal");
    if (overlay) overlay.classList.add("show");
  }

  function getState() {
    return state;
  }

  function render() {
    var min = Math.floor(state.remaining / 60);
    var sec = state.remaining % 60;
    var el = document.getElementById("pomo-time");
    if (el)
      el.textContent =
        String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");

    var phase = document.getElementById("pomo-phase");
    if (phase) {
      var cycleText =
        state.totalCycles > 1
          ? " (" + state.currentCycle + "/" + state.totalCycles + ")"
          : "";
      phase.textContent =
        (state.mode === "work" ? "Focus" : "Pause") + cycleText;
    }

    // Ring progress
    var progress = document.getElementById("pomo-progress");
    if (progress) {
      var pct =
        state.totalSeconds > 0 ? state.remaining / state.totalSeconds : 1;
      progress.style.strokeDasharray = circumference;
      progress.style.strokeDashoffset = circumference * (1 - pct);
      progress.style.stroke =
        state.mode === "work" ? "var(--accent)" : "var(--purple)";
    }

    var btn = document.getElementById("pomo-toggle-icon");
    if (btn) {
      if (state.running && !state.paused) btn.textContent = "⏸";
      else btn.textContent = "▶";
    }

    var labelInput = document.getElementById("pomo-label");
    if (labelInput) labelInput.disabled = state.running;

    // Update mini-timer on dashboard
    if (typeof DashboardTimer !== "undefined") DashboardTimer.sync();
  }

  function renderPresets() {
    var wrap = document.getElementById("pomo-presets");
    if (!wrap) return;
    var presets = [15, 25, 45, 60];
    var html = presets
      .map(function (p) {
        return (
          '<button class="preset-btn' +
          (p === state.preset && !state.isCustom ? " active" : "") +
          '" onclick="Pomodoro.setPreset(' +
          p +
          ')">' +
          p +
          " min</button>"
        );
      })
      .join("");
    html +=
      '<button class="preset-btn preset-btn-custom' +
      (state.isCustom ? " active" : "") +
      '" onclick="Pomodoro.toggleCustomWrap()">✏ Perso</button>';
    wrap.innerHTML = html;
  }

  function renderCycleConfig() {
    var wrap = document.getElementById("cycle-config");
    if (!wrap) return;
    if (!state.configOpen) {
      wrap.innerHTML =
        '<button class="cycle-toggle-btn" onclick="Pomodoro.toggleConfig()">' +
        "⚙ Configurer les cycles" +
        "</button>";
      return;
    }
    wrap.innerHTML =
      '<button class="cycle-toggle-btn open" onclick="Pomodoro.toggleConfig()">' +
      "⚙ Masquer la config" +
      "</button>" +
      '<div class="cycle-fields">' +
      '<div class="cycle-field">' +
      "<label>Travail</label>" +
      '<div class="cycle-input-wrap">' +
      '<button class="cycle-adj" onclick="Pomodoro.setCycleConfig(\'work\',' +
      (state.preset - 5) +
      ')">−</button>' +
      '<span class="cycle-val">' +
      (state.isCustom
        ? _fmtDuration(state.totalSeconds)
        : state.preset + " min") +
      "</span>" +
      '<button class="cycle-adj" onclick="Pomodoro.setCycleConfig(\'work\',' +
      (state.preset + 5) +
      ')">+</button>' +
      "</div></div>" +
      '<div class="cycle-field">' +
      "<label>Pause</label>" +
      '<div class="cycle-input-wrap">' +
      '<button class="cycle-adj" onclick="Pomodoro.setCycleConfig(\'break\',' +
      (state.breakMinutes - 1) +
      ')">−</button>' +
      '<span class="cycle-val">' +
      state.breakMinutes +
      " min</span>" +
      '<button class="cycle-adj" onclick="Pomodoro.setCycleConfig(\'break\',' +
      (state.breakMinutes + 1) +
      ')">+</button>' +
      "</div></div>" +
      '<div class="cycle-field">' +
      "<label>Cycles</label>" +
      '<div class="cycle-input-wrap">' +
      '<button class="cycle-adj" onclick="Pomodoro.setCycleConfig(\'cycles\',' +
      (state.totalCycles - 1) +
      ')">−</button>' +
      '<span class="cycle-val">' +
      state.totalCycles +
      "x</span>" +
      '<button class="cycle-adj" onclick="Pomodoro.setCycleConfig(\'cycles\',' +
      (state.totalCycles + 1) +
      ')">+</button>' +
      "</div></div>" +
      "</div>";
  }

  function renderSessionLog() {
    var wrap = document.getElementById("session-log");
    if (!wrap) return;
    var sessions = Storage.getSessionsByDate(Storage.todayStr()).reverse();
    if (sessions.length === 0) {
      wrap.innerHTML =
        '<div class="todo-empty"><span class="todo-empty-icon">⏱</span><p>Aucune session aujourd\'hui</p></div>';
      return;
    }
    wrap.innerHTML = sessions
      .map(function (s) {
        return (
          '<div class="session-entry">' +
          '<span class="session-dot"></span>' +
          '<span class="session-name">' +
          _escHtml(s.label) +
          "</span>" +
          '<span class="session-dur">' +
          s.duration +
          " min</span>" +
          '<span class="session-mood">' +
          (s.mood || "") +
          "</span>" +
          "</div>"
        );
      })
      .join("");
  }

  function setSessionMood(emoji) {
    var sessions = Storage.getSessions();
    if (sessions.length > 0) {
      sessions[sessions.length - 1].mood = emoji;
      Storage.set("sessions", sessions);
    }
    // Also record as daily mood
    Storage.addMood({ date: Storage.todayStr(), mood: emoji });
    // Close modal
    var overlay = document.getElementById("mood-modal");
    if (overlay) overlay.classList.remove("show");
    Gamification.checkBadges();
    renderSessionLog();
    // Refresh dashboard if visible
    if (typeof Dashboard !== "undefined") Dashboard.refresh();
  }

  function _escHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  // ── Custom Time ──
  function applyCustomTime() {
    if (state.running) return;
    var h = Math.max(
      0,
      parseInt(document.getElementById("custom-h").value) || 0,
    );
    var m = Math.max(
      0,
      parseInt(document.getElementById("custom-m").value) || 0,
    );
    var s = Math.max(
      0,
      parseInt(document.getElementById("custom-s").value) || 0,
    );
    var total = h * 3600 + m * 60 + s;
    if (total <= 0) return;
    state.isCustom = true;
    state.totalSeconds = total;
    state.remaining = total;
    state.mode = "work";
    state.currentCycle = 1;
    renderPresets();
    render();
  }

  function _fmtDuration(seconds) {
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = seconds % 60;
    if (h > 0) {
      return h + "h" + (m > 0 ? String(m).padStart(2, "0") + "min" : "");
    } else if (m > 0) {
      return m + "min" + (s > 0 ? String(s).padStart(2, "0") + "s" : "");
    } else {
      return s + "s";
    }
  }

  // ── Custom Wrap Toggle ──
  function toggleCustomWrap() {
    var wrap = document.getElementById("custom-wrap");
    if (!wrap) return;
    var isVisible = wrap.classList.contains("visible");
    if (isVisible) {
      wrap.classList.remove("visible");
      wrap.style.display = "";
      state.isCustom = false;
      renderPresets();
    } else {
      wrap.classList.add("visible");
      wrap.style.display = "flex";
      setTimeout(function () {
        wrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 80);
    }
  }

  // ── Notifications ──
  function _sendStartNotif() {
    if (!("Notification" in window)) return;
    function _send() {
      if (Notification.permission === "granted") {
        sendTimerNotification(
          "🍅 " + (state.label || "Session") + " démarrée !",
          _fmtDuration(state.totalSeconds) +
            " de focus. Bonne concentration ! 💪",
        );
      }
    }
    if (Notification.permission === "granted") {
      _send();
    } else if (Notification.permission === "default") {
      if (typeof OneSignal !== "undefined") {
        try {
          OneSignal.Slidedown.promptPush();
        } catch (e) {}
      }
      Notification.requestPermission().then(function () {
        _send();
      });
    }
  }

  function requestNotifPermission() {
    if (typeof OneSignal !== "undefined") {
      try {
        OneSignal.Slidedown.promptPush();
      } catch (e) {}
    } else if (
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }

  function sendTimerNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body: body,
          icon: "../assets/icons/icon-192.png",
          badge: "../assets/icons/icon-192.png",
          tag: "sissan-timer",
          renotify: true,
          vibrate: [200, 100, 200],
        });
      } catch (e) {}
    }
  }

  function testNotification() {
    var btn = document.getElementById("notif-test-btn");
    var status = document.getElementById("notif-status");

    // First request permission if needed
    if (!("Notification" in window)) {
      if (status) {
        status.textContent = "Notifications non supportées sur ce navigateur.";
        status.className = "notif-status notif-denied";
      }
      return;
    }

    function _doSend() {
      var perm = Notification.permission;
      if (perm === "granted") {
        sendTimerNotification(
          "Sis-San — Test 🎉",
          "Super ! Les notifications fonctionnent sur ton appareil ✅",
        );
        if (status) {
          status.textContent = "✅ Notification envoyée ! Vérifie ton écran.";
          status.className = "notif-status notif-ok";
        }
        if (btn) btn.textContent = "✅ Ça marche !";
        setTimeout(function () {
          if (btn) btn.textContent = "🔔 Envoyer une notif test";
        }, 3000);
      } else if (perm === "denied") {
        if (status) {
          status.textContent =
            "❌ Notifications bloquées. Va dans les réglages de ton navigateur pour les autoriser.";
          status.className = "notif-status notif-denied";
        }
      } else {
        if (status) {
          status.textContent = "En attente de ta réponse…";
          status.className = "notif-status notif-pending";
        }
      }
    }

    if (Notification.permission === "default") {
      requestNotifPermission();
      Notification.requestPermission().then(function () {
        _doSend();
      });
    } else {
      _doSend();
    }
  }

  function getNotifStatus() {
    if (!("Notification" in window)) return "unsupported";
    return Notification.permission; // 'granted' | 'denied' | 'default'
  }

  return {
    init: init,
    toggle: toggle,
    reset: reset,
    setPreset: setPreset,
    applyCustomTime: applyCustomTime,
    toggleConfig: toggleConfig,
    setCycleConfig: setCycleConfig,
    setSessionMood: setSessionMood,
    renderSessionLog: renderSessionLog,
    getState: getState,
    testNotification: testNotification,
    getNotifStatus: getNotifStatus,
    toggleCustomWrap: toggleCustomWrap,
  };
})();
