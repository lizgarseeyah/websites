(function () {
  'use strict';

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- intro ---
  var intro = document.getElementById('intro');
  var skip = document.getElementById('skipIntro');

  function endIntro() {
    if (!intro) return;
    intro.classList.add('hide');
    setTimeout(function () { if (intro && intro.parentNode) intro.parentNode.removeChild(intro); }, 600);
  }

  if (intro) {
    if (reduce) {
      // Show the logo briefly, then clear without motion.
      setTimeout(endIntro, 700);
    } else {
      // Total sequence ~2.6s (last word/logo at 1.6s + settle).
      setTimeout(endIntro, 2600);
    }
  }
  if (skip) skip.addEventListener('click', endIntro);

  // --- footer year ---
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // --- signup form (client-side demo, no backend) ---
  var form = document.getElementById('signupForm');
  var note = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('email');
      var val = (email && email.value || '').trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        if (note) { note.textContent = 'Please enter a valid email address.'; note.style.color = '#f0a3a3'; }
        if (email) email.focus();
        return;
      }
      if (note) { note.textContent = "You're on the list — watch your inbox for the Collection 01 drop."; note.style.color = ''; }
      form.reset();
    });
  }
})();
