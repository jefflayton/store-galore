# Store Galore

## Setup

Requires [mise](https://mise.jdx.dev). It installs the pinned Node, pnpm, and hk versions.

```sh
mise install       # install tools
hk install         # install git hooks
mise run install   # install dependencies
```

## Usage

```sh
mise run dev       # start local dev server
mise run test      # run tests
mise run lint      # lint
mise run fmt       # format
pnpm run deploy    # deploy to Cloudflare
```
