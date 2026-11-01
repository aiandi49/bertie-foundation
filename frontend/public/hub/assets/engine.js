// The one-question hub. Asks /api/chat for an AI answer grounded in data/gub.json.
// If AI answers are off (no key) or fail, it answers from the guide's own search instead.
(function () {
  'use strict';
  var form = document.getElementById('ask-form');
  var input = document.getElementById('q');
  var btn = document.getElementById('ask-btn');
  var thread = document.getElementById('thread');
  var label = document.getElementById('ask-label');
  var starters = document.getElementById('starters');
  var resetBtn = document.getElementById('reset-btn');
  if (!form) return;

  var messages = [];
  var busy = false;
  var gub = null;
  var gubReady = fetch('/hub/gub.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { gub = d; })
    .catch(function () {});

  var STOP = {};
  'the a an and or of to in on for is it i my me you your what how does do with at near about can are be this that from have has any there just like want should would could which who why when'
    .split(' ').forEach(function (w) { STOP[w] = 1; });
  function words(t) {
    return String(t).toLowerCase().replace(/[^a-z0-9$.\s-]/g, ' ').split(/\s+/)
      .filter(function (w) { return w.length > 1 && !STOP[w]; });
  }
  function search(q, n) {
    if (!gub) return [];
    var qw = words(q);
    return gub.entries.map(function (e, i) {
      var tags = (e.tags || []).map(function (t) { return t.toLowerCase(); });
      var headTxt = [e.title, e.summary, e.kind].join(' ').toLowerCase();
      var body = (e.body || []).join(' ').toLowerCase();
      var s = 0;
      qw.forEach(function (w) {
        if (tags.indexOf(w) >= 0) s += 4;
        if (headTxt.indexOf(w) >= 0) s += 2;
        else if (body.indexOf(w) >= 0) s += 1;
      });
      return { e: e, s: s, i: i };
    }).filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s || a.i - b.i; })
      .slice(0, n || 3).map(function (x) { return x.e; });
  }
  function byId(id) {
    if (!gub) return null;
    for (var i = 0; i < gub.entries.length; i++) if (gub.entries[i].id === id) return gub.entries[i];
    return null;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  // Paragraphs with safe links (text only, never HTML from the model).
  function richText(parent, text) {
    String(text).split(/\n{2,}|\n(?=[-•\d])/).forEach(function (para) {
      para = para.trim();
      if (!para) return;
      var p = el('p');
      var parts = para.split(/(https:\/\/[^\s)]+)/);
      parts.forEach(function (part) {
        if (/^https:\/\//.test(part)) {
          var clean = part.replace(/[.,;:]+$/, '');
          var a = el('a', null, clean.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, ''));
          a.href = clean; a.target = '_blank'; a.rel = 'noopener';
          p.appendChild(a);
          if (clean.length < part.length) p.appendChild(document.createTextNode(part.slice(clean.length)));
        } else {
          p.appendChild(document.createTextNode(part.replace(/\*\*/g, '')));
        }
      });
      parent.appendChild(p);
    });
  }
  function relatedCards(parent, entries, heading) {
    if (!entries.length) return;
    parent.appendChild(el('p', 'related-label', heading));
    var wrap = el('div', 'related');
    entries.forEach(function (e) {
      var a = el('a', 'related-card');
      a.href = '/hub/guide#' + e.id;
      a.appendChild(el('span', 'related-kind', e.kind));
      a.appendChild(el('strong', null, e.title));
      a.appendChild(el('span', 'related-text', e.summary));
      wrap.appendChild(a);
    });
    parent.appendChild(wrap);
  }

  function addQuestion(q) {
    var b = el('div', 'q-bubble');
    b.appendChild(el('p', null, q));
    thread.appendChild(b);
  }
  function addPending() {
    var a = el('div', 'a-card pending');
    a.appendChild(el('p', 'thinking', 'Looking through the guide…'));
    thread.appendChild(a);
    a.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return a;
  }
  function fillAnswer(card, reply) {
    card.classList.remove('pending');
    card.textContent = '';
    var lines = reply.split('\n');
    var seeIds = [];
    var next = '';
    var kept = [];
    lines.forEach(function (l) {
      var m = l.match(/^\s*SEE:\s*(.*)$/i);
      var n = l.match(/^\s*Next step:\s*(.*)$/i);
      if (m) seeIds = m[1].split(/[,\s]+/).filter(Boolean);
      else if (n) next = n[1];
      else kept.push(l);
    });
    richText(card, kept.join('\n').trim());
    if (next) {
      var ns = el('div', 'next-step');
      ns.appendChild(el('strong', null, 'Next step'));
      ns.appendChild(el('span', null, next));
      card.appendChild(ns);
    }
    var related = seeIds.map(byId).filter(Boolean).slice(0, 3);
    relatedCards(card, related, 'Read more in the guide');
  }
  function fillFromGuide(card, q, reason) {
    card.classList.remove('pending');
    card.textContent = '';
    var hits = search(q, 3);
    if (reason) card.appendChild(el('p', 'muted', reason));
    if (!hits.length) {
      card.appendChild(el('p', null, 'The guide has nothing on that yet. Try other words, or browse the full guide.'));
      return 'The guide has nothing on that yet.';
    }
    var top = hits[0];
    card.appendChild(el('p', 'a-title', top.title));
    richText(card, (top.body || []).slice(0, 3).join('\n\n'));
    relatedCards(card, hits, 'From the guide');
    return top.title + ': ' + top.summary;
  }

  function setBusy(on) {
    busy = on;
    btn.disabled = on;
    btn.textContent = on ? '…' : 'Ask';
  }
  function afterFirst() {
    label.textContent = 'Ask a follow-up';
    if (starters) starters.hidden = true;
    resetBtn.hidden = false;
  }

  function ask(q) {
    q = String(q || '').trim();
    if (!q || busy) return;
    if (messages.length >= 22) messages = messages.slice(-10);
    if (messages.length && messages[0].role !== 'user') messages.shift();
    messages.push({ role: 'user', content: q });
    addQuestion(q);
    input.value = '';
    afterFirst();
    var card = addPending();
    setBusy(true);
    fetch('/api/gub-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages })
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { status: r.status, d: d }; }); })
      .then(function (res) {
        return gubReady.then(function () {
          if (res.status === 200 && res.d.reply) {
            fillAnswer(card, res.d.reply);
            messages.push({ role: 'assistant', content: res.d.reply });
          } else {
            var reason = res.d.code === 'no-ai' ? 'Here is what the guide says:' : (res.d.error || 'The AI answer is not available right now.') + ' Here is what the guide says:';
            var summary = fillFromGuide(card, q, reason);
            messages.push({ role: 'assistant', content: summary });
          }
        });
      })
      .catch(function () {
        return gubReady.then(function () {
          var summary = fillFromGuide(card, q, 'You seem to be offline. Here is what the guide says:');
          messages.push({ role: 'assistant', content: summary });
        });
      })
      .then(function () {
        setBusy(false);
        input.focus();
      });
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    ask(input.value);
  });
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      ask(input.value);
    }
  });
  if (starters) {
    starters.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-q]');
      if (b) ask(b.getAttribute('data-q'));
    });
  }
  resetBtn.addEventListener('click', function () {
    messages = [];
    thread.textContent = '';
    label.textContent = 'Ask one question';
    if (starters) starters.hidden = false;
    resetBtn.hidden = true;
    input.focus();
  });

  var pre = new URLSearchParams(location.search).get('q');
  if (pre) {
    input.value = pre.slice(0, 2000);
    input.focus();
  }
})();
