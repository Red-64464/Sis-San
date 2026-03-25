/* ═══════════════════════════════════════════
   todo.js — Task Manager with categories & priority
   ═══════════════════════════════════════════ */
var Todo = (function () {
  var filter = "all"; // all | todo | done
  var CATEGORIES = [
    { key: "none", label: "Aucune", color: "var(--muted)" },
    { key: "math", label: "Maths", color: "#00f5c3" },
    { key: "science", label: "Sciences", color: "#a78bfa" },
    { key: "lang", label: "Langues", color: "#ffd93d" },
    { key: "other", label: "Autre", color: "#ff914d" },
  ];
  var PRIORITIES = [
    { key: "low", label: "Basse", color: "var(--muted)", icon: "↓" },
    { key: "medium", label: "Moyenne", color: "var(--warning)", icon: "→" },
    { key: "high", label: "Haute", color: "var(--danger)", icon: "↑" },
  ];

  function init() {
    render();
  }

  function add() {
    var input = document.getElementById("todo-input");
    var dateInput = document.getElementById("todo-date");
    var catSelect = document.getElementById("todo-cat");
    var prioSelect = document.getElementById("todo-prio");
    var text = input.value.trim();
    if (!text) return;
    var todos = Storage.getTodos();
    todos.push({
      id: Date.now(),
      text: text,
      done: false,
      created: Storage.todayStr(),
      deadline: dateInput.value || null,
      doneDate: null,
      category: catSelect ? catSelect.value : "none",
      priority: prioSelect ? prioSelect.value : "medium",
    });
    Storage.setTodos(todos);
    input.value = "";
    dateInput.value = "";
    render();
  }

  function toggleDone(id) {
    var todos = Storage.getTodos();
    todos = todos.map(function (t) {
      if (t.id === id) {
        t.done = !t.done;
        t.doneDate = t.done ? Storage.todayStr() : null;
        if (t.done) {
          Storage.addXP(10);
          Gamification.checkBadges();
        }
      }
      return t;
    });
    Storage.setTodos(todos);
    render();
    if (typeof Dashboard !== "undefined") Dashboard.refresh();
  }

  function remove(id) {
    var todos = Storage.getTodos().filter(function (t) {
      return t.id !== id;
    });
    Storage.setTodos(todos);
    render();
  }

  function setFilter(f) {
    filter = f;
    render();
  }

  function render() {
    renderFilters();
    renderList();
  }

  function renderFilters() {
    var wrap = document.getElementById("todo-filters");
    if (!wrap) return;
    var filters = [
      { key: "all", label: "Toutes" },
      { key: "todo", label: "À faire" },
      { key: "done", label: "Faites" },
    ];
    wrap.innerHTML = filters
      .map(function (f) {
        return (
          '<button class="todo-filter' +
          (filter === f.key ? " active" : "") +
          '" onclick="Todo.setFilter(\'' +
          f.key +
          "')\">" +
          f.label +
          "</button>"
        );
      })
      .join("");
  }

  function renderList() {
    var wrap = document.getElementById("todo-list");
    if (!wrap) return;
    var todos = Storage.getTodos();

    if (filter === "todo")
      todos = todos.filter(function (t) {
        return !t.done;
      });
    else if (filter === "done")
      todos = todos.filter(function (t) {
        return t.done;
      });

    // Sort: priority (high first), then undone first, then by creation desc
    var prioOrder = { high: 0, medium: 1, low: 2 };
    todos.sort(function (a, b) {
      if (a.done !== b.done) return a.done ? 1 : -1;
      var pa = prioOrder[a.priority || "medium"] || 1;
      var pb = prioOrder[b.priority || "medium"] || 1;
      if (pa !== pb) return pa - pb;
      return b.id - a.id;
    });

    if (todos.length === 0) {
      wrap.innerHTML =
        '<div class="todo-empty"><span class="todo-empty-icon">✨</span><p>' +
        (filter === "done"
          ? "Aucune tâche complétée"
          : filter === "todo"
            ? "Tout est fait !"
            : "Ajoute ta première tâche") +
        "</p></div>";
      return;
    }

    wrap.innerHTML = todos
      .map(function (t) {
        var cat = _getCat(t.category);
        var prio = _getPrio(t.priority);
        return (
          '<div class="todo-item' +
          (t.done ? " done" : "") +
          '" data-id="' +
          t.id +
          '">' +
          '<button class="todo-check" onclick="Todo.toggleDone(' +
          t.id +
          ')">' +
          (t.done ? "✓" : "") +
          "</button>" +
          '<div class="todo-content">' +
          '<span class="todo-text">' +
          _escHtml(t.text) +
          "</span>" +
          '<div class="todo-meta">' +
          (t.category && t.category !== "none"
            ? '<span class="todo-cat-badge" style="color:' +
              cat.color +
              ";border-color:" +
              cat.color +
              '">' +
              cat.label +
              "</span>"
            : "") +
          '<span class="todo-prio-badge" style="color:' +
          prio.color +
          '">' +
          prio.icon +
          " " +
          prio.label +
          "</span>" +
          (t.deadline
            ? '<span class="todo-date">' + _formatDate(t.deadline) + "</span>"
            : "") +
          "</div></div>" +
          '<button class="todo-delete" onclick="Todo.remove(' +
          t.id +
          ')">✕</button>' +
          "</div>"
        );
      })
      .join("");
  }

  function _getCat(key) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].key === key) return CATEGORIES[i];
    }
    return CATEGORIES[0];
  }

  function _getPrio(key) {
    for (var i = 0; i < PRIORITIES.length; i++) {
      if (PRIORITIES[i].key === key) return PRIORITIES[i];
    }
    return PRIORITIES[1];
  }

  function getTasksForDate(dateStr) {
    return Storage.getTodos().filter(function (t) {
      return t.deadline === dateStr;
    });
  }

  function _formatDate(str) {
    var parts = str.split("-");
    return parts[2] + "/" + parts[1];
  }

  function _escHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function handleKeydown(e) {
    if (e.key === "Enter") add();
  }

  return {
    init: init,
    add: add,
    toggleDone: toggleDone,
    remove: remove,
    setFilter: setFilter,
    render: render,
    handleKeydown: handleKeydown,
    getTasksForDate: getTasksForDate,
    CATEGORIES: CATEGORIES,
    PRIORITIES: PRIORITIES,
  };
})();
