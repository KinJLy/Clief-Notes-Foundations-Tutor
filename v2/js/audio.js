/* WebAudio-synthesized sounds — no asset files. Soft, quiet, mute persisted.
   The AudioContext is created lazily on the first user gesture (browser rule). */

FC.audio = (function () {
  var U = FC.util;
  var ctx = null;

  function ensureCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  document.addEventListener("pointerdown", function () { if (!muted()) ensureCtx(); }, { capture: true });

  function muted() {
    return !!(FC.state && FC.state.data.settings.muted);
  }

  function tone(freq, start, dur, gainPeak, type) {
    var c = ensureCtx();
    if (!c) return;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    var t0 = c.currentTime + (start || 0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainPeak || 0.06, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  var sounds = {
    click: function () { tone(1180, 0, 0.05, 0.03, "triangle"); },
    step: function () { tone(660, 0, 0.12, 0.05); tone(880, 0.09, 0.16, 0.05); },
    correct: function () { tone(523.25, 0, 0.14, 0.05); tone(659.25, 0.1, 0.2, 0.05); },
    wrong: function () { tone(196, 0, 0.22, 0.045, "triangle"); },
    achievement: function () { tone(523.25, 0, 0.12, 0.05); tone(659.25, 0.09, 0.12, 0.05); tone(783.99, 0.18, 0.24, 0.055); },
    levelup: function () {
      tone(392, 0, 0.16, 0.05); tone(523.25, 0.12, 0.16, 0.05);
      tone(659.25, 0.24, 0.16, 0.055); tone(783.99, 0.36, 0.34, 0.06);
    },
    type: function () { tone(2200 + Math.random() * 300, 0, 0.02, 0.008, "square"); }
  };

  function play(name) {
    if (muted()) return;
    var fn = sounds[name];
    if (fn) { try { fn(); } catch (e) { /* audio is never worth crashing over */ } }
  }

  function setMuted(m) {
    FC.state.data.settings.muted = !!m;
    FC.state.save();
    U.emit("audio:muted", !!m);
  }

  function toggleMute() { setMuted(!muted()); return muted(); }

  return { play: play, muted: muted, setMuted: setMuted, toggleMute: toggleMute };
})();
