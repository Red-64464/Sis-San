/* ═══════════════════════════════════════════
   notes.js — Bloc-notes style Notion
   ═══════════════════════════════════════════ */
var Notes = (function () {
  var currentNoteId = null;
  var searchQuery = "";

  var NOTE_COLORS = [
    { id: "pink", bg: "#fff0f5", border: "#f8bbd0" },
    { id: "lavender", bg: "#f5f0ff", border: "#e0d4ff" },
    { id: "mint", bg: "#f0faf8", border: "#b2dfdb" },
    { id: "peach", bg: "#fff8f0", border: "#ffd6b0" },
    { id: "sky", bg: "#f0f8ff", border: "#b3d9ff" },
    { id: "white", bg: "#ffffff", border: "#f5d8e0" },
  ];

  var NOTE_EMOJIS = [
    "📝",
    "💡",
    "🌸",
    "🎨",
    "📚",
    "🧪",
    "⚗️",
    "🧬",
    "📐",
    "🌍",
    "🎵",
    "💭",
    "✨",
    "🌙",
    "⚡",
  ];

  /* ── Storage ── */
  function getNotes() {
    return Storage.get("notes", []);
  }
  function setNotes(arr) {
    Storage.set("notes", arr);
  }

  /* ── Init ── */
  function init() {
    renderList();
    // If there's a current note open, re-show editor; else show list
    if (currentNoteId) {
      showEditor(currentNoteId);
    } else {
      showView("list");
    }
  }

  /* ── Views ── */
  function showView(v) {
    var list = document.getElementById("notes-view-list");
    var editor = document.getElementById("notes-view-editor");
    if (v === "list") {
      if (list) list.style.display = "block";
      if (editor) editor.style.display = "none";
      currentNoteId = null;
      renderList();
    } else {
      if (list) list.style.display = "none";
      if (editor) editor.style.display = "block";
    }
  }

  /* ── List ── */
  function renderList() {
    var wrap = document.getElementById("notes-list");
    if (!wrap) return;
    var notes = getNotes();
    // Filter by search
    if (searchQuery) {
      var q = searchQuery.toLowerCase();
      notes = notes.filter(function (n) {
        return (
          n.title.toLowerCase().includes(q) ||
          (n.content || "").toLowerCase().includes(q)
        );
      });
    }
    // Sort by last updated
    notes.sort(function (a, b) {
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });

    if (notes.length === 0) {
      wrap.innerHTML =
        '<div class="todo-empty">' +
        '<span class="todo-empty-icon">📝</span>' +
        "<p>" +
        (searchQuery ? "Aucun résultat" : "Crée ta première note !") +
        "</p>" +
        "</div>";
      return;
    }

    wrap.innerHTML = notes
      .map(function (n) {
        var col =
          NOTE_COLORS.find(function (c) {
            return c.id === n.color;
          }) || NOTE_COLORS[5];
        var preview = (n.content || "").replace(/<[^>]+>/g, "").slice(0, 80);
        return (
          '<div class="note-card" style="background:' +
          col.bg +
          ";border-color:" +
          col.border +
          ';" onclick="Notes.open(\'' +
          n.id +
          "')\">" +
          '<div class="note-card-head">' +
          '<span class="note-card-emoji">' +
          (n.emoji || "📝") +
          "</span>" +
          '<span class="note-card-title">' +
          _esc(n.title || "Sans titre") +
          "</span>" +
          '<button class="cal-detail-close" onclick="event.stopPropagation();Notes.deleteNote(\'' +
          n.id +
          "')\">✕</button>" +
          "</div>" +
          '<div class="note-card-preview">' +
          _esc(preview) +
          "</div>" +
          '<div class="note-card-date">' +
          _formatDate(n.updatedAt) +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function setSearch(q) {
    searchQuery = q;
    renderList();
  }

  /* ── Open/Create ── */
  function newNote() {
    var notes = getNotes();
    var note = {
      id: String(Date.now()),
      title: "",
      content: "",
      emoji: "📝",
      color: "white",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    notes.unshift(note);
    setNotes(notes);
    open(note.id);
  }

  function open(id) {
    currentNoteId = id;
    showEditor(id);
  }

  function showEditor(id) {
    var notes = getNotes();
    var note = notes.find(function (n) {
      return n.id === id;
    });
    if (!note) {
      showView("list");
      return;
    }

    var titleEl = document.getElementById("note-title");
    var editorEl = document.getElementById("note-editor");
    var emojiEl = document.getElementById("note-emoji-display");
    if (titleEl) titleEl.value = note.title || "";
    if (editorEl) editorEl.innerHTML = note.content || "";
    if (emojiEl) emojiEl.textContent = note.emoji || "📝";

    // Set color buttons
    renderColorBar(note.color);

    showView("editor");
  }

  function renderColorBar(activeColor) {
    var wrap = document.getElementById("note-color-bar");
    if (!wrap) return;
    wrap.innerHTML = NOTE_COLORS.map(function (c) {
      return (
        '<button class="note-color-dot' +
        (c.id === activeColor ? " active" : "") +
        '" style="background:' +
        c.bg +
        ";border-color:" +
        c.border +
        ';" onclick="Notes.setColor(\'' +
        c.id +
        "')\"></button>"
      );
    }).join("");
  }

  function setColor(colorId) {
    _saveCurrentNote();
    var notes = getNotes();
    notes = notes.map(function (n) {
      if (n.id === currentNoteId) n.color = colorId;
      return n;
    });
    setNotes(notes);
    renderColorBar(colorId);
    // Update editor bg
    var editorArea = document.getElementById("note-editor-area");
    var col =
      NOTE_COLORS.find(function (c) {
        return c.id === colorId;
      }) || NOTE_COLORS[5];
    if (editorArea) {
      editorArea.style.background = col.bg;
      editorArea.style.borderColor = col.border;
    }
  }

  function openEmojiPicker() {
    var wrap = document.getElementById("note-emoji-panel");
    if (!wrap) return;
    wrap.innerHTML = NOTE_EMOJIS.map(function (e) {
      return (
        '<button class="fc-color-swatch" style="background:var(--card2);font-size:1.3rem;width:40px;height:40px;" onclick="Notes.setEmoji(\'' +
        e +
        "')\">" +
        e +
        "</button>"
      );
    }).join("");
    wrap.style.display = wrap.style.display === "flex" ? "none" : "flex";
  }

  function setEmoji(emoji) {
    var el = document.getElementById("note-emoji-display");
    if (el) el.textContent = emoji;
    var notes = getNotes().map(function (n) {
      if (n.id === currentNoteId) n.emoji = emoji;
      return n;
    });
    setNotes(notes);
    var wrap = document.getElementById("note-emoji-panel");
    if (wrap) wrap.style.display = "none";
  }

  /* ── Formatting ── */
  function format(cmd, val) {
    document.execCommand(cmd, false, val || null);
    document.getElementById("note-editor").focus();
    _saveCurrentNote();
  }

  function insertBullet() {
    document.execCommand("insertUnorderedList", false, null);
    document.getElementById("note-editor").focus();
    _saveCurrentNote();
  }

  function insertHeading() {
    var sel = window.getSelection();
    if (!sel.rangeCount) return;
    var text = sel.toString() || "Titre";
    document.execCommand(
      "insertHTML",
      false,
      "<h3>" + text + "</h3><p><br></p>",
    );
    document.getElementById("note-editor").focus();
    _saveCurrentNote();
  }

  /* ── Auto-save ── */
  var _saveTimer = null;
  function onInput() {
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(_saveCurrentNote, 600);
  }

  function _saveCurrentNote() {
    if (!currentNoteId) return;
    var titleEl = document.getElementById("note-title");
    var editorEl = document.getElementById("note-editor");
    if (!editorEl) return;
    var notes = getNotes().map(function (n) {
      if (n.id === currentNoteId) {
        n.title = titleEl ? titleEl.value : n.title;
        n.content = editorEl.innerHTML;
        n.updatedAt = Date.now();
      }
      return n;
    });
    setNotes(notes);
  }

  function saveAndBack() {
    _saveCurrentNote();
    showView("list");
  }

  /* ── Delete ── */
  function deleteNote(id) {
    var notes = getNotes().filter(function (n) {
      return n.id !== id;
    });
    setNotes(notes);
    if (currentNoteId === id) showView("list");
    else renderList();
  }

  function deleteCurrentNote() {
    if (!currentNoteId) {
      showView("list");
      return;
    }
    if (!confirm("Supprimer cette note ?")) return;
    deleteNote(currentNoteId);
  }

  /* ── Helpers ── */
  function _esc(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function _formatDate(ts) {
    if (!ts) return "";
    var d = new Date(ts);
    var now = new Date();
    var diff = Math.floor((now - d) / 60000);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return diff + " min";
    if (diff < 1440) return Math.floor(diff / 60) + "h";
    return d.getDate() + "/" + (d.getMonth() + 1);
  }

  return {
    init: init,
    newNote: newNote,
    open: open,
    saveAndBack: saveAndBack,
    deleteNote: deleteNote,
    deleteCurrentNote: deleteCurrentNote,
    setSearch: setSearch,
    setColor: setColor,
    openEmojiPicker: openEmojiPicker,
    setEmoji: setEmoji,
    format: format,
    insertBullet: insertBullet,
    insertHeading: insertHeading,
    onInput: onInput,
  };
})();
