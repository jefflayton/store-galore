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
mise run dev         # start local dev server (installs deps first if needed)
pnpm db:generate     # generate a migration after editing src/db/schema.ts
pnpm db:migrate      # apply migrations to the local D1 database
pnpm test            # run tests
pnpm lint            # lint
pnpm fmt             # format
```
