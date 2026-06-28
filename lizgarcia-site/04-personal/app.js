(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('yr').textContent = new Date().getFullYear();

  var intro = document.getElementById('intro');
  var skip = document.getElementById('skipIntro');
  function endIntro() { if (!intro) return; intro.classList.add('hide'); setTimeout(function(){ intro.remove(); }, 650); }
  if (intro) {
    if (reduce) { intro.remove(); }
    else { intro.classList.add('run'); skip.addEventListener('click', endIntro); setTimeout(endIntro, 2200); }
  }

  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { note.textContent = 'Please fill in every field.'; note.style.color = '#f0a0a0'; return; }
    note.style.color = ''; note.textContent = 'Thanks for the note — I\'ll get back to you.';
    form.reset();
  });
})();
