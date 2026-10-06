/* ==========================================================================
   Chapter 2 LR dashboard: navigation, routing, theme, presenter mode,
   search, progress, copy buttons, mind maps, Lottie.
   Behaviour only: every visual change is a class or attribute that CSS styles.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;

  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }
  };

  function icon(id, cls) {
    return '<svg class="' + (cls || 'icon') + '" aria-hidden="true"><use href="#i-' + id + '"/></svg>';
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.className = 'visually-hidden';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  var showHandlers = [];
  window.LR = {
    $: $, $$: $$, store: store, icon: icon, esc: esc, toast: toast, copyText: copyText,
    onShow: function (fn) { showHandlers.push(fn); },
    go: function (tab, sub) { go(tab, sub); }
  };

  /* ---------------------------------------------------------------------
     Model: read tabs and their parts from the authored sections
     --------------------------------------------------------------------- */
  var tabs = $$('.tab-panel').map(function (sec) {
    return {
      el: sec,
      slug: sec.dataset.slug,
      title: sec.dataset.title,
      short: sec.dataset.short || sec.dataset.title,
      icon: sec.dataset.icon || 'book',
      subs: $$(':scope > .sub-panel', sec).map(function (a) {
        return { el: a, slug: a.dataset.sub, title: a.dataset.title, id: sec.dataset.slug + '/' + a.dataset.sub };
      })
    };
  });
  var flat = [];
  tabs.forEach(function (t) { t.subs.forEach(function (s) { flat.push({ tab: t, sub: s }); }); });
  if (!tabs.length) return;

  /* ---------------------------------------------------------------------
     Build the contents rail (main tabs)
     --------------------------------------------------------------------- */
  var rail = $('#rail-list');
  tabs.forEach(function (t) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'rail-tab';
    b.id = 'railtab-' + t.slug;
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', t.el.id);
    b.setAttribute('aria-selected', 'false');
    b.tabIndex = -1;
    b.innerHTML = icon(t.icon) + '<span>' + esc(t.short) + '</span><span class="rail-tab__count" data-count></span>';
    b.addEventListener('click', function () { go(t.slug, lastSub[t.slug] || t.subs[0].slug); });
    rail.appendChild(b);
    t.btn = b;
    t.el.setAttribute('role', 'tabpanel');
    t.el.setAttribute('aria-labelledby', b.id);
    t.el.hidden = true;
  });
  rail.addEventListener('keydown', function (e) { rovingKeys(e, tabs.map(function (t) { return t.btn; }), true); });

  /* ---------------------------------------------------------------------
     Build each tab's part bar (sub-tabs) and part footers
     --------------------------------------------------------------------- */
  tabs.forEach(function (t) {
    var nav = document.createElement('nav');
    nav.className = 'sub-nav';
    nav.setAttribute('aria-label', 'Parts of ' + t.title);
    var list = document.createElement('div');
    list.className = 'sub-nav__list';
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', t.title);
    t.subs.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sub-tab';
      b.id = 'subtab-' + t.slug + '-' + s.slug;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', s.el.id);
      b.setAttribute('aria-selected', 'false');
      b.tabIndex = -1;
      b.innerHTML = '<span>' + esc(s.title) + '</span>' + icon('check-circle', 'icon sub-tab__done');
      b.addEventListener('click', function () { go(t.slug, s.slug); });
      list.appendChild(b);
      s.btn = b;
      s.el.setAttribute('role', 'tabpanel');
      s.el.setAttribute('aria-labelledby', b.id);
      s.el.hidden = true;
    });
    list.addEventListener('keydown', function (e) { rovingKeys(e, t.subs.map(function (s) { return s.btn; }), false); });
    list.addEventListener('scroll', function () { markOverflow(list); }, { passive: true });
    t.list = list;
    nav.appendChild(list);
    var head = $(':scope > .panel-head', t.el);
    if (head) head.insertAdjacentElement('afterend', nav); else t.el.insertBefore(nav, t.el.firstChild);
    if (t.subs.length < 2) nav.hidden = true;
  });

  flat.forEach(function (f, i) {
    var prev = flat[i - 1], next = flat[i + 1];
    var foot = document.createElement('div');
    foot.className = 'sub-foot';
    foot.innerHTML =
      (prev ? '<button type="button" class="sub-foot__link" data-go="' + prev.tab.slug + '/' + prev.sub.slug + '"><span>' +
        (prev.tab !== f.tab ? 'Previous lesson' : 'Previous') + '</span>' + esc(prev.sub.title) + '</button>' : '<span></span>') +
      '<button type="button" class="done-toggle" aria-pressed="false" data-done="' + f.sub.id + '">' + icon('check-circle') +
        '<span data-done-label>Mark this part as done</span></button>' +
      (next ? '<button type="button" class="sub-foot__link sub-foot__link--next" data-go="' + next.tab.slug + '/' + next.sub.slug + '"><span>' +
        (next.tab !== f.tab ? 'Next lesson: ' + esc(next.tab.short) : 'Next') + '</span>' + esc(next.sub.title) + '</button>' : '<span></span>');
    f.sub.el.appendChild(foot);
  });

  /* A fade on the right edge tells the reader that a part bar scrolls */
  function markOverflow(list) {
    if (!list) return;
    var over = list.scrollWidth > list.clientWidth + 2;
    list.classList.toggle('is-overflowing', over);
    list.classList.toggle('is-scrolled-end', over && list.scrollLeft + list.clientWidth >= list.scrollWidth - 4);
  }
  window.addEventListener('resize', function () { if (current) markOverflow(current.t.list); });

  function rovingKeys(e, buttons, vertical) {
    var i = buttons.indexOf(document.activeElement);
    if (i < 0) return;
    var n = null;
    var fwd = ['ArrowRight'], back = ['ArrowLeft'];
    if (vertical) { fwd.push('ArrowDown'); back.push('ArrowUp'); }
    if (fwd.indexOf(e.key) > -1) n = (i + 1) % buttons.length;
    else if (back.indexOf(e.key) > -1) n = (i - 1 + buttons.length) % buttons.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = buttons.length - 1;
    if (n === null) return;
    e.preventDefault();
    e.stopPropagation();
    buttons[n].focus();
    buttons[n].click();
  }

  /* ---------------------------------------------------------------------
     Router: #/tab/part
     --------------------------------------------------------------------- */
  var lastSub = store.get('lr-last-sub', {});
  var current = null;
  var firstRender = true;

  function parseHash() {
    var m = location.hash.match(/^#\/([\w-]+)(?:\/([\w-]+))?/);
    return m ? { tab: m[1], sub: m[2] } : { tab: null, sub: null };
  }

  function go(tab, sub) {
    var h = '#/' + tab + '/' + sub;
    if (location.hash !== h) location.hash = h; else render();
  }

  function centreInStrip(btn) {
    var list = btn && btn.parentElement;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    list.scrollLeft = btn.offsetLeft - (list.clientWidth - btn.offsetWidth) / 2;
  }

  function render() {
    var p = parseHash();
    var t = tabs.filter(function (x) { return x.slug === p.tab; })[0] || tabs[0];
    var s = t.subs.filter(function (x) { return x.slug === p.sub; })[0] || t.subs.filter(function (x) { return x.slug === lastSub[t.slug]; })[0] || t.subs[0];
    var sameTab = current && current.t === t;

    tabs.forEach(function (x) {
      var on = x === t;
      x.el.hidden = !on;
      x.el.classList.toggle('is-active', on);
      x.btn.setAttribute('aria-selected', on ? 'true' : 'false');
      x.btn.tabIndex = on ? 0 : -1;
    });
    t.subs.forEach(function (x) {
      var on = x === s;
      x.el.hidden = !on;
      x.el.classList.toggle('is-active', on);
      x.btn.setAttribute('aria-selected', on ? 'true' : 'false');
      x.btn.tabIndex = on ? 0 : -1;
    });

    s.el.classList.remove('is-entering');
    void s.el.offsetWidth;
    s.el.classList.add('is-entering');

    lastSub[t.slug] = s.slug;
    store.set('lr-last-sub', lastSub);
    document.title = s.title + ' | ' + t.short + ' | Chapter 2: The Literature Review';

    centreInStrip(s.btn);
    centreInStrip(t.btn);
    markOverflow(t.list);
    if (!firstRender) {
      var nav = $(':scope > .sub-nav', t.el);
      var y = sameTab && nav ? Math.min(window.scrollY, t.el.offsetTop) : 0;
      window.scrollTo({ top: y, behavior: 'auto' });
    }
    firstRender = false;
    current = { t: t, s: s };
    showHandlers.forEach(function (fn) { try { fn(t.slug, s.slug, s.el); } catch (e) { console.error(e); } });
  }
  window.addEventListener('hashchange', render);

  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-go]');
    if (g) {
      var parts = g.getAttribute('data-go').split('/');
      go(parts[0], parts[1]);
    }
  });

  /* ---------------------------------------------------------------------
     Progress ("mark as done")
     --------------------------------------------------------------------- */
  var done = store.get('lr-done', []);
  function isDone(id) { return done.indexOf(id) > -1; }
  function paintProgress() {
    var total = flat.length, count = 0;
    flat.forEach(function (f) {
      var d = isDone(f.sub.id);
      if (d) count++;
      f.sub.btn.classList.toggle('is-done', d);
      var tg = $('.done-toggle', f.sub.el);
      if (tg) {
        tg.setAttribute('aria-pressed', d ? 'true' : 'false');
        $('[data-done-label]', tg).textContent = d ? 'Done (click to undo)' : 'Mark this part as done';
      }
    });
    $$('.sub-tab__done').forEach(function (ic) {
      ic.parentNode.classList.contains('is-done') ? ic.removeAttribute('hidden') : ic.setAttribute('hidden', '');
    });
    tabs.forEach(function (t) {
      var n = t.subs.filter(function (s) { return isDone(s.id); }).length;
      var c = $('[data-count]', t.btn);
      c.textContent = n ? n + '/' + t.subs.length : '';
      c.classList.toggle('is-complete', n === t.subs.length);
    });
    var bar = $('#overall-progress');
    if (bar) { bar.max = total; bar.value = count; }
    var lab = $('#overall-progress-label');
    if (lab) lab.textContent = count + ' of ' + total + ' parts done';
    $$('[data-progress-summary]').forEach(function (el) { el.textContent = count + ' of ' + total; });
  }
  document.addEventListener('click', function (e) {
    var tg = e.target.closest('.done-toggle');
    if (!tg) return;
    var id = tg.getAttribute('data-done');
    if (isDone(id)) done = done.filter(function (x) { return x !== id; }); else done.push(id);
    store.set('lr-done', done);
    paintProgress();
    if (isDone(id)) toast('Marked as done');
  });

  /* ---------------------------------------------------------------------
     Theme
     --------------------------------------------------------------------- */
  var themeBtn = $('[data-action="theme"]');
  function currentTheme() {
    var a = root.getAttribute('data-theme');
    if (a) return a;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function paintTheme() {
    var dark = currentTheme() === 'dark';
    if (!themeBtn) return;
    $('use', themeBtn).setAttribute('href', dark ? '#i-sun' : '#i-moon');
    $('[data-theme-label]', themeBtn).textContent = dark ? 'Light' : 'Dark';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }
  function toggleTheme() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('lr-theme', next); } catch (e) { /* storage blocked */ }
    paintTheme();
  }
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  if (window.matchMedia) {
    var mq = matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', paintTheme);
  }

  /* ---------------------------------------------------------------------
     Presenter mode
     --------------------------------------------------------------------- */
  var presentBtn = $('[data-action="present"]');
  function paintPresent() {
    if (presentBtn) presentBtn.setAttribute('aria-pressed', root.classList.contains('presenting') ? 'true' : 'false');
  }
  function togglePresent(force) {
    var on = typeof force === 'boolean' ? force : !root.classList.contains('presenting');
    root.classList.toggle('presenting', on);
    paintPresent();
    try {
      if (on && document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(function () {});
      } else if (!on && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(function () {});
      }
    } catch (e) { /* fullscreen not allowed */ }
    toast(on ? 'Presenter mode: arrow keys move between parts, Esc to leave' : 'Presenter mode off');
  }
  if (presentBtn) presentBtn.addEventListener('click', function () { togglePresent(); });

  /* ---------------------------------------------------------------------
     Keyboard shortcuts
     --------------------------------------------------------------------- */
  function step(dir) {
    if (!current) return;
    var i = flat.findIndex(function (f) { return f.sub === current.s; });
    var n = flat[i + dir];
    if (n) go(n.tab.slug, n.sub.slug);
  }
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
    if (e.ctrlKey || e.metaKey || e.altKey) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#site-search').focus(); }
      return;
    }
    if (typing) return;
    if (e.key === '/') { e.preventDefault(); $('#site-search').focus(); return; }
    if (e.key === 'p' || e.key === 'P') { togglePresent(); return; }
    if (e.key === 't' || e.key === 'T') { toggleTheme(); return; }
    if (e.key === 'Escape' && root.classList.contains('presenting')) { togglePresent(false); return; }
    var inTabs = e.target.closest && e.target.closest('[role="tablist"]');
    if (inTabs) return;
    if (e.key === 'ArrowRight') { step(1); }
    else if (e.key === 'ArrowLeft') { step(-1); }
  });

  /* ---------------------------------------------------------------------
     Site search across every part
     --------------------------------------------------------------------- */
  var input = $('#site-search');
  var results = $('#search-results');
  var index = null;
  var hits = [];
  var sel = -1;

  function buildIndex() {
    index = flat.map(function (f) {
      var clone = f.sub.el.cloneNode(true);
      $$('.sub-foot, script, .mindmap__src', clone).forEach(function (n) { n.remove(); });
      return {
        f: f,
        title: f.sub.title,
        where: f.tab.title,
        text: (clone.textContent || '').replace(/\s+/g, ' ').trim()
      };
    });
  }
  function snippet(text, terms) {
    var low = text.toLowerCase();
    var at = -1;
    terms.forEach(function (t) { var k = low.indexOf(t); if (k > -1 && (at < 0 || k < at)) at = k; });
    var start = Math.max(0, at - 60);
    var s = (start > 0 ? '... ' : '') + text.substr(start, 170) + (start + 170 < text.length ? ' ...' : '');
    var out = esc(s);
    terms.forEach(function (t) {
      out = out.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>');
    });
    return out;
  }
  function runSearch() {
    if (!index) buildIndex();
    var q = input.value.trim().toLowerCase();
    var terms = q.split(/\s+/).filter(function (t) { return t.length > 1; });
    if (!terms.length) { closeResults(); return; }
    hits = index.map(function (e) {
      var low = e.text.toLowerCase(), tl = e.title.toLowerCase(), score = 0;
      for (var i = 0; i < terms.length; i++) {
        var c = low.split(terms[i]).length - 1;
        if (!c && tl.indexOf(terms[i]) < 0) return null;
        score += c + (tl.indexOf(terms[i]) > -1 ? 25 : 0);
      }
      return { e: e, score: score };
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 12);
    sel = hits.length ? 0 : -1;
    results.innerHTML = hits.length ? hits.map(function (h, i) {
      return '<button type="button" class="search__result" role="option" aria-selected="' + (i === sel) + '" data-i="' + i + '">' +
        '<span class="search__where">' + esc(h.e.where) + '</span>' +
        '<span class="search__title">' + esc(h.e.title) + '</span>' +
        '<span class="search__snip">' + snippet(h.e.text, terms) + '</span></button>';
    }).join('') : '<p class="search__empty">No part mentions all of these words. Try fewer or different terms, for example "boolean", "gap" or "predatory".</p>';
    results.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }
  function closeResults() {
    results.hidden = true;
    input.setAttribute('aria-expanded', 'false');
  }
  function openHit(i) {
    var h = hits[i];
    if (!h) return;
    var terms = input.value.trim().toLowerCase().split(/\s+/).filter(function (t) { return t.length > 1; });
    closeResults();
    input.blur();
    go(h.e.f.tab.slug, h.e.f.sub.slug);
    setTimeout(function () {
      var cands = $$('p, li, td, th, h2, h3, h4, dd, dt, summary, .prompt__body', h.e.f.sub.el);
      var target = cands.filter(function (el) {
        var t = el.textContent.toLowerCase();
        return terms.every(function (x) { return t.indexOf(x) > -1; });
      })[0] || cands.filter(function (el) { return el.textContent.toLowerCase().indexOf(terms[0]) > -1; })[0];
      if (target) {
        var det = target.closest('details');
        if (det) det.open = true;
        target.scrollIntoView({ block: 'center', behavior: 'smooth' });
        target.classList.add('search-flash');
        setTimeout(function () { target.classList.remove('search-flash'); }, 2600);
      }
    }, 60);
  }
  if (input) {
    var deb;
    input.addEventListener('input', function () { clearTimeout(deb); deb = setTimeout(runSearch, 120); });
    input.addEventListener('focus', function () { if (input.value.trim()) runSearch(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!hits.length) return;
        e.preventDefault();
        sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length;
        $$('.search__result', results).forEach(function (b, i) { b.setAttribute('aria-selected', i === sel ? 'true' : 'false'); });
        var b = $$('.search__result', results)[sel];
        if (b) b.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        openHit(sel < 0 ? 0 : sel);
      } else if (e.key === 'Escape') {
        closeResults();
        input.blur();
      }
    });
    results.addEventListener('mousedown', function (e) { e.preventDefault(); });
    results.addEventListener('click', function (e) {
      var b = e.target.closest('.search__result');
      if (b) openHit(+b.getAttribute('data-i'));
    });
    input.addEventListener('blur', function () { setTimeout(closeResults, 120); });
  }
  LR.rebuildSearch = function () { index = null; };

  /* ---------------------------------------------------------------------
     Copy buttons on prompts and query strings
     --------------------------------------------------------------------- */
  function wireCopy(scope) {
    $$('.prompt, .query, [data-copy-target]', scope).forEach(function (box) {
      if (box.hasAttribute('data-copy-wired')) return;
      box.setAttribute('data-copy-wired', '');
      var body = $('.prompt__body, .query__body', box) || box;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.innerHTML = icon('copy') + '<span>Copy</span>';
      btn.addEventListener('click', function () {
        copyText(body.innerText.trim()).then(function () {
          btn.classList.add('is-copied');
          $('span', btn).textContent = 'Copied';
          toast('Copied to clipboard');
          setTimeout(function () { btn.classList.remove('is-copied'); $('span', btn).textContent = 'Copy'; }, 1600);
        }, function () { toast('Copy failed: select the text and press Ctrl+C'); });
      });
      var head = $('.prompt__head', box);
      if (head) head.appendChild(btn); else box.appendChild(btn);
    });
  }
  LR.wireCopy = wireCopy;

  /* Print buttons */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-action="print"]')) window.print();
  });

  /* ---------------------------------------------------------------------
     Mind maps (markmap), rendered only when their part is visible
     --------------------------------------------------------------------- */
  function renderMindmaps(scope) {
    $$('.mindmap:not([data-rendered])', scope).forEach(function (el) {
      var al = window.markmap && window.markmap.autoLoader;
      if (!al || !al.render) return;
      el.setAttribute('data-rendered', 'pending');
      Promise.resolve(al.ready).then(function () {
        al.render(el);
        el.setAttribute('data-rendered', 'yes');
      }).catch(function () {
        el.removeAttribute('data-rendered');
      });
    });
  }
  LR.onShow(function (tab, sub, el) { renderMindmaps(el); });
  window.addEventListener('load', function () { if (current) renderMindmaps(current.s.el); });

  /* ---------------------------------------------------------------------
     Lottie: a few small, decorative animations
     --------------------------------------------------------------------- */
  function startLottie() {
    if (!window.lottie || !window.LR_LOTTIE) return;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    $$('[data-lottie]').forEach(function (el) {
      var data = window.LR_LOTTIE[el.getAttribute('data-lottie')];
      if (!data || el.hasAttribute('data-lottie-on')) return;
      el.setAttribute('data-lottie-on', '');
      $$('.lottie-fallback', el).forEach(function (f) { f.remove(); });
      var anim = window.lottie.loadAnimation({
        container: el,
        renderer: 'svg',
        loop: el.getAttribute('data-loop') !== 'false',
        autoplay: !reduce,
        animationData: JSON.parse(JSON.stringify(data)),
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
      });
      if (reduce) anim.addEventListener('DOMLoaded', function () { anim.goToAndStop(anim.totalFrames - 1, true); });
    });
  }
  window.addEventListener('load', startLottie);

  /* ---------------------------------------------------------------------
     Start
     --------------------------------------------------------------------- */
  paintTheme();
  paintPresent();
  paintProgress();
  wireCopy(document);
  if (!location.hash) history.replaceState(null, '', '#/' + tabs[0].slug + '/' + tabs[0].subs[0].slug);
  render();
})();
