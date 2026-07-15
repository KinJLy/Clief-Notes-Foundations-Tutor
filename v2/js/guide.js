/* The guide — a tutorial NPC. One popup at a time, typed text, action buttons,
   and a spotlight ring on whatever the player should click next.
   Voice rules live in the copy (directives), not here. */

FC.guide = (function () {
  var U = FC.util;

  var currentSpot = null;
  var typing = null;

  function root() { return U.q("#guide"); }
  function body() { return U.q("#guide-body"); }
  function actions() { return U.q("#guide-actions"); }

  function clearSpot() {
    if (currentSpot) {
      currentSpot.classList.remove("spotlit");
      currentSpot = null;
    }
  }

  function spotlight(selector) {
    clearSpot();
    if (!selector) return;
    var elm = typeof selector === "string" ? U.q(selector) : selector;
    if (elm) {
      elm.classList.add("spotlit");
      currentSpot = elm;
    }
  }

  function hide() {
    root().classList.remove("show");
    clearSpot();
  }

  // spec: {
  //   progress: "Lesson 1 · build 2 of 4"    (head note)
  //   parts: [ {t:"p", text}, {t:"pre", text}, {t:"title", text} ]
  //   buttons: [ {label, primary, onClick} ]
  //   spotlight: css selector (applied AFTER text finishes typing)
  //   instant: skip typing
  // }
  function show(spec) {
    var g = root();
    var b = body();
    var a = actions();
    if (typing) { typing.skip = null; typing = null; }
    clearSpot();
    U.clear(b);
    U.clear(a);

    U.q("#guide-progress").textContent = spec.progress || "";
    g.classList.toggle("dock-left", !!(FC.windows && FC.windows.isOpen && FC.windows.isOpen("claude")));
    g.classList.add("show");

    var parts = spec.parts || [];
    var idx = 0;
    var finished = false;

    function addButtons() {
      if (finished) return;
      finished = true;
      (spec.buttons || []).forEach(function (btn) {
        a.appendChild(U.el("button", {
          class: btn.primary ? "btn-primary" : "",
          text: btn.label,
          onclick: function () {
            FC.audio.play("click");
            btn.onClick && btn.onClick();
          }
        }));
      });
      if (spec.spotlight) spotlight(spec.spotlight);
      if (spec.onShown) spec.onShown();
    }

    function next() {
      if (idx >= parts.length) { addButtons(); return; }
      var part = parts[idx++];
      var node;
      if (part.t === "pre") {
        node = U.el("pre", { text: part.text });
        b.appendChild(node);
        b.scrollTop = b.scrollHeight;
        next();
      } else if (part.t === "title") {
        node = U.el("div", { class: "brief-title", text: part.text });
        b.appendChild(node);
        next();
      } else {
        node = U.el("p");
        b.appendChild(node);
        var session = U.typeInto(node, part.text, {
          instant: spec.instant,
          charsPerFrame: 4,
          tick: function () { FC.audio.play("type"); b.scrollTop = b.scrollHeight; },
          done: function () { b.scrollTop = b.scrollHeight; next(); }
        });
        typing = session;
      }
    }

    next();

    // Click the popup body to fast-forward the typing.
    b.onclick = function () {
      if (typing && typing.skip) {
        var t = typing;
        typing = null;
        // Skipping cascades: finish current paragraph instantly, render the rest instantly.
        spec.instant = true;
        t.skip();
      }
    };
  }

  // Shorthand: plain paragraphs + one continue button.
  function say(text, buttonLabel, onContinue, extras) {
    var paras = Array.isArray(text) ? text : [text];
    var spec = {
      parts: paras.map(function (p) { return { t: "p", text: p }; }),
      buttons: [{ label: buttonLabel || "Got it", primary: true, onClick: onContinue }]
    };
    if (extras) Object.keys(extras).forEach(function (k) { spec[k] = extras[k]; });
    show(spec);
  }

  return { show: show, say: say, hide: hide, spotlight: spotlight, clearSpot: clearSpot };
})();
