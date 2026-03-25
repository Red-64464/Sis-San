/* ═══════════════════════════════════════════
   gamification.js — XP, Levels, Badges
   ═══════════════════════════════════════════ */
var Gamification = (function () {
  var BADGE_DEFS = [
    // ── Sessions ──
    {
      id: "first_pomo",
      icon: "🍅",
      name: "Premier Pomodoro",
      desc: "Terminer ta toute première session Focus.",
      check: function () {
        return Storage.getSessions().length >= 1;
      },
    },
    {
      id: "pomo_5",
      icon: "🌱",
      name: "5 Pomodoros",
      desc: "5 sessions complétées. L'habitude se forme !",
      check: function () {
        return Storage.getSessions().length >= 5;
      },
    },
    {
      id: "pomo_10",
      icon: "🔥",
      name: "10 Pomodoros",
      desc: "10 sessions — tu es lancée !",
      check: function () {
        return Storage.getSessions().length >= 10;
      },
    },
    {
      id: "pomo_25",
      icon: "⚡",
      name: "25 Pomodoros",
      desc: "25 sessions — régularité au top.",
      check: function () {
        return Storage.getSessions().length >= 25;
      },
    },
    {
      id: "pomo_50",
      icon: "💪",
      name: "50 Pomodoros",
      desc: "50 sessions — une vraie machine !",
      check: function () {
        return Storage.getSessions().length >= 50;
      },
    },
    {
      id: "pomo_100",
      icon: "💯",
      name: "100 Pomodoros",
      desc: "100 sessions — niveau légendaire !",
      check: function () {
        return Storage.getSessions().length >= 100;
      },
    },
    {
      id: "pomo_200",
      icon: "🚀",
      name: "200 Pomodoros",
      desc: "200 sessions — tu ne t'arrêtes plus !",
      check: function () {
        return Storage.getSessions().length >= 200;
      },
    },
    {
      id: "pomo_500",
      icon: "🏆",
      name: "500 Pomodoros",
      desc: "500 sessions — Hall of Fame absolu.",
      check: function () {
        return Storage.getSessions().length >= 500;
      },
    },

    // ── Streaks ──
    {
      id: "streak_3",
      icon: "⚡",
      name: "3 jours de suite",
      desc: "3 jours consécutifs de travail.",
      check: function () {
        return Storage.getStreak() >= 3;
      },
    },
    {
      id: "streak_7",
      icon: "🌟",
      name: "1 semaine",
      desc: "7 jours consécutifs — super !",
      check: function () {
        return Storage.getStreak() >= 7;
      },
    },
    {
      id: "streak_14",
      icon: "🌙",
      name: "2 semaines",
      desc: "14 jours de suite — incroyable !",
      check: function () {
        return Storage.getStreak() >= 14;
      },
    },
    {
      id: "streak_21",
      icon: "💎",
      name: "3 semaines",
      desc: "21 jours — l'habitude est formée !",
      check: function () {
        return Storage.getStreak() >= 21;
      },
    },
    {
      id: "streak_30",
      icon: "👑",
      name: "1 mois",
      desc: "30 jours consécutifs — royale !",
      check: function () {
        return Storage.getStreak() >= 30;
      },
    },
    {
      id: "streak_60",
      icon: "🌈",
      name: "2 mois",
      desc: "60 jours — quelle discipline !",
      check: function () {
        return Storage.getStreak() >= 60;
      },
    },
    {
      id: "streak_100",
      icon: "🦁",
      name: "100 jours",
      desc: "100 jours consécutifs — légendaire.",
      check: function () {
        return Storage.getStreak() >= 100;
      },
    },
    {
      id: "streak_365",
      icon: "🌍",
      name: "1 an !",
      desc: "365 jours de suite — MYTHIQUE !",
      check: function () {
        return Storage.getStreak() >= 365;
      },
    },

    // ── Tasks ──
    {
      id: "task_1",
      icon: "✅",
      name: "Première tâche",
      desc: "Ta toute première tâche cochée.",
      check: function () {
        return Storage.getTodos().some(function (x) {
          return x.done;
        });
      },
    },
    {
      id: "task_5",
      icon: "📝",
      name: "5 tâches",
      desc: "5 tâches complétées.",
      check: function () {
        return (
          Storage.getTodos().filter(function (x) {
            return x.done;
          }).length >= 5
        );
      },
    },
    {
      id: "task_10",
      icon: "📋",
      name: "10 tâches",
      desc: "10 tâches cochées !",
      check: function () {
        return (
          Storage.getTodos().filter(function (x) {
            return x.done;
          }).length >= 10
        );
      },
    },
    {
      id: "task_25",
      icon: "📚",
      name: "25 tâches",
      desc: "25 tâches complétées — sérieuse !",
      check: function () {
        return (
          Storage.getTodos().filter(function (x) {
            return x.done;
          }).length >= 25
        );
      },
    },
    {
      id: "task_50",
      icon: "🎯",
      name: "50 tâches",
      desc: "50 tâches — machine de guerre !",
      check: function () {
        return (
          Storage.getTodos().filter(function (x) {
            return x.done;
          }).length >= 50
        );
      },
    },
    {
      id: "task_100",
      icon: "🧠",
      name: "100 tâches",
      desc: "100 tâches complétées — ÉLITE.",
      check: function () {
        return (
          Storage.getTodos().filter(function (x) {
            return x.done;
          }).length >= 100
        );
      },
    },

    // ── Focus Time ──
    {
      id: "hour_1",
      icon: "⏰",
      name: "1h de focus",
      desc: "1 heure de focus total cumulée.",
      check: function () {
        return (
          Storage.getSessions().reduce(function (a, b) {
            return a + b.duration;
          }, 0) >= 60
        );
      },
    },
    {
      id: "hour_5",
      icon: "⏱",
      name: "5h de focus",
      desc: "5 heures de focus cumulées.",
      check: function () {
        return (
          Storage.getSessions().reduce(function (a, b) {
            return a + b.duration;
          }, 0) >= 300
        );
      },
    },
    {
      id: "hour_10",
      icon: "🏅",
      name: "10h de focus",
      desc: "10 heures — quasi pro !",
      check: function () {
        return (
          Storage.getSessions().reduce(function (a, b) {
            return a + b.duration;
          }, 0) >= 600
        );
      },
    },
    {
      id: "hour_25",
      icon: "🥇",
      name: "25h de focus",
      desc: "25 heures de travail intense.",
      check: function () {
        return (
          Storage.getSessions().reduce(function (a, b) {
            return a + b.duration;
          }, 0) >= 1500
        );
      },
    },
    {
      id: "hour_50",
      icon: "🔮",
      name: "50h de focus",
      desc: "50 heures — experte confirmée !",
      check: function () {
        return (
          Storage.getSessions().reduce(function (a, b) {
            return a + b.duration;
          }, 0) >= 3000
        );
      },
    },
    {
      id: "hour_100",
      icon: "🫡",
      name: "100h de focus",
      desc: "100 heures — absolument élite.",
      check: function () {
        return (
          Storage.getSessions().reduce(function (a, b) {
            return a + b.duration;
          }, 0) >= 6000
        );
      },
    },

    // ── Mood ──
    {
      id: "mood_7",
      icon: "😊",
      name: "7 jours d'humeur",
      desc: "7 humeurs enregistrées.",
      check: function () {
        return Storage.getMoods().length >= 7;
      },
    },
    {
      id: "mood_30",
      icon: "😄",
      name: "30 jours d'humeur",
      desc: "30 humeurs enregistrées — super suivi !",
      check: function () {
        return Storage.getMoods().length >= 30;
      },
    },
    {
      id: "mood_positive",
      icon: "🤩",
      name: "Toujours positive",
      desc: "10 humeurs positives (😊 ou 🔥) de suite.",
      check: function () {
        var m = Storage.getMoods().slice(-10);
        return (
          m.length >= 10 &&
          m.every(function (x) {
            return x.mood === "😊" || x.mood === "🔥";
          })
        );
      },
    },

    // ── Time of Day ──
    {
      id: "night_owl",
      icon: "🦉",
      name: "Noctambule",
      desc: "Session après 22h — tu veilles tard !",
      check: function () {
        return Storage.getSessions().some(function (s) {
          var h = parseInt(s.time);
          return h >= 22 || h < 5;
        });
      },
    },
    {
      id: "early_bird",
      icon: "🌅",
      name: "Lève-tôt",
      desc: "Session avant 7h du matin — courageuse !",
      check: function () {
        return Storage.getSessions().some(function (s) {
          var h = parseInt(s.time);
          return h >= 5 && h < 7;
        });
      },
    },
    {
      id: "morning_star",
      icon: "☀️",
      name: "Étoile du matin",
      desc: "Session entre 6h et 9h.",
      check: function () {
        return Storage.getSessions().some(function (s) {
          var h = parseInt(s.time);
          return h >= 6 && h <= 9;
        });
      },
    },
    {
      id: "weekend_warrior",
      icon: "🎮",
      name: "Guerrière du week-end",
      desc: "Session un samedi ou dimanche.",
      check: function () {
        return Storage.getSessions().some(function (s) {
          var d = new Date(s.date + "T12:00:00");
          return d.getDay() === 0 || d.getDay() === 6;
        });
      },
    },
    {
      id: "monday_motivation",
      icon: "📅",
      name: "Lundi motivé",
      desc: "Commencer la semaine par une session.",
      check: function () {
        return Storage.getSessions().some(function (s) {
          var d = new Date(s.date + "T12:00:00");
          return d.getDay() === 1;
        });
      },
    },

    // ── Daily High Score ──
    {
      id: "daily_3",
      icon: "🔱",
      name: "3 sessions en 1 jour",
      desc: "3 sessions dans la même journée.",
      check: function () {
        var counts = {};
        Storage.getSessions().forEach(function (x) {
          counts[x.date] = (counts[x.date] || 0) + 1;
        });
        return Object.keys(counts).some(function (k) {
          return counts[k] >= 3;
        });
      },
    },
    {
      id: "daily_5",
      icon: "⚔️",
      name: "5 sessions en 1 jour",
      desc: "5 sessions dans la même journée — focus monstre !",
      check: function () {
        var counts = {};
        Storage.getSessions().forEach(function (x) {
          counts[x.date] = (counts[x.date] || 0) + 1;
        });
        return Object.keys(counts).some(function (k) {
          return counts[k] >= 5;
        });
      },
    },
    {
      id: "daily_10",
      icon: "🌋",
      name: "10 sessions en 1 jour",
      desc: "10 sessions en une seule journée — légendaire !",
      check: function () {
        var counts = {};
        Storage.getSessions().forEach(function (x) {
          counts[x.date] = (counts[x.date] || 0) + 1;
        });
        return Object.keys(counts).some(function (k) {
          return counts[k] >= 10;
        });
      },
    },

    // ── XP / Levels ──
    {
      id: "xp_100",
      icon: "⭐",
      name: "100 XP",
      desc: "100 points d'expérience accumulés.",
      check: function () {
        return Storage.getXP() >= 100;
      },
    },
    {
      id: "xp_500",
      icon: "🌠",
      name: "500 XP",
      desc: "500 XP — tu progresses vite !",
      check: function () {
        return Storage.getXP() >= 500;
      },
    },
    {
      id: "xp_1000",
      icon: "💫",
      name: "1 000 XP",
      desc: "1000 XP — impressionnant.",
      check: function () {
        return Storage.getXP() >= 1000;
      },
    },
    {
      id: "xp_5000",
      icon: "🌌",
      name: "5 000 XP",
      desc: "5000 XP — niveau absolu.",
      check: function () {
        return Storage.getXP() >= 5000;
      },
    },
    {
      id: "level_5",
      icon: "🥉",
      name: "Niveau 5",
      desc: "Atteindre le niveau 5.",
      check: function () {
        return Gamification.getLevel() >= 5;
      },
    },
    {
      id: "level_10",
      icon: "🥈",
      name: "Niveau 10",
      desc: "Atteindre le niveau 10.",
      check: function () {
        return Gamification.getLevel() >= 10;
      },
    },
    {
      id: "level_20",
      icon: "🥇",
      name: "Niveau 20",
      desc: "Atteindre le niveau 20.",
      check: function () {
        return Gamification.getLevel() >= 20;
      },
    },
    {
      id: "level_50",
      icon: "👸",
      name: "Niveau 50",
      desc: "Maîtresse absolue du level-up !",
      check: function () {
        return Gamification.getLevel() >= 50;
      },
    },

    // ── Spéciaux ──
    {
      id: "marathon",
      icon: "🏃",
      name: "Marathon",
      desc: "Session de 60+ minutes d'un coup !",
      check: function () {
        return Storage.getSessions().some(function (s) {
          return s.duration >= 60;
        });
      },
    },
    {
      id: "comeback",
      icon: "💪",
      name: "Retour en force",
      desc: "Reprendre après 3+ jours d'absence.",
      check: function () {
        var s = Storage.getSessions();
        for (var i = 1; i < s.length; i++) {
          var diff = (new Date(s[i].date) - new Date(s[i - 1].date)) / 86400000;
          if (diff >= 3) return true;
        }
        return false;
      },
    },
    {
      id: "perfect_week",
      icon: "🎖️",
      name: "Semaine parfaite",
      desc: "7 jours consécutifs au moins une fois.",
      check: function () {
        return Storage.getBestStreak() >= 7;
      },
    },
    {
      id: "best_streak_14",
      icon: "🏆",
      name: "Record 14 jours",
      desc: "Record personnel de 14 jours.",
      check: function () {
        return Storage.getBestStreak() >= 14;
      },
    },
    {
      id: "first_day",
      icon: "🎉",
      name: "Bienvenue !",
      desc: "Ouvrir l'application pour la première fois.",
      check: function () {
        return true;
      },
    },
  ];

  function getLevel(xp) {
    if (typeof xp === "undefined") xp = Storage.getXP();
    return Math.floor(xp / 100) + 1;
  }

  function getXPInLevel(xp) {
    if (typeof xp === "undefined") xp = Storage.getXP();
    return xp % 100;
  }

  function checkBadges() {
    var newlyUnlocked = [];
    BADGE_DEFS.forEach(function (b) {
      if (b.check()) {
        if (Storage.unlockBadge(b.id)) {
          newlyUnlocked.push(b);
        }
      }
    });
    // Show modal for each new badge (queued)
    newlyUnlocked.forEach(function (b) {
      showBadgeModal(b);
    });
    return newlyUnlocked;
  }

  var _badgeQueue = [];
  var _badgeModalOpen = false;

  function showBadgeModal(badge) {
    _badgeQueue.push(badge);
    if (!_badgeModalOpen) _processNextBadge();
  }

  function _processNextBadge() {
    if (_badgeQueue.length === 0) {
      _badgeModalOpen = false;
      return;
    }
    _badgeModalOpen = true;
    var badge = _badgeQueue.shift();
    var modal = document.getElementById("badge-modal");
    if (!modal) return;
    var iconEl = document.getElementById("badge-modal-icon");
    var nameEl = document.getElementById("badge-modal-name");
    var descEl = document.getElementById("badge-modal-desc");
    if (iconEl) iconEl.textContent = badge.icon;
    if (nameEl) nameEl.textContent = badge.name;
    if (descEl) descEl.textContent = badge.desc || "";
    modal.classList.add("show");

    // Celebratory sound
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.24);
      osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.36);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {}

    // Confetti!
    if (typeof Confetti !== "undefined") Confetti.launch();
  }

  function closeBadgeModal() {
    var modal = document.getElementById("badge-modal");
    if (modal) modal.classList.remove("show");
    _badgeModalOpen = false;
    setTimeout(_processNextBadge, 350);
  }

  function getAllBadges() {
    var unlocked = Storage.getBadges();
    return BADGE_DEFS.map(function (b) {
      return {
        id: b.id,
        icon: b.icon,
        name: b.name,
        desc: b.desc || "",
        unlocked: !!unlocked[b.id],
      };
    });
  }

  return {
    getLevel: getLevel,
    getXPInLevel: getXPInLevel,
    checkBadges: checkBadges,
    getAllBadges: getAllBadges,
    closeBadgeModal: closeBadgeModal,
    BADGE_DEFS: BADGE_DEFS,
  };
})();
