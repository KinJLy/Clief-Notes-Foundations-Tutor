# Foundation Companion: Desktop (v2 addon)

The 11 Foundation lessons as a browser game. A simulated desktop — file explorer,
text editor, and a scripted "Claude Code (simulated)" window — walks you through
the same curriculum the Claude Code tutor teaches, tutorial-NPC style: guide
popups prompt each click, files type themselves in, comprehension quizzes gate
each lesson, and levels unlock at the section boundaries.

Everything you build in the game maps 1:1 to real files. Download your workspace
as a zip at any time, drop it on your actual machine, and point the real Claude
Code at it.

## Play it

No install, no build step, no network calls:

- **Locally**: open `v2/index.html` in Chrome, Edge, or Firefox (double-click works — the app is `file://`-safe).
- **Hosted**: serve the `v2/` folder from any static host (GitHub Pages works as-is).

Progress autosaves in the browser (`localStorage`). Leave and come back — the
Continue button picks up mid-lesson. The menu (top right) has save export/import
as a backup, the workspace zip download, reduced motion, and restart.

## How it relates to the CLI tutor

This is a parallel track, not a replacement. The prose the guide teaches is
compiled verbatim from `_tutor/curriculum/*.md` — the curriculum stays the
single source of truth. Lesson slugs and the progress vocabulary mirror
`_tutor/progress.md`, and the game mirrors the five-phase Lesson Loop from
`_tutor/INSTRUCTIONS.md`: Open, Teach (with comprehension checks), Build
(one step at a time, inspected), Check-in (gating quiz), Close (section
boundaries after lessons 2, 5, 10). Nothing in `_tutor/` changed.

## Editing content

- **Jake's prose** lives in `_tutor/curriculum/*.md`. After editing, regenerate:

  ```
  node v2/tools/build-content.mjs
  ```

  This rewrites `v2/js/data/content.js` and lints the game script — it fails
  loudly if a lesson's chunking shifted under existing references, if any copy
  uses a banned persona phrase or emoji, or if a path is missing `${ws}`.

- **The game script** (build steps, quizzes, Claude-sim scripts, XP) is
  hand-authored in `v2/js/data/directives.js`, one entry per lesson.

- **The brand** lives entirely in `v2/css/theme.css` (Don's Bookshelf tokens).
  Swap the variables there to restyle everything.

## Architecture notes

Plain HTML/CSS/JS, no framework, no runtime dependencies. Classic `<script>`
tags on a single `window.FC` namespace — ES modules and `fetch()` are blocked
under `file://`, so all data ships as `.js` files. The zip download is a
dependency-free ZIP writer (STORE + CRC32). Sounds are WebAudio-synthesized —
no audio assets. The simulated Claude window is fully scripted and says so in
its title bar; it never pretends to be the real thing.

```
v2/
├── index.html            skeleton + script load order
├── css/theme.css         brand tokens (colors, fonts, motion) — edit to restyle
├── css/app.css           component styles
├── js/data/content.js    GENERATED from the curriculum — do not edit
├── js/data/directives.js hand-authored game script (per-lesson beats)
├── js/engine.js          lesson-loop state machine (Open→Teach→Build→Check-in→Close)
├── js/windows.js         desktop shell: explorer, editor, window management
├── js/claudesim.js       "Claude Code (simulated)": scripted chat + terminal
├── js/guide.js           tutorial popup + spotlight
├── js/quiz.js            multiple-choice gates + reflections
├── js/vfs.js             simulated file tree
├── js/state.js           autosave, save export/import
├── js/xp.js              XP, levels, achievements, toasts
├── js/audio.js           synthesized sounds + mute
├── js/zip.js             workspace zip download
├── js/main.js            boot + title screen + menu
├── tools/build-content.mjs   content compiler + persona linter
└── test/e2e.mjs          Playwright bot that plays the whole game
```

## Tests

The e2e bot plays Lesson 1 fully under `file://`, checks reload-resume, drives
the Claude-sim lessons, verifies the zip with real `unzip`, then plays **all 11
lessons end to end** over `http://` and asserts the finale:

```
NODE_PATH=$(npm root -g) PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node v2/test/e2e.mjs
```

(Any environment with Playwright + Chromium works; adjust the two env vars to
your install.)
