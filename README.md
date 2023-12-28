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

> [!IMPORTANT]\
> The settings of the measurement devices only take into account the stable
> versions. Pre-release versions (e.g. `1.0.0-beta.1`) are not displayed as a
> new update.

Nothing else needs to be done. GitHub Actions will do the rest.

> [!NOTE]\
> This page is hosted on GitHub Pages and can therefore be cached for up to 15
> minutes, so it may take up to this time for an update to appear in the
> measurement device settings.
