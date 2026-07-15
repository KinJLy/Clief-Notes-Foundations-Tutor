/* Foundation Companion: Desktop — shared utilities.
   Classic script: everything hangs off window.FC (no modules — file:// blocks them). */

window.FC = window.FC || {};

FC.util = (function () {
  // ---- tiny pub/sub -------------------------------------------------------
  var listeners = {};

  function on(event, fn) {
    (listeners[event] = listeners[event] || []).push(fn);
    return function off() {
      var arr = listeners[event] || [];
      var i = arr.indexOf(fn);
      if (i >= 0) arr.splice(i, 1);
    };
  }

  function emit(event, payload) {
    (listeners[event] || []).slice().forEach(function (fn) {
      try { fn(payload); } catch (e) { console.error("listener for " + event + " failed", e); }
    });
  }

  // ---- DOM helpers --------------------------------------------------------
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k.indexOf("on") === 0) node.addEventListener(k.slice(2), attrs[k]);
        else if (k === "dataset") Object.keys(attrs[k]).forEach(function (d) { node.dataset[d] = attrs[k][d]; });
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Lucide-style inline SVG icons (1.5px stroke, currentColor)
  var ICON_PATHS = {
    folder: '<path d="M4 4h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/>',
    "folder-plus": '<path d="M4 4h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M12 11v6M9 14h6"/>',
    file: '<path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z"/><path d="M14 3v4h4"/>',
    "file-plus": '<path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z"/><path d="M14 3v4h4"/><path d="M12 11v6M9 14h6"/>',
    "message-square": '<path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/>',
    terminal: '<path d="M4 17l6-6-6-6"/><path d="M12 19h8"/>',
    "book-open": '<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>',
    star: '<path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.8-5.4 2.8 1-6L3.2 9.4l6.1-.9z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>',
    "volume-2": '<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
    "volume-x": '<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M22 9l-6 6"/><path d="M16 9l6 6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    "rotate-ccw": '<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/>',
    play: '<path d="M6 4l14 8-14 8z"/>',
    send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>'
  };

  function icon(name, cls) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("class", "icon" + (cls ? " " + cls : ""));
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = ICON_PATHS[name] || ICON_PATHS.file;
    return svg;
  }

  // ---- path templating ----------------------------------------------------
  // Resolves ${ws} (chosen workspace name) and ${chosen:key} (other player-picked
  // names) against FC.state. Every path in directives goes through here.
  function resolvePath(template) {
    if (!template) return template;
    var data = FC.state ? FC.state.data : null;
    return template.replace(/\$\{ws\}/g, function () {
      return (data && data.player.workspaceName) || "${ws}";
    }).replace(/\$\{chosen:([\w-]+)\}/g, function (_, key) {
      return (data && data.player.chosenNames[key]) || "${chosen:" + key + "}";
    });
  }

  // Same substitution inside prose (guide text, file contents).
  var resolveText = resolvePath;

  // ---- typing animator ----------------------------------------------------
  // Types `text` into `node` (textContent), calls done() at the end.
  // Returns {skip} which completes instantly. Speed: chars per frame.
  function typeInto(node, text, opts) {
    opts = opts || {};
    var reduced = document.body.classList.contains("reduced-motion") ||
      (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var cps = opts.charsPerFrame || 3;
    if (reduced || opts.instant) {
      node.textContent = text;
      if (opts.done) opts.done();
      return { skip: function () {} };
    }
    var i = 0, cancelled = false;
    function finish() {
      cancelled = true;
      node.textContent = text;
      if (opts.done) opts.done();
    }
    function step() {
      if (cancelled) return;
      i = Math.min(text.length, i + cps);
      node.textContent = text.slice(0, i);
      if (opts.tick && i % 24 < cps) opts.tick();
      if (i < text.length) requestAnimationFrame(step);
      else if (opts.done) { cancelled = true; opts.done(); }
    }
    requestAnimationFrame(step);
    return { skip: finish };
  }

  // ---- misc ---------------------------------------------------------------
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function debounce(fn, ms) {
    var t = null;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  function download(filename, blob) {
    var url = URL.createObjectURL(blob);
    var a = el("a", { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  return {
    on: on, emit: emit,
    el: el, q: q, qa: qa, clear: clear, escapeHtml: escapeHtml, icon: icon,
    resolvePath: resolvePath, resolveText: resolveText,
    typeInto: typeInto, shuffle: shuffle, debounce: debounce,
    download: download, todayISO: todayISO
  };
})();
