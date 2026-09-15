(function () {
  "use strict";

  /* ===================== STATE ===================== */
  let state = {
    days: {} // dayId -> per-day completion flags (session-only, resets on reload)
  };
  let activeProfile = 'hardy'; // 'hardy' | 'scott'

  let session = {
    dayId: null,
    dayStartTime: null,
    wordIdx: 0,
    sentenceOrder: [],
    sentenceIdx: 0,
    sentenceAttempts: 0,
    matchLeft: [],
    matchRight: [],
    selectedLeft: null,
    selectedRight: null,
    matchedKeys: [],
    wrongFlash: false,
    matchLock: false,
    spellQueue: [],
    spellTotalInitial: 0,
    spellPos: 0,
    spellAttempts: 0,
    reviewQueue: [],
    reviewTotalInitial: 0,
    reviewPos: 0,
    reviewAttempts: 0,
    reviewFillQueue: [],
    reviewFillTotalInitial: 0,
    reviewFillPos: 0,
    reviewFillAttempts: 0,
    previewIdx: 0,
    checkMcIdx: 0,
    checkShortIdx: 0,
    checkAttempts: 0
  };

  /* ===================== HELPERS ===================== */
  function $(id) { return document.getElementById(id); }
  function show(id) {
    document.querySelectorAll('.screen').forEach(function (s) { s.hidden = true; });
    $(id).hidden = false;
  }
  function renderRuby(pairs) {
    return pairs.map(function (p) {
      const ch = p[0];
      const symbols = Array.from(p[1]);
      let leadTone = '', trailTone = '';
      if (symbols.length && symbols[0] === '˙') { leadTone = symbols.shift(); }
      else if (symbols.length && 'ˊˇˋ'.indexOf(symbols[symbols.length - 1]) !== -1) { trailTone = symbols.pop(); }

      let rows = '';
      if (leadTone) {
        rows += '<span class="zy-row zy-tone-row"><span class="zy-tone-char">' + leadTone + '</span></span>';
      }
      symbols.forEach(function (s, i) {
        const isLast = i === symbols.length - 1;
        if (isLast && trailTone) {
          rows += '<span class="zy-row"><span class="zy-sym">' + s + '</span><span class="zy-tone-char">' + trailTone + '</span></span>';
        } else {
          rows += '<span class="zy-row"><span class="zy-sym">' + s + '</span></span>';
        }
      });

      return '<span class="zh-unit"><span class="zh-char">' + ch + '</span><span class="zh-zy">' + rows + '</span></span>';
    }).join('');
  }
  /* ===================== VOICE SELECTION ===================== */
  let preferredVoice = null;

  function rankVoice(v) {
    const name = v.name || '';
    if (/natural/i.test(name)) return 0;
    if (/online|enhanced|premium/i.test(name)) return 1;
    if (/google/i.test(name)) return 2;
    return 3;
  }

  function pickPreferredVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const enVoices = voices.filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf('en') === 0; });
    const pool = enVoices.length ? enVoices : voices;
    const sorted = pool.slice().sort(function (a, b) { return rankVoice(a) - rankVoice(b); });
    return sorted[0] || null;
  }

  if ('speechSynthesis' in window) {
    preferredVoice = pickPreferredVoice();
    window.speechSynthesis.onvoiceschanged = function () { preferredVoice = pickPreferredVoice(); };
  }

  function speak(text, voiceOverride) {
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      const v = voiceOverride || preferredVoice;
      if (v) { u.voice = v; }
      window.speechSynthesis.speak(u);
    } catch (e) { /* speech unavailable, ignore */ }
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function dayById(id) {
    return GRADE1_DAYS.concat(GRADE6_DAYS).filter(function (d) { return d.id === id; })[0];
  }

  const hardyDaysByDate = {};
  GRADE1_DAYS.forEach(function (d) { hardyDaysByDate[d.date] = d; });
  const grade6DaysByDate = {};
  GRADE6_DAYS.forEach(function (d) { grade6DaysByDate[d.date] = d; });

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function toIso(y, m, d) { return y + '-' + pad2(m + 1) + '-' + pad2(d); }
  const now = new Date();
  const todayIso = toIso(now.getFullYear(), now.getMonth(), now.getDate());
  let calView = { year: now.getFullYear(), month: now.getMonth() };

  const TEST_MODE = new URLSearchParams(location.search).get('test') === '1';

  function updateTestBar() {
    if (!TEST_MODE) return;
    const scott = activeProfile === 'scott';
    $('test-hardy-jumps').hidden = scott;
    $('test-scott-jumps').hidden = !scott;
    const day = session.dayId ? dayById(session.dayId) : null;
    $('test-current-day').textContent = day
      ? '目前：[' + (scott ? 'Scott' : 'Hardy') + '] ' + day.title
      : '請先點行事曆上的日期';
  }

  /* ===================== PROGRESS LOGGING (Google Form) ===================== */
  const GOOGLE_FORM_ID = '1FAIpQLScl8dNHaL7urPZQut6To9WYh_qX_rWpQU3hn8TAYuFKluZsLg';
  const GOOGLE_FORM_ENTRIES = {
    child: 'entry.1500129491',
    dayLabel: 'entry.2062457373',
    stage: 'entry.452910041',
    duration: 'entry.1418784165'
  };

  function formatDuration(ms) {
    const totalSec = Math.max(0, Math.round(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return m + '分' + (s < 10 ? '0' : '') + s + '秒';
  }

  function logProgress(child, dayLabel, stage, duration) {
    try {
      const form = document.createElement('form');
      form.action = 'https://docs.google.com/forms/d/e/' + GOOGLE_FORM_ID + '/formResponse';
      form.method = 'POST';
      form.target = 'hidden_iframe';
      form.style.display = 'none';

      const fields = {};
      fields[GOOGLE_FORM_ENTRIES.child] = child;
      fields[GOOGLE_FORM_ENTRIES.dayLabel] = dayLabel;
      fields[GOOGLE_FORM_ENTRIES.stage] = stage;
      fields[GOOGLE_FORM_ENTRIES.duration] = duration;

      Object.keys(fields).forEach(function (name) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = fields[name];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      setTimeout(function () { form.remove(); }, 1000);
    } catch (e) { /* best-effort logging; never block the app on this */ }
  }

  function ensureDayState(dayId) {
    if (!state.days[dayId]) {
      state.days[dayId] = {
        wordsDone: false, sentenceDone: false, matchDone: false, spellDone: false,
        reviewDone: false, previewDone: false, storyDone: false, checkDone: false
      };
    }
    return state.days[dayId];
  }

  function isDayDone(ds, profile) {
    return profile === 'scott'
      ? (ds.reviewDone && ds.previewDone && ds.storyDone && ds.checkDone)
      : (ds.wordsDone && ds.sentenceDone && ds.matchDone && ds.spellDone);
  }

  /* ===================== HOME / DAY SELECT (calendar) ===================== */
  function renderHome() {
    $('profile-name').textContent = activeProfile === 'scott' ? 'SCOTT' : 'HARDY';
    const daysByDate = activeProfile === 'scott' ? grade6DaysByDate : hardyDaysByDate;

    $('cal-title').textContent = calView.year + '年' + (calView.month + 1) + '月';

    const grid = $('cal-grid');
    grid.innerHTML = '';

    const firstWeekday = new Date(calView.year, calView.month, 1).getDay();
    const daysInMonth = new Date(calView.year, calView.month + 1, 0).getDate();

    for (let i = 0; i < firstWeekday; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-cell blank';
      grid.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const iso = toIso(calView.year, calView.month, d);
      const cell = document.createElement('div');
      const contentDay = daysByDate[iso];

      if (!contentDay) {
        cell.className = 'cal-cell plain';
        cell.textContent = d;
      } else {
        const unlocked = TEST_MODE || iso <= todayIso;
        const ds = ensureDayState(contentDay.id);
        const done = isDayDone(ds, activeProfile);
        cell.className = 'cal-cell has-content ' + (unlocked ? 'unlocked' : 'locked');
        cell.innerHTML =
          '<span>' + d + '</span>' +
          '<span class="cal-icon">' + (unlocked ? contentDay.emoji : '🔒') + '</span>' +
          (done ? '<span class="cal-badge">✅</span>' : '');
        if (unlocked) {
          cell.addEventListener('click', function () { startDay(contentDay.id); });
        }
      }

      if (iso === todayIso) { cell.classList.add('is-today'); }
      grid.appendChild(cell);
    }
  }

  $('cal-prev').addEventListener('click', function () {
    calView.month--;
    if (calView.month < 0) { calView.month = 11; calView.year--; }
    renderHome();
  });
  $('cal-next').addEventListener('click', function () {
    calView.month++;
    if (calView.month > 11) { calView.month = 0; calView.year++; }
    renderHome();
  });

  function startDay(dayId) {
    session.dayId = dayId;
    session.dayStartTime = Date.now();
    if (activeProfile === 'scott') {
      startPreviewCards();
    } else {
      session.wordIdx = 0;
      show('screen-words');
      renderWordCard();
    }
    updateTestBar();
  }

  /* ===================== WORD CARDS ===================== */
  function renderWordCard() {
    const day = dayById(session.dayId);
    const word = day.words[session.wordIdx];
    $('w-emoji').textContent = word.emoji;
    $('w-en').textContent = word.en;
    $('w-zh').innerHTML = renderRuby(word.wordZh);
    $('w-prev').disabled = session.wordIdx === 0;
    $('w-next').textContent = (session.wordIdx === day.words.length - 1) ? '去做短句練習 →' : '下一個';

    const dots = $('word-dots');
    dots.innerHTML = '';
    day.words.forEach(function (_, i) {
      const dot = document.createElement('span');
      if (i < session.wordIdx) dot.className = 'done';
      else if (i === session.wordIdx) dot.className = 'current';
      dots.appendChild(dot);
    });
  }

  $('w-speak').addEventListener('click', function () {
    const day = dayById(session.dayId);
    speak(day.words[session.wordIdx].en);
  });
  $('w-prev').addEventListener('click', function () {
    if (session.wordIdx > 0) { session.wordIdx--; renderWordCard(); }
  });
  $('w-next').addEventListener('click', function () {
    const day = dayById(session.dayId);
    if (session.wordIdx < day.words.length - 1) {
      session.wordIdx++;
      renderWordCard();
    } else {
      ensureDayState(day.id).wordsDone = true;
      startSentencePractice();
    }
  });

  /* ===================== SENTENCE PRACTICE ===================== */
  function startSentencePractice() {
    const day = dayById(session.dayId);
    session.sentenceOrder = shuffle(day.words.map(function (_, i) { return i; }));
    session.sentenceIdx = 0;
    show('screen-sentence');
    renderSentenceRound();
  }

  function renderSentenceRound() {
    const day = dayById(session.dayId);
    const word = day.words[session.sentenceOrder[session.sentenceIdx]];
    session.sentenceAttempts = 0;

    $('s-emoji').textContent = word.emoji;
    $('s-line').innerHTML = day.pattern.replace('___', '<span class="blank"></span>');
    $('s-hint').textContent = '';
    $('s-reveal').hidden = true;

    const dots = $('sent-dots');
    dots.innerHTML = '';
    day.words.forEach(function (_, i) {
      const dot = document.createElement('span');
      if (i < session.sentenceIdx) dot.className = 'done';
      else if (i === session.sentenceIdx) dot.className = 'current';
      dots.appendChild(dot);
    });

    const options = shuffle(day.words).slice(0, 4);
    if (options.indexOf(word) === -1) { options[0] = word; }
    const shuffledOptions = shuffle(options);

    const grid = $('s-options');
    grid.innerHTML = '';
    grid.hidden = false;
    shuffledOptions.forEach(function (opt) {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = '<span>' + opt.en + '</span>';
      btn.addEventListener('click', function () { handleSentenceAnswer(opt, word, btn); });
      grid.appendChild(btn);
    });
  }

  function handleSentenceAnswer(chosen, correct, btnEl) {
    const isCorrect = chosen.en === correct.en;
    const grid = $('s-options');

    if (isCorrect) {
      Array.prototype.forEach.call(grid.children, function (b) { b.disabled = true; });
      btnEl.classList.add('correct');
      setTimeout(function () { revealSentence(correct); }, 500);
      return;
    }

    session.sentenceAttempts++;
    btnEl.classList.add('wrong');
    btnEl.disabled = true;

    if (session.sentenceAttempts === 1) {
      $('s-hint').textContent = '再想想！提示：中文意思是「' + correct.wordZh.map(function (p) { return p[0]; }).join('') + '」';
    } else {
      Array.prototype.forEach.call(grid.children, function (b) { b.disabled = true; });
      setTimeout(function () { revealSentence(correct, true); }, 300);
    }
  }

  function revealSentence(word, wasRevealed) {
    const day = dayById(session.dayId);
    $('s-options').hidden = true;
    $('s-hint').textContent = '';
    $('s-reveal').hidden = false;
    $('s-reveal-en').textContent = day.pattern.replace('___', word.en);
    $('s-reveal-zh').innerHTML = renderRuby(word.zh);
    $('s-reveal-speak').onclick = function () { speak(day.pattern.replace('___', word.en)); };
    speak(day.pattern.replace('___', word.en));
  }

  $('s-continue').addEventListener('click', function () {
    const day = dayById(session.dayId);
    $('s-options').hidden = false;
    if (session.sentenceIdx < day.words.length - 1) {
      session.sentenceIdx++;
      renderSentenceRound();
    } else {
      ensureDayState(day.id).sentenceDone = true;
      startMatchGame();
    }
  });

  /* ===================== MATCHING GAME (left/right columns) ===================== */
  function startMatchGame() {
    const day = dayById(session.dayId);
    session.matchLeft = shuffle(day.words.map(function (w) { return { key: w.en, display: w.emoji }; }));
    session.matchRight = shuffle(day.words.map(function (w) { return { key: w.en, display: w.en }; }));
    session.selectedLeft = null;
    session.selectedRight = null;
    session.matchedKeys = [];
    session.wrongFlash = false;
    session.matchLock = false;
    show('screen-match');
    renderMatchColumns();
  }

  function renderMatchColumns() {
    const leftCol = $('match-col-left');
    const rightCol = $('match-col-right');
    leftCol.innerHTML = '';
    rightCol.innerHTML = '';

    session.matchLeft.forEach(function (item, idx) {
      const el = document.createElement('div');
      el.className = 'match-item';
      el.textContent = item.display;
      if (session.matchedKeys.indexOf(item.key) !== -1) {
        el.classList.add('matched');
      } else if (session.selectedLeft === idx) {
        el.classList.add(session.wrongFlash ? 'wrong' : 'selected');
      }
      el.addEventListener('click', function () { selectMatch('left', idx); });
      leftCol.appendChild(el);
    });

    session.matchRight.forEach(function (item, idx) {
      const el = document.createElement('div');
      el.className = 'match-item text';
      el.textContent = item.display;
      if (session.matchedKeys.indexOf(item.key) !== -1) {
        el.classList.add('matched');
      } else if (session.selectedRight === idx) {
        el.classList.add(session.wrongFlash ? 'wrong' : 'selected');
      }
      el.addEventListener('click', function () { selectMatch('right', idx); });
      rightCol.appendChild(el);
    });
  }

  function selectMatch(side, idx) {
    if (session.matchLock) return;
    const item = side === 'left' ? session.matchLeft[idx] : session.matchRight[idx];
    if (session.matchedKeys.indexOf(item.key) !== -1) return;

    if (side === 'left') { session.selectedLeft = idx; }
    else { session.selectedRight = idx; }
    renderMatchColumns();

    if (session.selectedLeft === null || session.selectedRight === null) return;

    session.matchLock = true;
    const leftItem = session.matchLeft[session.selectedLeft];
    const rightItem = session.matchRight[session.selectedRight];

    if (leftItem.key === rightItem.key) {
      setTimeout(function () {
        session.matchedKeys.push(leftItem.key);
        session.selectedLeft = null;
        session.selectedRight = null;
        session.matchLock = false;
        renderMatchColumns();
        if (session.matchedKeys.length === session.matchLeft.length) {
          ensureDayState(dayById(session.dayId).id).matchDone = true;
          setTimeout(startSpellPractice, 400);
        }
      }, 300);
    } else {
      session.wrongFlash = true;
      renderMatchColumns();
      setTimeout(function () {
        session.wrongFlash = false;
        session.selectedLeft = null;
        session.selectedRight = null;
        session.matchLock = false;
        renderMatchColumns();
      }, 650);
    }
  }

  /* ===================== SPELLING PRACTICE ===================== */
  function startSpellPractice() {
    const day = dayById(session.dayId);
    session.spellQueue = shuffle(day.words).map(function (w) { return { word: w, isRetry: false }; });
    session.spellTotalInitial = session.spellQueue.length;
    session.spellPos = 0;
    show('screen-spell');
    renderSpellRound();
  }

  function renderSpellRound() {
    const day = dayById(session.dayId);
    const entry = session.spellQueue[session.spellPos];
    const word = entry.word;
    session.spellAttempts = 0;

    $('sp-prompt').textContent = entry.isRetry ? '🔁 加強練習：再選一次這個單字' : '請選出正確的英文單字';
    $('sp-emoji').textContent = word.emoji;
    $('sp-zh').innerHTML = renderRuby(word.wordZh);
    $('sp-hint').textContent = '';
    $('sp-reveal').hidden = true;

    const dots = $('spell-dots');
    if (entry.isRetry) {
      dots.hidden = true;
    } else {
      dots.hidden = false;
      dots.innerHTML = '';
      for (let i = 0; i < session.spellTotalInitial; i++) {
        const dot = document.createElement('span');
        if (i < session.spellPos) dot.className = 'done';
        else if (i === session.spellPos) dot.className = 'current';
        dots.appendChild(dot);
      }
    }

    const distractors = shuffle(day.words.filter(function (w) { return w.en !== word.en; })).slice(0, 2);
    const options = shuffle([word].concat(distractors));

    const grid = $('sp-options');
    grid.innerHTML = '';
    grid.hidden = false;
    options.forEach(function (opt) {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = '<span>' + opt.en + '</span>';
      btn.addEventListener('click', function () { handleSpellAnswer(opt, word, btn); });
      grid.appendChild(btn);
    });
  }

  function handleSpellAnswer(chosen, correct, btnEl) {
    const isCorrect = chosen.en === correct.en;
    const grid = $('sp-options');

    if (isCorrect) {
      Array.prototype.forEach.call(grid.children, function (b) { b.disabled = true; });
      btnEl.classList.add('correct');
      setTimeout(function () { revealSpell(correct, true); }, 500);
      return;
    }

    session.spellAttempts++;
    btnEl.classList.add('wrong');
    btnEl.disabled = true;

    if (session.spellAttempts === 1) {
      $('sp-hint').textContent = '再想想！提示：中文意思是「' + correct.wordZh.map(function (p) { return p[0]; }).join('') + '」';
    } else {
      Array.prototype.forEach.call(grid.children, function (b) { b.disabled = true; });
      setTimeout(function () { revealSpell(correct, false); }, 300);
    }
  }

  function revealSpell(word, wasCorrect) {
    $('sp-hint').textContent = '';
    $('sp-options').hidden = true;
    $('sp-reveal').hidden = false;
    $('sp-reveal-en').textContent = word.en;
    $('sp-reveal-speak').onclick = function () { speak(word.en); };
    speak(word.en);
    if (!wasCorrect) {
      session.spellQueue.push({ word: word, isRetry: true });
    }
  }

  $('sp-continue').addEventListener('click', function () {
    session.spellPos++;
    if (session.spellPos < session.spellQueue.length) {
      renderSpellRound();
    } else {
      finishDay();
    }
  });

  /* ===================== SCOTT: VOCAB REVIEW ===================== */
  function startVocabReview() {
    const day = dayById(session.dayId);
    session.reviewQueue = shuffle(day.previewWords).map(function (w) { return { word: w, isRetry: false }; });
    session.reviewTotalInitial = session.reviewQueue.length;
    session.reviewPos = 0;
    show('screen-review');
    renderReviewRound();
  }

  function renderReviewRound() {
    const day = dayById(session.dayId);
    const entry = session.reviewQueue[session.reviewPos];
    const word = entry.word;
    session.reviewAttempts = 0;

    $('rv-en').textContent = word.en;
    $('rv-hint').textContent = '';
    $('rv-reveal').hidden = true;

    const dots = $('review-dots');
    if (entry.isRetry) {
      dots.hidden = true;
    } else {
      dots.hidden = false;
      dots.innerHTML = '';
      for (let i = 0; i < session.reviewTotalInitial; i++) {
        const dot = document.createElement('span');
        if (i < session.reviewPos) dot.className = 'done';
        else if (i === session.reviewPos) dot.className = 'current';
        dots.appendChild(dot);
      }
    }

    const pool = day.previewWords.filter(function (w) { return w.en !== word.en; });
    const distractors = shuffle(pool).slice(0, 3);
    const options = shuffle(distractors.concat([word]));

    const grid = $('rv-options');
    grid.hidden = false;
    grid.innerHTML = '';
    options.forEach(function (opt) {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = '<span>' + opt.zh + '</span>';
      btn.addEventListener('click', function () { handleReviewAnswer(opt, word, btn); });
      grid.appendChild(btn);
    });
  }

  function handleReviewAnswer(chosen, correct, btnEl) {
    const grid = $('rv-options');
    if (chosen.en === correct.en) {
      Array.prototype.forEach.call(grid.children, function (b) { b.disabled = true; });
      btnEl.classList.add('correct');
      setTimeout(function () { revealReview(correct, true); }, 450);
      return;
    }
    session.reviewAttempts++;
    btnEl.classList.add('wrong');
    btnEl.disabled = true;
    if (session.reviewAttempts === 1) {
      $('rv-hint').textContent = '再想想！提示：這個字是「' + correct.pos + '」，開頭是「' + correct.en[0].toUpperCase() + '」';
    } else {
      Array.prototype.forEach.call(grid.children, function (b) { b.disabled = true; });
      setTimeout(function () { revealReview(correct, false); }, 300);
    }
  }

  function revealReview(word, wasCorrect) {
    $('rv-options').hidden = true;
    $('rv-hint').textContent = '';
    $('rv-reveal').hidden = false;
    $('rv-reveal-word').textContent = word.en;
    $('rv-reveal-zh').textContent = word.zh + '（' + word.pos + '）';
    speak(word.en);
    if (!wasCorrect) {
      session.reviewQueue.push({ word: word, isRetry: true });
    }
  }

  $('rv-speak').addEventListener('click', function () {
    speak($('rv-en').textContent);
  });
  $('rv-continue').addEventListener('click', function () {
    $('rv-options').hidden = false;
    session.reviewPos++;
    if (session.reviewPos < session.reviewQueue.length) {
      renderReviewRound();
    } else {
      startReviewFill();
    }
  });

  /* ===================== SCOTT: VOCAB REVIEW - FILL IN THE BLANK ===================== */
  function startReviewFill() {
    const day = dayById(session.dayId);
    const picked = shuffle(day.previewWords).slice(0, Math.min(5, day.previewWords.length));
    session.reviewFillQueue = picked.map(function (w) { return { word: w, isRetry: false }; });
    session.reviewFillTotalInitial = session.reviewFillQueue.length;
    session.reviewFillPos = 0;
    show('screen-review-fill');
    renderReviewFillRound();
  }

  function renderReviewFillRound() {
    const entry = session.reviewFillQueue[session.reviewFillPos];
    const word = entry.word;
    session.reviewFillAttempts = 0;

    $('rf-prompt').textContent = entry.isRetry ? '🔁 加強練習：再輸入一次這個單字' : '請輸入英文單字';
    $('rf-zh').textContent = word.zh + '（' + word.pos + '）';
    $('rf-hint').textContent = '';
    $('rf-reveal').hidden = true;
    $('rf-submit').hidden = false;

    const input = $('rf-input');
    input.value = '';
    input.className = 'spell-input';
    input.disabled = false;
    input.focus();

    const dots = $('rf-dots');
    if (entry.isRetry) {
      dots.hidden = true;
    } else {
      dots.hidden = false;
      dots.innerHTML = '';
      for (let i = 0; i < session.reviewFillTotalInitial; i++) {
        const dot = document.createElement('span');
        if (i < session.reviewFillPos) dot.className = 'done';
        else if (i === session.reviewFillPos) dot.className = 'current';
        dots.appendChild(dot);
      }
    }
  }

  function handleReviewFillSubmit() {
    const entry = session.reviewFillQueue[session.reviewFillPos];
    const word = entry.word;
    const input = $('rf-input');
    const val = input.value.trim().toLowerCase();
    if (!val) return;

    if (val === word.en.toLowerCase()) {
      input.disabled = true;
      input.classList.add('correct');
      $('rf-submit').hidden = true;
      setTimeout(function () { revealReviewFill(word, true); }, 350);
      return;
    }

    session.reviewFillAttempts++;
    input.classList.add('wrong');
    setTimeout(function () { input.classList.remove('wrong'); }, 400);

    if (session.reviewFillAttempts === 1) {
      $('rf-hint').textContent = '再試一次！提示：共 ' + word.en.length + ' 個字母，開頭是「' + word.en[0].toUpperCase() + '」';
      input.value = '';
      input.focus();
    } else {
      input.disabled = true;
      $('rf-submit').hidden = true;
      revealReviewFill(word, false);
    }
  }

  function revealReviewFill(word, wasCorrect) {
    $('rf-hint').textContent = '';
    $('rf-reveal').hidden = false;
    $('rf-reveal-en').textContent = word.en;
    $('rf-reveal-speak').onclick = function () { speak(word.en); };
    speak(word.en);
    if (!wasCorrect) {
      session.reviewFillQueue.push({ word: word, isRetry: true });
    }
  }

  $('rf-submit').addEventListener('click', handleReviewFillSubmit);
  $('rf-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !$('rf-input').disabled) { handleReviewFillSubmit(); }
  });
  $('rf-continue').addEventListener('click', function () {
    session.reviewFillPos++;
    if (session.reviewFillPos < session.reviewFillQueue.length) {
      renderReviewFillRound();
    } else {
      ensureDayState(session.dayId).reviewDone = true;
      startStory();
    }
  });

  /* ===================== SCOTT: PREVIEW VOCAB CARDS ===================== */
  function startPreviewCards() {
    session.previewIdx = 0;
    show('screen-preview');
    renderPreviewCard();
  }

  function renderPreviewCard() {
    const day = dayById(session.dayId);
    const word = day.previewWords[session.previewIdx];
    $('pv-pos').textContent = word.pos;
    $('pv-en').textContent = word.en;
    $('pv-zh').textContent = word.zh;
    $('pv-def').textContent = word.def;
    $('pv-prev').disabled = session.previewIdx === 0;
    $('pv-next').textContent = (session.previewIdx === day.previewWords.length - 1) ? '去做單字複習 →' : '下一個';

    const dots = $('preview-dots');
    dots.innerHTML = '';
    day.previewWords.forEach(function (_, i) {
      const dot = document.createElement('span');
      if (i < session.previewIdx) dot.className = 'done';
      else if (i === session.previewIdx) dot.className = 'current';
      dots.appendChild(dot);
    });
  }

  $('pv-speak').addEventListener('click', function () {
    speak($('pv-en').textContent);
  });
  $('pv-prev').addEventListener('click', function () {
    if (session.previewIdx > 0) { session.previewIdx--; renderPreviewCard(); }
  });
  $('pv-next').addEventListener('click', function () {
    const day = dayById(session.dayId);
    if (session.previewIdx < day.previewWords.length - 1) {
      session.previewIdx++;
      renderPreviewCard();
    } else {
      ensureDayState(day.id).previewDone = true;
      startVocabReview();
    }
  });

  /* ===================== SCOTT: STORY READING ===================== */
  function startStory() {
    const day = dayById(session.dayId);
    $('story-title').textContent = day.title;
    $('story-text').textContent = day.storyEn;
    show('screen-story');
  }

  $('story-speak').addEventListener('click', function () {
    speak($('story-text').textContent);
  });
  $('story-continue').addEventListener('click', function () {
    ensureDayState(session.dayId).storyDone = true;
    startCheck();
  });

  /* ===================== SCOTT: COMPREHENSION CHECK ===================== */
  function startCheck() {
    session.checkMcIdx = 0;
    session.checkShortIdx = 0;
    show('screen-check');
    renderCheckRound();
  }

  function checkTotalQuestions(day) { return day.mc.length + day.short.length; }
  function checkCurrentIndex() { return session.checkMcIdx + session.checkShortIdx; }

  function renderCheckDots(day) {
    const dots = $('check-dots');
    dots.innerHTML = '';
    const total = checkTotalQuestions(day);
    const current = checkCurrentIndex();
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('span');
      if (i < current) dot.className = 'done';
      else if (i === current) dot.className = 'current';
      dots.appendChild(dot);
    }
  }

  function renderCheckRound() {
    const day = dayById(session.dayId);
    session.checkAttempts = 0;
    $('check-hint').textContent = '';
    $('check-reveal').hidden = true;
    renderCheckDots(day);

    if (session.checkMcIdx < day.mc.length) {
      const q = day.mc[session.checkMcIdx];
      $('check-mc-block').hidden = false;
      $('check-short-block').hidden = true;
      $('check-mc-q').textContent = q.q;
      const grid = $('check-mc-options');
      grid.hidden = false;
      grid.innerHTML = '';
      shuffleOptionsForMc(q).forEach(function (opt) {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = '<span>' + opt.text + '</span>';
        btn.addEventListener('click', function () { handleCheckMcAnswer(opt.isCorrect, q, btn); });
        grid.appendChild(btn);
      });
    } else {
      const q = day.short[session.checkShortIdx];
      $('check-mc-block').hidden = true;
      $('check-short-block').hidden = false;
      $('check-short-q').textContent = q.q;
      const input = $('check-short-input');
      input.value = '';
      input.disabled = false;
      input.className = 'spell-input';
      $('check-short-submit').hidden = false;
    }
  }

  function shuffleOptionsForMc(q) {
    const opts = q.options.map(function (text, i) { return { text: text, isCorrect: i === q.answer }; });
    return shuffle(opts);
  }

  function handleCheckMcAnswer(isCorrect, q, btnEl) {
    const grid = $('check-mc-options');
    if (isCorrect) {
      Array.prototype.forEach.call(grid.children, function (b) { b.disabled = true; });
      btnEl.classList.add('correct');
      setTimeout(function () { advanceCheck(); }, 500);
      return;
    }
    session.checkAttempts++;
    btnEl.classList.add('wrong');
    btnEl.disabled = true;
    if (session.checkAttempts === 1) {
      $('check-hint').textContent = '再想想！再讀一次故事找答案喔。';
    } else {
      Array.prototype.forEach.call(grid.children, function (b) { b.disabled = true; });
      revealCheckAnswer(q.options[q.answer]);
    }
  }

  function normalizeAnswer(s) { return s.trim().toLowerCase(); }

  function handleCheckShortSubmit() {
    const day = dayById(session.dayId);
    const q = day.short[session.checkShortIdx];
    const input = $('check-short-input');
    const val = normalizeAnswer(input.value);
    if (!val) return;

    const isCorrect = q.requireAll
      ? q.keywords.every(function (k) { return val.indexOf(k) !== -1; })
      : q.keywords.some(function (k) { return val.indexOf(k) !== -1; });

    if (isCorrect) {
      input.disabled = true;
      input.classList.add('correct');
      $('check-short-submit').hidden = true;
      setTimeout(function () { advanceCheck(); }, 450);
      return;
    }

    session.checkAttempts++;
    input.classList.add('wrong');
    setTimeout(function () { input.classList.remove('wrong'); }, 400);

    if (session.checkAttempts === 1) {
      $('check-hint').textContent = '提示：再讀一次這句話——「' + q.hintSentence + '」';
      input.value = '';
      input.focus();
    } else {
      input.disabled = true;
      $('check-short-submit').hidden = true;
      revealCheckAnswer(q.ref);
    }
  }

  function revealCheckAnswer(answerText) {
    $('check-hint').textContent = '';
    $('check-reveal').hidden = false;
    $('check-reveal-text').textContent = '正解：' + answerText;
  }

  function advanceCheck() {
    const day = dayById(session.dayId);
    if (session.checkMcIdx < day.mc.length) { session.checkMcIdx++; }
    else { session.checkShortIdx++; }

    if (checkCurrentIndex() < checkTotalQuestions(day)) {
      renderCheckRound();
    } else {
      finishScottDay();
    }
  }

  $('check-short-submit').addEventListener('click', handleCheckShortSubmit);
  $('check-short-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !$('check-short-input').disabled) { handleCheckShortSubmit(); }
  });
  $('check-continue').addEventListener('click', function () {
    advanceCheck();
  });

  function showDayComplete(message) {
    $('complete-msg').textContent = message;
    updateCompletePlayButton();
    show('screen-complete');
  }

  /* ===================== REWARD GAME (5-minute hard cutoff) ===================== */
  const REWARD_GAME_URL = 'https://idwolfang.github.io/reward-games/';
  const REWARD_DURATION_SEC = 5 * 60;
  const REWARD_MAX_PER_DAY = 3;
  const REWARD_COUNT_KEY = 'kidsEnglishToolsRewardCount';
  let rewardTimerId = null;
  let rewardRemaining = 0;

  function getRewardCountToday() {
    if (TEST_MODE) return 0;
    try {
      const raw = localStorage.getItem(REWARD_COUNT_KEY);
      if (!raw) return 0;
      const data = JSON.parse(raw);
      return data.date === todayIso ? data.count : 0;
    } catch (e) { return 0; }
  }

  function incrementRewardCountToday() {
    try {
      localStorage.setItem(REWARD_COUNT_KEY, JSON.stringify({ date: todayIso, count: getRewardCountToday() + 1 }));
    } catch (e) { /* localStorage unavailable, ignore */ }
  }

  function updateCompletePlayButton() {
    const btn = $('complete-play');
    const remaining = REWARD_MAX_PER_DAY - getRewardCountToday();
    if (remaining <= 0) {
      btn.disabled = true;
      btn.textContent = '今天的遊戲時間已經用完囉，明天再來玩！';
    } else {
      btn.disabled = false;
      btn.textContent = '🎮 玩小遊戲（今天還可以玩 ' + remaining + ' 次）';
    }
  }

  function formatMMSS(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function startRewardGame() {
    rewardRemaining = REWARD_DURATION_SEC;
    $('reward-timer').textContent = formatMMSS(rewardRemaining);
    $('reward-timer').classList.remove('low-time');
    $('reward-iframe').src = REWARD_GAME_URL;
    show('screen-reward');

    if (rewardTimerId) { clearInterval(rewardTimerId); }
    rewardTimerId = setInterval(function () {
      rewardRemaining--;
      $('reward-timer').textContent = formatMMSS(Math.max(0, rewardRemaining));
      if (rewardRemaining <= 10) { $('reward-timer').classList.add('low-time'); }
      if (rewardRemaining <= 0) {
        endRewardGame('timeup');
      }
    }, 1000);
  }

  function endRewardGame() {
    if (rewardTimerId) { clearInterval(rewardTimerId); rewardTimerId = null; }
    $('reward-iframe').src = 'about:blank';
    show('screen-reward-done');
  }

  function exitRewardGameEarly() {
    if (rewardTimerId) { clearInterval(rewardTimerId); rewardTimerId = null; }
    $('reward-iframe').src = 'about:blank';
    renderHome();
    show('screen-home');
  }

  $('complete-play').addEventListener('click', function () {
    if (getRewardCountToday() >= REWARD_MAX_PER_DAY) return;
    incrementRewardCountToday();
    startRewardGame();
  });
  $('reward-exit').addEventListener('click', exitRewardGameEarly);
  $('reward-back-to-hub').addEventListener('click', function () {
    $('reward-iframe').src = REWARD_GAME_URL;
  });
  $('reward-done-home').addEventListener('click', function () {
    renderHome();
    show('screen-home');
  });

  function finishDay() {
    const day = dayById(session.dayId);
    ensureDayState(day.id).spellDone = true;
    if (!TEST_MODE) { logProgress('Hardy', day.title, '100%', formatDuration(Date.now() - session.dayStartTime)); }
    showDayComplete('今天的單字、短句、配對都完成了，太棒了！');
  }

  function finishScottDay() {
    const day = dayById(session.dayId);
    ensureDayState(day.id).checkDone = true;
    if (!TEST_MODE) { logProgress('Scott', day.title, '100%', formatDuration(Date.now() - session.dayStartTime)); }
    showDayComplete('今天的單字複習、故事、理解檢核都完成了，做得好！');
  }

  $('complete-home').addEventListener('click', function () {
    renderHome();
    show('screen-home');
  });

  /* ===================== NAVIGATION ===================== */
  $('btn-hardy').addEventListener('click', function () {
    activeProfile = 'hardy';
    session.dayId = null;
    $('screen-mode').hidden = true;
    $('profile-flow').hidden = false;
    renderHome();
    show('screen-home');
    updateTestBar();
  });

  $('btn-scott').addEventListener('click', function () {
    activeProfile = 'scott';
    session.dayId = null;
    $('screen-mode').hidden = true;
    $('profile-flow').hidden = false;
    renderHome();
    show('screen-home');
    updateTestBar();
  });

  $('profile-back').addEventListener('click', function () {
    if (rewardTimerId) { clearInterval(rewardTimerId); rewardTimerId = null; $('reward-iframe').src = 'about:blank'; }
    $('profile-flow').hidden = true;
    $('screen-mode').hidden = false;
  });

  /* ===================== TEST/DEV SHORTCUT BAR (?test=1) =====================
     No day picker here — click any date on the calendar (all dates are
     unlocked while TEST_MODE is on) to make it the "current" day, then use
     these buttons to jump straight to any screen for that same day. */
  if (TEST_MODE) {
    $('test-bar').hidden = false;
    updateTestBar();

    $('test-bar').addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-jump]');
      if (!btn) return;
      const dayId = session.dayId || (activeProfile === 'scott' ? GRADE6_DAYS[0].id : GRADE1_DAYS[0].id);
      session.dayId = dayId;
      $('screen-mode').hidden = true;
      $('profile-flow').hidden = false;

      const jump = btn.dataset.jump;
      if (jump === 'words') { session.wordIdx = 0; show('screen-words'); renderWordCard(); }
      else if (jump === 'sentence') { startSentencePractice(); }
      else if (jump === 'match') { startMatchGame(); }
      else if (jump === 'spell') { startSpellPractice(); }
      else if (jump === 'complete') { ensureDayState(dayId); show('screen-complete'); }
      else if (jump === 'review') { startVocabReview(); }
      else if (jump === 'preview') { startPreviewCards(); }
      else if (jump === 'story') { startStory(); }
      else if (jump === 'check') { startCheck(); }
      else if (jump === 'scott-complete') { ensureDayState(dayId); show('screen-complete'); }
      updateTestBar();
    });

    function renderVoicePanel() {
      const panel = $('test-voice-panel');
      if (!('speechSynthesis' in window)) { panel.textContent = '此瀏覽器不支援語音功能'; return; }
      const voices = window.speechSynthesis.getVoices();
      panel.innerHTML = '';
      if (!voices.length) {
        panel.textContent = '尚未載入語音清單，稍後再點一次';
        return;
      }
      voices.forEach(function (v) {
        const isPreferred = preferredVoice && v.voiceURI === preferredVoice.voiceURI;
        const row = document.createElement('div');
        row.className = 'test-voice-row' + (isPreferred ? ' is-preferred' : '');
        const nameSpan = document.createElement('span');
        nameSpan.className = 'tv-name';
        nameSpan.textContent = (isPreferred ? '★ ' : '') + v.name + '（' + v.lang + '）';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = '▶ 試聽';
        btn.addEventListener('click', function () {
          speak('Hello, this is a test. I like apples and I see a dog.', v);
        });
        row.appendChild(nameSpan);
        row.appendChild(btn);
        panel.appendChild(row);
      });
    }

    $('test-voice-toggle').addEventListener('click', function () {
      const panel = $('test-voice-panel');
      panel.hidden = !panel.hidden;
      if (!panel.hidden) { renderVoicePanel(); }
    });
  }
})();
