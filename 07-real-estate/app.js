(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('yr').textContent = new Date().getFullYear();

  var intro = document.getElementById('intro');
  var skip = document.getElementById('skipIntro');
  function endIntro() { if (!intro) return; intro.classList.add('hide'); setTimeout(function(){ intro.remove(); }, 650); }
  if (intro) {
    if (reduce) { intro.remove(); }
    else { intro.classList.add('run'); skip.addEventListener('click', endIntro); setTimeout(endIntro, 3000); }
  }

  // Pause persistent top ticker on hover (nice-to-have, accessibility-friendly)
  var track = document.querySelector('.topticker-track');
  if (track && !reduce) {
    var ticker = document.querySelector('.topticker');
    ticker.addEventListener('mouseenter', function(){ track.style.animationPlayState = 'paused'; });
    ticker.addEventListener('mouseleave', function(){ track.style.animationPlayState = 'running'; });
  }

  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { note.textContent = 'Please fill in every field.'; note.style.color = '#e7b3b3'; return; }
    note.style.color = ''; note.textContent = 'Sending…';
    var btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).then(function (res) {
      if (res.ok) {
        note.style.color = ''; note.textContent = "Thank you — I'll be in touch within a day.";
        form.reset();
      } else {
        return res.json().then(function (d) {
          note.style.color = '#e7b3b3';
          note.textContent = (d && d.errors && d.errors.map(function (x){return x.message}).join(', ')) || 'Something went wrong. Please try again.';
        });
      }
    }).catch(function () {
      note.style.color = '#e7b3b3';
      note.textContent = 'Network error. Please try again in a moment.';
    }).finally(function () { if (btn) btn.disabled = false; });
  });
})();
