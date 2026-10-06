/* ==========================================================================
   Interactive tools: roadmap, Boolean builder, scorecard, quizzes, checklists,
   decision tree, matrix builder, prompt library and builder, slop list and
   scanner, downloads. Behaviour only; presentation lives in CSS.
   ========================================================================== */
(function () {
  'use strict';
  if (!window.LR) return;
  var $ = LR.$, $$ = LR.$$, esc = LR.esc, store = LR.store, icon = LR.icon;

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (html != null) n.innerHTML = html;
    return n;
  }

  function download(name, text, type) {
    var blob = new Blob([text], { type: (type || 'text/plain') + ';charset=utf-8' });
    var a = el('a', { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function csvCell(v) {
    v = String(v == null ? '' : v);
    return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }

  /* ======================================================================
     1. Roadmap (home)
     ====================================================================== */
  var ROAD = [
    { t: 'Define', s: 'Question and concepts', d: 'Write your research question, break it into concepts, and list synonyms and JEL codes. Decide your inclusion criteria before you search.', links: [['search/strategy', 'Search strategy']] },
    { t: 'Search', s: 'Scholar, databases, AI', d: 'Run documented searches in Google Scholar and at least one curated database. Use AI tools to brainstorm terms and find candidates, never as sources.', links: [['search/scholar', 'Google Scholar manual'], ['search/ai-search', 'Searching with AI']] },
    { t: 'Screen', s: 'Relevance and quality', d: 'Screen titles and abstracts against your criteria. Check every unfamiliar journal; drop predatory and hijacked sources.', links: [['journals/verify', 'Ten-minute journal check'], ['journals/scorecard', 'Scorecard']] },
    { t: 'Read', s: 'Three passes, notes', d: 'Read in passes. Write one note per paper in your own words, with page numbers for findings.', links: [['search/reading', 'Reading and notes']] },
    { t: 'Extract', s: 'The summary matrix', d: 'Enter each study in your matrix: setting, data, method, findings, limitations, relevance. Gemini Notebook can draft it; you verify it.', links: [['matrix/matrix', 'Summary matrix'], ['matrix/nlm-table', 'Gemini Notebook tables']] },
    { t: 'Synthesise', s: 'Themes and mind map', d: 'Group studies into themes, find agreements and disagreements, and draw the mind map that becomes your outline.', links: [['matrix/mindmap', 'Mind map'], ['writing/good', 'Organising approaches']] },
    { t: 'Gap', s: 'What is missing, and why it matters', d: 'Identify the type of gap, check it against the matrix, and write a four-move gap statement.', links: [['gap/what', 'The literature gap'], ['gap/write', 'Gap statement']] },
    { t: 'Frame', s: 'Theory to variables', d: 'Build the framework your study needs, with every arrow justified by theory or evidence and every variable carried into Chapter 3.', links: [['framework/compare', 'Frameworks'], ['framework/build', 'Build your own']] },
    { t: 'Write and revise', s: 'Synthesis, voice, checks', d: 'Write thematic synthesis paragraphs, then check structure, citations, slop and integrity before submitting.', links: [['chapter/structure', 'Chapter blueprint'], ['toolkit/checklist', 'Self-check']] }
  ];
  (function roadmap() {
    var box = $('#roadmap'), detail = $('#roadmap-detail');
    if (!box) return;
    ROAD.forEach(function (r, i) {
      var b = el('button', { type: 'button', class: 'roadmap__step', 'aria-pressed': 'false' }, '<b>' + esc(r.t) + '</b><span>' + esc(r.s) + '</span>');
      b.addEventListener('click', function () { show(i); });
      box.appendChild(b);
    });
    function show(i) {
      $$('.roadmap__step', box).forEach(function (b, j) { b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
      var r = ROAD[i];
      detail.innerHTML = '<h3>Stage ' + (i + 1) + ': ' + esc(r.t) + '</h3><p>' + esc(r.d) + '</p><div class="btn-row mb-0">' +
        r.links.map(function (l) { return '<a class="btn btn--small" href="#/' + l[0] + '">' + esc(l[1]) + '</a>'; }).join('') + '</div>';
    }
    show(0);
  })();

  /* ======================================================================
     2. Boolean query builder
     ====================================================================== */
  (function booleanBuilder() {
    var wrap = $('#bool-concepts');
    if (!wrap) return;
    var LABELS = ['Concept 1 (e.g. the cause)', 'Concept 2 (e.g. the outcome)', 'Concept 3 (e.g. the unit)', 'Concept 4 (e.g. the place)', 'Concept 5', 'Concept 6'];
    var EXAMPLE = ['remittances, remittance income, migrant transfers', 'education expenditure, schooling, educational spending', 'household, households, family'];
    var concepts = ['', '', ''];

    function draw() {
      wrap.innerHTML = '';
      concepts.forEach(function (v, i) {
        var row = el('div', { class: 'concept' });
        row.innerHTML = '<div class="concept__and" aria-hidden="true">' + (i === 0 ? '' : 'AND') + '</div>' +
          '<div class="field mb-0"><label for="bool-c' + i + '">' + esc(LABELS[i] || 'Concept ' + (i + 1)) + '</label>' +
          '<input type="text" id="bool-c' + i + '" value="' + esc(v) + '" placeholder="synonym one, synonym two, a phrase"></div>';
        wrap.appendChild(row);
        $('input', row).addEventListener('input', function (e) { concepts[i] = e.target.value; build(); });
      });
      build();
    }
    function terms(s) {
      return String(s).split(/[,;\n]/).map(function (t) { return t.trim(); }).filter(Boolean)
        .map(function (t) { return /\s/.test(t) && !/^".*"$/.test(t) ? '"' + t.replace(/"/g, '') + '"' : t; });
    }
    function highlight(s) {
      return esc(s)
        .replace(/&quot;([^&]*?)&quot;/g, '<span class="q-str">&quot;$1&quot;</span>')
        .replace(/\b(AND NOT|AND|OR|NOT)\b/g, '<span class="q-op">$1</span>')
        .replace(/(intitle:|allintitle:|TITLE-ABS-KEY|PUBYEAR|\bTI\b|\bAB\b)/g, '<span class="q-field">$1</span>')
        .replace(/(^|\s)-(?=\S)/g, '$1<span class="q-op">-</span>');
    }
    function build() {
      var groups = concepts.map(terms).filter(function (g) { return g.length; });
      var not = terms($('#bool-not').value);
      var from = parseInt($('#bool-from').value, 10), to = parseInt($('#bool-to').value, 10);
      var title = $('#bool-title').checked;
      var status = $('#bool-status');
      if (!groups.length) {
        $('#bool-gs').textContent = 'Your search string will appear here.';
        $('#bool-scopus').textContent = '';
        $('#bool-ebsco').textContent = '';
        status.textContent = '';
        return;
      }
      var gsParts = groups.map(function (g, i) {
        if (i === 0 && title) {
          return g.length > 1 ? '(' + g.map(function (t) { return 'intitle:' + t; }).join(' OR ') + ')' : 'intitle:' + g[0];
        }
        return g.length > 1 ? '(' + g.join(' OR ') + ')' : g[0];
      });
      var gs = gsParts.join(' ') + (not.length ? ' ' + not.map(function (t) { return '-' + t; }).join(' ') : '');
      $('#bool-gs').innerHTML = highlight(gs);

      var sc = 'TITLE-ABS-KEY(' + groups.map(function (g) { return '(' + g.join(' OR ') + ')'; }).join(' AND ') + ')';
      if (not.length) sc += ' AND NOT TITLE-ABS-KEY(' + not.join(' OR ') + ')';
      if (from) sc += ' AND PUBYEAR > ' + (from - 1);
      if (to) sc += ' AND PUBYEAR < ' + (to + 1);
      $('#bool-scopus').innerHTML = highlight(sc);

      var eb = groups.map(function (g) { var j = g.join(' OR '); return '(TI (' + j + ') OR AB (' + j + '))'; }).join(' AND ');
      if (not.length) eb += ' NOT (' + not.join(' OR ') + ')';
      $('#bool-ebsco').innerHTML = highlight(eb);

      var url = 'https://scholar.google.com/scholar?q=' + encodeURIComponent(gs);
      if (from) url += '&as_ylo=' + from;
      if (to) url += '&as_yhi=' + to;
      $('#bool-open').href = url;

      var msgs = [];
      if (gs.length > 256) msgs.push('This string is ' + gs.length + ' characters long. Google Scholar may cut long queries without warning: split it into two or three shorter searches.');
      if (groups.some(function (g) { return g.some(function (t) { return /\*/.test(t); }); })) msgs.push('Google Scholar ignores the * truncation symbol. Type the word endings out with OR.');
      if (from || to) msgs.push('Dates are added to the link; in Scholar itself, set them under "Custom range".');
      status.textContent = msgs.join(' ');
      status.classList.toggle('is-warn', gs.length > 256);
    }
    $('#bool-add').addEventListener('click', function () { if (concepts.length < 6) { concepts.push(''); draw(); } });
    $('#bool-example').addEventListener('click', function () {
      concepts = EXAMPLE.slice();
      $('#bool-not').value = 'health';
      $('#bool-from').value = '2010';
      $('#bool-to').value = '2026';
      $('#bool-title').checked = true;
      draw();
    });
    $('#bool-clear').addEventListener('click', function () {
      concepts = ['', '', ''];
      ['#bool-not', '#bool-from', '#bool-to'].forEach(function (s) { $(s).value = ''; });
      $('#bool-title').checked = false;
      draw();
    });
    ['#bool-not', '#bool-from', '#bool-to'].forEach(function (s) { $(s).addEventListener('input', build); });
    $('#bool-title').addEventListener('change', build);
    draw();
  })();

  /* ======================================================================
     3. Journal legitimacy scorecard
     ====================================================================== */
  (function scorecard() {
    var list = $('#score-list');
    if (!list) return;
    var ITEMS = [
      { q: 'Listed in the Clarivate Master Journal List (SSCI, SCIE, AHCI or ESCI)?', w: 3, good: true },
      { q: 'Listed in Scopus Sources, and not on the discontinued list?', w: 3, good: true },
      { q: 'Does the website address match the one given in the Master Journal List or Scopus?', w: 2, good: true },
      { q: 'Is the ISSN registered to this exact title on the ISSN Portal?', w: 1, good: true },
      { q: 'Are the editors named, with affiliations you can verify?', w: 2, good: true },
      { q: 'Is the peer-review process described, with received and accepted dates on articles?', w: 2, good: true },
      { q: 'Are any fees stated clearly on the website before submission?', w: 1, good: true },
      { q: 'If open access: is it listed in DOAJ?', w: 1, good: true, hint: 'Answer "unsure" if not open access.' },
      { q: 'Do its articles have DOIs that resolve to the article?', w: 1, good: true },
      { q: 'Is it rated by ABDC, AJG or RePEc, or indexed in MyCite?', w: 1, good: true },
      { q: 'Did it reach you through an unsolicited, flattering invitation?', w: 2, good: false },
      { q: 'Does it promise review or publication within days?', w: 3, good: false },
      { q: 'Does it display impact factors not issued by Clarivate ("Global", "Universal", "ISI")?', w: 3, good: false },
      { q: 'Does its scope cover unrelated disciplines?', w: 2, good: false },
      { q: 'Does it appear in the Retraction Watch Hijacked Journal Checker?', w: 4, good: false, hijack: true },
      { q: 'Is payment requested to a personal account, or are fees revealed only after acceptance?', w: 3, good: false }
    ];
    var answers = {};
    ITEMS.forEach(function (it, i) {
      var li = el('li', { class: 'score-item' });
      li.innerHTML = '<span class="score-item__q">' + esc(it.q) + (it.hint ? '<small>' + esc(it.hint) + '</small>' : '') +
        (it.good ? '' : '<small>Warning sign</small>') + '</span>' +
        '<span class="seg" role="group" aria-label="Answer">' +
        ['yes', 'no', 'unsure'].map(function (v) { return '<button type="button" data-v="' + v + '" aria-pressed="false">' + v.charAt(0).toUpperCase() + v.slice(1) + '</button>'; }).join('') +
        '</span>';
      $$('button', li).forEach(function (b) {
        b.addEventListener('click', function () {
          answers[i] = b.getAttribute('data-v');
          $$('button', li).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          verdict();
        });
      });
      list.appendChild(li);
    });
    function verdict() {
      var gy = 0, gn = 0, ry = 0, n = 0, hij = false, reds = [];
      ITEMS.forEach(function (it, i) {
        var a = answers[i];
        if (!a) return;
        n++;
        if (it.good && a === 'yes') gy += it.w;
        if (it.good && a === 'no') gn += it.w;
        if (!it.good && a === 'yes') { ry += it.w; reds.push(it.q); if (it.hijack) hij = true; }
      });
      var cls, msg;
      if (hij) { cls = 'bad'; msg = 'Do not use this website: it is probably a hijacked copy of a real journal. Find the genuine site through Scopus or the Master Journal List.'; }
      else if (ry >= 5 || (ry >= 3 && gy < 4)) { cls = 'bad'; msg = 'Likely predatory: do not submit, and do not rely on its articles as evidence.'; }
      else if (n < 6) { cls = ''; msg = 'Answer at least six questions for a verdict.'; }
      else if (gy >= 8 && ry === 0) { cls = 'good'; msg = 'Credible: read and cite its articles, judging each one on its design and data.'; }
      else { cls = 'warn'; msg = 'Uncertain: check further (ask the library or your supervisor) and prefer stronger sources for claims your argument depends on.'; }
      $('#score-out').innerHTML = '<div class="verdict' + (cls ? ' verdict--' + cls : '') + '">' + esc(msg) + '</div>' +
        '<p class="small muted mb-0">Good signs: ' + gy + ' points. Missing good signs: ' + gn + ' points. Warning signs: ' + ry + ' points. Questions answered: ' + n + ' of ' + ITEMS.length + '.</p>' +
        (reds.length ? '<ul class="findings">' + reds.map(function (r) { return '<li>' + icon('alert') + '<span>' + esc(r) + '</span></li>'; }).join('') + '</ul>' : '');
    }
    $('#score-reset').addEventListener('click', function () {
      answers = {};
      $$('.seg button', list).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      $('#score-name').value = '';
      verdict();
    });
    verdict();
  })();

  /* ======================================================================
     4. Quizzes
     ====================================================================== */
  (function quizzes() {
    var banks = window.LR_QUIZZES || {};
    $$('.quiz[data-quiz]').forEach(function (box) {
      var bank = banks[box.getAttribute('data-quiz')];
      if (!bank) return;
      var answered = 0, correct = 0;
      var head = el('div', { class: 'quiz__progress' }, '<span data-q-progress></span><button type="button" class="btn btn--small btn--ghost" data-q-reset>' + icon('refresh') + 'Start again</button>');
      box.appendChild(head);
      var itemsWrap = el('div');
      box.appendChild(itemsWrap);
      var score = el('div', { class: 'quiz__score', hidden: '' });
      box.appendChild(score);

      function render() {
        answered = 0; correct = 0;
        itemsWrap.innerHTML = '';
        bank.items.forEach(function (it, qi) {
          var item = el('div', { class: 'quiz__item' });
          item.innerHTML = '<p class="quiz__q">' + (qi + 1) + '. ' + it.q + (it.x ? '<span class="excerpt">' + it.x + '</span>' : '') + '</p>' +
            '<div class="quiz__opts">' + it.o.map(function (o, oi) {
              return '<button type="button" class="quiz__opt" data-oi="' + oi + '"><span class="quiz__key">' + 'ABCDEF'.charAt(oi) + '</span><span>' + o + '</span></button>';
            }).join('') + '</div><div class="quiz__fb" hidden></div>';
          $$('.quiz__opt', item).forEach(function (b) {
            b.addEventListener('click', function () {
              var oi = +b.getAttribute('data-oi');
              var ok = oi === it.a;
              $$('.quiz__opt', item).forEach(function (x) {
                x.disabled = true;
                if (+x.getAttribute('data-oi') === it.a) x.classList.add('is-correct');
              });
              if (!ok) b.classList.add('is-wrong');
              var fb = $('.quiz__fb', item);
              var text = Array.isArray(it.f) ? it.f[oi] : it.f;
              fb.innerHTML = '<b>' + (ok ? 'Correct.' : 'Not quite. The best answer is ' + 'ABCDEF'.charAt(it.a) + '.') + '</b> ' + text;
              fb.className = 'quiz__fb ' + (ok ? 'is-correct' : 'is-wrong');
              fb.hidden = false;
              answered++;
              if (ok) correct++;
              paint();
            });
          });
          itemsWrap.appendChild(item);
        });
        paint();
      }
      function paint() {
        $('[data-q-progress]', head).textContent = answered + ' of ' + bank.items.length + ' answered';
        if (answered === bank.items.length) {
          score.hidden = false;
          score.innerHTML = '<strong>' + correct + ' / ' + bank.items.length + '</strong><span>' +
            (correct === bank.items.length ? 'All correct. Well done.' : correct >= bank.items.length * 0.6 ? 'A good result. Reread the feedback on the ones you missed.' : 'Worth another look: revisit the lesson, then start again.') + '</span>';
        } else {
          score.hidden = true;
        }
      }
      $('[data-q-reset]', head).addEventListener('click', render);
      render();
    });
  })();

  /* ======================================================================
     5. Checklists (saved per name)
     ====================================================================== */
  (function checklists() {
    var names = {};
    $$('ul.checklist[data-checklist]').forEach(function (ul) { names[ul.getAttribute('data-checklist')] = true; });
    Object.keys(names).forEach(function (name) {
      var boxes = $$('ul.checklist[data-checklist="' + name + '"] input[type="checkbox"]');
      var saved = store.get('lr-check-' + name, []);
      boxes.forEach(function (b, i) {
        b.checked = !!saved[i];
        b.addEventListener('change', function () { save(); paint(); });
      });
      function save() { store.set('lr-check-' + name, boxes.map(function (b) { return b.checked; })); }
      function paint() {
        var n = boxes.filter(function (b) { return b.checked; }).length;
        $$('[data-checklist-bar="' + name + '"]').forEach(function (bar) {
          var c = $('[data-checklist-count]', bar);
          if (c) c.textContent = n + ' of ' + boxes.length + ' ticked';
          var p = $('[data-checklist-progress]', bar);
          if (p) { p.max = boxes.length; p.value = n; }
        });
      }
      $$('[data-checklist-reset="' + name + '"]').forEach(function (b) {
        b.addEventListener('click', function () { boxes.forEach(function (x) { x.checked = false; }); save(); paint(); });
      });
      paint();
    });
  })();

  /* ======================================================================
     6. Framework decision tree
     ====================================================================== */
  (function decisionTree() {
    var box = $('#dtree');
    if (!box) return;
    var N = {
      start: { q: 'What must your framework show your examiners first?', o: [
        ['Why my variables should be related, using established theory', 'theory'],
        ['Exactly which variables my study links, drawing on several theories and earlier findings', 'R_conceptual'],
        ['How the whole study proceeds, from the problem to the outputs', 'multi'],
        ['How the data will be analysed to answer each question', 'R_analytical']] },
      theory: { q: 'Will you test one established theory largely as it stands?', o: [
        ['Yes: one theory, tested with my data', 'math'],
        ['No: I combine or adapt several theories', 'R_conceptual']] },
      math: { q: 'Can the theory be written as a model with signed predictions?', o: [
        ['Yes, for example a utility- or profit-maximisation model', 'R_theory_math'],
        ['Not easily, for example a behavioural or institutional theory', 'R_theory_diag']] },
      multi: { q: 'Does your study have several strands, methods or work packages?', o: [
        ['Yes: an evaluation, a mixed-methods design or a funded project', 'R_research'],
        ['No: one main question and one main method', 'R_conceptual']] },
      R_theory_math: { r: 'Theoretical framework, in mathematical form', d: 'State the model, derive the behavioural function and the signs of its derivatives, then map each argument to a measured variable.', where: 'Chapter 2, leading to the estimating equation in Chapter 3.', ex: [['chapter/theoretical', 'Becker (1968) example'], ['framework/forms', 'From theory to equation']] },
      R_theory_diag: { r: 'Theoretical framework, in diagram form', d: 'Show the theory\'s constructs and the relationships it predicts, cite it on the diagram, and trace each construct to the variable you will measure.', where: 'End of Chapter 2.', ex: [['framework/gallery', 'Gallery: TPB and wage examples']] },
      R_conceptual: { r: 'Conceptual framework, grounded in theory', d: 'Draw your own variables and the hypothesised relationships between them, label arrows H1, H2 and so on, and cite the theories and studies that justify each arrow.', where: 'End of Chapter 2 (or the start of Chapter 3, if your school prefers).', ex: [['framework/compare', 'The four frameworks'], ['framework/build', 'Build your own']] },
      R_research: { r: 'Research framework, with a conceptual or analytical framework for each strand', d: 'Map the issue, questions, objectives, instruments, outputs and outcomes, and add the theory each strand rests on.', where: 'Chapter 1 or 3 for the research framework; Chapter 2 for the theory behind it.', ex: [['framework/gallery', 'Gallery: TPP and LS-JS examples']] },
      R_analytical: { r: 'Analytical framework, motivated by theory', d: 'Specify the models, estimators, tests and steps that turn data into answers, and show which objective each result serves.', where: 'Chapter 3, with the motivating theory in Chapter 2.', ex: [['framework/forms', 'QUAIDS example']] }
    };
    var trail = [];
    function draw(id) {
      var n = N[id];
      var crumbs = trail.map(function (t) { return '<span class="dtree__crumb">' + esc(t) + '</span>'; }).join('');
      if (n.q) {
        box.innerHTML = (crumbs ? '<div class="dtree__trail">' + crumbs + '</div>' : '') +
          '<p class="dtree__q">' + esc(n.q) + '</p><div class="dtree__opts">' +
          n.o.map(function (o, i) { return '<button type="button" class="quiz__opt" data-i="' + i + '"><span class="quiz__key">' + 'ABCD'.charAt(i) + '</span><span>' + esc(o[0]) + '</span></button>'; }).join('') +
          '</div>' + (trail.length ? '<div class="btn-row"><button type="button" class="btn btn--small btn--ghost" data-restart>' + icon('refresh') + 'Start again</button></div>' : '');
        $$('[data-i]', box).forEach(function (b) {
          b.addEventListener('click', function () {
            var o = n.o[+b.getAttribute('data-i')];
            trail.push(o[0]);
            draw(o[1]);
          });
        });
      } else {
        box.innerHTML = '<div class="dtree__trail">' + crumbs + '</div><div class="dtree__result"><h4>' + esc(n.r) + '</h4><p>' + esc(n.d) + '</p><p><b>Where it goes:</b> ' + esc(n.where) + '</p>' +
          '<div class="btn-row">' + n.ex.map(function (e) { return '<a class="btn btn--small" href="#/' + e[0] + '">' + esc(e[1]) + '</a>'; }).join('') + '</div>' +
          '<p class="small mb-0">If your school allows only one framework, compare this with the alternatives below and agree the choice with your supervisor.</p></div>' +
          '<div class="btn-row"><button type="button" class="btn btn--small" data-restart>' + icon('refresh') + 'Start again</button></div>';
      }
      var r = $('[data-restart]', box);
      if (r) r.addEventListener('click', function () { trail = []; draw('start'); });
    }
    draw('start');
  })();

  /* ======================================================================
     7. Matrix builder
     ====================================================================== */
  var MATRIX_PRESETS = {
    empirical: {
      cols: ['Author (year)', 'Country and period', 'Data and N', 'Dependent variable', 'Explanatory variables', 'Method and identification', 'Main findings (magnitude, page)', 'Limitations', 'Relevance to my study', 'Journal check'],
      example: ['Jack & Suri (2014)', 'Kenya, 2008 to 2010', 'Household panel survey', 'Household consumption', 'M-Pesa use; income shocks', 'Panel; variation in access to agents', 'Users maintained consumption after negative shocks; non-users reduced it (see main results tables)', 'East African setting; adoption not random', 'Mechanism for e-wallets and risk sharing in Malaysia', 'AER: SSCI, Q1']
    },
    theory: {
      cols: ['Theory or model', 'Author(s) (year)', 'Core proposition', 'Key assumptions', 'Predictions (signs)', 'Critiques and evidence', 'Variables implied', 'Use in my framework'],
      example: ['Economic model of crime', 'Becker (1968)', 'Offences depend on the probability and severity of punishment and on other influences', 'Rational, utility-maximising individuals', 'Offences fall as probability (p) and severity (f) of punishment rise', 'Deterrence effects vary; data on p and f are imperfect', 'Arrest or conviction rate; sentence length; legal income', 'Theoretical basis of H1 and H2']
    },
    synthesis: { cols: null, example: null }
  };
  (function matrixBuilder() {
    var table = $('#matrix-table');
    if (!table) return;
    var state = store.get('lr-matrix', null) || { preset: 'empirical', themes: 'Theme A, Theme B, Theme C', rows: {} };
    if (!state.rows) state.rows = {};
    var presetSel = $('#matrix-preset'), themesIn = $('#matrix-themes'), status = $('#matrix-status');
    presetSel.value = state.preset;
    themesIn.value = state.themes;

    function cols() {
      if (state.preset === 'synthesis') {
        var th = state.themes.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
        return ['Study'].concat(th.length ? th : ['Theme A']);
      }
      return MATRIX_PRESETS[state.preset].cols;
    }
    function rows() {
      if (!state.rows[state.preset]) state.rows[state.preset] = [[]];
      return state.rows[state.preset];
    }
    var saveT;
    function save() { clearTimeout(saveT); saveT = setTimeout(function () { store.set('lr-matrix', state); }, 250); }
    function draw() {
      var c = cols(), r = rows();
      $('#matrix-themes-field').hidden = state.preset !== 'synthesis';
      table.innerHTML = '<thead><tr>' + c.map(function (h) { return '<th scope="col">' + esc(h) + '</th>'; }).join('') + '<th scope="col"><span class="visually-hidden">Remove</span></th></tr></thead><tbody></tbody>';
      var tb = $('tbody', table);
      r.forEach(function (row, ri) {
        var tr = el('tr');
        c.forEach(function (h, ci) {
          var td = el('td');
          var ta = el('textarea', { 'aria-label': h + ', row ' + (ri + 1), rows: '3' });
          ta.value = row[ci] || '';
          ta.addEventListener('input', function () { row[ci] = ta.value; save(); });
          td.appendChild(ta);
          tr.appendChild(td);
        });
        var ctl = el('td', { class: 'matrix__ctl' });
        var del = el('button', { type: 'button', class: 'btn btn--small btn--ghost', 'aria-label': 'Remove row ' + (ri + 1) }, icon('trash'));
        del.addEventListener('click', function () { r.splice(ri, 1); if (!r.length) r.push([]); save(); draw(); });
        ctl.appendChild(del);
        tr.appendChild(ctl);
        tb.appendChild(tr);
      });
      status.textContent = r.length + (r.length === 1 ? ' row' : ' rows') + '. Saved in this browser only.';
    }
    presetSel.addEventListener('change', function () { state.preset = presetSel.value; save(); draw(); });
    themesIn.addEventListener('change', function () { state.themes = themesIn.value; save(); draw(); });
    $('#matrix-add').addEventListener('click', function () { rows().push([]); save(); draw(); });
    $('#matrix-example').addEventListener('click', function () {
      var ex = MATRIX_PRESETS[state.preset].example;
      if (!ex) {
        var c = cols();
        ex = ['Jack & Suri (2014)'].concat(c.slice(1).map(function (t, i) { return i === 0 ? 'Users kept consumption steady after shocks' : ''; }));
      }
      var r = rows();
      if (r.length === 1 && !r[0].join('')) r[0] = ex.slice(); else r.push(ex.slice());
      save(); draw();
    });
    $('#matrix-clear').addEventListener('click', function () {
      if (!window.confirm('Remove all rows from this template? This cannot be undone.')) return;
      state.rows[state.preset] = [[]]; save(); draw();
    });
    $('#matrix-csv').addEventListener('click', function () {
      var c = cols();
      var lines = [c.map(csvCell).join(',')].concat(rows().map(function (r) { return c.map(function (h, i) { return csvCell(r[i]); }).join(','); }));
      download('literature-matrix-' + state.preset + '.csv', '﻿' + lines.join('\r\n'), 'text/csv');
      status.textContent = 'Downloaded literature-matrix-' + state.preset + '.csv';
    });
    $('#matrix-md').addEventListener('click', function () {
      var c = cols();
      var tsv = [c.join('\t')].concat(rows().map(function (r) { return c.map(function (h, i) { return String(r[i] || '').replace(/[\t\n]+/g, ' '); }).join('\t'); })).join('\n');
      LR.copyText(tsv).then(function () { LR.toast('Copied: paste into Excel, Google Sheets or a Word table'); });
    });
    draw();
  })();

  /* ======================================================================
     8. Prompt library and prompt builder
     ====================================================================== */
  var P = window.LR_PROMPTS;
  function fieldLabel(key) {
    var f = P && P.fields.filter(function (x) { return x.key === key; })[0];
    return f ? f.label : key;
  }
  function slotsHTML(body, values) {
    return esc(body).replace(/\{\{(\w+)\}\}/g, function (m, k) {
      var v = values && values[k];
      return v ? esc(v) : '<span class="slot">[' + esc(fieldLabel(k).toLowerCase()) + ']</span>';
    }).replace(/(\[(?:PASTE|LIST|ADD|DESCRIBE|NAME)[^\]]*\])/g, '<span class="slot">$1</span>');
  }
  (function promptLibrary() {
    var lib = $('#prompt-library'), filter = $('#prompt-filter');
    if (!lib || !P) return;
    var stageName = {};
    P.stages.forEach(function (s) { stageName[s.id] = s.name; });
    P.prompts.forEach(function (p) {
      var card = el('div', { class: 'prompt', 'data-stage': p.stage, id: 'prompt-' + p.id });
      card.innerHTML = '<div class="prompt__head"><span class="prompt__name">' + icon('sparkles') + esc(p.id + '. ' + p.title) + ' <span class="tag tag--ai">' + esc(stageName[p.stage]) + '</span></span></div>' +
        '<p class="prompt__meta"><b>Purpose:</b> ' + esc(p.purpose) + ' <b>Where to use it:</b> ' + esc(p.use) + '.</p>' +
        '<pre class="prompt__body">' + slotsHTML(p.body) + '</pre>' +
        '<p class="prompt__meta"><b>After running it:</b> ' + p.after.map(esc).join(' ') + '</p>';
      lib.appendChild(card);
    });
    var stages = [{ id: 'all', name: 'All' }].concat(P.stages);
    stages.forEach(function (s, i) {
      var b = el('button', { type: 'button', class: 'btn btn--small' + (i === 0 ? ' btn--primary' : ''), 'aria-pressed': i === 0 ? 'true' : 'false' }, esc(s.name));
      b.addEventListener('click', function () {
        $$('button', filter).forEach(function (x) { x.classList.remove('btn--primary'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('btn--primary');
        b.setAttribute('aria-pressed', 'true');
        $$('.prompt', lib).forEach(function (c) { c.hidden = !(s.id === 'all' || c.getAttribute('data-stage') === s.id); });
      });
      filter.appendChild(b);
    });
  })();
  (function promptBuilder() {
    var sel = $('#pb-select');
    if (!sel || !P) return;
    var values = store.get('lr-prompt-fields', {});
    P.stages.forEach(function (s) {
      var g = el('optgroup', { label: s.name });
      P.prompts.filter(function (p) { return p.stage === s.id; }).forEach(function (p) {
        g.appendChild(el('option', { value: p.id }, esc(p.id + '. ' + p.title)));
      });
      sel.appendChild(g);
    });
    function current() { return P.prompts.filter(function (p) { return p.id === sel.value; })[0] || P.prompts[0]; }
    function keys(p) {
      var k = [];
      p.body.replace(/\{\{(\w+)\}\}/g, function (m, x) { if (k.indexOf(x) < 0) k.push(x); });
      return k;
    }
    function drawFields() {
      var p = current(), wrap = $('#pb-fields');
      var ks = keys(p);
      wrap.innerHTML = ks.length ? '' : '<p class="small muted">This prompt has no project fields; paste your material where the prompt says.</p>';
      ks.forEach(function (k) {
        var f = P.fields.filter(function (x) { return x.key === k; })[0] || { key: k, label: k, placeholder: '' };
        var d = el('div', { class: 'field' });
        d.innerHTML = '<label for="pb-' + k + '">' + esc(f.label) + '</label>' +
          (k === 'rq' ? '<textarea id="pb-' + k + '" rows="3" placeholder="' + esc(f.placeholder) + '"></textarea>' : '<input type="text" id="pb-' + k + '" placeholder="' + esc(f.placeholder) + '">');
        var input = $('input, textarea', d);
        input.value = values[k] || '';
        input.addEventListener('input', function () { values[k] = input.value; store.set('lr-prompt-fields', values); preview(); });
        wrap.appendChild(d);
      });
      preview();
    }
    function preview() {
      var p = current();
      $('#pb-title').textContent = p.id + '. ' + p.title;
      $('#pb-use').textContent = 'Where to use it: ' + p.use + '. ' + p.purpose;
      $('#pb-out').innerHTML = slotsHTML(p.body, values);
      $('#pb-after').innerHTML = '<p class="small"><b>After running it:</b></p><ul class="small">' + p.after.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>';
    }
    sel.addEventListener('change', drawFields);
    $('#pb-example').addEventListener('click', function () {
      P.fields.forEach(function (f) { values[f.key] = f.example; });
      store.set('lr-prompt-fields', values);
      drawFields();
    });
    $('#pb-clear').addEventListener('click', function () {
      values = {};
      store.set('lr-prompt-fields', values);
      drawFields();
    });
    drawFields();
  })();

  /* ======================================================================
     9. Slop list and scanner
     ====================================================================== */
  var S = window.LR_SLOP;
  (function slopTable() {
    var tb = $('#slop-table tbody');
    if (!tb || !S) return;
    var all = S.words.map(function (w) { return { t: w.t, k: 'Word', alt: w.alt, why: w.why }; })
      .concat(S.phrases.map(function (w) { return { t: w.t, k: 'Phrase', alt: w.alt, why: w.why }; }))
      .sort(function (a, b) { return a.t.localeCompare(b.t); });
    tb.innerHTML = all.map(function (w) {
      return '<tr><td><b>' + esc(w.t) + '</b></td><td><span class="tag ' + (w.k === 'Word' ? 'tag--gilt' : 'tag--teach') + '">' + w.k + '</span></td><td>' + esc(w.alt) + '</td><td>' + esc(w.why) + '</td></tr>';
    }).join('');
    var f = $('#slop-filter');
    if (f) f.addEventListener('input', function () {
      var q = f.value.trim().toLowerCase();
      $$('tr', tb).forEach(function (tr) { tr.hidden = q && tr.textContent.toLowerCase().indexOf(q) < 0; });
    });
  })();

  function rx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function scan(text) {
    var norm = text.replace(/[‘’]/g, "'");
    var words = (norm.match(/[A-Za-zÀ-ɏ]+(?:['-][A-Za-z]+)*/g) || []).length;
    var marks = [], findings = {}, flags = [];
    function add(start, end, cat, key, alt, why) {
      marks.push({ s: start, e: end, cat: cat, key: key, alt: alt, why: why });
    }
    var lex = S.phrases.map(function (p) { return { t: p.t, cat: 'filler', alt: p.alt, why: p.why }; })
      .concat(S.words.map(function (w) { return { t: w.t, cat: 'word', alt: w.alt, why: w.why }; }))
      .sort(function (a, b) { return b.t.length - a.t.length; });
    lex.forEach(function (x) {
      var pre = /^\w/.test(x.t) ? '\\b' : '', post = /\w$/.test(x.t) ? '\\b' : '';
      var re = new RegExp(pre + rx(x.t) + post, 'gi'), m;
      while ((m = re.exec(norm))) add(m.index, m.index + m[0].length, x.cat, x.t, x.alt, x.why);
    });
    var structure = [
      { re: /—|\s–\s/g, key: 'Em dash', why: 'Frequent em dashes are typical of chatbot prose; commas, colons or brackets usually read better.' },
      { re: /\bnot only\b[^.?!]{0,140}?\bbut also\b/gi, key: '"Not only ... but also"', why: 'A padding formula; "and", or two sentences, is usually clearer.' },
      { re: /\b(?:it is|it's|this is)\s+not\s+(?:just|merely|simply|only)\b[^.?!]{0,100}/gi, key: '"Not just X, it is Y"', why: 'Sets up a straw man before the real point.' },
      { re: /\bnot (?:just|merely|simply) (?:about )?[^,.;?!]{1,40}, but\b/gi, key: '"Not just X, but Y"', why: 'Sets up a straw man before the real point.' },
      { re: /\b[\w-]+(?: [\w-]+)?, [\w-]+(?: [\w-]+)?,? (?:and|or) [\w-]+(?: [\w-]+)?\b/g, key: 'List of three', why: 'Lists of exactly three are a common rhythm in generated text. Keep only if the content really has three items.' },
      { re: /[^.?!\n]{8,}\?/g, key: 'Rhetorical question', why: 'Rare in economics literature reviews.' },
      { re: /(?:^|[.!?]\s+)(?:Furthermore|Moreover|Additionally|In addition|Ultimately|Notably|Importantly),/g, key: 'Sentence-initial connector', why: 'Many sentences opening with a connector give a mechanical feel.' }
    ];
    structure.forEach(function (x) {
      var m;
      while ((m = x.re.exec(norm))) {
        var s = m.index, e = m.index + m[0].length;
        if (x.key === 'Sentence-initial connector') { s = norm.indexOf(m[0].replace(/^[.!?]\s+/, ''), m.index); e = s + m[0].replace(/^[.!?]\s+/, '').length; }
        add(s, e, 'structure', x.key, '', x.why);
      }
    });
    var year = new Date().getFullYear(), m2;
    var cites = [
      { re: /\bet al(?![.\w])/g, key: '"et al" without a full stop', why: 'APA requires "et al."' },
      { re: /\bn\.d\./g, key: '"n.d." citation', why: 'Frequent "n.d." suggests unverified sources.' },
      { re: /retrieved from/gi, key: '"Retrieved from"', why: 'Not used in APA 7 for most sources.' },
      { re: /\[\d+(?:\s*[,–-]\s*\d+)*\]/g, key: 'Numbered citation', why: 'Mixing numbered and author-date citations suggests pasted text.' },
      { re: /["“][^"”]{15,}["”]\s*\((?![^)]*\bpp?\.)[^)]*\d{4}[^)]*\)/g, key: 'Quotation without page number', why: 'APA requires a page or paragraph number for direct quotations.' }
    ];
    cites.forEach(function (x) { var m; while ((m = x.re.exec(norm))) add(m.index, m.index + m[0].length, 'citation', x.key, '', x.why); });
    var yr = /\b(1[89]\d{2}|20\d{2})[a-z]?\b(?=[^()]*\))/g;
    while ((m2 = yr.exec(norm))) {
      if (+m2[1] > year) add(m2.index, m2.index + m2[0].length, 'citation', 'Citation year in the future', '', 'A strong sign of an invented or garbled reference.');
    }
    var sentences = norm.split(/(?<=[.!?])\s+/).map(function (s) { return (s.match(/[A-Za-z]+/g) || []).length; }).filter(function (n) { return n > 2; });
    if (sentences.length >= 5) {
      var mean = sentences.reduce(function (a, b) { return a + b; }, 0) / sentences.length;
      var sd = Math.sqrt(sentences.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / sentences.length);
      if (sd / mean < 0.25) flags.push({ key: 'Uniform sentence length', why: 'Sentences are all about ' + Math.round(mean) + ' words long. Human writing usually varies more.' });
    }
    if (words >= 70 && !/\d/.test(norm)) flags.push({ key: 'No specifics', why: 'No numbers, years or citations anywhere in ' + words + ' words. Literature reviews are specific.' });

    marks.sort(function (a, b) { return a.s - b.s || (b.e - b.s) - (a.e - a.s); });
    var kept = [], last = -1;
    marks.forEach(function (mk) { if (mk.s >= last) { kept.push(mk); last = mk.e; } });
    kept.forEach(function (mk) {
      if (!findings[mk.key]) findings[mk.key] = { key: mk.key, cat: mk.cat, n: 0, alt: mk.alt, why: mk.why };
      findings[mk.key].n++;
    });

    var weights = { word: 1, filler: 1.5, structure: 0.75, citation: 2 };
    var tells = kept.reduce(function (a, mk) { return a + weights[mk.cat]; }, 0) + flags.length * 2;
    var density = words ? tells / words * 100 : 0;
    var band = !words ? 0 : density < 1.2 ? 1 : density < 3 ? 2 : density < 6 ? 3 : density < 10 ? 4 : 5;
    return { text: text, kept: kept, findings: findings, flags: flags, words: words, density: density, band: band };
  }
  (function slopScanner() {
    var input = $('#slop-input');
    if (!input || !S) return;
    var out = $('#slop-out'), res = $('#slop-results');
    var CAT = { word: 'Inflated word', filler: 'Stock phrase', structure: 'Pattern', citation: 'Citation problem' };
    var BANDS = ['', 'Low', 'Some', 'Noticeable', 'Heavy', 'Saturated'];
    function run() {
      var t = input.value.trim();
      if (!t) { res.hidden = true; return; }
      var r = scan(t);
      var html = '', pos = 0;
      r.kept.forEach(function (mk) {
        html += esc(r.text.slice(pos, mk.s));
        html += '<mark data-cat="' + mk.cat + '" title="' + esc(CAT[mk.cat] + (mk.alt ? ': try "' + mk.alt + '"' : '')) + '">' + esc(r.text.slice(mk.s, mk.e)) + '</mark>';
        pos = mk.e;
      });
      html += esc(r.text.slice(pos));
      out.innerHTML = html;
      $('#slop-bands').setAttribute('data-band', String(r.band));
      $('#slop-summary').textContent = r.words + ' words. ' + r.kept.length + ' highlighted ' + (r.kept.length === 1 ? 'item' : 'items') + (r.flags.length ? ' and ' + r.flags.length + ' passage-level ' + (r.flags.length === 1 ? 'warning' : 'warnings') : '') + '. Band: ' + BANDS[r.band] + '.';
      var order = ['citation', 'filler', 'word', 'structure'];
      var f = Object.keys(r.findings).map(function (k) { return r.findings[k]; }).sort(function (a, b) { return order.indexOf(a.cat) - order.indexOf(b.cat) || b.n - a.n; });
      var items = r.flags.map(function (x) { return '<li>' + icon('alert') + '<span><b>' + esc(x.key) + '.</b> ' + esc(x.why) + '</span></li>'; })
        .concat(f.map(function (x) {
          return '<li><span class="tag ' + ({ word: 'tag--gilt', filler: 'tag--teach', structure: 'tag--info', citation: 'tag--bad' })[x.cat] + '">' + esc(CAT[x.cat]) + '</span><span><b>' + esc(x.key) + '</b>' + (x.n > 1 ? ' (' + x.n + ' times)' : '') + '. ' + esc(x.why) + (x.alt ? ' <i>Try: ' + esc(x.alt) + '.</i>' : '') + '</span></li>';
        }));
      $('#slop-findings').innerHTML = items.length ? items.join('') : '<li>' + icon('check-circle') + '<span>No tells found. Still read it aloud: plain and specific is the goal.</span></li>';
      res.hidden = false;
    }
    $('#slop-run').addEventListener('click', run);
    $('#slop-sample-bad').addEventListener('click', function () { input.value = S.samples.sloppy; run(); });
    $('#slop-sample-good').addEventListener('click', function () { input.value = S.samples.clean; run(); });
    $('#slop-clear').addEventListener('click', function () { input.value = ''; res.hidden = true; input.focus(); });
    input.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') run(); });
  })();
  LR.scanSlop = scan;

  /* ======================================================================
     10. Downloads
     ====================================================================== */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-download]');
    if (!b) return;
    var kind = b.getAttribute('data-download');
    if (kind === 'matrix') {
      var c = MATRIX_PRESETS.empirical.cols;
      download('literature-matrix-template.csv', '﻿' + [c.map(csvCell).join(','), MATRIX_PRESETS.empirical.example.map(csvCell).join(',')].join('\r\n'), 'text/csv');
    } else if (kind === 'searchlog') {
      var h = ['Date', 'Source', 'Exact search string', 'Limits', 'Hits', 'Kept', 'Notes'];
      download('search-log-template.csv', '﻿' + h.join(',') + '\r\n', 'text/csv');
    } else if (kind === 'prompts' && P) {
      var md = '# Literature review prompt pack\n\nFrom the Chapter 2 lessons. Replace the parts in [brackets] and {{double braces}}.\n\n';
      P.stages.forEach(function (s) {
        md += '## ' + s.name + '\n\n';
        P.prompts.filter(function (p) { return p.stage === s.id; }).forEach(function (p) {
          md += '### ' + p.id + '. ' + p.title + '\n\n*Purpose:* ' + p.purpose + '  \n*Where to use it:* ' + p.use + '\n\n```text\n' + p.body + '\n```\n\n*After running it:* ' + p.after.join(' ') + '\n\n';
        });
      });
      download('lr-prompt-pack.md', md, 'text/markdown');
    } else if (kind === 'note') {
      download('reading-note-template.txt', 'Reference (APA 7):\nSection of my Chapter 2:\nResearch question:\nTheory / mechanism:\nData (country, years, unit, N):\nMethod and identification:\nMain findings (with magnitudes; table or page number):\nLimitations (stated by authors):\nLimitations (my own view):\nHow it relates to other papers:\nWhat I will use from it:\nQuotable sentence (with page number), if any:\n');
    }
    LR.toast('Download started');
  });

  /* Dynamic content is in place: wire copy buttons and refresh the search index */
  LR.wireCopy(document);
  LR.rebuildSearch();
})();
