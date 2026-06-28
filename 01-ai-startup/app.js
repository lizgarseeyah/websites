(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('yr').textContent = new Date().getFullYear();

  /* ---- Neural / particle field ---- */
  function neuralField(canvas, opts) {
    if (!canvas || reduce) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [], W, H, raf;
    opts = opts || {};
    var COUNT = opts.count || 60, LINK = opts.link || 130;

    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function init() {
      nodes = [];
      for (var i = 0; i < COUNT; i++) {
        nodes.push({ x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 });
      }
    }
    function step() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j], dx = n.x - m.x, dy = n.y - m.y, d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.strokeStyle = 'rgba(110,231,255,' + (1 - d / LINK) * .22 + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(167,139,250,.9)';
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(step);
    }
    resize(); init(); step();
    window.addEventListener('resize', function () { cancelAnimationFrame(raf); resize(); init(); step(); });
  }

  neuralField(document.getElementById('neural'), { count: 70, link: 150 });
  neuralField(document.getElementById('heroNeural'), { count: 45, link: 140 });

  /* ---- Intro ---- */
  var intro = document.getElementById('intro');
  var skip = document.getElementById('skipIntro');
  function endIntro() { if (!intro) return; intro.classList.add('hide'); setTimeout(function(){ intro.remove(); }, 700); }
  if (intro) {
    if (reduce) { intro.remove(); }
    else {
      skip.addEventListener('click', endIntro);
      setTimeout(endIntro, 2600);
    }
  }

  /* ---- Form ---- */
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { note.textContent = 'Please complete every field.'; note.style.color = '#f87171'; return; }
    note.style.color = ''; note.textContent = 'Thanks — we\'ll be in touch shortly.';
    form.reset();
  });
})();
