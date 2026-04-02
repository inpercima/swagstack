# swagstack

[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.md)

An [s]mart [w]eb [a]pps monorepo [g]enerator for Angular with optional backend - full[stack] included.

Projects like [publicmedia](https://github.com/inpercima/publicmedia), [cryptocheck](https://github.com/inpercima/cryptocheck), [mittagstisch](https://github.com/inpercima/mittagstisch) or [run-and-fun](https://github.com/inpercima/run-and-fun) are build on it.

## Motivation

Creating a web application is a great thing but collecting everything you need is very annoying.
Therefore, I decided to write a small tool, which puts together all the necessary resources for the desired app from the given fundamentals and technologies.

## Benefits of swaaplate

### The goal

With swaaplate, the goal is to create an Angular monorepo app with one of the following presets:
- `preset-angular-only` – Angular frontend only
- `preset-angular-java` – Angular frontend + Java/Spring Boot backend skeleton
- `preset-angular-php` – Angular frontend + PHP backend skeleton

## Prerequisites

- Node.js `>= 20.9.0`
- pnpm, npm, or yarn

## Getting started

```bash
# clone project
git clone https://github.com/inpercima/swaaplate
cd swaaplate

# install dependencies
npm install

# build the CLI
npm run build
```

## Usage

### Interactive mode

```bash
npm run dev -- init
# or after build:
node dist/cli/index.js init
```

The CLI will prompt you for:
1. Project name (folder)
2. Preset (angular-only / angular-java / angular-php)
3. Package manager (pnpm / npm / yarn)

### Non-interactive mode

```bash
# Angular only (using pnpm)
node dist/cli/index.js init my-app --preset preset-angular-only --pm pnpm --yes

# Angular + Java backend skeleton
node dist/cli/index.js init my-app --preset preset-angular-java --pm pnpm --yes

# Angular + PHP backend skeleton
node dist/cli/index.js init my-app --preset preset-angular-php --pm pnpm --yes
```

### Available options

| Option | Description | Default |
|---|---|---|
| `--preset <preset>` | `preset-angular-only` \| `preset-angular-java` \| `preset-angular-php` | prompted |
| `--pm <pm>` | `pnpm` \| `npm` \| `yarn` | `pnpm` |
| `--yes`, `-y` | Skip prompts where possible | `false` |
| `--force`, `-f` | Overwrite existing non-empty target directory | `false` |

## Generated project structure

```
<name>/
├── apps/
│   ├── frontend/          # Angular project (via Angular CLI)
│   └── backend/           # Java or PHP skeleton (if preset includes backend)
├── package.json           # root workspace config
├── pnpm-workspace.yaml    # (if pnpm selected)
└── README.md
```

## Development

```bash
# run CLI in dev mode (no build needed)
npm run dev -- init my-app --preset preset-angular-only --pm pnpm --yes

# build
npm run build

# run built CLI
npm start -- init
```

## Changelog

Check the [Changelog](./CHANGELOG.md) for updates.
