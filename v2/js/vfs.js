/* Simulated file system. Paths are root-relative like "my-blog/CLAUDE.md".
   Mutations emit events the engine and explorer listen to. */

FC.vfs = (function () {
  var U = FC.util;

  var root = newDir("");

  function newDir(name) { return { name: name, type: "dir", children: [] }; }
  function newFile(name, content) { return { name: name, type: "file", content: content || "" }; }

  function normalize(path) {
    return String(path || "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  }

  function segments(path) {
    var p = normalize(path);
    return p === "" ? [] : p.split("/");
  }

  function get(path) {
    var segs = segments(path);
    var node = root;
    for (var i = 0; i < segs.length; i++) {
      if (node.type !== "dir") return null;
      var next = null;
      for (var j = 0; j < node.children.length; j++) {
        if (node.children[j].name === segs[i]) { next = node.children[j]; break; }
      }
      if (!next) return null;
      node = next;
    }
    return node;
  }

  function exists(path) { return !!get(path); }

  function ensureDir(path) {
    var segs = segments(path);
    var node = root;
    for (var i = 0; i < segs.length; i++) {
      var child = null;
      for (var j = 0; j < node.children.length; j++) {
        if (node.children[j].name === segs[i]) { child = node.children[j]; break; }
      }
      if (!child) {
        child = newDir(segs[i]);
        node.children.push(child);
        sortChildren(node);
        U.emit("vfs:created", { path: segs.slice(0, i + 1).join("/"), type: "dir" });
      } else if (child.type !== "dir") {
        return null;
      }
      node = child;
    }
    return node;
  }

  function mkdir(path) {
    if (exists(path)) return { ok: false, reason: "exists" };
    var dir = ensureDir(path);
    if (!dir) return { ok: false, reason: "conflict" };
    U.emit("vfs:changed", {});
    return { ok: true };
  }

  function writeFile(path, content) {
    var segs = segments(path);
    if (!segs.length) return { ok: false, reason: "empty path" };
    var name = segs.pop();
    var dir = segs.length ? ensureDir(segs.join("/")) : root;
    if (!dir) return { ok: false, reason: "conflict" };
    var node = null;
    for (var j = 0; j < dir.children.length; j++) {
      if (dir.children[j].name === name) { node = dir.children[j]; break; }
    }
    var created = false;
    if (!node) {
      node = newFile(name, content);
      dir.children.push(node);
      sortChildren(dir);
      created = true;
    } else {
      if (node.type !== "file") return { ok: false, reason: "conflict" };
      node.content = content;
    }
    U.emit(created ? "vfs:created" : "vfs:updated", { path: normalize(path), type: "file" });
    U.emit("vfs:changed", {});
    return { ok: true, created: created };
  }

  function readFile(path) {
    var node = get(path);
    return node && node.type === "file" ? node.content : null;
  }

  function sortChildren(dir) {
    dir.children.sort(function (a, b) {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  // Reasonable file/folder name rules, mirroring what real OSes accept.
  function validateName(name) {
    var n = String(name || "").trim();
    if (!n) return { ok: false, reason: "Name it something — it can't be empty." };
    if (n.length > 40) return { ok: false, reason: "Keep it under 40 characters." };
    if (/[\/\\:*?"<>|]/.test(n)) return { ok: false, reason: 'No / \\ : * ? " < > | in a name.' };
    if (n[0] === ".") return { ok: false, reason: "Don't start the name with a dot." };
    return { ok: true, name: n };
  }

  // Walk every file: cb(path, content)
  function walkFiles(cb) {
    (function walk(node, prefix) {
      node.children.forEach(function (child) {
        var p = prefix ? prefix + "/" + child.name : child.name;
        if (child.type === "file") cb(p, child.content);
        else walk(child, p);
      });
    })(root, "");
  }

  function serialize() { return JSON.parse(JSON.stringify(root)); }

  function load(data) {
    if (data && data.type === "dir") root = JSON.parse(JSON.stringify(data));
    else root = newDir("");
    U.emit("vfs:changed", {});
  }

  function reset() { load(null); }

  return {
    get: get, exists: exists, mkdir: mkdir, writeFile: writeFile, readFile: readFile,
    validateName: validateName, walkFiles: walkFiles,
    serialize: serialize, load: load, reset: reset, normalize: normalize,
    getRoot: function () { return root; }
  };
})();
