/* Desktop shell: window frames (drag, focus, minimize, taskbar), the file
   explorer, and the text editor. Windows are dumb views; the engine drives
   them through small APIs and listens to the events they emit. */

FC.windows = (function () {
  var U = FC.util;

  var zTop = 50;
  var wins = {}; // id -> {el, taskBtn}

  // ---------------------------------------------------------------------------
  // Window frames
  // ---------------------------------------------------------------------------

  function registerWindow(id, el, taskBtn) {
    wins[id] = { el: el, taskBtn: taskBtn };

    var bar = U.q(".window-titlebar", el);
    bar.addEventListener("pointerdown", startDrag(el));
    el.addEventListener("pointerdown", function () { focusWin(id); });

    var minBtn = U.q(".win-min", el);
    if (minBtn) minBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      hideWin(id);
    });

    taskBtn.addEventListener("click", function () {
      if (el.classList.contains("hidden")) showWin(id);
      else hideWin(id);
    });
  }

  function startDrag(el) {
    return function (e) {
      if (e.target.closest("button")) return;
      var desktop = U.q("#desktop").getBoundingClientRect();
      var rect = el.getBoundingClientRect();
      var dx = e.clientX - rect.left, dy = e.clientY - rect.top;
      function move(ev) {
        var x = Math.min(Math.max(ev.clientX - desktop.left - dx, -rect.width + 80), desktop.width - 60);
        var y = Math.min(Math.max(ev.clientY - desktop.top - dy, 0), desktop.height - 40);
        el.style.left = x + "px";
        el.style.top = y + "px";
      }
      function up() {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
      }
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    };
  }

  function focusWin(id) {
    Object.keys(wins).forEach(function (k) { wins[k].el.classList.remove("focused"); });
    var w = wins[id];
    if (!w) return;
    w.el.classList.add("focused");
    // Windows live in the 50-95 band — the guide (120) and modals (140+) always win.
    if (zTop >= 95) {
      zTop = 50;
      Object.keys(wins).forEach(function (k) { wins[k].el.style.zIndex = ++zTop; });
    }
    w.el.style.zIndex = ++zTop;
  }

  function showWin(id) {
    var w = wins[id];
    if (!w) return;
    var wasHidden = w.el.classList.contains("hidden");
    w.el.classList.remove("hidden");
    w.taskBtn.classList.add("open-win");
    focusWin(id);
    if (wasHidden) U.emit("window:opened", { id: id });
  }

  function hideWin(id) {
    var w = wins[id];
    if (!w) return;
    w.el.classList.add("hidden");
    w.taskBtn.classList.remove("open-win");
  }

  function isOpen(id) {
    var w = wins[id];
    return !!w && !w.el.classList.contains("hidden");
  }

  function layoutDefaults() {
    var desk = U.q("#desktop").getBoundingClientRect();
    var ex = wins.explorer.el, ed = wins.editor.el, cl = wins.claude.el;
    ex.style.left = "16px"; ex.style.top = "16px";
    ex.style.width = "270px"; ex.style.height = Math.max(320, desk.height - 32) + "px";
    ed.style.left = "302px"; ed.style.top = "16px";
    ed.style.width = Math.max(420, desk.width - 320 - 420) + "px";
    ed.style.height = Math.max(320, desk.height - 32) + "px";
    cl.style.left = Math.max(340, desk.width - 470) + "px"; cl.style.top = "40px";
    cl.style.width = "430px"; cl.style.height = Math.max(320, desk.height - 90) + "px";
  }

  // ---------------------------------------------------------------------------
  // Explorer
  // ---------------------------------------------------------------------------

  var explorer = (function () {
    var expectation = null; // {kind, parent, validate(name)->{ok,reason}, onDone(name)}
    var selectedPath = "";
    var collapsed = {};   // path -> true when user collapsed a folder
    var pendingInput = null;

    function arm(exp) {
      expectation = exp;
      render();
      updateToolbar();
    }

    function disarm() {
      expectation = null;
      pendingInput = null;
      render();
      updateToolbar();
    }

    function updateToolbar() {
      var fBtn = U.q("#btn-new-folder"), fiBtn = U.q("#btn-new-file");
      fBtn.disabled = !(expectation && expectation.kind === "folder");
      fiBtn.disabled = !(expectation && expectation.kind === "file");
    }

    function beginCreate() {
      if (!expectation || pendingInput) return;
      pendingInput = { parent: expectation.parent || "" };
      // Make sure the parent folder is visible.
      collapsed[pendingInput.parent] = false;
      render();
    }

    function commitCreate(name) {
      var exp = expectation;
      if (!exp) return;
      var check = FC.vfs.validateName(name);
      if (check.ok && exp.validate) {
        var extra = exp.validate(check.name);
        if (extra && !extra.ok) check = extra;
      }
      if (!check.ok) {
        setHint(check.reason);
        return;
      }
      var cleanName = check.name || name;
      pendingInput = null;
      setHint("");
      exp.onDone(cleanName);
    }

    function setHint(text) {
      var h = U.q("#explorer-hint");
      h.textContent = text || "";
      h.style.display = text ? "block" : "none";
    }

    function nodeRow(node, path, depth) {
      var row = U.el("div", {
        class: "tree-row" + (path === selectedPath ? " selected" : ""),
        dataset: { path: path }
      }, [
        U.icon(node.type === "dir" ? "folder" : "file", "icon-sm"),
        U.el("span", { text: node.name || "foundation-companion" })
      ]);
      row.addEventListener("click", function () {
        selectedPath = path;
        FC.audio.play("click");
        if (node.type === "dir") {
          collapsed[path] = !collapsed[path];
          render();
        } else {
          render();
          editor.open(path);
          U.emit("explorer:file-opened", { path: path });
        }
      });
      return row;
    }

    function render() {
      var host = U.q("#explorer-tree");
      U.clear(host);

      (function walk(node, path, container, depth) {
        var row = nodeRow(node, path, depth);
        var li = U.el("div", {}, [row]);
        container.appendChild(li);
        if (node.type === "dir" && !collapsed[path]) {
          var kids = U.el("div", { class: "tree-children" });
          node.children.forEach(function (child) {
            walk(child, path ? path + "/" + child.name : child.name, kids, depth + 1);
          });
          // Inline input for a pending create inside this folder.
          if (pendingInput && pendingInput.parent === path) {
            var input = U.el("input", { class: "tree-input", type: "text",
              placeholder: expectation && expectation.placeholder || "name…" });
            var wrap = U.el("div", { class: "tree-row" }, [
              U.icon(expectation && expectation.kind === "folder" ? "folder-plus" : "file-plus", "icon-sm"),
              input
            ]);
            kids.appendChild(wrap);
            input.addEventListener("keydown", function (e) {
              if (e.key === "Enter") commitCreate(input.value);
              if (e.key === "Escape") { pendingInput = null; setHint(""); render(); }
            });
            setTimeout(function () { input.focus(); }, 30);
          }
          li.appendChild(kids);
        }
      })(FC.vfs.getRoot(), "", host, 0);
    }

    // Flash the newly created row.
    U.on("vfs:created", function (info) {
      render();
      var row = U.q('.tree-row[data-path="' + CSS.escape(info.path) + '"]');
      if (row) row.classList.add("appearing");
    });
    U.on("vfs:changed", function () { render(); });

    return { arm: arm, disarm: disarm, render: render, beginCreate: beginCreate, setHint: setHint };
  })();

  // ---------------------------------------------------------------------------
  // Editor
  // ---------------------------------------------------------------------------

  var editor = (function () {
    var buffers = {};   // path -> {mode:"view"|"script", content, fields, onSaved, segments}
    var openTabs = [];
    var active = null;
    var typingSession = null;

    function tabsEl() { return U.q("#editor-tabs"); }
    function surface() { return U.q("#editor-surface"); }

    function open(path, opts) {
      showWin("editor");
      if (openTabs.indexOf(path) < 0) openTabs.push(path);
      active = path;
      if (!buffers[path] || (opts && opts.refresh)) {
        buffers[path] = { mode: "view", content: FC.vfs.readFile(path) || "" };
      }
      renderTabs();
      renderActive();
    }

    function closeTab(path) {
      var i = openTabs.indexOf(path);
      if (i >= 0) openTabs.splice(i, 1);
      delete buffers[path];
      if (active === path) active = openTabs[openTabs.length - 1] || null;
      renderTabs();
      renderActive();
    }

    function renderTabs() {
      var host = tabsEl();
      U.clear(host);
      openTabs.forEach(function (path) {
        var name = path.split("/").pop();
        var tab = U.el("div", { class: "editor-tab" + (path === active ? " active" : ""), text: name });
        tab.title = path;
        tab.addEventListener("click", function () { active = path; renderTabs(); renderActive(); });
        host.appendChild(tab);
      });
    }

    function renderActive() {
      var host = surface();
      var actionsEl = U.q("#editor-actions");
      U.clear(host);
      U.clear(actionsEl);
      var empty = U.q("#editor-empty");
      if (!active) {
        empty.style.display = "flex";
        return;
      }
      empty.style.display = "none";

      var buf = buffers[active];
      if (buf.mode === "view") {
        host.textContent = FC.vfs.readFile(active) != null ? FC.vfs.readFile(active) : buf.content;
        return;
      }
      // scripted buffer with fill fields
      renderSegments(buf, host);
      renderSaveButton(buf, actionsEl);
    }

    // Split scripted content into text/[FIELD] segments.
    function segmentize(content, fieldNames) {
      var segs = [];
      var re = /\[([^\]\n]+)\]/g;
      var last = 0, m;
      while ((m = re.exec(content))) {
        if (fieldNames.indexOf(m[1]) < 0) continue;
        if (m.index > last) segs.push({ t: "text", text: content.slice(last, m.index) });
        segs.push({ t: "field", name: m[1], value: "" });
        last = m.index + m[0].length;
      }
      if (last < content.length) segs.push({ t: "text", text: content.slice(last) });
      return segs;
    }

    function renderSegments(buf, host) {
      buf.segments.forEach(function (seg) {
        if (seg.t === "text") {
          host.appendChild(document.createTextNode(seg.text));
        } else {
          var span = U.el("span", {
            class: "fill-field" + (seg.value ? " done" : ""),
            contenteditable: "plaintext-only",
            spellcheck: "false",
            "data-ph": seg.name
          });
          span.textContent = seg.value;
          span.addEventListener("input", function () {
            seg.value = span.textContent.trim();
            span.classList.toggle("done", !!seg.value);
            updateSaveState(buf);
          });
          span.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); span.blur(); }
          });
          host.appendChild(span);
        }
      });
    }

    function renderSaveButton(buf, actionsEl) {
      var hint = U.el("span", { class: "progress-note", id: "editor-save-hint" });
      var btn = U.el("button", { class: "btn-primary", id: "btn-editor-save" }, [U.icon("save", "icon-sm"), U.el("span", { text: " Save file" })]);
      btn.addEventListener("click", function () {
        if (!allFilled(buf)) return;
        var content = buf.segments.map(function (s) { return s.t === "text" ? s.text : s.value; }).join("");
        FC.vfs.writeFile(buf.path, content);
        FC.audio.play("step");
        buf.mode = "view";
        buf.content = content;
        renderActive();
        U.emit("editor:saved", { path: buf.path, content: content });
        if (buf.onSaved) buf.onSaved(content);
      });
      actionsEl.appendChild(hint);
      actionsEl.appendChild(btn);
      updateSaveState(buf);
    }

    function allFilled(buf) {
      return buf.segments.every(function (s) { return s.t === "text" || (s.value && s.value !== s.name); });
    }

    function updateSaveState(buf) {
      var btn = U.q("#btn-editor-save");
      var hint = U.q("#editor-save-hint");
      if (!btn) return;
      var remaining = buf.segments.filter(function (s) { return s.t === "field" && !s.value; }).length;
      btn.disabled = remaining > 0;
      hint.textContent = remaining > 0
        ? remaining + (remaining === 1 ? " blank left to fill" : " blanks left to fill")
        : "All blanks filled — save it.";
    }

    // Engine API: open a tab and type `content` in, then turn [FIELDS] editable.
    // opts: { path, content, fillFields:[], mode:"replace"|"append", onSaved(content) }
    function typeIn(opts) {
      showWin("editor");
      focusWin("editor");
      var path = opts.path;
      var existing = FC.vfs.readFile(path);
      var base = opts.mode === "append" && existing ? existing.replace(/\s*$/, "") + "\n\n" : "";
      var full = base + opts.content;

      if (openTabs.indexOf(path) < 0) openTabs.push(path);
      active = path;
      buffers[path] = {
        mode: "script",
        path: path,
        content: full,
        segments: segmentize(full, opts.fillFields || []),
        onSaved: opts.onSaved
      };
      renderTabs();

      // Type the raw text first, then swap in the editable-field rendering.
      var host = surface();
      var actionsEl = U.q("#editor-actions");
      U.clear(host); U.clear(actionsEl);
      U.q("#editor-empty").style.display = "none";
      var textNode = U.el("span");
      var caret = U.el("span", { class: "caret" });
      host.appendChild(textNode);
      host.appendChild(caret);

      typingSession = U.typeInto(textNode, full, {
        charsPerFrame: 6,
        tick: function () { FC.audio.play("type"); host.scrollTop = host.scrollHeight; },
        done: function () {
          typingSession = null;
          renderActive();
          if (opts.onTyped) opts.onTyped();
        }
      });
      host.onclick = function () {
        if (typingSession && typingSession.skip) typingSession.skip();
      };
    }

    return { open: open, typeIn: typeIn, closeTab: closeTab, renderTabs: renderTabs, renderActive: renderActive };
  })();

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------

  function init() {
    registerWindow("explorer", U.q("#win-explorer"), U.q("#task-explorer"));
    registerWindow("editor", U.q("#win-editor"), U.q("#task-editor"));
    registerWindow("claude", U.q("#win-claude"), U.q("#task-claude"));
    layoutDefaults();

    U.q("#btn-new-folder").addEventListener("click", function () { explorer.beginCreate(); });
    U.q("#btn-new-file").addEventListener("click", function () { explorer.beginCreate(); });

    showWin("explorer");
    hideWin("editor");
    hideWin("claude");
    explorer.render();
    window.addEventListener("resize", function () { /* windows keep their spots; fine */ });
  }

  return {
    init: init,
    explorer: explorer,
    editor: editor,
    show: showWin,
    hide: hideWin,
    focus: focusWin,
    isOpen: isOpen
  };
})();
