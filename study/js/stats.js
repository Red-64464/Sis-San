/* ═══════════════════════════════════════════
   stats.js — Statistics & Heatmap
   ═══════════════════════════════════════════ */
var Stats = (function () {
  function renderWeekBars() {
    var wrap = document.getElementById("stat-bars");
    if (!wrap) return;

    // Get sessions from last 7 days grouped by label
    var sessions = Storage.getSessions();
    var labels = {};
    var now = new Date();
    sessions.forEach(function (s) {
      var d = new Date(s.date);
      var diffDays = Math.floor((now - d) / 86400000);
      if (diffDays <= 7) {
        var lbl = s.label || "Session";
        labels[lbl] = (labels[lbl] || 0) + s.duration;
      }
    });

    var entries = Object.keys(labels).map(function (k) {
      return { label: k, mins: labels[k] };
    });
    entries.sort(function (a, b) {
      return b.mins - a.mins;
    });

    if (entries.length === 0) {
      wrap.innerHTML =
        '<p style="color:var(--muted);font-size:.82rem;text-align:center">Pas de données cette semaine</p>';
      return;
    }

    var maxMin = entries[0].mins;
    var colors = [
      "var(--accent)",
      "var(--purple)",
      "var(--warning)",
      "var(--danger)",
      "var(--orange)",
    ];

    wrap.innerHTML = entries
      .map(function (e, i) {
        var pct = maxMin > 0 ? Math.round((e.mins / maxMin) * 100) : 0;
        var h = Math.floor(e.mins / 60);
        var m = e.mins % 60;
        var timeStr =
          h > 0
            ? h + "h" + (m > 0 ? String(m).padStart(2, "0") : "")
            : m + "min";
        return (
          '<div class="stat-bar-row">' +
          '<span class="stat-bar-label">' +
          _escHtml(e.label) +
          "</span>" +
          '<div class="stat-bar-track"><div class="stat-bar-fill" style="width:' +
          pct +
          "%;background:" +
          colors[i % colors.length] +
          '"></div></div>' +
          '<span class="stat-bar-val">' +
          timeStr +
          "</span></div>"
        );
      })
      .join("");
  }

  function renderHeatmap() {
    var wrap = document.getElementById("heatmap");
    if (!wrap) return;

    var sessions = Storage.getSessions();
    var dayCounts = {};
    sessions.forEach(function (s) {
      dayCounts[s.date] = (dayCounts[s.date] || 0) + 1;
    });

    // Last 84 days (12 weeks)
    var html = "";
    var d = new Date();
    d.setDate(d.getDate() - 83);
    for (var i = 0; i < 84; i++) {
      var dateStr =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0");
      var count = dayCounts[dateStr] || 0;
      var cls = "heatmap-day";
      if (count >= 4) cls += " l4";
      else if (count >= 3) cls += " l3";
      else if (count >= 2) cls += " l2";
      else if (count >= 1) cls += " l1";
      html +=
        '<div class="' +
        cls +
        '" title="' +
        dateStr +
        ": " +
        count +
        ' sessions"></div>';
      d.setDate(d.getDate() + 1);
    }
    wrap.innerHTML = html;
  }

  function renderTotalStats() {
    var sessions = Storage.getSessions();
    var totalMin = sessions.reduce(function (a, s) {
      return a + s.duration;
    }, 0);
    var totalH = Math.floor(totalMin / 60);
    var totalM = totalMin % 60;

    var el = document.getElementById("stat-total-time");
    if (el)
      el.textContent = totalH + "h " + String(totalM).padStart(2, "0") + "min";

    var el2 = document.getElementById("stat-total-sessions");
    if (el2) el2.textContent = sessions.length;

    var el3 = document.getElementById("stat-total-tasks");
    if (el3)
      el3.textContent = Storage.getTodos().filter(function (t) {
        return t.done;
      }).length;
  }

  function refreshAll() {
    renderWeekBars();
    renderHeatmap();
    renderTotalStats();
  }

  function _escHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  return {
    refreshAll: refreshAll,
    renderWeekBars: renderWeekBars,
    renderHeatmap: renderHeatmap,
    renderTotalStats: renderTotalStats,
  };
})();
