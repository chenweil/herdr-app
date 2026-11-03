# Along

This personal layout adds a right-click menu to the Files and Changes panels.
It copies the absolute path, the path relative to the panel folder or
repository root, and the file name.

Version 0.3.0. See `CHANGELOG.md` for what changed.

## Install

From this directory, run:

```sh
./install.sh
```

The installer copies the layout, mods, `README.md`, `RECIPE.md`, `LICENSE`,
and `NOTICE` into `${HERDR_APP_HOME:-$HOME/.config/herdr-app}`, then runs
`herdr-app check` on each installed mod. Restart Herdr and switch to the
`along` layout.

The mods use `exec` and `readTextFile` because they are copies of Herdr's
Files and Changes panels. They read the focused folder and repository, and do
not use the network. The Machines dialog runs local `hc` commands. Disable
forgets the machine from herdr-core after saving its profile in Along's
shared state; Enable adds it back with the saved target and session. Remote
terminals keep running while a machine is disabled.

## License

Along is Apache-2.0 licensed; see `LICENSE`. `along-files` and
`along-changes` are modified copies of the Files and Changes mods from
herdr-app. See `NOTICE` for attribution.
