/* HAND-AUTHORED game script. One entry per lesson. Translates each curriculum
   file's Build/Check-in runtime instructions into playable beats. Voice follows
   _tutor/PERSONA.md: plain, direct, no filler, no banned phrases, no emoji.
   Every workspace path threads through ${ws} — the linter enforces it.
   Lint + regenerate content with: node v2/tools/build-content.mjs */

FC.directives = {

  // ===========================================================================
  "01_first-folder": {
    teach: [
      { chunks: [0], clarifier: {
        q: "Why does the folder change how Claude responds?",
        options: [
          { t: "The files carry who you are, what the project is, and what good looks like — so Claude stops starting from zero.", correct: true },
          { t: "The folder gives Claude more processing power for your questions." },
          { t: "Claude only works properly when your files are in markdown format." },
          { t: "The folder unlocks a special project mode inside Claude." }
        ],
        explain: "It's about context, not power. The files tell Claude who you are, what you're building, and what good work looks like — so you stop re-explaining it every chat."
      } },
      { chunks: [1, 2, 3] },
      { chunks: [4, 5, 6], clarifier: {
        q: "What do the three files give Claude that a normal chat never has?",
        options: [
          { t: "Who you are, what the project is, and what good output looks like.", correct: true },
          { t: "A bigger context window and faster responses." },
          { t: "Permission to edit files anywhere on your machine." },
          { t: "A memory of every conversation you've ever had." }
        ],
        explain: "CLAUDE.md carries who you are, CONTEXT.md carries the project, REFERENCES.md carries background. That's the whole trick."
      } }
    ],
    build: [
      { type: "create-folder", parent: "", name: "player-choice", storeAs: "workspaceName",
        guide: ["We're building your practice workspace right here on this desktop — everything stays where I can check it.",
          "Click New folder in the explorer. Name it after whatever you're actually working on — my-blog, client-work, dev-projects. Your call."],
        xp: 15, achievement: "workspace-named" },
      { type: "create-file", path: "${ws}/CLAUDE.md",
        guide: "Now the first file. Click New file and call it exactly CLAUDE.md — capitals matter. The starter content types itself in. Fill the two blanks with your real name and what you do, then save.",
        typedContent: "# Identity\n\nYou are helping [YOUR NAME] with [WHAT YOU DO].\n\n## Rules\n- Write in plain, clear language\n- Ask clarifying questions before making assumptions\n- When you are unsure, say so\n",
        fillFields: ["YOUR NAME", "WHAT YOU DO"],
        xp: 15, achievement: "first-file" },
      { type: "open-file", path: "${ws}/CLAUDE.md",
        guide: "Click CLAUDE.md in the explorer and read the first two lines back to yourself. This is the habit: after you save, verify. Files drift when nobody reads them.",
        xp: 10 },
      { type: "create-file", path: "${ws}/CONTEXT.md",
        guide: "One more — CONTEXT.md, same folder. This one tells Claude what you're working on right now. Fill the three blanks. Rough is fine; you'll sharpen it later.",
        typedContent: "# Current Project\n\n## What we are building\n[YOUR PROJECT IN 2-3 SENTENCES]\n\n## What good looks like\n[WHAT A SUCCESSFUL OUTPUT LOOKS LIKE]\n\n## What to avoid\n[MISTAKES OR THINGS YOU DO NOT WANT]\n",
        fillFields: ["YOUR PROJECT IN 2-3 SENTENCES", "WHAT A SUCCESSFUL OUTPUT LOOKS LIKE", "MISTAKES OR THINGS YOU DO NOT WANT"],
        xp: 10 }
    ],
    checkin: {
      artifacts: ["${ws}/CLAUDE.md"],
      quiz: {
        q: "Tomorrow you set this up for a completely different project. What goes in that CLAUDE.md?",
        options: [
          { t: "Who Claude is helping, what that project is, and rules for how it should work — specific to that project.", correct: true },
          { t: "The same file, copied over — one CLAUDE.md works for every project." },
          { t: "A full history of everything you have ever worked on." },
          { t: "Nothing — CLAUDE.md only matters for your first project." }
        ],
        explain: "The file carries project-specific context. New project, new identity line, new rules."
      },
      reflect: {
        prompt: "One line: what would the Identity line say for a real second project of yours?",
        saveTo: "${ws}/.notes/lesson-01-reflection.md"
      }
    },
    xpLessonComplete: 50
  },

  // ===========================================================================
  "02_prompt-structure": {
    teach: [
      { chunks: [0], clarifier: {
        q: "Text-message prompts work for simple questions. Where do they fall apart?",
        options: [
          { t: "The moment you want Claude to do real work — vague instructions get vague results.", correct: true },
          { t: "When your message is longer than a text message would be." },
          { t: "They never fall apart — Claude fills in the gaps for you." },
          { t: "Only when you forget to say please." }
        ],
        explain: "A prompt is an instruction set. Clear instruction, better result. Casual phrasing survives simple asks and dies on real work."
      } },
      { chunks: [1, 2, 3] },
      { chunks: [4, 5, 6], clarifier: {
        q: "What do constraints actually buy you?",
        options: [
          { t: "Editing time — every constraint you set is a mistake Claude will not make.", correct: true },
          { t: "Nothing — they just make the prompt longer." },
          { t: "They force Claude to work slower and more carefully." },
          { t: "They are only useful for code, not writing." }
        ],
        explain: "Think about the last three AI outputs that annoyed you. Those annoyances are constraints you didn't set."
      } },
      { chunks: [7, 8, 9] },
      { chunks: [10], clarifier: {
        q: "The five parts, in order — which list is right?",
        options: [
          { t: "Identity, Task, Context, Constraints, Output format.", correct: true },
          { t: "Introduction, Topic, Details, Rules, Summary." },
          { t: "Task, Deadline, Budget, Tone, Length." },
          { t: "Context, Identity, Output format, Task, Examples." }
        ],
        explain: "Identity — who Claude is. Task — what to do. Context — what it needs to know. Constraints — what to avoid. Output format — the shape of the result."
      } }
    ],
    build: [
      { type: "create-folder", parent: "${ws}", name: "prompts",
        guide: "Prompts you build once and reuse deserve their own room. Create a folder called prompts inside your workspace.",
        xp: 10 },
      { type: "create-file", name: "player-choice", pathParent: "${ws}/prompts", storeAs: "02-prompt-file",
        guide: ["Pick something you actually need to do this week. One specific task — not 'write some emails,' but 'follow up with the client who went quiet.'",
          "Create a file in prompts/ and name it after that task. The five-part skeleton types itself in — fill each part for your real task, then save."],
        typedContent: "# [WHAT THIS PROMPT IS FOR]\n\n## Identity\nYou are [WHO CLAUDE SHOULD BE FOR THIS TASK].\n\n## Task\n[THE SPECIFIC ASK — ACTION, SCOPE, ENOUGH DETAIL FOR A STRANGER]\n\n## Context\n[WHAT CLAUDE NEEDS TO KNOW THAT IT WOULD NOT GUESS]\n\n## Constraints\n[WHAT YOU DO NOT WANT IN THE OUTPUT]\n\n## Output format\n[THE SHAPE OF THE RESULT — LENGTH, STRUCTURE, PIECES]\n",
        fillFields: ["WHAT THIS PROMPT IS FOR", "WHO CLAUDE SHOULD BE FOR THIS TASK",
          "THE SPECIFIC ASK — ACTION, SCOPE, ENOUGH DETAIL FOR A STRANGER",
          "WHAT CLAUDE NEEDS TO KNOW THAT IT WOULD NOT GUESS",
          "WHAT YOU DO NOT WANT IN THE OUTPUT",
          "THE SHAPE OF THE RESULT — LENGTH, STRUCTURE, PIECES"],
        xp: 25, achievement: "five-parts" }
    ],
    checkin: {
      artifacts: ["${ws}/prompts/${chosen:02-prompt-file}"],
      quiz: {
        q: "Next time Claude gives you something vague or unhelpful — what's the first thing you check?",
        options: [
          { t: "Which of the five parts is missing — usually Context or a Task that's too loose.", correct: true },
          { t: "Rewrite the whole prompt from scratch and hope." },
          { t: "Switch to a different AI model." },
          { t: "Send the same prompt again — it usually works the second time." }
        ],
        explain: "The framework is a diagnostic. Vague output means a part is missing. Find the part; don't start over."
      },
      reflect: {
        prompt: "Which part do you personally skip most often — and what has it been costing you?",
        saveTo: "${ws}/.notes/lesson-02-reflection.md"
      }
    },
    xpLessonComplete: 50
  },

  // ===========================================================================
  "03_full-walkthrough": {
    teach: [
      { chunks: [0, 1], clarifier: {
        q: "Why do tokens make the folder structure matter?",
        options: [
          { t: "The context window is finite — separating work into areas means Claude only loads what the task needs.", correct: true },
          { t: "Tokens cost money, and folders are free." },
          { t: "More folders means Claude can use more tokens at once." },
          { t: "Tokens only matter for code projects." }
        ],
        explain: "Dump everything in one place and Claude reads your video notes while writing your blog post. Wasted tokens, noisier output. Folders split the work so only the relevant part loads."
      } },
      { chunks: [2, 3] },
      { chunks: [4, 5], clarifier: {
        q: "What happens without the routing table in CLAUDE.md?",
        options: [
          { t: "Claude reads everything and wastes tokens, or guesses wrong about what matters.", correct: true },
          { t: "Nothing — Claude always knows where files are." },
          { t: "The folder stops opening in your editor." },
          { t: "Claude refuses to work until you add one." }
        ],
        explain: "The table tells Claude: for this task, read these files, skip those. Without it, Claude reads everything or guesses."
      } },
      { chunks: [6, 7, 8, 9], clarifier: {
        q: "Map, Rooms, Tools — what's the Rooms layer?",
        options: [
          { t: "One CONTEXT.md per workspace, describing what happens there — loaded only when Claude works in that room.", correct: true },
          { t: "Physical rooms where you should keep your computer." },
          { t: "Chat rooms where Claude talks to other AIs." },
          { t: "Backup copies of your CLAUDE.md file." }
        ],
        explain: "Say 'go to writing room' and Claude reads that room's context file — the voice, the process, the files. It only loads what it needs for where it is."
      } },
      { chunks: [10, 11, 12, 13] }
    ],
    build: [
      { type: "edit-file", path: "${ws}/CLAUDE.md", mode: "append", button: "Open CLAUDE.md",
        guide: "Layer 1 — the Map. Your CLAUDE.md gets a routing table. The structure types in below what you already have. Name your real work areas, then save.",
        typedContent: "# [YOUR PROJECT NAME]\n\n## Folder structure\n- /[WORKSPACE ONE] — [WHAT HAPPENS THERE]\n- /[WORKSPACE TWO] — [WHAT HAPPENS THERE TOO]\n\n## Routing\n| Task | Go to | Read |\n|------|-------|------|\n| [TASK TYPE ONE] | /[FIRST WORKSPACE] | CONTEXT.md |\n| [TASK TYPE TWO] | /[SECOND WORKSPACE] | CONTEXT.md |\n\n## Naming conventions\n- Drafts: topic-name_draft.md\n- Final: topic-name_final.md\n",
        fillFields: ["YOUR PROJECT NAME", "WORKSPACE ONE", "WHAT HAPPENS THERE", "WORKSPACE TWO", "WHAT HAPPENS THERE TOO",
          "TASK TYPE ONE", "FIRST WORKSPACE", "TASK TYPE TWO", "SECOND WORKSPACE"],
        xp: 20 },
      { type: "quiz", eyebrow: "Mini check", quiz: {
        q: "In your own words — what does the Map do, and what breaks without it?",
        options: [
          { t: "It routes: for each task it says where to go and what to read. Without it Claude guesses, reads everything, or gets lost.", correct: true },
          { t: "It stores all my project content so I never write context files." },
          { t: "It's decoration — Claude works the same without it." },
          { t: "It locks the folder so Claude can't change files." }
        ],
        explain: "You walk into a building, the floor plan is on the wall, you know where to go. That's the CLAUDE.md."
      } },
      { type: "create-folder", parent: "${ws}", name: "player-choice", storeAs: "03-room",
        guide: "Layer 2 — one Room. Create one workspace folder for a real area of your work. One of the names you just put in the routing table.",
        xp: 10 },
      { type: "create-file", path: "${ws}/${chosen:03-room}/CONTEXT.md",
        guide: "Every room gets a context file. Create CONTEXT.md inside your new folder and fill it in for the real work — not placeholders.",
        typedContent: "# [WORKSPACE NAME]\n\n## What this workspace is for\n[2-3 SENTENCES ABOUT THE WORK THAT HAPPENS HERE]\n\n## Process\n[HOW YOU WORK HERE — FIRST THIS, THEN THAT]\n\n## What files live here\n[THE TYPES OF FILES AND HOW THEY ARE NAMED]\n",
        fillFields: ["WORKSPACE NAME", "2-3 SENTENCES ABOUT THE WORK THAT HAPPENS HERE",
          "HOW YOU WORK HERE — FIRST THIS, THEN THAT", "THE TYPES OF FILES AND HOW THEY ARE NAMED"],
        xp: 20 },
      { type: "edit-file", path: "${ws}/CLAUDE.md", mode: "append", button: "Open CLAUDE.md",
        guide: "Layer 3 — the Tools. You don't wire anything in yet, but the routing table gets a Skills column so there's a place for them. Fill in one real task row.",
        typedContent: "## Routing — with tools\n| Task | Go to | Read | Skills |\n|------|-------|------|--------|\n| [A TASK YOU REPEAT] | /[ITS WORKSPACE] | CONTEXT.md | — |\n",
        fillFields: ["A TASK YOU REPEAT", "ITS WORKSPACE"],
        xp: 15, achievement: "three-layers" }
    ],
    checkin: {
      artifacts: ["${ws}/CLAUDE.md", "${ws}/${chosen:03-room}/CONTEXT.md"],
      quiz: {
        q: "You have Map, Room, and a placeholder for Tools. You start using this for real work tomorrow. What do you add first?",
        options: [
          { t: "The next workspace my real work needs, with its own CONTEXT.md — grow it from actual use.", correct: true },
          { t: "Nothing — the system is finished." },
          { t: "Twenty more routing rows, to cover every possible future task." },
          { t: "Every skill I can find, wired into every workspace." }
        ],
        explain: "The system grows from use. Add the room your real work asks for next; skip the ones it doesn't."
      },
      reflect: {
        prompt: "The folder becomes your app. What would the second room in yours be?",
        saveTo: "${ws}/.notes/lesson-03-reflection.md"
      }
    },
    xpLessonComplete: 50
  },

  // ===========================================================================
  "04_customize": {
    teach: [
      { chunks: [0], clarifier: {
        q: "What changes between use cases, and what stays the same?",
        options: [
          { t: "The labels, context files, and routing change. The three layers stay the same.", correct: true },
          { t: "Everything changes — each use case needs its own architecture." },
          { t: "Nothing changes — you copy the example folders exactly." },
          { t: "Only the folder colors change." }
        ],
        explain: "Map, rooms, tools — the architecture holds. Your workspace names, context files, and routing rows are what make it yours."
      } },
      { chunks: [1, 2, 3] },
      { chunks: [4], clarifier: {
        q: "How do you know two tasks deserve two separate workspaces?",
        options: [
          { t: "You shift mental modes between them — like writing versus building, or client A versus client B.", correct: true },
          { t: "They use different file extensions." },
          { t: "Any two tasks always get two workspaces." },
          { t: "When the folder has more than three files in it." }
        ],
        explain: "Drafting and editing are one mode at two stages — one workspace. Writing and building are different modes — two workspaces. If you're not sure, it doesn't deserve its own."
      } }
    ],
    build: [
      { type: "picker", storeAs: "04-use-case", eyebrow: "Your work",
        q: "Which example is closest to how you actually work?",
        options: [
          { t: "Content creator — ideas, production, publishing" },
          { t: "Freelancer or consultant — clients, templates, pipeline" },
          { t: "Developer — planning, code, docs, ops" },
          { t: "A mix of these" }
        ] },
      { type: "edit-file", path: "${ws}/${chosen:03-room}/CONTEXT.md", mode: "append", button: "Open CONTEXT.md",
        guide: "Now make your room describe the real work. A sharper block types in below — answer for how you actually operate, in your own words. Then save.",
        typedContent: "## Customized for my use case\n\n### A typical task here, step by step\n[WALK THROUGH IT — FIRST THIS, THEN THAT, THEN DONE]\n\n### What good output looks like\n[SPECIFIC — WHAT WOULD MAKE YOU SAY 'THAT'S RIGHT']\n\n### What files this room produces\n[TYPES AND NAMES, E.G. TOPIC-NAME_DRAFT.MD]\n",
        fillFields: ["WALK THROUGH IT — FIRST THIS, THEN THAT, THEN DONE",
          "SPECIFIC — WHAT WOULD MAKE YOU SAY 'THAT'S RIGHT'",
          "TYPES AND NAMES, E.G. TOPIC-NAME_DRAFT.MD"],
        xp: 20 },
      { type: "edit-file", path: "${ws}/CLAUDE.md", mode: "append", button: "Open CLAUDE.md",
        guide: "Last piece: naming conventions that fit your files. Naming is what lets Claude find, organize, and move work without a database. Fill in two real patterns.",
        typedContent: "## My naming conventions\n- [A FILE TYPE YOU MAKE]: [ITS NAMING PATTERN]\n- [ANOTHER FILE TYPE]: [ITS PATTERN]\n",
        fillFields: ["A FILE TYPE YOU MAKE", "ITS NAMING PATTERN", "ANOTHER FILE TYPE", "ITS PATTERN"],
        xp: 15 }
    ],
    checkin: {
      artifacts: ["${ws}/CLAUDE.md", "${ws}/${chosen:03-room}/CONTEXT.md"],
      quiz: {
        q: "Someone else opens your folder and reads CLAUDE.md and CONTEXT.md cold. What should they walk away understanding?",
        options: [
          { t: "What kind of work happens here, how it's organized, and where a given task should go.", correct: true },
          { t: "That there are two markdown files in the folder." },
          { t: "Your complete life story and work history." },
          { t: "Nothing — those files are only readable by Claude." }
        ],
        explain: "The files communicate the work: the modes, the structure, the routing. If a stranger gets that, so does Claude."
      },
      reflect: {
        prompt: "Which workspace name from the examples did you steal or adapt — and what did you call yours?",
        saveTo: "${ws}/.notes/lesson-04-reflection.md"
      }
    },
    xpLessonComplete: 50
  },

  // ===========================================================================
  "05_common-mistakes": {
    teach: [
      { chunks: [0, 1, 2], clarifier: {
        q: "Your CLAUDE.md is 120 lines long. What's the actual problem?",
        options: [
          { t: "The routing signal gets buried in noise, and Claude burns tokens on irrelevant background — the extra belongs in workspace CONTEXT.md files.", correct: true },
          { t: "Long files crash Claude Code." },
          { t: "Nothing — longer means more helpful." },
          { t: "It becomes too hard for you to scroll." }
        ],
        explain: "The CLAUDE.md is a routing file. One screen: identity, structure, routing table, naming. Everything else has context files hiding inside it — pull them out."
      } },
      { chunks: [3, 4], clarifier: {
        q: "A context file that spends 30 lines on Claude's personality and 2 on the project — why does it underperform?",
        options: [
          { t: "Claude responds to context about the work far more than context about itself.", correct: true },
          { t: "Claude ignores files longer than 20 lines." },
          { t: "Personality instructions are against the rules." },
          { t: "It doesn't — personality is what matters most." }
        ],
        explain: "Flip the ratio: 80 percent the work — audience, prior decisions, what good looks like — 20 percent or less on behavior. A project brief beats a personality quiz."
      } },
      { chunks: [5, 6], clarifier: {
        q: "Someone spends a whole weekend building six workspaces before running a single task. What does the lesson predict?",
        options: [
          { t: "Half the decisions won't match how they actually work — they built the factory before making a product.", correct: true },
          { t: "They'll save time later because everything is ready." },
          { t: "Claude will refuse the oversized setup." },
          { t: "Nothing — more preparation is always better." }
        ],
        explain: "Build the minimum and grow it. First version in 15 minutes; add what real use proves you need."
      } },
      { chunks: [7] }
    ],
    build: [
      { type: "open-file", path: "${ws}/CLAUDE.md",
        guide: "Audit time — your setup against the seven. Open your CLAUDE.md. Does it still fit on one screen? Is the routing table there? Look before you answer.",
        xp: 10 },
      { type: "edit-file", path: "${ws}/${chosen:03-room}/CONTEXT.md", mode: "append", button: "Open CONTEXT.md",
        guide: "Mistake 5 is the silent one — stale context. Start the habit that beats it: a Last updated line. Type today's date.",
        typedContent: "Last updated: [TODAY'S DATE]\n",
        fillFields: ["TODAY'S DATE"],
        xp: 10 },
      { type: "create-file", path: "${ws}/self-audit.md",
        guide: "Now write the audit down. Create self-audit.md in your workspace. One honest status per mistake: fine, needs fix, or fixed.",
        typedContent: "# Self-audit\n\nMistake 1 (CLAUDE.md too long): [STATUS ONE]\nMistake 2 (no routing table): [STATUS TWO]\nMistake 3 (too many workspaces): [STATUS THREE]\nMistake 4 (AI personality vs work): [STATUS FOUR]\nMistake 5 (stale context files): [STATUS FIVE]\nMistake 6 (everything in one folder): [STATUS SIX]\nMistake 7 (built before using): [STATUS SEVEN]\n",
        fillFields: ["STATUS ONE", "STATUS TWO", "STATUS THREE", "STATUS FOUR", "STATUS FIVE", "STATUS SIX", "STATUS SEVEN"],
        xp: 20, achievement: "honest-audit" }
    ],
    checkin: {
      artifacts: ["${ws}/self-audit.md"],
      quiz: {
        q: "Three weeks from now your output quality drifts and it feels like Claude got worse. What most likely happened?",
        options: [
          { t: "The project moved and the context files didn't — Claude is following stale instructions perfectly.", correct: true },
          { t: "Claude's model degraded over time." },
          { t: "Your folder got too big for Claude to open." },
          { t: "You used up your good outputs for the month." }
        ],
        explain: "Claude does exactly what the context says. When the work changes and the files don't, the drift is yours to fix — 30 seconds per edit."
      },
      reflect: {
        prompt: "Which of the seven is most likely to bite you — and why that one?",
        saveTo: "${ws}/.notes/lesson-05-reflection.md"
      }
    },
    xpLessonComplete: 50
  },

  // ===========================================================================
  "06_install-first-use": {
    teach: [
      { chunks: [0, 1], clarifier: {
        q: "Desktop, Claude Code in VS Code, Claude Code in the terminal — what are they, really?",
        options: [
          { t: "One model with three interfaces — the difference is what each one lets the model see and do.", correct: true },
          { t: "Three different AIs with different intelligence levels." },
          { t: "Three subscription tiers — you pay more for smarter answers." },
          { t: "Old, current, and beta versions of the same app." }
        ],
        explain: "Same brain behind all three. Desktop is a conversation layer, VS Code an editor layer, the terminal a command line layer."
      } },
      { chunks: [2], clarifier: {
        q: "You have a folder of 40 files to reorganize and rename. Which interface fits?",
        options: [
          { t: "Claude Code — it can see the files and act on them directly.", correct: true },
          { t: "Claude Desktop — upload all 40 and paste the results back one by one." },
          { t: "None — AI can't touch files." },
          { t: "It makes no difference which you use." }
        ],
        explain: "Desktop can't reach your stuff — everything goes through copy and paste. Claude Code reads the folder and does the work in place."
      } },
      { chunks: [3, 4, 5, 6] }
    ],
    build: [
      { type: "note",
        guide: ["Quick reframe: in the real course you'd be installing all three interfaces on your machine. In here, we verify the way you would on a real setup — and you'll repeat these exact checks on your own computer after.",
          "This desktop has a practice terminal built into the Claude Code window."],
        button: "Let's verify", xp: 5 },
      { type: "picker", storeAs: "06-platform", eyebrow: "Architecture check",
        q: "First — are you on Windows or Mac (on your real machine)?",
        defaultFor: { "06-arch": "N/A (Mac)" },
        options: [
          { t: "Windows", followUp: {
            storeAs: "06-arch",
            q: "Windows users: Settings, System, About, System type. x64 or ARM64? Installing the wrong one causes problems that are hard to diagnose.",
            options: [{ t: "x64" }, { t: "ARM64" }, { t: "I'll check after this session" }]
          } },
          { t: "Mac" }
        ] },
      { type: "claude-open", mode: "terminal",
        guide: "Open the Claude Code window from the taskbar. It starts in terminal mode — the practice command line.",
        xp: 5 },
      { type: "claude-term", command: "claude --version",
        guide: "Type the version check into the terminal, exactly: claude --version — then press enter. This is how you confirm an install actually worked.",
        output: ["2.1.0 (Claude Code)", "(simulated — your real machine will show its own number)"],
        xp: 15 },
      { type: "create-file", path: "${ws}/setup-verified.md",
        guide: "Write the verification down. Create setup-verified.md in your workspace and fill in what you found — real answers, not placeholders.",
        typedContent: "# Setup Verified\n\nPlatform: [MAC OR WINDOWS]\nArchitecture: [X64 / ARM64 / N-A FOR MAC]\nClaude Code version: [THE VERSION YOU SAW]\nInterface: [VS CODE EXTENSION / TERMINAL / BOTH]\nDate verified: [TODAY'S DATE]\n",
        fillFields: ["MAC OR WINDOWS", "X64 / ARM64 / N-A FOR MAC", "THE VERSION YOU SAW", "VS CODE EXTENSION / TERMINAL / BOTH", "TODAY'S DATE"],
        xp: 15 }
    ],
    checkin: {
      artifacts: ["${ws}/setup-verified.md"],
      quiz: {
        q: "Monday morning: you need to turn a folder of scattered meeting notes into one summary document. Which interface, and why?",
        options: [
          { t: "Claude Code — it reads the whole folder and writes the summary file directly, no copy-paste layer.", correct: true },
          { t: "Claude Desktop — paste each note into the chat and combine the answers by hand." },
          { t: "Whichever opens faster that day." },
          { t: "The VS Code built-in chat, since it's already there." }
        ],
        explain: "If the task is 'read a bunch of files and produce a deliverable,' Claude Code wins every time. Desktop is for thinking and planning."
      },
      reflect: {
        prompt: "Which interface do you honestly expect to live in most — and for what kind of work?",
        saveTo: "${ws}/.notes/lesson-06-reflection.md"
      }
    },
    xpLessonComplete: 50
  },

  // ===========================================================================
  "07_in-practice": {
    teach: [
      { chunks: [0], clarifier: {
        q: "Read, Think, Write, Check, Adjust. What's different about that loop in Claude Code versus the chat interface?",
        options: [
          { t: "In chat it runs once and stops. In Claude Code it keeps running until the job is done.", correct: true },
          { t: "Claude Code skips the Think step to go faster." },
          { t: "The chat version has more steps." },
          { t: "There's no difference — the loop is identical." }
        ],
        explain: "Claude Code can check its own output against your files and adjust. Chat hands you one answer and waits."
      } },
      { chunks: [1, 2], clarifier: {
        q: "15 meeting notes, one summary needed. Why does Claude Code finish in 90 seconds what takes an hour by hand in Desktop?",
        options: [
          { t: "It reads the files from your folder itself — the copy-paste layer disappears.", correct: true },
          { t: "Claude Code runs on a faster model than Desktop." },
          { t: "It skips reading most of the files to save time." },
          { t: "Desktop has a 15-file upload limit." }
        ],
        explain: "Same model, same analysis. The hour you save is the manual work around it — copying, pasting, combining."
      } },
      { chunks: [3], clarifier: {
        q: "The output comes back wrong. What's the move?",
        options: [
          { t: "Say exactly what's wrong and let it fix that — starting over throws away the context it built.", correct: true },
          { t: "Start a fresh session and rewrite the prompt from scratch." },
          { t: "Accept it — you get what you get." },
          { t: "Ask the same thing again in different words and hope." }
        ],
        explain: "Iterate. 'The summary missed the budget decisions from March 14. Add those.' That is the whole point of the loop."
      } }
    ],
    build: [
      { type: "seed-files",
        guide: "I dropped three meeting notes into your workspace — stand-ins for your real files. Open one in the explorer and skim it before we run the task.",
        button: "Got them",
        files: [
          { path: "${ws}/meeting-notes/2026-03-02-kickoff.md",
            content: "# Kickoff — March 2\n\nAttendees: D, S, P\n\n- DECISION: website relaunch ships end of Q2\n- DECISION: Sarah owns the content migration\n- Homepage copy needs a full rewrite; old tone is off-brand\n- Open question: keep the blog on the subdomain or move it?\n" },
          { path: "${ws}/meeting-notes/2026-03-14-budget.md",
            content: "# Budget review — March 14\n\nAttendees: D, P, finance\n\n- DECISION: Q2 budget capped at 12k for the relaunch\n- DECISION: video production pushed to Q3 to stay under cap\n- Hosting renewal due in May — get two quotes\n" },
          { path: "${ws}/meeting-notes/2026-03-28-review.md",
            content: "# Design review — March 28\n\nAttendees: D, S, design\n\n- DECISION: new palette approved, warm neutrals\n- DECISION: mobile nav switches to bottom bar\n- Sarah flags: content migration is two weeks behind\n" }
        ],
        xp: 5 },
      { type: "claude-open", mode: "chat", expectFolder: "${ws}",
        guide: "Open the Claude Code window from the taskbar.",
        folderPrompt: "Point it at your workspace — the folder selector at the top. That's the 'cd into the folder' move.",
        xp: 10, achievement: "left-the-driveway" },
      { type: "claude-chat",
        guide: "Give it the task. Be specific: name the folder, name what you want back, and say where to save the output. Use the suggested prompt or write your own — it needs those three things.",
        script: [{
          suggestedPrompt: "Read every file in meeting-notes/ and summarize all decisions, organized by project. Save the result as summary.md in this folder.",
          acceptIf: { mentionsAnyOf: ["meeting", "notes", "decision"], mentionsAllOf: [] },
          rejectHint: "Close — name the folder to read, what you want back, and where to save it. All three.",
          reply: {
            thinkingLines: ["reading meeting-notes/ — 3 files", "found decisions across 2 projects", "writing summary.md"],
            text: "Done. Read 3 files, wrote summary.md with the decisions organized under Website relaunch and Design. Open it and check my work.",
            effects: [{
              writeFile: "${ws}/summary.md",
              content: "# Decisions — Q1\n\n## Website relaunch\n- Ships end of Q2 (Mar 2)\n- Sarah owns content migration (Mar 2)\n- Content migration running two weeks behind (Mar 28)\n\n## Design\n- New palette approved, warm neutrals (Mar 28)\n- Mobile nav moves to bottom bar (Mar 28)\n"
            }]
          }
        }],
        xp: 20 },
      { type: "open-file", path: "${ws}/summary.md",
        guide: "Open summary.md and read it. Look closely — something from the March 14 meeting is missing. That's on purpose.",
        xp: 5 },
      { type: "claude-chat",
        guide: "The summary skipped the budget decisions. Don't start over — tell Claude exactly what's wrong and what to add.",
        script: [{
          suggestedPrompt: "The summary missed the budget decisions from the March 14 meeting. Add those.",
          acceptIf: { mentionsAnyOf: ["march 14", "budget", "missed", "missing"], mentionsAllOf: [] },
          rejectHint: "Point at the gap: which meeting did it miss, and what should it add?",
          reply: {
            thinkingLines: ["re-reading 2026-03-14-budget.md", "updating summary.md"],
            text: "Fixed. Added the two March 14 budget decisions under a Q2 budget section. That follow-up cost you one sentence — a restart would have cost the whole context.",
            effects: [{
              writeFile: "${ws}/summary.md",
              content: "# Decisions — Q1\n\n## Website relaunch\n- Ships end of Q2 (Mar 2)\n- Sarah owns content migration (Mar 2)\n- Content migration running two weeks behind (Mar 28)\n\n## Q2 budget\n- Relaunch budget capped at 12k (Mar 14)\n- Video production pushed to Q3 to stay under cap (Mar 14)\n\n## Design\n- New palette approved, warm neutrals (Mar 28)\n- Mobile nav moves to bottom bar (Mar 28)\n"
            }]
          }
        }],
        xp: 20, achievement: "iterator" },
      { type: "create-file", path: "${ws}/sessions/session-01.md",
        guide: "Log the session — this is the artifact. What you ran, what you'd do differently. Real answers.",
        typedContent: "# Session 01\n\n## Task\n[WHAT YOU RAN]\n\n## Prompt\n[THE PROMPT YOU USED]\n\n## Result\n[WHAT IT PRODUCED]\n\n## Next time\n[WHAT YOU WOULD DO DIFFERENTLY]\n",
        fillFields: ["WHAT YOU RAN", "THE PROMPT YOU USED", "WHAT IT PRODUCED", "WHAT YOU WOULD DO DIFFERENTLY"],
        xp: 15 }
    ],
    checkin: {
      artifacts: ["${ws}/sessions/session-01.md"],
      quiz: {
        q: "Which of these tasks is Claude Code clearly the wrong-tool-right-tool winner for?",
        options: [
          { t: "Read these 30 files and produce one deliverable, saved as a file.", correct: true },
          { t: "Help me think through whether to take this job offer." },
          { t: "Give me a quick definition of a context window." },
          { t: "Chat with me about weekend plans." }
        ],
        explain: "Reading and writing files is where Claude Code shines. Thinking through a decision is Desktop's game — that's the next lesson."
      },
      reflect: {
        prompt: "Name one task from your real work — something that eats 20-30 minutes — that this loop could handle.",
        saveTo: "${ws}/.notes/lesson-07-reflection.md"
      }
    },
    xpLessonComplete: 50
  },

  // ===========================================================================
  "08_thinking-partner": {
    teach: [
      { chunks: [0], clarifier: {
        q: "Prompting for content versus prompting for thinking — what's the difference?",
        options: [
          { t: "Content gets you a document. Thinking gets your assumptions challenged and blind spots surfaced before you build.", correct: true },
          { t: "Thinking prompts have to be longer than content prompts." },
          { t: "Content prompts are for work, thinking prompts are for fun." },
          { t: "There is no difference — all prompts return content." }
        ],
        explain: "'Write me a marketing plan' is a vending machine. 'What am I not seeing about reaching this audience?' is a thinking partner."
      } },
      { chunks: [1, 2, 3], clarifier: {
        q: "Fifteen minutes of planning in Desktop before building in Code — what does the lesson say it saves?",
        options: [
          { t: "Around 90 minutes of building the wrong thing — restarts are where the time goes.", correct: true },
          { t: "Nothing — planning and building take the same time either way." },
          { t: "Money, because Desktop is cheaper per message." },
          { t: "It saves Claude effort, not you." }
        ],
        explain: "Decide and build at the same time and both suffer. Desktop for decisions. Code for execution."
      } },
      { chunks: [4, 5] }
    ],
    build: [
      { type: "reflect", optional: false, eyebrow: "Pick the problem",
        prompt: "Name a real decision you've been going back and forth on — something you keep second-guessing. One or two lines.",
        saveTo: "${ws}/.notes/lesson-08-problem.md",
        xp: 10 },
      { type: "claude-open", mode: "chat",
        guide: "Open the Claude window. In real life this session runs in Claude Desktop — same idea here: no files, just thinking.",
        xp: 5 },
      { type: "claude-chat",
        guide: "Run the thinking session on the problem you just named. Structure it with the five parts — and keep the key constraint: don't let it solve. It should question.",
        script: [{
          suggestedPrompt: "You are a strategic advisor. Help me see what I'm missing about my decision. Don't solve it for me — ask 2-3 questions I haven't asked myself, then name the assumption I'm most likely wrong about.",
          acceptIf: { mentionsAnyOf: ["missing", "not seeing", "blind spot", "assumption", "don't solve", "questions"], mentionsAllOf: [] },
          rejectHint: "That reads like a content request. Ask it to challenge you — what are you missing, what assumption might be wrong?",
          reply: {
            thinkingLines: ["no files needed — thinking mode"],
            text: "Three questions before you decide: What would make this decision obvious — and can you get that information this week? Who already made this choice and what did it cost them? If you had to commit today, which way would you lean — and what does that lean tell you? Most likely wrong assumption: that waiting is free. It isn't — name what each week of not deciding costs.",
            effects: []
          }
        }],
        xp: 20, achievement: "thinking-partner" },
      { type: "create-file", path: "${ws}/prompts/thinking-partner.md",
        guide: "Save the pattern as a reusable prompt. The skeleton types in — customize Task and Context for your real work. The constraint stays: no solving, only questions.",
        typedContent: "# Thinking partner\n\n## Identity\nYou are a strategic advisor helping me think through a decision.\n\n## Task\nHelp me identify what I'm not seeing about [YOUR RECURRING KIND OF DECISION].\n\n## Context\n[THE STAKES, WHAT YOU HAVE ALREADY CONSIDERED, WHAT KEEPS YOU UP]\n\n## Constraints\nDo not solve it for me. Ask questions and identify blind spots. Push back on my assumptions.\n\n## Output format\n2-3 questions I haven't asked myself yet, then the one assumption I might be most wrong about.\n",
        fillFields: ["YOUR RECURRING KIND OF DECISION", "THE STAKES, WHAT YOU HAVE ALREADY CONSIDERED, WHAT KEEPS YOU UP"],
        xp: 20 }
    ],
    checkin: {
      artifacts: ["${ws}/prompts/thinking-partner.md"],
      quiz: {
        q: "When do you reach for the thinking-partner prompt instead of opening Claude Code?",
        options: [
          { t: "Before committing — choosing between approaches, pressure-testing a plan, deciding what to build.", correct: true },
          { t: "Never — Code does everything Desktop does." },
          { t: "Whenever a task involves files." },
          { t: "Only when Claude Code is down." }
        ],
        explain: "Desktop for decisions, Code for execution. If you're deciding what to build, you're in thinking territory."
      },
      reflect: {
        prompt: "Conversations are disposable; the thinking is not. What insight from your session is worth keeping?",
        saveTo: "${ws}/.notes/lesson-08-reflection.md"
      }
    },
    xpLessonComplete: 50
  },

  // ===========================================================================
  "09_understand-project": {
    teach: [
      { chunks: [0, 1], clarifier: {
        q: "Why does Claude Code feel like a smart stranger on every new conversation?",
        options: [
          { t: "It doesn't know your conventions, structure, or standards — it can do the work but guesses at everything a teammate would know.", correct: true },
          { t: "Each conversation runs on a fresh, untrained model." },
          { t: "It forgets on purpose, for privacy." },
          { t: "It isn't — Claude remembers everything between sessions." }
        ],
        explain: "The model is capable; the context is missing. CLAUDE.md is the onboarding doc it reads in two seconds and follows every word of."
      } },
      { chunks: [2, 3], clarifier: {
        q: "The five things a CLAUDE.md carries — which list is right?",
        options: [
          { t: "Project overview, tech stack or document types, how to run things, key conventions, what to avoid.", correct: true },
          { t: "Your name, your age, your job, your goals, your schedule." },
          { t: "Passwords, API keys, tokens, secrets, credentials." },
          { t: "A diary of everything Claude has done so far." }
        ],
        explain: "Fifteen lines. Ten minutes. Overview, stack, commands, conventions, avoid-list. Write it for a smart person who just joined the project."
      } },
      { chunks: [4] }
    ],
    build: [
      { type: "open-file", path: "${ws}/CLAUDE.md",
        guide: "Open your CLAUDE.md and read what's in it now. It's grown since lesson 1 — see what's already covered before adding more.",
        xp: 5 },
      { type: "edit-file", path: "${ws}/CLAUDE.md", mode: "append", button: "Open CLAUDE.md",
        guide: "Now deepen it with the five elements. The skeleton types in below your existing content — fill each one for this actual workspace, then save. A mediocre CLAUDE.md beats no CLAUDE.md; specifics beat mediocre.",
        typedContent: "## Project overview\n[TWO OR THREE SENTENCES — WHAT IS THIS FOLDER FOR]\n\n## Stack or document types\n[TOOLS, FORMATS, OR LANGUAGES IN PLAY HERE]\n\n## How to run things\n[COMMANDS — OR FOR DOCUMENTS, HOW THESE FILES GET USED]\n\n## Key conventions\n[NAMING PATTERNS AND WHAT CLAUDE SHOULD DO BY DEFAULT]\n\n## Avoid\n[WHAT WOULD ANNOY YOU IF CLAUDE DID IT HERE]\n",
        fillFields: ["TWO OR THREE SENTENCES — WHAT IS THIS FOLDER FOR", "TOOLS, FORMATS, OR LANGUAGES IN PLAY HERE",
          "COMMANDS — OR FOR DOCUMENTS, HOW THESE FILES GET USED", "NAMING PATTERNS AND WHAT CLAUDE SHOULD DO BY DEFAULT",
          "WHAT WOULD ANNOY YOU IF CLAUDE DID IT HERE"],
        xp: 25 }
    ],
    checkin: {
      artifacts: ["${ws}/CLAUDE.md"],
      quiz: {
        q: "You start a totally different second project tomorrow. From this CLAUDE.md, what carries over and what changes?",
        options: [
          { t: "General conventions and identity travel; the overview, stack, and avoid-list are rewritten for the new project.", correct: true },
          { t: "The whole file copies over unchanged — it's universal." },
          { t: "Nothing carries — every CLAUDE.md starts from a blank page." },
          { t: "Only the file name carries over." }
        ],
        explain: "Some parts are portable — how you like to work. Some are project-bound — what this thing is and what to avoid in it. Knowing which is which is the skill."
      },
      reflect: {
        prompt: "What's the one line in your Avoid section that will save you the most editing time?",
        saveTo: "${ws}/.notes/lesson-09-reflection.md"
      }
    },
    xpLessonComplete: 50
  },

  // ===========================================================================
  "10_where-this-goes": {
    teach: [
      { chunks: [0, 1], clarifier: {
        q: "'Write a script' loads the voice docs. 'Build an animation' loads the design system. What's doing that?",
        options: [
          { t: "The routing table in CLAUDE.md — same Claude, different context loaded per task.", correct: true },
          { t: "Separate AI models trained for each task type." },
          { t: "Claude reading your mind from the phrasing." },
          { t: "A paid add-on called task routing." }
        ],
        explain: "Layer 1 routes, layer 2 holds each room's context, layer 3 plugs tools in per workspace. The table decides what loads."
      } },
      { chunks: [2], clarifier: {
        q: "Why does task routing matter more as you scale?",
        options: [
          { t: "200K tokens sounds huge until you fill it with irrelevant files — clean input keeps output quality up.", correct: true },
          { t: "It doesn't — bigger context windows solved this." },
          { t: "Routing makes Claude type faster." },
          { t: "It's only for teams over 50 people." }
        ],
        explain: "If Claude is writing a blog post while also reading your client contracts, you're burning tokens on noise. Each task should load only what it needs."
      } },
      { chunks: [3] }
    ],
    build: [
      { type: "create-folder", parent: "${ws}", name: "player-choice", storeAs: "10-area",
        guide: "The smallest version of routing: two scoped contexts. Think of a second, distinct area of your work — different enough that Claude should behave differently there. Create a folder for it.",
        xp: 10 },
      { type: "create-file", path: "${ws}/${chosen:10-area}/CLAUDE.md",
        guide: "Give the new area its own CLAUDE.md — not a copy of your first one. Same five elements, different answers. What's different about how Claude should act here?",
        typedContent: "# [THIS AREA'S NAME]\n\n## Overview\n[WHAT THIS AREA IS — AND HOW IT DIFFERS FROM YOUR MAIN WORKSPACE]\n\n## How Claude should behave here\n[DIFFERENT VOICE, DIFFERENT DEFAULTS, DIFFERENT PRIORITIES]\n\n## Avoid\n[WHAT DOES NOT BELONG IN THIS AREA]\n",
        fillFields: ["THIS AREA'S NAME", "WHAT THIS AREA IS — AND HOW IT DIFFERS FROM YOUR MAIN WORKSPACE",
          "DIFFERENT VOICE, DIFFERENT DEFAULTS, DIFFERENT PRIORITIES", "WHAT DOES NOT BELONG IN THIS AREA"],
        xp: 20, achievement: "second-room" },
      { type: "claude-open", mode: "chat", expectFolder: "${ws}",
        guide: "Now watch the difference. Open the Claude window and point it at your workspace.",
        xp: 5 },
      { type: "claude-chat",
        guide: "Run the comparison: ask it to read both CLAUDE.md files and tell you how it would behave differently in each.",
        script: [{
          suggestedPrompt: "Read the CLAUDE.md in this folder and the one in my second area. Compare: how would you behave differently in each?",
          acceptIf: { mentionsAnyOf: ["compare", "both", "differ", "two", "second"], mentionsAllOf: [] },
          rejectHint: "Ask for the comparison — both CLAUDE.md files, and how behavior changes between them.",
          reply: {
            thinkingLines: ["reading both CLAUDE.md files"],
            text: "Read both. Same model, two different Claudes: each file changed what I pay attention to — different overview, different defaults, different avoid-list. In the first area I'd work one way; in the second, another. That difference is workspace routing at its smallest. New sessions start clean, the right context loads, and anyone who opens the folder gets the same quality.",
            effects: []
          }
        }],
        xp: 15 },
      { type: "create-file", path: "${ws}/next-steps-draft.md",
        guide: "Last build of the section. Where do you want to take this next — not the official answer, yours. Two or three sentences.",
        typedContent: "# Next steps\n\n[WHERE YOU WANT TO TAKE THIS — YOUR HONEST ANSWER, 2-3 SENTENCES]\n",
        fillFields: ["WHERE YOU WANT TO TAKE THIS — YOUR HONEST ANSWER, 2-3 SENTENCES"],
        xp: 15 }
    ],
    checkin: {
      artifacts: ["${ws}/next-steps-draft.md"],
      quiz: {
        q: "Hand your folder to a teammate. Why do they get the same quality from Claude that you do?",
        options: [
          { t: "The context lives in files, not in your head — anyone who opens the folder gets the same Claude.", correct: true },
          { t: "They don't — Claude only works well for the person who set it up." },
          { t: "Claude recognizes teammates automatically." },
          { t: "Because you both pay for the same plan." }
        ],
        explain: "One fact, one location. New sessions start clean. Context in files scales from one person to a team without losing consistency."
      },
      reflect: {
        prompt: "You wrote where you want to take this. What's the one thing you'd need to figure out or set up to actually get there?",
        saveTo: "${ws}/.notes/lesson-10-reflection.md"
      }
    },
    xpLessonComplete: 50
  },

  // ===========================================================================
  "11_path-from-here": {
    teach: [
      { chunks: [0] },
      { chunks: [1, 2] },
      { chunks: [3, 4, 5, 6] },
      { chunks: [7] }
    ],
    build: [
      { type: "reflect", optional: false, eyebrow: "Take stock",
        prompt: "Before we write anything — one thing you understand about working with Claude now that you didn't 11 lessons ago. Your words.",
        saveTo: "${ws}/.notes/lesson-11-stock.md",
        xp: 10 },
      { type: "picker", storeAs: "11-path", eyebrow: "Your path",
        q: "Looking at the paths — which fits where you actually want to go next? Not the official answer. Yours.",
        options: [
          { t: "Level 2 playbooks — build real projects hands-on" },
          { t: "Level 3 — custom interfaces and remote access" },
          { t: "Premium — templates, assets, structured courses" },
          { t: "Keep going free — replay sections, engage the community" }
        ] },
      { type: "create-file", path: "${ws}/path_forward.md",
        guide: "Write it down. This file is for you, not for me. Three honest answers.",
        typedContent: "# Path forward\n\n## What I understand now that I didn't before\n[ONE OR TWO SENTENCES]\n\n## What my setup looks like\n[YOUR WORKSPACES AND FILES, IN YOUR WORDS]\n\n## What I'll do with this next\n[THE ACTUAL NEXT MOVE]\n",
        fillFields: ["ONE OR TWO SENTENCES", "YOUR WORKSPACES AND FILES, IN YOUR WORDS", "THE ACTUAL NEXT MOVE"],
        xp: 20 }
    ],
    checkin: {
      artifacts: ["${ws}/path_forward.md"],
      quiz: {
        q: "Final gate, part one. The three-layer architecture — what is it, in plain words?",
        options: [
          { t: "A map that routes every task, rooms that each hold their own context, and tools that plug in where needed.", correct: true },
          { t: "Three copies of the same file, for safety." },
          { t: "Beginner, intermediate, and advanced modes of Claude." },
          { t: "Three separate AI models working together." }
        ],
        explain: "Map, rooms, tools. The CLAUDE.md routes, each workspace's context file describes its room, and skills plug into the workspaces that need them."
      },
      quiz2: {
        q: "Part two. The five-part prompting framework — what are the parts, and what's the point?",
        options: [
          { t: "Identity, task, context, constraints, output format — so when output is off, you know which part is missing.", correct: true },
          { t: "Five different ways to phrase the same question." },
          { t: "Greeting, question, examples, thanks, sign-off." },
          { t: "A checklist Claude requires before it will answer." }
        ],
        explain: "Who Claude is, what to do, what it needs to know, what to avoid, and the shape of the result. The framework is a diagnostic as much as a recipe."
      },
      reflect: {
        prompt: "The whole arc: first folder, five-part prompts, map-rooms-tools, real sessions, two scoped contexts. What are you building first?",
        saveTo: "${ws}/.notes/lesson-11-reflection.md"
      }
    },
    xpLessonComplete: 100
  }
};
