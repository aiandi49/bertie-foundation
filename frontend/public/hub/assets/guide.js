// Live search on the full guide page: hides entries and sections that don't match.
(function () {
  'use strict';
  var input = document.getElementById('filter');
  var count = document.getElementById('filter-count');
  if (!input) return;
  var entries = Array.prototype.slice.call(document.querySelectorAll('.entry'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('section.band'));
  function run() {
    var terms = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;
    entries.forEach(function (e) {
      var hay = e.getAttribute('data-search') || '';
      var ok = terms.every(function (t) { return hay.indexOf(t) >= 0; });
      e.hidden = !ok;
      if (ok) shown++;
    });
    sections.forEach(function (s) {
      s.hidden = !s.querySelector('.entry:not([hidden])');
    });
    count.textContent = terms.length ? shown + ' of ' + entries.length + ' entries match' : entries.length + ' entries';
  }
  input.addEventListener('input', run);
})();
