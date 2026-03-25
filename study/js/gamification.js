/* ═══════════════════════════════════════════
   gamification.js — XP, Levels, Badges
   ═══════════════════════════════════════════ */
var Gamification = (function () {
  var BADGE_DEFS = [
    {
      id: "first_pomo",
      icon: "🍅",
      name: "Premier Pomodoro",
      check: function () {
        return Storage.getSessions().length >= 1;
      },
    },
    {
      id: "pomo_10",
      icon: "🔥",
      name: "10 Pomodoros",
      check: function () {
        return Storage.getSessions().length >= 10;
      },
    },
    {
      id: "pomo_50",
      icon: "💪",
      name: "50 Pomodoros",
      check: function () {
        return Storage.getSessions().length >= 50;
      },
    },
    {
      id: "streak_3",
      icon: "⚡",
      name: "3 jours de suite",
      check: function () {
        return Storage.getStreak() >= 3;
      },
    },
    {
      id: "streak_7",
      icon: "🌟",
      name: "1 semaine",
      check: function () {
        return Storage.getStreak() >= 7;
      },
    },
    {
      id: "streak_30",
      icon: "👑",
      name: "1 mois",
      check: function () {
        return Storage.getStreak() >= 30;
      },
    },
    {
      id: "task_1",
      icon: "✅",
      name: "Première tâche",
      check: function () {
        var t = Storage.getTodos();
        return t.some(function (x) {
          return x.done;
        });
      },
    },
    {
      id: "task_25",
      icon: "📋",
      name: "25 tâches faites",
      check: function () {
        var t = Storage.getTodos();
        return (
          t.filter(function (x) {
            return x.done;
          }).length >= 25
        );
      },
    },
    {
      id: "hour_1",
      icon: "⏰",
      name: "1h de focus",
      check: function () {
        var s = Storage.getSessions();
        return (
          s.reduce(function (a, b) {
            return a + b.duration;
          }, 0) >= 60
        );
      },
    },
    {
      id: "hour_10",
      icon: "🏆",
      name: "10h de focus",
      check: function () {
        var s = Storage.getSessions();
        return (
          s.reduce(function (a, b) {
            return a + b.duration;
          }, 0) >= 600
        );
      },
    },
    {
      id: "mood_7",
      icon: "😊",
      name: "7 jours d'humeur",
      check: function () {
        return Storage.getMoods().length >= 7;
      },
    },
    {
      id: "night_owl",
      icon: "🦉",
      name: "Noctambule",
      check: function () {
        return Storage.getSessions().some(function (s) {
          var h = parseInt(s.time);
          return h >= 22 || h < 5;
        });
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
    // Show toast for each new badge
    newlyUnlocked.forEach(function (b, i) {
      setTimeout(function () {
        showBadgeToast(b);
      }, i * 1200);
    });
    return newlyUnlocked;
  }

  function showBadgeToast(badge) {
    // Sound
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}

    // Toast
    var toast = document.createElement("div");
    toast.className = "badge-toast";
    toast.innerHTML =
      '<span class="badge-toast-icon">' +
      badge.icon +
      "</span>" +
      '<div class="badge-toast-text">' +
      '<div class="badge-toast-title">Badge débloqué !</div>' +
      '<div class="badge-toast-name">' +
      badge.name +
      "</div>" +
      "</div>";
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(function () {
      toast.classList.add("show");
    });

    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () {
        toast.remove();
      }, 400);
    }, 3000);
  }

  function getAllBadges() {
    var unlocked = Storage.getBadges();
    return BADGE_DEFS.map(function (b) {
      return {
        id: b.id,
        icon: b.icon,
        name: b.name,
        unlocked: !!unlocked[b.id],
      };
    });
  }

  return {
    getLevel: getLevel,
    getXPInLevel: getXPInLevel,
    checkBadges: checkBadges,
    getAllBadges: getAllBadges,
    BADGE_DEFS: BADGE_DEFS,
  };
})();
