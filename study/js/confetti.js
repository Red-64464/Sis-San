/* ═══════════════════════════════════════════
   confetti.js — Celebration particles
   ═══════════════════════════════════════════ */
var Confetti = (function () {
  function launch() {
    var canvas = document.createElement("canvas");
    canvas.id = "confetti-canvas";
    canvas.style.cssText =
      "position:fixed;inset:0;z-index:9999;pointer-events:none;";
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var particles = [];
    var colors = [
      "#00f5c3",
      "#a78bfa",
      "#ffd93d",
      "#ff6b6b",
      "#ff914d",
      "#fff",
    ];

    for (var i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width * Math.random(),
        y: canvas.height * 0.3 * Math.random() - canvas.height * 0.1,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 4 + 2,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
      });
    }

    var start = performance.now();
    var duration = 2500;

    function animate(now) {
      var elapsed = now - start;
      if (elapsed > duration) {
        canvas.remove();
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var fadeStart = duration * 0.6;
      particles.forEach(function (p) {
        p.x += p.vx;
        p.vy += 0.15;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.opacity =
          elapsed > fadeStart
            ? 1 - (elapsed - fadeStart) / (duration - fadeStart)
            : 1;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    // Also pulse the timer ring
    var ring = document.querySelector(".timer-ring");
    if (ring) {
      ring.classList.add("celebrate");
      setTimeout(function () {
        ring.classList.remove("celebrate");
      }, 1500);
    }
  }

  return { launch: launch };
})();
