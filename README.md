# swu.varos.cloud

This repository includes all VAROS Connect software updates, which are available
via OTA update.

A list of the latest available updates can be found at
[`https://swu.varos.cloud/v1/index.json`](https://swu.varos.cloud/v1/index.json).
This index file is automatically generated via
[GitHub Actions](https://github.com/features/actions).

## Adding a swu-file

Simply add the `.swu` file to this repository and commit the changes. The
filename is of no importance and the swu-file may be (deeply) nested in
sub-directories (excluding `build/`, `.github/` and `dist/`).

Nothing else needs to be done. GitHub Actions will do the rest.
