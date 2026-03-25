/* ═══════════════════════════════════════════
   notifications.js — Islamic Daily Notifications
   ═══════════════════════════════════════════ */

var IslamicNotifs = (function () {
  var _midnightTimer = null;

  var ISLAMIC_NOTIFS = [
    { hour: 7,  title: "Bismillah 🌅", body: "Une nouvelle journée, un nouveau souffle d'Allah. Commence avec la basmala." },
    { hour: 8,  title: "Tawakkul ☀️", body: "Celui qui place sa confiance en Allah, Il lui suffit. — Coran 65:3" },
    { hour: 9,  title: "Au travail ! 📚", body: "Allah aime que tu fasses ton travail avec excellence. C'est une ibada." },
    { hour: 10, title: "Rappel 🌿", body: "N'arrête pas de travailler — Allah voit chaque effort, même le plus discret." },
    { hour: 11, title: "Patience 💛", body: "Après la difficulté vient la facilité. (Coran 94:5). Tu y es presque." },
    { hour: 12, title: "Pause du midi 🤲", body: "C'est l'heure de la prière. Repose ton esprit et reviens plus forte." },
    { hour: 13, title: "Reprends ! 🔥", body: "La persévérance est une lumière. Rallume la tienne." },
    { hour: 14, title: "Tawakkul 🌙", body: "Fais ta part. Laisse à Allah le reste. C'est ça, le tawakkul." },
    { hour: 15, title: "Asr 🕌", body: "Prends une minute pour te rappeler pour Qui tu travailles. Puis continue." },
    { hour: 16, title: "Tu avances 🌟", body: "Chaque heure d'étude est une sadaqa pour ton futur. Continue, tu es sur la bonne voie." },
    { hour: 17, title: "Bientôt ! 💎", body: "La fin de journée approche. Finis fort — Allah voit tes efforts." },
    { hour: 18, title: "Maghrib 🌅", body: "Le coucher du soleil est un rappel : chaque jour est un cadeau. Qu'as-tu semé aujourd'hui ?" },
    { hour: 19, title: "Révision du soir 📖", body: "Lis au nom de ton Seigneur. La connaissance est ton héritage le plus précieux." },
    { hour: 20, title: "Isha 🌙", body: "La nuit est faite pour le repos et la prière. Tu as bien travaillé." },
    { hour: 21, title: "Bonne nuit 🕊️", body: "Ton Seigneur ne t'a pas abandonnée. Repose-toi — demain est un nouveau souffle." }
  ];

  function _todayStr() {
    return new Date().toISOString().split("T")[0];
  }

  function schedule() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    var now = new Date();
    var todayDate = _todayStr();

    ISLAMIC_NOTIFS.forEach(function (notif) {
      var targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), notif.hour, 0, 0, 0);
      var delay = targetTime.getTime() - now.getTime();

      // Skip if hour already passed today
      if (delay < 0) return;

      var storageKey = "notif-sent-" + todayDate + "-" + notif.hour;
      if (localStorage.getItem(storageKey)) return;

      setTimeout(function () {
        // Re-check permission and sent flag at fire time
        if (!("Notification" in window) || Notification.permission !== "granted") return;
        if (localStorage.getItem(storageKey)) return;
        try {
          new Notification(notif.title, {
            body: notif.body,
            icon: "../assets/icons/icon-192.png",
            badge: "../assets/icons/icon-192.png",
            tag: "sissan-islamic-" + notif.hour,
            renotify: false
          });
          localStorage.setItem(storageKey, "1");
        } catch (e) {
          console.warn("Failed to send Islamic notification:", e);
        }
      }, delay);
    });
  }

  function init() {
    schedule();

    // Clear any previously scheduled midnight re-init to avoid duplicate timers
    if (_midnightTimer !== null) {
      clearTimeout(_midnightTimer);
    }

    // Re-schedule at midnight each day (5s offset ensures we are past the day boundary)
    var now = new Date();
    var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5, 0);
    var msUntilMidnight = midnight.getTime() - now.getTime();

    _midnightTimer = setTimeout(function () {
      _midnightTimer = null;
      init();
    }, msUntilMidnight);
  }

  return {
    init: init,
    schedule: schedule
  };
})();
