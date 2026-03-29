/* ═══════════════════════════════════════════
   flashcards.js — Système de Flashcards style Quizlet
   ═══════════════════════════════════════════ */
var Flashcards = (function () {
  var currentDeckId = null;
  var currentSession = null; // { mode, cards, index, score, flipped }
  var editingCardId = null;
  var editingDeckId = null;
  var selectedColor = "#e8739a";
  var selectedEmoji = "📚";

  var DECK_COLORS = [
    "#e8739a",
    "#a78bfa",
    "#00f5c3",
    "#ffd93d",
    "#ff914d",
    "#60a5fa",
    "#f472b6",
    "#34d399",
  ];

  var DECK_EMOJIS = [
    "📚",
    "🧪",
    "⚗️",
    "🧬",
    "📐",
    "📏",
    "🔢",
    "🔬",
    "🌍",
    "🗺️",
    "🎨",
    "📝",
    "🎵",
    "🏛️",
    "💡",
    "🧠",
    "✏️",
    "🖊️",
    "📖",
    "🌿",
    "⚡",
    "🧲",
    "🔭",
    "🌙",
    "🌊",
    "🧮",
    "📊",
    "📈",
    "🖥️",
    "💻",
    "🇧🇪",
    "🇫🇷",
    "🇬🇧",
    "🇩🇪",
    "🇪🇸",
    "🎭",
    "⚽",
    "🎯",
    "🏆",
    "🌸",
  ];

  /* ── Storage ── */
  function getDecks() {
    return Storage.get("fc_decks", []);
  }
  function setDecks(d) {
    Storage.set("fc_decks", d);
  }

  /* ── Init ── */
  function init() {
    showView("decks");
  }

  /* ── View Router ── */
  function showView(name) {
    document.querySelectorAll(".fc-view").forEach(function (v) {
      v.classList.remove("active");
    });
    var el = document.getElementById("fc-view-" + name);
    if (el) el.classList.add("active");
    if (name === "decks") renderDecks();
    else if (name === "editor") renderEditor();
  }

  /* ══════════════════════════════
     DECK LIST
  ══════════════════════════════ */
  function renderDecks() {
    var wrap = document.getElementById("fc-deck-list");
    if (!wrap) return;
    var decks = getDecks();
    if (decks.length === 0) {
      wrap.innerHTML =
        '<div class="todo-empty">' +
        '<span class="todo-empty-icon">🃏</span>' +
        "<p>Crée ton premier paquet de fiches !</p>" +
        "</div>";
      return;
    }
    wrap.innerHTML = decks
      .map(function (d) {
        var mastery =
          d.cards.length > 0 && d.scores && d.scores.length > 0
            ? Math.round((d.scores[d.scores.length - 1] / d.cards.length) * 100)
            : null;
        return (
          '<div class="fc-deck-item" onclick="Flashcards.openDeck(\'' +
          d.id +
          "')\">" +
          '<div class="fc-deck-color" style="background:' +
          d.color +
          '">' +
          '<span class="fc-deck-emoji">' +
          (d.emoji || "📚") +
          "</span>" +
          "</div>" +
          '<div class="fc-deck-info">' +
          '<div class="fc-deck-name">' +
          _esc(d.name) +
          "</div>" +
          '<div class="fc-deck-count">' +
          d.cards.length +
          " carte" +
          (d.cards.length !== 1 ? "s" : "") +
          "</div>" +
          (mastery !== null
            ? '<div class="fc-deck-mastery"><div class="fc-deck-mastery-bar" style="width:' +
              mastery +
              '%"></div></div>'
            : "") +
          "</div>" +
          '<div style="display:flex;gap:4px;flex-shrink:0">' +
          '<button class="cal-detail-close" title="Modifier" onclick="event.stopPropagation();Flashcards.openEditDeck(\'' +
          d.id +
          "')\">✏️</button>" +
          '<button class="cal-detail-close" title="Supprimer" onclick="event.stopPropagation();Flashcards.deleteDeck(\'' +
          d.id +
          "')\">✕</button>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function openDeck(id) {
    currentDeckId = id;
    showView("editor");
  }

  function openCreateDeck() {
    editingDeckId = null;
    selectedColor = DECK_COLORS[0];
    selectedEmoji = "📚";
    document.getElementById("fc-deck-name").value = "";
    document.getElementById("fc-create-modal-title").textContent =
      "🃏 Nouveau paquet";
    renderColorPick();
    renderEmojiPick();
    document.getElementById("fc-create-modal").classList.add("show");
    setTimeout(function () {
      var inp = document.getElementById("fc-deck-name");
      if (inp) inp.focus();
    }, 120);
  }

  function openEditDeck(id) {
    editingDeckId = id;
    var deck = getDecks().find(function (d) {
      return d.id === id;
    });
    if (!deck) return;
    selectedColor = deck.color;
    selectedEmoji = deck.emoji || "📚";
    document.getElementById("fc-deck-name").value = deck.name;
    document.getElementById("fc-create-modal-title").textContent =
      "✏️ Modifier le paquet";
    renderColorPick();
    renderEmojiPick();
    document.getElementById("fc-create-modal").classList.add("show");
  }

  function renderColorPick() {
    var wrap = document.getElementById("fc-color-pick");
    if (!wrap) return;
    wrap.innerHTML = DECK_COLORS.map(function (c) {
      return (
        '<button class="fc-color-swatch' +
        (c === selectedColor ? " selected" : "") +
        '" style="background:' +
        c +
        '" onclick="Flashcards.pickColor(\'' +
        c +
        '\')" aria-label="Couleur ' +
        c +
        '"></button>'
      );
    }).join("");
  }

  function pickColor(c) {
    selectedColor = c;
    renderColorPick();
  }

  function renderEmojiPick() {
    var wrap = document.getElementById("fc-emoji-pick");
    if (!wrap) return;
    wrap.innerHTML = DECK_EMOJIS.map(function (e) {
      return (
        '<button class="fc-emoji-swatch' +
        (e === selectedEmoji ? " selected" : "") +
        '" onclick="Flashcards.pickEmoji(\'' +
        e +
        "')\">" +
        e +
        "</button>"
      );
    }).join("");
  }

  function pickEmoji(e) {
    selectedEmoji = e;
    renderEmojiPick();
  }

  function closeCreateModal() {
    document.getElementById("fc-create-modal").classList.remove("show");
    editingDeckId = null;
  }

  function confirmCreateDeck() {
    var name = document.getElementById("fc-deck-name").value.trim();
    if (!name) {
      document.getElementById("fc-deck-name").focus();
      return;
    }
    var decks = getDecks();
    if (editingDeckId) {
      decks = decks.map(function (d) {
        if (d.id === editingDeckId) {
          d.name = name;
          d.color = selectedColor;
          d.emoji = selectedEmoji;
        }
        return d;
      });
      editingDeckId = null;
    } else {
      decks.push({
        id: String(Date.now()),
        name: name,
        color: selectedColor,
        emoji: selectedEmoji,
        cards: [],
        scores: [],
      });
    }
    setDecks(decks);
    closeCreateModal();
    renderDecks();
  }

  function deleteDeck(id) {
    if (!confirm("Supprimer ce paquet et toutes ses cartes ?")) return;
    var decks = getDecks().filter(function (d) {
      return d.id !== id;
    });
    setDecks(decks);
    renderDecks();
  }

  /* ══════════════════════════════
     DECK EDITOR
  ══════════════════════════════ */
  function renderEditor() {
    var deck = getDecks().find(function (d) {
      return d.id === currentDeckId;
    });
    if (!deck) {
      showView("decks");
      return;
    }

    var title = document.getElementById("fc-editor-title");
    if (title) title.textContent = deck.name;

    // Color accent strip
    var strip = document.getElementById("fc-editor-strip");
    if (strip) strip.style.background = deck.color;

    var wrap = document.getElementById("fc-card-list");
    if (!wrap) return;

    if (deck.cards.length === 0) {
      wrap.innerHTML =
        '<div class="todo-empty"><span class="todo-empty-icon">📝</span><p>Ajoute ta première carte !</p></div>';
      return;
    }
    wrap.innerHTML = deck.cards
      .map(function (c, i) {
        return (
          '<div class="fc-card-item">' +
          '<div class="fc-card-num">' +
          (i + 1) +
          "</div>" +
          '<div class="fc-card-content">' +
          '<div class="fc-card-q-text">' +
          _esc(c.q) +
          "</div>" +
          '<div class="fc-card-a-text">' +
          _esc(c.a) +
          "</div>" +
          "</div>" +
          '<div style="display:flex;gap:4px;flex-shrink:0">' +
          '<button class="cal-detail-close" title="Modifier" onclick="Flashcards.openEditCard(\'' +
          c.id +
          "')\">✏️</button>" +
          '<button class="cal-detail-close" title="Supprimer" onclick="Flashcards.deleteCard(\'' +
          c.id +
          "')\">✕</button>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function openAddCard() {
    editingCardId = null;
    document.getElementById("fc-card-modal-title").textContent =
      "📝 Nouvelle carte";
    document.getElementById("fc-card-q").value = "";
    document.getElementById("fc-card-a").value = "";
    document.getElementById("fc-card-modal").classList.add("show");
    setTimeout(function () {
      var el = document.getElementById("fc-card-q");
      if (el) el.focus();
    }, 120);
  }

  function openEditCard(cardId) {
    editingCardId = cardId;
    var deck = getDecks().find(function (d) {
      return d.id === currentDeckId;
    });
    var card = deck
      ? deck.cards.find(function (c) {
          return c.id === cardId;
        })
      : null;
    if (!card) return;
    document.getElementById("fc-card-modal-title").textContent =
      "✏️ Modifier la carte";
    document.getElementById("fc-card-q").value = card.q;
    document.getElementById("fc-card-a").value = card.a;
    document.getElementById("fc-card-modal").classList.add("show");
  }

  function closeCardModal() {
    document.getElementById("fc-card-modal").classList.remove("show");
    editingCardId = null;
  }

  function confirmCard() {
    var q = document.getElementById("fc-card-q").value.trim();
    var a = document.getElementById("fc-card-a").value.trim();
    if (!q) {
      document.getElementById("fc-card-q").focus();
      return;
    }
    if (!a) {
      document.getElementById("fc-card-a").focus();
      return;
    }
    var decks = getDecks();
    decks = decks.map(function (d) {
      if (d.id !== currentDeckId) return d;
      if (editingCardId) {
        d.cards = d.cards.map(function (c) {
          if (c.id === editingCardId) {
            c.q = q;
            c.a = a;
          }
          return c;
        });
      } else {
        d.cards.push({ id: String(Date.now()), q: q, a: a });
      }
      return d;
    });
    setDecks(decks);
    closeCardModal();
    renderEditor();
  }

  function deleteCard(cardId) {
    var decks = getDecks();
    decks = decks.map(function (d) {
      if (d.id !== currentDeckId) return d;
      d.cards = d.cards.filter(function (c) {
        return c.id !== cardId;
      });
      return d;
    });
    setDecks(decks);
    renderEditor();
  }

  /* ══════════════════════════════
     STUDY MODE PICKER
  ══════════════════════════════ */
  function startStudyPicker() {
    var deck = getDecks().find(function (d) {
      return d.id === currentDeckId;
    });
    if (!deck || deck.cards.length === 0) {
      alert("Ajoute au moins une carte avant d'étudier !");
      return;
    }
    showView("study-pick");
  }

  /* ══════════════════════════════
     STUDY — Core
  ══════════════════════════════ */
  function startStudy(mode) {
    var deck = getDecks().find(function (d) {
      return d.id === currentDeckId;
    });
    if (!deck || deck.cards.length === 0) return;
    // Shuffle cards
    var cards = deck.cards.slice().sort(function () {
      return Math.random() - 0.5;
    });
    currentSession = {
      mode: mode,
      cards: cards,
      index: 0,
      score: 0,
      flipped: false,
    };
    if (mode === "classic") _renderClassic();
    else if (mode === "quiz") _renderQuiz();
    else if (mode === "write") _renderWrite();
    showView(mode);
  }

  /* ── Classic Mode ── */
  function _renderClassic() {
    var s = currentSession;
    var card = s.cards[s.index];
    var prog = document.getElementById("fc-classic-progress");
    if (prog) prog.textContent = s.index + 1 + " / " + s.cards.length;
    var qEl = document.getElementById("fc-classic-q");
    var aEl = document.getElementById("fc-classic-a");
    if (qEl) qEl.textContent = card.q;
    if (aEl) aEl.textContent = card.a;
    var inner = document.getElementById("fc-flip-inner");
    if (inner) {
      inner.classList.remove("flipped");
      s.flipped = false;
    }
  }

  function flipCard() {
    if (!currentSession) return;
    var inner = document.getElementById("fc-flip-inner");
    if (!inner) return;
    currentSession.flipped = !currentSession.flipped;
    inner.classList.toggle("flipped", currentSession.flipped);
  }

  function classicNext(knew) {
    if (!currentSession) return;
    if (knew) currentSession.score++;
    currentSession.index++;
    if (currentSession.index >= currentSession.cards.length) {
      _showResult();
    } else {
      _renderClassic();
    }
  }

  /* ── Quiz Mode ── */
  function _renderQuiz() {
    var s = currentSession;
    var card = s.cards[s.index];
    var prog = document.getElementById("fc-quiz-progress");
    if (prog) prog.textContent = s.index + 1 + " / " + s.cards.length;
    var qEl = document.getElementById("fc-quiz-q");
    if (qEl) qEl.textContent = card.q;
    var feedback = document.getElementById("fc-quiz-feedback");
    if (feedback) feedback.style.display = "none";

    // Build 4 options (1 correct + up to 3 random wrong answers)
    var deck = getDecks().find(function (d) {
      return d.id === currentDeckId;
    });
    var allAnswers = deck
      ? deck.cards
          .map(function (c) {
            return c.a;
          })
          .filter(function (a) {
            return a !== card.a;
          })
      : [];
    allAnswers.sort(function () {
      return Math.random() - 0.5;
    });
    var options = [card.a].concat(allAnswers.slice(0, 3));
    options.sort(function () {
      return Math.random() - 0.5;
    });

    var wrap = document.getElementById("fc-quiz-options");
    if (!wrap) return;
    wrap.innerHTML = options
      .map(function (opt) {
        var safeOpt = _escAttr(opt);
        var safeCorrect = _escAttr(card.a);
        return (
          '<button class="fc-quiz-opt" data-opt="' +
          safeOpt +
          '" data-correct="' +
          safeCorrect +
          '" onclick="Flashcards._handleQuizOpt(this)">' +
          _esc(opt) +
          "</button>"
        );
      })
      .join("");
  }

  function _handleQuizOpt(btn) {
    var chosen = btn.getAttribute("data-opt");
    var correct = btn.getAttribute("data-correct");
    _checkQuiz(btn, chosen, correct);
  }

  function _checkQuiz(btn, chosen, correct) {
    var buttons = document.querySelectorAll(".fc-quiz-opt");
    buttons.forEach(function (b) {
      b.disabled = true;
      var bOpt = b.getAttribute("data-opt");
      if (b === btn) {
        b.classList.add(chosen === correct ? "correct" : "wrong");
      } else if (bOpt === correct) {
        b.classList.add("correct");
      }
    });

    var isCorrect = chosen === correct;
    var feedback = document.getElementById("fc-quiz-feedback");
    if (feedback) {
      feedback.style.display = "block";
      feedback.className =
        "fc-quiz-feedback " +
        (isCorrect ? "fc-feedback-ok" : "fc-feedback-err");
      feedback.textContent = isCorrect
        ? "✓ Correct !"
        : "✕ La bonne réponse était : " + correct;
    }
    if (isCorrect) currentSession.score++;

    setTimeout(function () {
      currentSession.index++;
      if (currentSession.index >= currentSession.cards.length) {
        _showResult();
      } else {
        _renderQuiz();
      }
    }, 1600);
  }

  /* ── Write Mode ── */
  function _renderWrite() {
    var s = currentSession;
    var card = s.cards[s.index];
    var prog = document.getElementById("fc-write-progress");
    if (prog) prog.textContent = s.index + 1 + " / " + s.cards.length;
    var qEl = document.getElementById("fc-write-q");
    if (qEl) qEl.textContent = card.q;
    var inp = document.getElementById("fc-write-input");
    if (inp) {
      inp.value = "";
      inp.disabled = false;
    }
    var feedback = document.getElementById("fc-write-feedback");
    if (feedback) {
      feedback.style.display = "none";
      feedback.className = "fc-write-feedback";
    }
    setTimeout(function () {
      var i = document.getElementById("fc-write-input");
      if (i) i.focus();
    }, 120);
  }

  function checkWrite() {
    if (!currentSession) return;
    var input = document.getElementById("fc-write-input");
    if (!input || input.disabled) return;
    var card = currentSession.cards[currentSession.index];
    var answer = input.value.trim().toLowerCase();
    var correct = card.a.trim().toLowerCase();
    var isCorrect = answer === correct;

    var feedback = document.getElementById("fc-write-feedback");
    if (feedback) {
      feedback.style.display = "block";
      feedback.className =
        "fc-write-feedback " +
        (isCorrect ? "fc-feedback-ok" : "fc-feedback-err");
      feedback.textContent = isCorrect
        ? "✓ Parfait !"
        : "✕ Réponse attendue : " + card.a;
    }
    input.disabled = true;
    if (isCorrect) currentSession.score++;

    setTimeout(function () {
      currentSession.index++;
      if (currentSession.index >= currentSession.cards.length) {
        _showResult();
      } else {
        _renderWrite();
      }
    }, 1600);
  }

  /* ── Result ── */
  function _showResult() {
    var s = currentSession;
    var pct = Math.round((s.score / s.cards.length) * 100);
    var icon = pct >= 80 ? "🎉" : pct >= 50 ? "💪" : "📚";
    var iconEl = document.querySelector("#fc-view-result .fc-result-icon");
    if (iconEl) iconEl.textContent = icon;
    var scoreEl = document.getElementById("fc-result-score");
    if (scoreEl)
      scoreEl.textContent =
        s.score + " / " + s.cards.length + " (" + pct + "%)";
    // Save score to deck history
    var decks = getDecks().map(function (d) {
      if (d.id === currentDeckId) {
        if (!d.scores) d.scores = [];
        d.scores.push(s.score);
        if (d.scores.length > 10) d.scores = d.scores.slice(-10);
      }
      return d;
    });
    setDecks(decks);
    // XP reward
    if (s.score > 0) Storage.addXP(s.score * 2);
    showView("result");
  }

  /* ── Modal close on backdrop ── */
  function closeModal(e, id) {
    if (e.target === document.getElementById(id)) {
      document.getElementById(id).classList.remove("show");
    }
  }

  /* ── Helpers ── */
  function _esc(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function _escAttr(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  return {
    init: init,
    showView: showView,
    renderDecks: renderDecks,
    openDeck: openDeck,
    openCreateDeck: openCreateDeck,
    openEditDeck: openEditDeck,
    pickColor: pickColor,
    pickEmoji: pickEmoji,
    closeCreateModal: closeCreateModal,
    confirmCreateDeck: confirmCreateDeck,
    deleteDeck: deleteDeck,
    renderEditor: renderEditor,
    openAddCard: openAddCard,
    openEditCard: openEditCard,
    closeCardModal: closeCardModal,
    confirmCard: confirmCard,
    deleteCard: deleteCard,
    startStudyPicker: startStudyPicker,
    startStudy: startStudy,
    flipCard: flipCard,
    classicNext: classicNext,
    _handleQuizOpt: _handleQuizOpt,
    checkWrite: checkWrite,
    closeModal: closeModal,
  };
})();
