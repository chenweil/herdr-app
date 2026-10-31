# Along

This personal layout adds a right-click menu to the Files and Changes panels.
It copies the absolute path, the path relative to the panel folder or
repository root, and the file name.

Copy `layouts/along.json` into `~/.config/herdr-app/layouts/` and
the three folders under `mods/` into `~/.config/herdr-app/mods/`. Then switch
to the `along` layout.

Validate each mod before using it:

```sh
herdr-app check ~/.config/herdr-app/mods/along-files
herdr-app check ~/.config/herdr-app/mods/along-changes
herdr-app check ~/.config/herdr-app/mods/along-menu
```

The mods use `exec` and `readTextFile` because they are copies of Herdr's
Files and Changes panels. They read the focused folder and repository, and do
not use the network.
