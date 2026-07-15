/* XP, levels, achievements. Pure listener on engine events — no game logic here.
   Levels are fixed at the curriculum's section boundaries, not XP thresholds. */

FC.xp = (function () {
  var U = FC.util;

  var LEVELS = [
    { level: 1, name: "Getting started" },
    { level: 2, name: "Prompt builder" },   // after lesson 02
    { level: 3, name: "Architect" },        // after lesson 05
    { level: 4, name: "Operator" },         // after lesson 10
    { level: 5, name: "Foundation complete" } // after lesson 11
  ];

  var ACHIEVEMENTS = {
    "workspace-named": { title: "First folder", sub: "You named your workspace." },
    "first-file": { title: "On the record", sub: "Your first CLAUDE.md is saved." },
    "five-parts": { title: "Prompt architect", sub: "A full five-part prompt, assembled." },
    "three-layers": { title: "Map, rooms, tools", sub: "The three-layer system is standing." },
    "honest-audit": { title: "Honest audit", sub: "Seven mistakes, checked against your own setup." },
    "left-the-driveway": { title: "Left the driveway", sub: "First real exchange with Claude Code." },
    "iterator": { title: "Iterator", sub: "You fixed the output instead of starting over." },
    "thinking-partner": { title: "Thinking partner", sub: "You prompted for thinking, not content." },
    "second-room": { title: "Second room", sub: "Two scoped contexts, two different Claudes." },
    "clean-sweep": { title: "Clean sweep", sub: "Every quiz in a section, first try." },
    "packed-up": { title: "Packed up", sub: "You downloaded your workspace as real files." },
    "foundation-complete": { title: "The Foundation", sub: "All 11 lessons. The system is yours." }
  };

  function data() { return FC.state.data; }

  function add(amount, label) {
    if (!amount) return;
    data().xp.total += amount;
    FC.state.save();
    U.emit("xp:changed", { total: data().xp.total, delta: amount, label: label });
    toastXP(amount, label);
  }

  function setLevel(n) {
    if (data().xp.level >= n) return;
    data().xp.level = n;
    FC.state.save();
    U.emit("xp:level", levelInfo());
  }

  function levelInfo() {
    var lv = data().xp.level;
    var def = LEVELS[Math.min(lv, LEVELS.length) - 1];
    return { level: lv, name: def.name };
  }

  function award(id) {
    if (!ACHIEVEMENTS[id]) return;
    if (data().achievements.indexOf(id) >= 0) return;
    data().achievements.push(id);
    FC.state.save();
    FC.audio.play("achievement");
    toastAchievement(ACHIEVEMENTS[id]);
    U.emit("xp:achievement", { id: id });
  }

  // ---- toasts ---------------------------------------------------------------
  var toastRoot = null;
  function ensureRoot() {
    if (!toastRoot) toastRoot = U.q("#toasts");
    return toastRoot;
  }

  function toast(children, ms) {
    var rootEl = ensureRoot();
    if (!rootEl) return;
    var t = U.el("div", { class: "toast" }, children);
    rootEl.appendChild(t);
    setTimeout(function () { t.classList.add("fade"); }, ms || 3200);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, (ms || 3200) + 500);
  }

  function spineColor() {
    var l = FC.content && FC.content.bySlug[data().progress.current_lesson];
    var idx = l ? l.spine : 1;
    return "var(--spine-" + idx + ")";
  }

  function toastXP(amount, label) {
    toast([
      U.el("div", { class: "toast-spine", style: "background:" + spineColor() }),
      U.el("div", {}, [
        U.el("div", { class: "toast-title", text: label || "Nice work" })
      ]),
      U.el("div", { class: "toast-xp", text: "+" + amount + " xp" })
    ], 2400);
  }

  function toastAchievement(a) {
    toast([
      U.icon("star"),
      U.el("div", {}, [
        U.el("div", { class: "toast-title", text: a.title }),
        U.el("div", { class: "toast-sub", text: a.sub })
      ])
    ], 4200);
  }

  // ---- header strip ---------------------------------------------------------
  function renderHeader() {
    var num = U.q("#xp-num"), fill = U.q("#xp-fill"), lvl = U.q("#xp-level");
    if (!num) return;
    num.textContent = data().xp.total;
    lvl.textContent = "Level " + data().xp.level + " — " + levelInfo().name;
    // Bar shows progress through the 11 lessons.
    var done = data().progress.lessons_completed.length;
    fill.style.width = Math.round((done / 11) * 100) + "%";
  }

  U.on("xp:changed", renderHeader);
  U.on("xp:level", renderHeader);
  U.on("engine:render", renderHeader);

  return {
    add: add, award: award, setLevel: setLevel, levelInfo: levelInfo,
    renderHeader: renderHeader, ACHIEVEMENTS: ACHIEVEMENTS
  };
})();
