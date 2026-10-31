# Files Copy Path

![Files Copy Path](preview.png)

Right-clicking a file row in the Files or Changes panel opens a small menu
with copy actions for the absolute path, relative path, and name.

## Built from

This package clones the shipped `files` and `changes` panels into
`copy-files` and `copy-changes`, adds the `copy-menu` overlay, and uses a
personal `files-copy-path` layout cloned from `main`. The layout points its
Files and Changes stack at the personal panel copies.

## Done when

- The three mods pass `herdr-app check`.
- The `files-copy-path` layout opens and shows Files and Changes.
- Right-clicking a row opens the copy menu and each item writes to the
  clipboard.

## Watch out

The package reads the focused folder and repository through the same local
commands as the shipped panels. It does not use the network. Keep the personal
copies when Herdr updates; shipped mods can change independently.
