# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Cursor, Copilot, etc.) when working with code in this repository.

## Repository Overview

`xrpl-skills` is a collection of skills for AI coding agents focused on the XRP Ledger ecosystem. It currently ships four skills:

| Skill | Type | Scope |
|---|---|---|
| `xrpl` | Knowledge | xrpl.js JavaScript/TypeScript client library |
| `xrpl-go` | Knowledge | [Peersyst/xrpl-go](https://github.com/Peersyst/xrpl-go) Go client library |
| `xrpl-standards` | Knowledge | All XRPL Standards (XLS-1 … XLS-102) organized by topic |
| `xrplevm` | Knowledge | XRPL EVM sidechain — Cosmos SDK + EVM, Axelar bridge to XRPL |

The repo also hosts the public landing page (`landing/`) and shared build tooling (`packages/skills-build/`).

Skills follow the [Agent Skills](https://agentskills.io/) format and are distributed via `npx skills add peersyst/xrpl-skills`.

## Creating a New Skill

### Directory Structure

```
skills/
  {skill-name}/           # kebab-case directory name
    SKILL.md              # Required: skill definition
    references/           # Knowledge skills: reference material loaded on demand
    scripts/              # Action skills: executable tools the agent runs
      {script-name}.sh    # Bash scripts (preferred)
      {script-name}.go    # Go scripts (when appropriate)
```

There are two skill types:
- **Knowledge skills** — reference material only (e.g. `xrpl-standards`); no scripts
- **Action skills** — have a `scripts/` directory with executable tools the agent runs

Zip files are not used — distribution is via `npx skills add peersyst/xrpl-skills`.

### Naming Conventions

- **Skill directory**: `kebab-case` (e.g., `xrpl-go`, `xrplevm`)
- **SKILL.md**: Always uppercase, always this exact filename
- **Scripts**: `kebab-case.sh` or `kebab-case.go`

### SKILL.md Format

```markdown
---
name: {skill-name}
description: {One sentence describing when to use this skill. Include trigger phrases — symbol names, transaction types, library identifiers, etc.}
---

# {Skill Title}

{Brief description of what the skill does.}

## How to Use

Read reference files directly:

```
Read <skill-dir>/references/<topic>/<file>.md
```

Common locations:
- **claude.ai**: `/mnt/skills/user/{skill-name}/`
- **Claude Code** (`npx skills add`): `.claude/skills/{skill-name}/`

## Topics

{Table or list of topics with the files that cover them.}
```

### Best Practices for Context Efficiency

Skills are loaded on demand — only the skill name and description load at startup. The full `SKILL.md` loads only when the agent decides the skill is relevant. To minimize context:

- **Keep SKILL.md under 500 lines** — put detailed material in `references/`
- **Write specific descriptions** — trigger phrases help the agent activate the right skill
- **Use progressive disclosure** — link to reference files; they load only when needed
- **Prefer scripts over inline code** — script execution doesn't consume context (only output does)

### Script Requirements

#### Bash Scripts
- `#!/bin/bash` shebang
- `set -e` for fail-fast behavior
- Status messages to stderr: `echo "Message" >&2`
- Machine-readable output (JSON) to stdout
- Cleanup trap for temp files

#### Go Scripts
- Follow [Effective Go](https://go.dev/doc/effective_go) guidelines
- Handle errors explicitly; never use `panic()` for expected errors
- Run `gofmt` and `go vet` before committing
- Keep functions small and focused

## Build Commands

```bash
cd packages/skills-build
pnpm install

pnpm build:xrpl-standards   # Fetch and store all 75 raw XLS specs
pnpm test:xrpl-standards    # Validate parsing of all XLS specs

pnpm test                   # Run efficiency tests on all skills
pnpm tokens                 # Analyze token usage for all skills
pnpm tokens:compare         # Side-by-side token comparison
```

## End-User Installation

Document these two installation methods for users:

**Claude Code:**
```bash
# Install all skills
npx skills add peersyst/xrpl-skills

# Or install a specific skill
npx skills add peersyst/xrpl-skills --skill xrpl-standards
npx skills add peersyst/xrpl-skills --skill xrpl-go
```

**claude.ai:**
Add the skill to project knowledge or paste `SKILL.md` contents into the conversation. If the skill requires network access, add required domains at `claude.ai/settings/capabilities`.

## Landing Page

`landing/` hosts the public-facing site for this repo.

---

**Last Updated:** 2026-05-20
