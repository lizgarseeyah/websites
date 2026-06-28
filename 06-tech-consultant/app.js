(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('yr').textContent = new Date().getFullYear();

  /* ---- Animated tech grid / data-flow motion graphic ---- */
  function techGrid(canvas) {
    if (!canvas || reduce) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, raf, t = 0, packets = [];
    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn() {
      var gap = 60;
      var cols = Math.ceil(W / gap), rows = Math.ceil(H / gap);
      packets = [];
      for (var i = 0; i < 14; i++) {
        var horiz = Math.random() > .5;
        packets.push({
          horiz: horiz,
          line: Math.floor(Math.random() * (horiz ? rows : cols)) * gap,
          pos: Math.random() * (horiz ? W : H),
          speed: (.6 + Math.random() * 1.2) * (Math.random() > .5 ? 1 : -1),
          gap: gap
        });
      }
    }
    function step() {
      ctx.clearRect(0, 0, W, H);
      var gap = 60;
      // grid
      ctx.strokeStyle = 'rgba(79,140,255,.07)'; ctx.lineWidth = 1;
      for (var x = 0; x <= W; x += gap) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (var y = 0; y <= H; y += gap) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      // packets
      packets.forEach(function (p) {
        p.pos += p.speed;
        var lim = p.horiz ? W : H;
        if (p.pos > lim + 40) p.pos = -40;
        if (p.pos < -40) p.pos = lim + 40;
        var px = p.horiz ? p.pos : p.line;
        var py = p.horiz ? p.line : p.pos;
        var grad = ctx.createLinearGradient(px, py, px - (p.horiz ? p.speed * 24 : 0), py - (p.horiz ? 0 : p.speed * 24));
        grad.addColorStop(0, 'rgba(95,227,208,.9)');
        grad.addColorStop(1, 'rgba(95,227,208,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(px, py, 2.4, 0, Math.PI * 2); ctx.fill();
      });
      t++;
      raf = requestAnimationFrame(step);
    }
    resize(); spawn(); step();
    window.addEventListener('resize', function () { cancelAnimationFrame(raf); resize(); spawn(); step(); });
  }
  techGrid(document.getElementById('grid'));
  techGrid(document.getElementById('heroGrid'));

  var intro = document.getElementById('intro');
  var skip = document.getElementById('skipIntro');
  function endIntro() { if (!intro) return; intro.classList.add('hide'); setTimeout(function(){ intro.remove(); }, 600); }
  if (intro) {
    if (reduce) { intro.remove(); }
    else { skip.addEventListener('click', endIntro); setTimeout(endIntro, 2600); }
  }

  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { note.textContent = 'Please complete every field.'; note.style.color = '#f87171'; return; }
    note.style.color = ''; note.textContent = 'Thanks — I\'ll reply within one business day.';
    form.reset();
  });
})();
