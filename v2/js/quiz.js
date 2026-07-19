/* Multiple-choice quiz card + free-text reflection. Gates comprehension the way
   the CLI tutor does, minus the LLM: authored options, distractors = real
   misconceptions, wrong answers explain and re-ask. */

FC.quiz = (function () {
  var U = FC.util;

  function scrim(show) {
    var s = U.q("#scrim");
    if (s) s.classList.toggle("show", !!show);
  }

  function card() {
    var c = U.q("#quiz-card");
    U.clear(c);
    return c;
  }

  function close(c) {
    c.classList.remove("show");
    scrim(false);
  }

  function stripe(spine) {
    return U.el("div", { class: "spine-stripe", style: "background: var(--spine-" + (spine || 1) + ")" });
  }

  // opts: { eyebrow, q, options:[{t, correct}], explain, spine, skippable }
  // done({ firstTry: bool, attempts: n, skipped: bool })
  function ask(opts, done) {
    var c = card();
    var attempts = 0;

    function render() {
      U.clear(c);
      c.appendChild(stripe(opts.spine));
      c.appendChild(U.el("div", { class: "eyebrow", text: opts.eyebrow || "Quick check" }));
      c.appendChild(U.el("h2", { text: opts.q }));

      var shuffled = U.shuffle(opts.options);
      var locked = false;

      shuffled.forEach(function (opt) {
        var btn = U.el("button", { class: "quiz-opt", text: opt.t });
        btn.addEventListener("click", function () {
          if (locked) return;
          locked = true;
          attempts++;
          FC.state.data.quizStats.attempts++;
          U.qa(".quiz-opt", c).forEach(function (b) { b.disabled = true; });
          if (opt.correct) {
            btn.classList.add("correct");
            FC.audio.play("correct");
            if (attempts === 1) FC.state.data.quizStats.firstTryCorrect++;
            else FC.state.data.quizStats.sectionClean = false;
            FC.state.save();
            // Always explain WHY it's right, then let the player move on.
            if (opts.explain) {
              c.appendChild(U.el("div", { class: "quiz-explain", text: opts.explain }));
            }
            var okActions = U.el("div", { class: "modal-actions" }, [
              U.el("button", { class: "btn-primary", text: "Got it", onclick: function () {
                close(c);
                done({ firstTry: attempts === 1, attempts: attempts });
              } })
            ]);
            c.appendChild(okActions);
            c.scrollTop = c.scrollHeight;
          } else {
            btn.classList.add("wrong");
            FC.audio.play("wrong");
            FC.state.data.quizStats.sectionClean = false;
            FC.state.save();
            var explain = U.el("div", { class: "quiz-explain", text: opts.explain || "Not quite. Look at it again." });
            c.appendChild(explain);
            var actions = U.el("div", { class: "modal-actions" });
            if (opts.skippable) {
              actions.appendChild(U.el("button", { class: "btn-quiet", text: "Skip this", onclick: function () {
                close(c); done({ skipped: true });
              } }));
            }
            actions.appendChild(U.el("button", { class: "btn-primary", text: "Try again", onclick: function () { render(); } }));
            c.appendChild(actions);
            c.scrollTop = c.scrollHeight;
          }
        });
        c.appendChild(btn);
      });

      // Optional checks can be waved off before answering.
      if (opts.skippable) {
        c.appendChild(U.el("div", { class: "modal-actions" }, [
          U.el("button", { class: "btn-quiet", text: "Skip check", onclick: function () {
            if (locked) return;
            close(c); done({ skipped: true });
          } })
        ]));
      }
    }

    scrim(true);
    c.classList.add("show");
    render();
  }

  // opts: { eyebrow, prompt, spine, placeholder, optional }
  // done(text or null when skipped)
  function reflect(opts, done) {
    var c = card();
    c.appendChild(stripe(opts.spine));
    c.appendChild(U.el("div", { class: "eyebrow", text: opts.eyebrow || "Make it yours" }));
    c.appendChild(U.el("h2", { text: opts.prompt }));
    var ta = U.el("textarea", { placeholder: opts.placeholder || "Write it in your own words…" });
    c.appendChild(ta);
    var actions = U.el("div", { class: "modal-actions" });
    if (opts.optional !== false) {
      actions.appendChild(U.el("button", { class: "btn-quiet", text: "Skip", onclick: function () {
        close(c); done(null);
      } }));
    }
    actions.appendChild(U.el("button", { class: "btn-primary", text: "Save it", onclick: function () {
      var v = ta.value.trim();
      if (!v && opts.optional === false) { ta.focus(); return; }
      close(c); done(v || null);
    } }));
    c.appendChild(actions);
    scrim(true);
    c.classList.add("show");
    ta.focus();
  }

  // Simple choice picker (e.g. "Mac or Windows?") — no right answer.
  // opts: { eyebrow, q, options:[{t, value}], spine } ; done(value)
  function pick(opts, done) {
    var c = card();
    c.appendChild(stripe(opts.spine));
    c.appendChild(U.el("div", { class: "eyebrow", text: opts.eyebrow || "Your setup" }));
    c.appendChild(U.el("h2", { text: opts.q }));
    opts.options.forEach(function (opt) {
      c.appendChild(U.el("button", { class: "quiz-opt", text: opt.t, onclick: function () {
        FC.audio.play("click");
        close(c);
        done(opt.value !== undefined ? opt.value : opt.t);
      } }));
    });
    scrim(true);
    c.classList.add("show");
  }

  function closeAll() {
    var c = U.q("#quiz-card");
    if (c) c.classList.remove("show");
    scrim(false);
  }

  return { ask: ask, reflect: reflect, pick: pick, closeAll: closeAll };
})();
