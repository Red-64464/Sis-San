/* ═══════════════════════════════════════════
   storage.js — Centralized localStorage layer
   ═══════════════════════════════════════════ */
var Storage = (function () {
  var PREFIX = "sissan_";

  function _key(k) {
    return PREFIX + k;
  }

  function get(key, fallback) {
    try {
      var raw = localStorage.getItem(_key(key));
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function set(key, val) {
    try {
      localStorage.setItem(_key(key), JSON.stringify(val));
    } catch (e) {}
  }

  /* ── Sessions (Pomodoro) ── */
  function getSessions() {
    return get("sessions", []);
  }
  function addSession(session) {
    var s = getSessions();
    s.push(session);
    set("sessions", s);
  }

  /* ── Todos ── */
  function getTodos() {
    return get("todos", []);
  }
  function setTodos(arr) {
    set("todos", arr);
  }

  /* ── Mood ── */
  function getMoods() {
    return get("moods", []);
  }
  function addMood(entry) {
    var m = getMoods();
    // Replace if same date
    var today = entry.date;
    m = m.filter(function (x) {
      return x.date !== today;
    });
    m.push(entry);
    set("moods", m);
  }

  /* ── Gamification ── */
  function getXP() {
    return get("xp", 0);
  }
  function addXP(amount) {
    var xp = getXP() + amount;
    set("xp", xp);
    return xp;
  }
  function getBadges() {
    return get("badges", {});
  }
  function unlockBadge(id) {
    var b = getBadges();
    if (!b[id]) {
      b[id] = new Date().toISOString();
      set("badges", b);
      return true;
    }
    return false;
  }

  /* ── Streak ── */
  function getStreak() {
    var sessions = getSessions();
    if (sessions.length === 0) return 0;
    var dates = {};
    sessions.forEach(function (s) {
      dates[s.date] = true;
    });
    var today = _dateStr(new Date());
    var streak = 0;
    var d = new Date();
    // Check today or yesterday as start
    if (!dates[today]) {
      d.setDate(d.getDate() - 1);
      if (!dates[_dateStr(d)]) return 0;
    }
    while (dates[_dateStr(d)]) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  function getBestStreak() {
    return get("bestStreak", 0);
  }
  function updateBestStreak(current) {
    var best = getBestStreak();
    if (current > best) {
      set("bestStreak", current);
      return current;
    }
    return best;
  }

  /* ── Settings ── */
  function getSettings() {
    return get("settings", {
      pomoDuration: 25,
      shortBreak: 5,
      longBreak: 15,
      reminderHour: 18,
      notificationsOn: false,
    });
  }
  function setSettings(s) {
    set("settings", s);
  }

  /* ── Helpers ── */
  function _dateStr(d) {
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }
  function todayStr() {
    return _dateStr(new Date());
  }

  /* ── Sessions for a date ── */
  function getSessionsByDate(date) {
    return getSessions().filter(function (s) {
      return s.date === date;
    });
  }

  /* ── Total time today ── */
  function getTodayMinutes() {
    var today = todayStr();
    return getSessions()
      .filter(function (s) {
        return s.date === today;
      })
      .reduce(function (sum, s) {
        return sum + (s.duration || 0);
      }, 0);
  }

  /* ── Todos completed today ── */
  function getTodayCompletedCount() {
    var today = todayStr();
    return getTodos().filter(function (t) {
      return t.done && t.doneDate === today;
    }).length;
  }

  return {
    get: get,
    set: set,
    getSessions: getSessions,
    addSession: addSession,
    getSessionsByDate: getSessionsByDate,
    getTodos: getTodos,
    setTodos: setTodos,
    getMoods: getMoods,
    addMood: addMood,
    getXP: getXP,
    addXP: addXP,
    getBadges: getBadges,
    unlockBadge: unlockBadge,
    getStreak: getStreak,
    getBestStreak: getBestStreak,
    updateBestStreak: updateBestStreak,
    getSettings: getSettings,
    setSettings: setSettings,
    todayStr: todayStr,
    getTodayMinutes: getTodayMinutes,
    getTodayCompletedCount: getTodayCompletedCount,
  };
})();
