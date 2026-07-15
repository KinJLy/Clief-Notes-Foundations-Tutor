/* The guide — a tutorial NPC. One popup at a time, typed text, action buttons,
   and a spotlight ring on whatever the player should click next.
   Voice rules live in the copy (directives), not here. */

FC.guide = (function () {
  var U = FC.util;

  var currentSpot = null;
  var targetSel = null; // what the guide should anchor beside, if anything
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
      targetSel = selector;
      positionGuide();
    }
  }

  // Anchor the popup beside whatever the player should act on next, so the
  // instructions live at the point of interest instead of a far corner. With no
  // target (pure teaching), it rests in the bottom-right. Always clamped inside
  // the desktop so it can't be pushed off-screen.
  function positionGuide() {
    var g = root();
    if (!g.classList.contains("show")) return;
    var host = U.q("#desktop");
    if (!host) return;
    var desk = host.getBoundingClientRect();
    var gw = g.offsetWidth, gh = g.offsetHeight;
    var pad = 16, gap = 14;

    function place(left, top, side) {
      left = Math.min(Math.max(left, pad), Math.max(pad, desk.width - gw - pad));
      top = Math.min(Math.max(top, pad), Math.max(pad, desk.height - gh - pad));
      g.style.left = left + "px";
      g.style.top = top + "px";
      g.style.right = "auto";
      g.style.bottom = "auto";
      if (side) g.setAttribute("data-side", side);
      else g.removeAttribute("data-side");
    }

    var target = targetSel && (typeof targetSel === "string" ? U.q(targetSel) : targetSel);
    if (!target) {
      place(desk.width - gw - pad, desk.height - gh - pad, null);
      return;
    }

    var r = target.getBoundingClientRect();
    var tx = r.left - desk.left, ty = r.top - desk.top;
    var tR = tx + r.width, tB = ty + r.height;
    var tcx = tx + r.width / 2, tcy = ty + r.height / 2;

    // Prefer the side of the target with room; pick the first that fits.
    if (desk.width - tR >= gw + gap) {
      place(tR + gap, tcy - gh / 2, "left");        // popup sits right of target
    } else if (tx >= gw + gap) {
      place(tx - gap - gw, tcy - gh / 2, "right");  // popup sits left of target
    } else if (desk.height - tB >= gh + gap) {
      place(tcx - gw / 2, tB + gap, "top");         // popup sits below target
    } else if (ty >= gh + gap) {
      place(tcx - gw / 2, ty - gap - gh, "bottom"); // popup sits above target
    } else {
      place(desk.width - gw - pad, desk.height - gh - pad, null); // nothing fits
    }
  }

  function hide() {
    root().classList.remove("show");
    targetSel = null;
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
    // Open near where the action will be, so the box doesn't jump across the
    // screen once the spotlight lands at the end of the typing.
    targetSel = spec.spotlight || null;
    g.classList.remove("dock-left");
    g.classList.add("show");
    positionGuide();

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
      positionGuide(); // final size known — settle the anchor
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
          done: function () { b.scrollTop = b.scrollHeight; positionGuide(); next(); }
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

  // Keep the popup anchored when the desktop re-tiles (resize/zoom) or a
  // spotlit target shifts under it.
  U.on("desktop:reflow", positionGuide);
  window.addEventListener("resize", function () { positionGuide(); });

  return { show: show, say: say, hide: hide, spotlight: spotlight, clearSpot: clearSpot, reposition: positionGuide };
})();
