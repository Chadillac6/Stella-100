(() => {
  "use strict";

  const TOTAL = 100;
  const TIME_LIMIT_SECONDS = 8 * 60 + 30;
  const MAX_NUMBER = 19;
  const MAX_ANSWER_DIGITS = 2;

  // ---------- Devin the Otter ----------
  function otterSVG(pose) {
    const armL = {
      down: '<ellipse cx="68" cy="160" rx="12" ry="21" fill="#7A4A22" transform="rotate(28 68 160)"/>',
      wave: '<g class="arm-wave"><ellipse cx="46" cy="118" rx="12" ry="24" fill="#7A4A22" transform="rotate(35 46 118)"/><circle cx="34" cy="100" r="11" fill="#7A4A22"/></g>',
      cheer: '<ellipse cx="44" cy="112" rx="12" ry="26" fill="#7A4A22" transform="rotate(35 44 112)"/><circle cx="31" cy="92" r="11" fill="#7A4A22"/>',
    }[pose];
    const armR = {
      down: '<ellipse cx="132" cy="160" rx="12" ry="21" fill="#7A4A22" transform="rotate(-28 132 160)"/>',
      wave: '<ellipse cx="132" cy="160" rx="12" ry="21" fill="#7A4A22" transform="rotate(-28 132 160)"/>',
      cheer: '<ellipse cx="156" cy="112" rx="12" ry="26" fill="#7A4A22" transform="rotate(-35 156 112)"/><circle cx="169" cy="92" r="11" fill="#7A4A22"/>',
    }[pose];
    const star = pose === "cheer"
      ? '<path d="M172 48 l7 14 15 2 -11 10 3 15 -14 -7 -14 7 3 -15 -11 -10 15 -2 z" fill="#FFC93C" stroke="#E0A400" stroke-width="2" stroke-linejoin="round"/>'
      : "";
    const mouth = pose === "down"
      ? '<path d="M100 103 V108 M90 108 Q95 114 100 108 Q105 114 110 108" stroke="#3A2314" stroke-width="3" fill="none" stroke-linecap="round"/>'
      : '<path d="M100 103 V107" stroke="#3A2314" stroke-width="3" stroke-linecap="round"/><path d="M88 108 Q100 124 112 108 Z" fill="#C44A4A" stroke="#3A2314" stroke-width="3" stroke-linejoin="round"/>';
    return `<svg viewBox="0 0 200 230" role="img" aria-label="Devin the Otter">
      <path d="M140 205 C190 210 200 168 182 146 C178 176 160 188 132 188 Z" fill="#7A4A22"/>
      <ellipse cx="100" cy="166" rx="56" ry="55" fill="#8B5A2B"/>
      <ellipse cx="100" cy="176" rx="36" ry="40" fill="#F2D9B1"/>
      <ellipse cx="74" cy="219" rx="19" ry="9" fill="#6E4321"/>
      <ellipse cx="126" cy="219" rx="19" ry="9" fill="#6E4321"/>
      <circle cx="56" cy="46" r="15" fill="#8B5A2B"/><circle cx="56" cy="46" r="7" fill="#5C3818"/>
      <circle cx="144" cy="46" r="15" fill="#8B5A2B"/><circle cx="144" cy="46" r="7" fill="#5C3818"/>
      <ellipse cx="100" cy="85" rx="56" ry="50" fill="#9C6634"/>
      <ellipse cx="100" cy="97" rx="43" ry="35" fill="#E9C99A"/>
      <path d="M56 130 Q100 152 144 130 L146 143 Q100 166 54 143 Z" fill="#1FB5A8"/>
      <path d="M118 146 L130 178 L116 175 L110 150 Z" fill="#158A80"/>
      <circle cx="78" cy="78" r="8.5" fill="#2A1A0E"/><circle cx="81" cy="75" r="3" fill="#fff"/>
      <circle cx="122" cy="78" r="8.5" fill="#2A1A0E"/><circle cx="125" cy="75" r="3" fill="#fff"/>
      <ellipse cx="65" cy="100" rx="9" ry="6" fill="#F29C9C" opacity=".75"/>
      <ellipse cx="135" cy="100" rx="9" ry="6" fill="#F29C9C" opacity=".75"/>
      <ellipse cx="100" cy="104" rx="22" ry="16" fill="#F7E6CB"/>
      <ellipse cx="100" cy="96" rx="10" ry="7" fill="#3A2314"/>
      ${mouth}
      <path d="M80 101 L58 97 M80 106 L58 109 M120 101 L142 97 M120 106 L142 109" stroke="#5C3818" stroke-width="2" stroke-linecap="round"/>
      ${armL}${armR}${star}
    </svg>`;
  }

  function drawOtters(root = document) {
    root.querySelectorAll(".otter[data-pose]").forEach((el) => {
      el.innerHTML = otterSVG(el.dataset.pose);
    });
  }

  // ---------- Problems ----------
  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pairs(test) {
    const out = [];
    for (let a = 0; a <= MAX_NUMBER; a++) {
      for (let b = 0; b <= a; b++) if (test(a, b)) out.push({ a, b });
    }
    return out;
  }

  // Medium to hard: take-aways within 10, then teens without regrouping, then teens that cross ten.
  const LEVELS = [
    { count: 25, pool: pairs((a, b) => a >= 6 && a <= 10 && b >= 3 && b < a) },
    { count: 40, pool: pairs((a, b) => a >= 11 && b > 0 && b < a && (b <= a - 10 || b >= 10)) },
    { count: 35, pool: pairs((a, b) => a >= 11 && b < 10 && b > a - 10) },
  ];

  function makeProblems() {
    const list = [];
    for (const level of LEVELS) {
      for (const p of shuffle(level.pool).slice(0, level.count)) list.push(p);
    }
    return list.map((p, i) => ({
      n: i + 1, a: p.a, b: p.b, answer: p.a - p.b,
      response: null, late: false, skipped: false,
    }));
  }

  // ---------- Sound ----------
  const sound = {
    ctx: null,
    muted: localStorage.getItem("otterMuted") === "1",
    ensure() {
      if (this.muted) return null;
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
      return this.ctx;
    },
    tone(freq, start, dur, type = "sine", gain = 0.18, endFreq) {
      const ctx = this.ensure();
      if (!ctx) return;
      const t = ctx.currentTime + start;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    },
    tap() { this.tone(520, 0, 0.06, "triangle", 0.12); },
    submit() { this.tone(440, 0, 0.09, "sine", 0.16, 700); this.tone(880, 0.07, 0.1, "sine", 0.12); },
    skip() { this.tone(600, 0, 0.22, "sine", 0.14, 250); },
    start() { [523, 659, 784].forEach((f, i) => this.tone(f, i * 0.1, 0.16, "triangle", 0.16)); },
    timesUp() { [784, 659, 523, 659].forEach((f, i) => this.tone(f, i * 0.18, 0.22, "square", 0.07)); },
    finish() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, i * 0.12, 0.2, "triangle", 0.16)); },
  };

  // ---------- Elements ----------
  const $ = (id) => document.getElementById(id);
  const screens = { start: $("screen-start"), game: $("screen-game"), results: $("screen-results") };
  const el = {
    mute: $("mute"), form: $("start-form"), name: $("name"), nameError: $("name-error"),
    playerName: $("player-name"), timer: $("timer"), timerText: $("timer-text"),
    progressFill: $("progress-fill"), progressOtter: $("progress-otter"), progressText: $("progress-text"),
    a: $("prob-a"), b: $("prob-b"), answer: $("answer"), answerText: $("answer-text"),
    comeback: $("comeback"), skip: $("skip"), skippedCount: $("skipped-count"), cheer: $("cheer"),
    timesup: $("timesup"), keepGoing: $("keep-going"), stopNow: $("stop-now"),
    resultsTitle: $("results-title"), resultsMsg: $("results-msg"), resultsScore: $("results-score"),
    resultsDate: $("results-date"), stats: $("stats"), wrongList: $("wrong-list"), allGrid: $("all-grid"),
    print: $("print"), again: $("again"), newPlayer: $("new-player"),
  };

  const CHEERS = [
    "Keep swimming! 🌊", "You're doing great! ⭐", "Splash-tastic focus! 💦", "Otterly awesome effort! 🦦",
    "Nice and steady! 🐚", "Keep it up! 🎉", "You've got this! 💪", "Super swimmer! 🏊", "Almost there! 🏁",
  ];

  let state = null;
  let timerHandle = null;

  function show(name) {
    Object.entries(screens).forEach(([key, node]) => node.classList.toggle("active", key === name));
    window.scrollTo(0, 0);
  }

  function formatTime(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  function elapsedSeconds() {
    return (Date.now() - state.startedAt) / 1000;
  }

  // ---------- Game flow ----------
  function startGame(name) {
    state = {
      name, problems: makeProblems(), queue: [], pos: 0, typed: "",
      startedAt: Date.now(), finishedAt: null, timeUp: false, playing: true,
    };
    state.queue = state.problems.map((_, i) => i);
    el.playerName.textContent = name;
    el.cheer.textContent = "";
    el.timer.classList.remove("low", "over");
    el.timesup.hidden = true;
    show("game");
    sound.start();
    renderProblem();
    tick();
    clearInterval(timerHandle);
    timerHandle = setInterval(tick, 250);
  }

  function current() {
    return state.problems[state.queue[state.pos]];
  }

  function doneCount() {
    return state.problems.filter((p) => p.response !== null || p.leftBlank).length;
  }

  function renderProblem() {
    const p = current();
    el.a.textContent = p.a;
    el.b.textContent = p.b;
    state.typed = "";
    renderTyped();
    el.comeback.hidden = !p.skipped;
    el.skip.textContent = p.skipped ? "Leave it blank" : "Skip";
    const waiting = state.queue.slice(state.pos + 1).filter((i) => state.problems[i].skipped).length;
    el.skippedCount.textContent = waiting ? `🐚 ${waiting} skipped, coming back later` : "";
    const done = doneCount();
    const pct = (done / TOTAL) * 100;
    el.progressFill.style.width = `${pct}%`;
    el.progressOtter.style.left = `${pct}%`;
    el.progressText.textContent = `${done} of ${TOTAL} done`;
  }

  function renderTyped() {
    el.answerText.textContent = state.typed;
    el.answer.classList.toggle("filled", state.typed.length > 0);
  }

  function typeDigit(d) {
    if (state.typed.length >= MAX_ANSWER_DIGITS) return;
    state.typed = state.typed === "0" ? d : state.typed + d;
    sound.tap();
    renderTyped();
    el.answer.classList.remove("pop");
    void el.answer.offsetWidth;
    el.answer.classList.add("pop");
  }

  function erase() {
    if (!state.typed) return;
    state.typed = state.typed.slice(0, -1);
    sound.tap();
    renderTyped();
  }

  function submit() {
    if (!state.typed) {
      el.answer.classList.remove("shake");
      void el.answer.offsetWidth;
      el.answer.classList.add("shake");
      return;
    }
    const p = current();
    p.response = Number(state.typed);
    p.late = state.timeUp;
    sound.submit();
    advance();
  }

  function skip() {
    const p = current();
    if (p.skipped) {
      p.leftBlank = true;
      p.late = state.timeUp;
    } else {
      p.skipped = true;
      state.queue.push(state.queue[state.pos]);
    }
    sound.skip();
    advance();
  }

  function advance() {
    state.pos += 1;
    const done = doneCount();
    if (done > 0 && done % 10 === 0 && done < TOTAL) {
      el.cheer.textContent = CHEERS[(done / 10 - 1) % CHEERS.length];
    }
    if (state.pos >= state.queue.length) {
      finish();
    } else {
      renderProblem();
    }
  }

  function tick() {
    if (!state || !state.playing) return;
    const left = TIME_LIMIT_SECONDS - elapsedSeconds();
    if (left > 0) {
      el.timerText.textContent = formatTime(Math.ceil(left));
      el.timer.classList.toggle("low", left <= 60);
      el.timer.setAttribute("aria-label", `${formatTime(Math.ceil(left))} left`);
    } else {
      if (!state.timeUp) {
        state.timeUp = true;
        el.timer.classList.remove("low");
        el.timer.classList.add("over");
        el.timesup.hidden = false;
        el.keepGoing.focus();
        sound.timesUp();
      }
      el.timerText.textContent = `Time's up +${formatTime(-left)}`;
      el.timer.setAttribute("aria-label", "Time is up");
    }
  }

  function finish() {
    state.playing = false;
    state.finishedAt = Date.now();
    clearInterval(timerHandle);
    el.timesup.hidden = true;
    renderResults();
    show("results");
    sound.finish();
  }

  // ---------- Results ----------
  function status(p) {
    if (p.response === null) return "blank";
    return p.response === p.answer ? "ok" : "bad";
  }

  function renderResults() {
    const ps = state.problems;
    const right = ps.filter((p) => status(p) === "ok");
    const rightOnTime = right.filter((p) => !p.late).length;
    const rightLate = right.length - rightOnTime;
    const wrong = ps.filter((p) => status(p) !== "ok");
    const lateCount = ps.filter((p) => p.late).length;
    const used = (state.finishedAt - state.startedAt) / 1000;

    el.resultsTitle.textContent = right.length >= 90 ? `Amazing, ${state.name}!`
      : right.length >= 70 ? `Great work, ${state.name}!`
      : `Nice try, ${state.name}!`;
    el.resultsMsg.textContent = right.length === TOTAL ? "Devin the Otter is doing a happy dance. Every single one is right! 🎉"
      : right.length >= 90 ? "Wow! You're a subtraction superstar. ⭐"
      : right.length >= 70 ? "You worked hard. Practice the ones below to get even faster! 💪"
      : "Every try makes your brain stronger. Let's practice the ones below together! 🌊";
    el.resultsScore.innerHTML = `You got <b>${right.length}</b> out of ${TOTAL} right!`;
    el.resultsDate.textContent = new Date(state.finishedAt).toLocaleString([], {
      weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
    });

    const stats = [
      `✅ <b>${rightOnTime}</b> right in time`,
      lateCount ? `⏰ <b>${rightLate}</b> right after time was up` : null,
      `❌ <b>${wrong.length}</b> to practice`,
      `⏱️ Time used: <b>${formatTime(used)}</b>${used > TIME_LIMIT_SECONDS ? ` (limit ${formatTime(TIME_LIMIT_SECONDS)})` : ""}`,
    ].filter(Boolean);
    el.stats.innerHTML = stats.map((s) => `<span class="stat">${s}</span>`).join("");

    if (!wrong.length) {
      el.wrongList.innerHTML = '<p class="all-right">None! You got them all right. 🦦💙</p>';
    } else {
      el.wrongList.innerHTML = wrong.map((p) => `
        <div class="wrong-item">
          <div class="eq">${p.a} − ${p.b} = <span class="right">${p.answer}</span></div>
          <div class="you">${p.response === null ? "Left blank" : `You typed ${p.response}`}${p.late ? ' <span class="late-badge">⏰ late</span>' : ""}</div>
        </div>`).join("");
    }

    el.allGrid.innerHTML = ps.map((p) => {
      const s = status(p);
      const mark = s === "ok" ? "✓" : s === "bad" ? "✗" : "—";
      const shown = p.response === null ? "?" : p.response;
      return `<div class="cell ${s}" title="Problem ${p.n}"><span><span class="n">${p.n}.</span> ${p.a}−${p.b}=${shown}</span><span class="tag">${mark}${p.late ? "⏰" : ""}</span></div>`;
    }).join("");
  }

  // ---------- Input ----------
  function pressKey(key) {
    if (!state || !state.playing || !el.timesup.hidden) return false;
    if (/^[0-9]$/.test(key)) typeDigit(key);
    else if (key === "Backspace" || key === "Delete") erase();
    else if (key === "Enter") submit();
    else return false;
    return true;
  }

  function flashKey(key) {
    const btn = document.querySelector(`.key[data-key="${key}"]`);
    if (!btn) return;
    btn.classList.add("pressed");
    setTimeout(() => btn.classList.remove("pressed"), 90);
  }

  document.addEventListener("keydown", (e) => {
    if (!screens.game.classList.contains("active")) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    let key = e.key;
    if (key === "NumpadEnter") key = "Enter";
    if (pressKey(key)) {
      e.preventDefault();
      flashKey(key);
    }
  });

  document.querySelectorAll(".key").forEach((btn) => {
    btn.addEventListener("click", () => {
      pressKey(btn.dataset.key);
      btn.blur();
    });
  });

  el.skip.addEventListener("click", () => {
    if (state && state.playing && el.timesup.hidden) skip();
    el.skip.blur();
  });

  el.keepGoing.addEventListener("click", () => { el.timesup.hidden = true; });
  el.stopNow.addEventListener("click", () => {
    state.queue.slice(state.pos).forEach((i) => {
      const p = state.problems[i];
      if (p.response === null) p.leftBlank = true;
    });
    finish();
  });

  el.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = el.name.value.trim().replace(/\s+/g, " ");
    if (!name) {
      el.nameError.textContent = "Please type your name first.";
      el.name.classList.remove("shake");
      void el.name.offsetWidth;
      el.name.classList.add("shake");
      el.name.focus();
      return;
    }
    el.nameError.textContent = "";
    el.name.blur();
    startGame(name);
  });
  el.name.addEventListener("input", () => { el.nameError.textContent = ""; });

  el.print.addEventListener("click", () => window.print());
  el.again.addEventListener("click", () => startGame(state.name));
  el.newPlayer.addEventListener("click", () => {
    el.name.value = "";
    show("start");
    el.name.focus();
  });

  function renderMute() {
    el.mute.setAttribute("aria-pressed", String(sound.muted));
    el.mute.setAttribute("aria-label", sound.muted ? "Sound off. Press to turn sound on." : "Sound on. Press to mute.");
  }
  el.mute.addEventListener("click", () => {
    sound.muted = !sound.muted;
    localStorage.setItem("otterMuted", sound.muted ? "1" : "0");
    renderMute();
    if (!sound.muted) sound.tap();
    el.mute.blur();
  });

  window.addEventListener("beforeunload", (e) => {
    if (state && state.playing) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  drawOtters();
  renderMute();

  // Exposed for automated checks only.
  window.__otterMath = { makeProblems, LEVELS, TIME_LIMIT_SECONDS, getState: () => state };
})();
