/* ═══════════════════════════════════════════
   calendar.js — Interactive Monthly Calendar
   ═══════════════════════════════════════════ */
var Calendar = (function () {
  var viewDate = new Date();
  var selectedDate = null;

  function init() {
    render();
  }

  function prev() {
    viewDate.setMonth(viewDate.getMonth() - 1);
    selectedDate = null;
    render();
  }

  function next() {
    viewDate.setMonth(viewDate.getMonth() + 1);
    selectedDate = null;
    render();
  }

  function selectDay(dateStr) {
    selectedDate = selectedDate === dateStr ? null : dateStr;
    render();
    renderDayDetail();
  }

  function render() {
    var wrap = document.getElementById("calendar-wrap");
    if (!wrap) return;

    var year = viewDate.getFullYear();
    var month = viewDate.getMonth();
    var todayStr = Storage.todayStr();

    var months = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];
    document.getElementById("cal-month-label").textContent =
      months[month] + " " + year;

    // Get sessions per day
    var sessions = Storage.getSessions();
    var dayCounts = {};
    sessions.forEach(function (s) {
      var parts = s.date.split("-");
      if (parseInt(parts[0]) === year && parseInt(parts[1]) === month + 1) {
        dayCounts[parseInt(parts[2])] =
          (dayCounts[parseInt(parts[2])] || 0) + 1;
      }
    });

    // Get tasks per day
    var todos = Storage.getTodos();
    var dayTasks = {};
    todos.forEach(function (t) {
      if (t.deadline) {
        var parts = t.deadline.split("-");
        if (parseInt(parts[0]) === year && parseInt(parts[1]) === month + 1) {
          var day = parseInt(parts[2]);
          dayTasks[day] = (dayTasks[day] || 0) + 1;
        }
      }
    });

    var firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var daysInPrev = new Date(year, month, 0).getDate();

    var html = "";
    for (var i = firstDay - 1; i >= 0; i--) {
      html += '<div class="cal-day other-month">' + (daysInPrev - i) + "</div>";
    }
    for (var d = 1; d <= daysInMonth; d++) {
      var dateStr =
        year +
        "-" +
        String(month + 1).padStart(2, "0") +
        "-" +
        String(d).padStart(2, "0");
      var isToday = dateStr === todayStr;
      var isSelected = dateStr === selectedDate;
      var count = dayCounts[d] || 0;
      var taskCount = dayTasks[d] || 0;
      var cls = "cal-day cal-day-click";
      if (isToday) cls += " today";
      if (isSelected) cls += " selected";
      if (count >= 3) cls += " intensity-3";
      else if (count >= 2) cls += " intensity-2";
      else if (count >= 1) cls += " intensity-1";
      if (count > 0) cls += " has-session";

      html +=
        '<div class="' +
        cls +
        '" onclick="Calendar.selectDay(\'' +
        dateStr +
        "')\">" +
        "<span>" +
        d +
        "</span>" +
        (taskCount > 0 ? '<span class="cal-task-dot"></span>' : "") +
        "</div>";
    }
    var totalCells = firstDay + daysInMonth;
    var remainder = totalCells % 7;
    if (remainder > 0) {
      for (var n = 1; n <= 7 - remainder; n++) {
        html += '<div class="cal-day other-month">' + n + "</div>";
      }
    }

    wrap.innerHTML = html;
    renderDayDetail();
  }

  function renderDayDetail() {
    var wrap = document.getElementById("cal-day-detail");
    if (!wrap) {
      // Create the detail panel if it doesn't exist
      var calCard = document.getElementById("calendar-wrap");
      if (!calCard) return;
      var detail = document.createElement("div");
      detail.id = "cal-day-detail";
      detail.className = "cal-day-detail";
      calCard.parentNode.appendChild(detail);
      wrap = detail;
    }

    if (!selectedDate) {
      wrap.style.display = "none";
      return;
    }

    var parts = selectedDate.split("-");
    var dateLabel = parts[2] + "/" + parts[1] + "/" + parts[0];

    // Sessions for this day
    var sessions = Storage.getSessionsByDate(selectedDate);
    // Tasks for this day
    var tasks = Todo.getTasksForDate(selectedDate);

    var html =
      '<div class="cal-detail-head">' +
      '<span class="cal-detail-date">' +
      dateLabel +
      "</span>" +
      '<button class="cal-detail-close" onclick="Calendar.selectDay(\'' +
      selectedDate +
      "')\">✕</button>" +
      "</div>";

    if (sessions.length > 0) {
      html += '<div class="cal-detail-section">Sessions</div>';
      sessions.forEach(function (s) {
        html +=
          '<div class="cal-detail-item">' +
          '<span class="session-dot"></span>' +
          "<span>" +
          _escHtml(s.label) +
          "</span>" +
          '<span class="cal-detail-meta">' +
          s.duration +
          " min " +
          (s.mood || "") +
          "</span>" +
          "</div>";
      });
    }

    if (tasks.length > 0) {
      html += '<div class="cal-detail-section">Tâches</div>';
      tasks.forEach(function (t) {
        html +=
          '<div class="cal-detail-item">' +
          '<span class="cal-detail-check' +
          (t.done ? " done" : "") +
          '">' +
          (t.done ? "✓" : "○") +
          "</span>" +
          "<span" +
          (t.done ? ' style="text-decoration:line-through;opacity:.5"' : "") +
          ">" +
          _escHtml(t.text) +
          "</span>" +
          "</div>";
      });
    }

    if (sessions.length === 0 && tasks.length === 0) {
      html += '<p class="cal-detail-empty">Rien pour ce jour</p>';
    }

    wrap.innerHTML = html;
    wrap.style.display = "block";
  }

  function _escHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  return {
    init: init,
    prev: prev,
    next: next,
    render: render,
    selectDay: selectDay,
  };
})();
