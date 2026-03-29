/* ═══════════════════════════════════════════
   calendar.js — Interactive Monthly Calendar
   ═══════════════════════════════════════════ */
var Calendar = (function () {
  var viewDate = new Date();
  var selectedDate = null;
  var currentView = "month"; // 'month' | 'week'

  function init() {
    render();
  }

  function prev() {
    if (currentView === "week") {
      viewDate.setDate(viewDate.getDate() - 7);
    } else {
      viewDate.setMonth(viewDate.getMonth() - 1);
    }
    selectedDate = null;
    render();
  }

  function next() {
    if (currentView === "week") {
      viewDate.setDate(viewDate.getDate() + 7);
    } else {
      viewDate.setMonth(viewDate.getMonth() + 1);
    }
    selectedDate = null;
    render();
  }

  function setView(view, btn) {
    currentView = view;
    document.querySelectorAll(".cal-view-btn").forEach(function (b) {
      b.classList.remove("active");
    });
    if (btn) btn.classList.add("active");
    selectedDate = null;
    render();
  }

  function selectDay(dateStr) {
    selectedDate = selectedDate === dateStr ? null : dateStr;
    render();
    renderDayDetail();
  }

  function render() {
    if (currentView === "week") return renderWeek();
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

  function renderWeek() {
    var wrap = document.getElementById("calendar-wrap");
    if (!wrap) return;
    // Find Monday of the current week
    var d = new Date(viewDate);
    var day = d.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);

    var todayStr = Storage.todayStr();
    var months = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Jun",
      "Jul",
      "Aoû",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];
    var weekStart = new Date(d);
    var weekEnd = new Date(d);
    weekEnd.setDate(d.getDate() + 6);
    var labelEl = document.getElementById("cal-month-label");
    if (labelEl)
      labelEl.textContent =
        weekStart.getDate() +
        " " +
        months[weekStart.getMonth()] +
        " – " +
        weekEnd.getDate() +
        " " +
        months[weekEnd.getMonth()];

    var todos = Storage.getTodos();
    var sessions = Storage.getSessions();

    var html = "";
    for (var i = 0; i < 7; i++) {
      var cur = new Date(d);
      cur.setDate(d.getDate() + i);
      var dateStr =
        cur.getFullYear() +
        "-" +
        String(cur.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(cur.getDate()).padStart(2, "0");
      var isToday = dateStr === todayStr;
      var isSelected = dateStr === selectedDate;

      var dayTasks = todos.filter(function (t) {
        return t.deadline === dateStr;
      });
      var daySessions = sessions.filter(function (s) {
        return s.date === dateStr;
      });

      var cls =
        "cal-week-day" +
        (isToday ? " today" : "") +
        (isSelected ? " selected" : "");
      var dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

      html +=
        '<div class="' +
        cls +
        '" onclick="Calendar.selectDay(\'' +
        dateStr +
        "')\">" +
        '<div class="cal-week-header"><span class="cal-week-dayname">' +
        dayNames[i] +
        '</span><span class="cal-week-num">' +
        cur.getDate() +
        "</span></div>" +
        '<div class="cal-week-body">';

      daySessions.forEach(function (s) {
        html +=
          '<div class="cal-week-event session-event" title="' +
          _escHtml(s.label) +
          '">' +
          s.duration +
          "m</div>";
      });
      dayTasks.forEach(function (t) {
        html +=
          '<div class="cal-week-event task-event' +
          (t.done ? " done-event" : "") +
          '" title="' +
          _escHtml(t.text) +
          '">' +
          _escHtml(t.text.substring(0, 12)) +
          "</div>";
      });

      html += "</div></div>";
    }
    wrap.innerHTML = html;
    renderDayDetail();
  }

  return {
    init: init,
    prev: prev,
    next: next,
    render: render,
    selectDay: selectDay,
    setView: setView,
  };
})();
