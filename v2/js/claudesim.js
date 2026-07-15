/* "Claude Code (simulated)" — a deliberately simple stand-in: a folder selector
   and a chat window (plus a one-command terminal mode for lesson 6). Everything
   it says is scripted by directives. It never pretends to be the real thing. */

FC.claudesim = (function () {
  var U = FC.util;

  var mode = "chat";
  var script = null;     // active script item
  var rejects = 0;
  var termExpect = null; // {command, output, onDone}

  function log() { return U.q("#claude-log"); }

  function scrollLog() {
    var l = log();
    l.scrollTop = l.scrollHeight;
  }

  function addMsg(cls, text) {
    var m = U.el("div", { class: "chat-msg " + cls, text: text });
    log().appendChild(m);
    scrollLog();
    return m;
  }

  function addSystem(text) { addMsg("chat-sys", text); }

  function clearLog() { U.clear(log()); }

  function setMode(m) {
    mode = m;
    log().classList.toggle("term-mode", m === "terminal");
    U.q("#claude-inputrow").style.display = "flex";
    U.q("#claude-suggest").style.display = m === "chat" && script && script.suggestedPrompt ? "block" : "none";
    var input = U.q("#claude-input");
    input.placeholder = m === "terminal" ? "type a command and press enter…" : "tell Claude what you need…";
    if (m === "terminal") {
      clearLog();
      termLine("Claude Code (simulated) — practice terminal", false);
      termLine("", false);
    }
  }

  function termLine(text, withPrompt) {
    var line = U.el("div", { class: "term-line" });
    if (withPrompt) {
      line.appendChild(U.el("span", { class: "prompt-char", text: "$ " }));
    }
    line.appendChild(document.createTextNode(text));
    log().appendChild(line);
    scrollLog();
  }

  // ---- folder selector -----------------------------------------------------
  function refreshFolders() {
    var sel = U.q("#claude-folder");
    var current = sel.value;
    U.clear(sel);
    sel.appendChild(U.el("option", { value: "", text: "choose a folder…" }));
    FC.vfs.getRoot().children.forEach(function (child) {
      if (child.type === "dir") {
        sel.appendChild(U.el("option", { value: child.name, text: child.name + "/" }));
      }
    });
    sel.value = current;
  }

  // ---- chat script ---------------------------------------------------------
  // item: { suggestedPrompt, acceptIf:{mentionsAllOf,mentionsAnyOf}, rejectHint,
  //         reply:{thinkingLines, text, effects:[{writeFile, content}]}, onAccepted }
  function runScript(item) {
    script = item;
    rejects = 0;
    setMode("chat");
    var sug = U.q("#claude-suggest");
    U.clear(sug);
    if (item.suggestedPrompt) {
      sug.style.display = "block";
      sug.appendChild(U.el("button", {
        text: "suggested prompt: " + item.suggestedPrompt,
        onclick: function () {
          U.q("#claude-input").value = item.suggestedPrompt;
          U.q("#claude-input").focus();
        }
      }));
    } else {
      sug.style.display = "none";
    }
  }

  function matches(text, acceptIf) {
    if (!acceptIf) return true;
    var t = text.toLowerCase();
    var all = acceptIf.mentionsAllOf || [];
    var any = acceptIf.mentionsAnyOf || [];
    for (var i = 0; i < all.length; i++) {
      if (t.indexOf(all[i].toLowerCase()) < 0) return false;
    }
    if (any.length) {
      var hit = any.some(function (k) { return t.indexOf(k.toLowerCase()) >= 0; });
      if (!hit) return false;
    }
    return true;
  }

  function playReply(item, done) {
    var reply = item.reply || {};
    var lines = (reply.thinkingLines || []).slice();

    function nextThink() {
      if (!lines.length) { finalText(); return; }
      var line = lines.shift();
      setTimeout(function () {
        addMsg("chat-think", line);
        nextThink();
      }, 550);
    }

    function finalText() {
      setTimeout(function () {
        var m = U.el("div", { class: "chat-msg chat-claude" });
        log().appendChild(m);
        U.typeInto(m, U.resolveText(reply.text || "Done."), {
          charsPerFrame: 3,
          tick: scrollLog,
          done: function () {
            (reply.effects || []).forEach(function (fx) {
              if (fx.writeFile) {
                FC.vfs.writeFile(U.resolvePath(fx.writeFile), U.resolveText(fx.content || ""));
              }
            });
            scrollLog();
            if (done) done();
          }
        });
        scrollLog();
      }, 500);
    }

    nextThink();
  }

  function handleChatSend(text) {
    addMsg("chat-user", text);
    if (!script) {
      addMsg("chat-sys", "The simulator is waiting for the current lesson step — follow the guide.");
      return;
    }
    var item = script;
    var ok = matches(text, item.acceptIf) || rejects >= 2;
    if (!ok) {
      rejects++;
      var hint = item.rejectHint || "Close — be more specific about the files and what you want back.";
      if (rejects >= 2 && item.suggestedPrompt) {
        hint += " Here's the shape that works: \"" + item.suggestedPrompt + "\"";
      }
      setTimeout(function () { addMsg("chat-claude", hint); }, 450);
      return;
    }
    script = null;
    U.q("#claude-suggest").style.display = "none";
    playReply(item, function () {
      U.emit("claude:accepted", { prompt: text, item: item });
      if (item.onAccepted) item.onAccepted(text);
    });
  }

  // ---- terminal script -------------------------------------------------------
  // exp: { command:"claude --version", output:[lines], onDone }
  function expectCommand(exp) {
    termExpect = exp;
    setMode("terminal");
  }

  function handleTermSend(text) {
    termLine(text, true);
    var exp = termExpect;
    if (!exp) {
      termLine("(nothing to run right now — follow the guide)", false);
      return;
    }
    var norm = text.trim().replace(/\s+/g, " ").toLowerCase();
    if (norm === exp.command.toLowerCase()) {
      termExpect = null;
      var lines = exp.output.slice();
      (function next() {
        if (!lines.length) {
          U.emit("claude:command", { command: exp.command });
          if (exp.onDone) exp.onDone();
          return;
        }
        setTimeout(function () { termLine(lines.shift(), false); next(); }, 300);
      })();
    } else {
      termLine("command not found: " + text.trim() + "  (try: " + exp.command + ")", false);
    }
  }

  function send() {
    var input = U.q("#claude-input");
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    FC.audio.play("click");
    if (mode === "terminal") handleTermSend(text);
    else handleChatSend(text);
  }

  function init() {
    U.q("#claude-send").addEventListener("click", send);
    U.q("#claude-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    });
    U.q("#claude-folder").addEventListener("change", function (e) {
      if (e.target.value) {
        addSystem("reading " + e.target.value + "/ — CLAUDE.md loaded.");
        U.emit("claude:folder-selected", { path: e.target.value });
      }
    });
    U.on("vfs:changed", refreshFolders);
    refreshFolders();
  }

  return {
    init: init, setMode: setMode, runScript: runScript, expectCommand: expectCommand,
    addSystem: addSystem, clearLog: clearLog, refreshFolders: refreshFolders
  };
})();
