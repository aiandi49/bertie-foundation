// Theme and text-size buttons. Choices are remembered in this browser only.
(function () {
  'use strict';
  var d = document.documentElement;
  var sizes = ['sm', 'md', 'lg', 'xl'];
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    var sync = function () {
      var dark = d.getAttribute('data-theme') === 'dark';
      themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    };
    sync();
    themeBtn.addEventListener('click', function () {
      var next = d.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      d.setAttribute('data-theme', next);
      save('pref-theme', next);
      sync();
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-size-btn]'), function (b) {
    b.addEventListener('click', function () {
      var i = sizes.indexOf(d.getAttribute('data-font-size'));
      if (i < 0) i = 1;
      i = b.getAttribute('data-size-btn') === 'lg' ? Math.min(i + 1, 3) : Math.max(i - 1, 0);
      d.setAttribute('data-font-size', sizes[i]);
      save('pref-font-size', sizes[i]);
    });
  });
})();
