/* ═══════════════════════════════════════════
   mood.js — Daily mood tracking
   ═══════════════════════════════════════════ */
var Mood = (function () {
  var expanded = false;
  var defaultEmojis = ["😤", "😐", "😊", "🔥"];
  var extraEmojis = ["😴", "🤯", "😎", "🥳", "💀", "🧠", "😭", "🫠"];

  function getTodayMood() {
    var moods = Storage.getMoods();
    var today = Storage.todayStr();
    var entry = moods.filter(function (m) {
      return m.date === today;
    })[0];
    return entry ? entry.mood : null;
  }

  function setMood(emoji) {
    Storage.addMood({ date: Storage.todayStr(), mood: emoji });
    Gamification.checkBadges();
    expanded = false;
    renderPicker();
    if (typeof Dashboard !== "undefined") Dashboard.refresh();
  }

  function toggleExpand() {
    expanded = !expanded;
    renderPicker();
  }

  function renderPicker() {
    var wrap = document.getElementById("mood-picker-home");
    if (!wrap) return;
    var current = getTodayMood();
    var emojis = expanded ? defaultEmojis.concat(extraEmojis) : defaultEmojis;
    var html = emojis
      .map(function (e) {
        return (
          '<button class="mood-btn' +
          (current === e ? " selected" : "") +
          '" onclick="Mood.setMood(\'' +
          e +
          "')\">" +
          e +
          "</button>"
        );
      })
      .join("");
    html +=
      '<button class="mood-btn mood-btn-expand" onclick="Mood.toggleExpand()">' +
      (expanded ? "−" : "+") +
      "</button>";
    wrap.innerHTML = html;
  }

  function renderHistory() {
    var wrap = document.getElementById("mood-history");
    if (!wrap) return;
    var moods = Storage.getMoods().slice(-14).reverse();
    if (moods.length === 0) {
      wrap.innerHTML =
        '<p style="color:var(--muted);font-size:.82rem;text-align:center">Pas encore d\'humeur enregistrée</p>';
      return;
    }
    wrap.innerHTML = moods
      .map(function (m) {
        var d = m.date.split("-");
        return (
          '<div class="mood-history-item"><span class="mood-history-emoji">' +
          m.mood +
          '</span><span class="mood-history-date">' +
          d[2] +
          "/" +
          d[1] +
          "</span></div>"
        );
      })
      .join("");
  }

  return {
    getTodayMood: getTodayMood,
    setMood: setMood,
    toggleExpand: toggleExpand,
    renderPicker: renderPicker,
    renderHistory: renderHistory,
  };
})();
