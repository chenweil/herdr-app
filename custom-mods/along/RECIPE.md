# Along

Along adds a right-click menu to Herdr's Files and Changes panels: copy a file's absolute path, its path relative to the panel folder or the repository root, or just its name. A Machines button in the tab bar lists your herdr-core machines and enables or disables them.

![Along](preview.png)

Version 0.3.0. See [CHANGELOG.md](CHANGELOG.md) for what changed.

This file is the brief: enough to build Along from an empty folder. The
files next to it are one build of it. If they don't work on your Herdr, or you
want it different, build it again from here.

## What you see

Herdr's default window, with two differences: the Files and Changes panels
have a right-click menu, and the tab bar carries a Machines button next to
Files and Changes.

- **The window.** No title bar. A 268px sidebar on the left: a 46px brand
  block, the spaces list and the agents list, each at least 90px, and a 69px
  footer. A tab bar 42px tall with the terminal tabs, a `+`, and Files,
  Changes and Machines buttons at the right, then the pane area, then a 28px
  status bar.
  On the right, a panel column 368px wide (min 280, max 900), hidden until a
  panel is opened, holding Files and Changes as a stack with Files in front.
  Terminals get 14px of horizontal and 12px of vertical padding, and panes
  are 10px-radius cards with a 1px border that turns into the accent color
  when focused.
- **The Files panel.** A rounded 10px card on the theme background with a 1px
  border and 13px text. Header 42px: "Files" in semibold and the shown
  folder's name right-aligned in dim 12px. Rows are 28px, indented 18px per
  depth: a 12px chevron for a folder (12px of blank for a file), a 14px
  folder or file icon, the name, and, when git reports one, a status letter —
  `A` green, `D` and `U` red, `M` in the blocked color.
- **The Changes panel.** The same card. Header 42px: "Changes" in semibold,
  a bordered "N files" chip in 10px, then the total additions in green and
  deletions in red, both 11px. The changed-file list is at most 200px tall
  with 28px rows: the status letter in a 14px column, the directory prefix in
  dim text, the file name, and that file's own `+`/`−` counts. Below it the
  selected file's unified diff, 11px monospace on 20px rows, with a vertical
  scrollbar and horizontal scrolling; diff lines are never wrapped.
- **The commit bar.** At the bottom of Changes, a 32px rounded message input
  and a 32px "Commit" button. The button is filled with the theme's solid
  color only when the message is non-empty and no other git work is running.
- **The right-click menu.** A 210px popup with 5px padding on the theme's
  popover color and 12.8px text. Rows are 31px high with a 14px copy icon:
  "Copy Path", "Copy Relative Path", "Copy Name". A row whose value is empty
  or repeats an earlier row is dropped, so the menu can show fewer than three.
- **The Machines dialog.** 460×360, popover color, 12px padding, 13px text. A
  heading row "Machines" with "enable / disable" in dim 11px, then one 36px
  row per machine: a 7px dot (green when enabled, dim when disabled), the
  machine name, a second line with its state or "disabled" in dim 11px, and a
  "Disable" or "Enable" button in 11px.

## How it behaves

- Right-clicking any row in Files or Changes opens the menu for that row. In
  Files it works on folders and files; in Changes on changed files.
- "Copy Path" is absolute (`/home/me/project/src/main.js`, or
  `C:\work\project\src\main.js` on Windows). "Copy Relative Path" is relative
  to the folder the Files panel is showing, and in Changes relative to the
  repository root. "Copy Name" is the last path segment. The chosen value goes
  to the system clipboard and the menu closes.
- The menu takes focus when it opens, so keys go to it and not to the
  terminal behind it. Up and Down move the highlight, Enter copies, Escape
  closes. When it closes, typing reaches the terminal again.
- Path separators follow the platform: `/` on macOS and Linux, `\` on
  Windows, so a copied relative path pastes into that platform's shell.
- Files follows the focused pane's folder, reloads every 10 seconds and when
  the folder changes on disk, and remembers which folders are expanded per
  space. Clicking a folder expands it, clicking a file shows a read-only
  preview with syntax coloring, and "←" goes back to the list.
- Changes lists the repository's uncommitted files and shows the selected
  file's diff. Clicking a row opens its diff, clicking it again closes it.
- "Machines" opens the dialog from the tab bar. It reads the machines
  herdr-core knows with `hc machine ls --json`. "Disable" removes the machine
  with `hc machine rm` and keeps its profile in shared state; "Enable" adds it
  back with `hc machine add` and the saved target and session. The row shows
  "Working…" while the command runs.
- Nothing animates, and Along shows no agent status: the spaces and agents
  lists are the shipped ones.

## Built from

- **The layout**, `layouts/along.json`: a copy of the shipped `main` tree with
  `titlebar: "none"`, `traffic_lights: [12, 16]`, `terminal_padding:
  [14, 12]` and a 1px `border` divider. Its right column is `hidden: true`,
  368px, min 280, max 900, and holds a `stack` with `active: "files"` and two
  blocks, `content: { mod: "along-files" }` and `content: { mod:
  "along-changes" }`. The tab bar points at `along-tabs` instead of the
  shipped `tabs`. Everything else points at shipped mods:
  `workspace-chrome` (brand and footer), `spaces`, `agents`, `pane`,
  `workspace-status`.
- **Five mods**, all `"place": "none"` so only the layout decides where they
  show:
  - `along-files/` — the shipped `files` mod plus `openOverlay`, the
    `windows`/`joiner` path helpers, a `rowMenu(path, entry)` method, an
    `.on_mouse_down("right", …)` on each row, and its own asset paths
    (`mods/along-files/…`).
  - `along-changes/` — the shipped `changes` mod with the same additions,
    its relative path measured from the repository root.
  - `along-tabs/` — the shipped `tabs` mod with a "Machines" button added
    after the Files and Changes buttons.
  - `along-menu/` — the popup. Reads `props().target` (`path`, `relative`,
    `name`) and `props().overlay`, writes with `cx.write_to_clipboard`, closes
    with `closeOverlay`.
  - `along-machines/` — the dialog. Reads with `exec("hc", ["machine", "ls",
    "--json"])`, writes with `hc machine rm` and `hc machine add`, and keeps
    disabled profiles in shared state under `along.machines.disabled`. It
    migrates profiles from older per-overlay stores on first open.
- **Data:** `spaces()`, `panes()` and `focused()` for the folder and the
  remote machine, `theme()` for every color, `settings()` for the preview
  font, `window()` for the platform.
- **Commands and programs:** `openOverlay` and `closeOverlay`; `exec("sh")`
  or `exec("powershell")` to list a folder; `exec("git")` for the root,
  status, diffs, `add` and `commit`; `exec("hc")` for machines;
  `readTextFile` for previews; `watchFolder` for live refresh.
- **Art:** four SVGs in `along-files/` (chevron down, chevron right, file,
  folder) and one copy icon in `along-menu/`. They are the shipped panels'
  icons.

## Watch out

- **The Changes panel writes to your repository.** Its Commit button runs
  `git add -A` and then `git commit -m <message>` in the repository root, so
  it stages everything, not only the rows you looked at. Drop the commit bar
  if you don't want that.
- The Machines dialog runs `hc` and can remove machines from herdr-core. A
  disabled machine's spaces disappear from the window until it is enabled
  again; its terminals keep running in the core.
- These are copies of the shipped `files`, `changes` and `tabs` mods, so they
  do not follow upstream fixes. When Herdr updates, re-copy
  `defaults/mods/files/`, `defaults/mods/changes/` and `defaults/mods/tabs/`
  and re-apply the right-click and Machines additions. This copy was synced
  against herdr-app 0.1.12.
- The `mods/along-files/…` asset paths, the `mod` names in the layout and the
  `mod` names in the `openOverlay` calls all name the same five folders.
  Renaming any of them means changing all of them.
- The Files panel caps at 500 entries per folder and 5,000 overall; Changes
  caps at 1,000 changed files. A preview is limited to 400,000 characters, and
  a file containing a NUL byte is reported as binary.
- Remote (SSH) machines list folders, run git and read previews through
  `hc`, so the same menu works there; only the path separator rule still
  follows the local platform.
- The panels are read-only apart from the commit bar. There is no create,
  rename, delete or drag.

## Done when

- `herdr-app check mods/along-files`, `mods/along-changes`, `mods/along-menu`,
  `mods/along-machines` and `mods/along-tabs` pass.
- Switching to `along` (`ctrl-shift-l`, or `layout.switch along`) shows the
  sidebar, the tab bar with Machines next to Files and Changes, the terminals
  and the right panel with Files in front.
- Right-clicking a file row in Files opens the menu; each item puts the right
  string on the clipboard, and "Copy Relative Path" starts at the shown
  folder.
- Right-clicking a changed file in Changes copies paths relative to the
  repository root.
- Up, Down, Enter and Escape work in the menu, and the terminal receives keys
  again once it closes.
- "Machines" opens the dialog; Disable takes a machine out of `hc machine ls`
  and Enable brings it back with its target.
- Switching to another layout and back keeps the panels, and Files still
  follows the focused pane's folder.
