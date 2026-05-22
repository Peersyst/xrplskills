# Contributing to xrpl-skills

Thanks for your interest in improving `xrpl-skills`. New skills, new rules, corrections, and clarifications are all welcome.

This guide covers the contribution workflow. For the skill format, directory layout, and conventions, see [AGENTS.md](./AGENTS.md).

## Ways to Contribute

- **Fix a bug or inaccuracy** in an existing skill — wrong field name, stale amendment status, broken example.
- **Add a new rule or pattern** to an existing skill — a footgun your agent hit, a pattern that worked.
- **Add a new skill** — a new corner of the XRPL ecosystem the agent should know about.
- **Improve build tooling or the landing page** — anything under `packages/` or `landing/`.

If you are unsure whether a change fits, open an issue first to discuss the scope.

## Before You Start

1. Search [existing issues](https://github.com/Peersyst/xrpl-skills/issues) and open PRs to avoid duplicate work.
2. For non-trivial changes (new skills, large rewrites, structural changes), open an issue describing the proposal before writing code.
3. Read [AGENTS.md](./AGENTS.md) — it documents the skill format and naming conventions that PRs are expected to follow.

## Development Setup

```bash
git clone https://github.com/Peersyst/xrpl-skills.git
cd xrpl-skills
pnpm install
```

This repo uses [pnpm](https://pnpm.io/) workspaces. The `packageManager` field in `package.json` pins the expected version.

### Useful commands

Run from the repo root:

```bash
pnpm validate:frontmatter      # Validate SKILL.md frontmatter across all skills
pnpm build:xrpl-standards      # Fetch and store the raw XLS specs
pnpm test:xrpl-standards       # Validate parsing of all XLS specs
```

See [AGENTS.md](./AGENTS.md#build-commands) for the full list, including token-usage analysis.

## Making Changes

### Editing an existing skill

1. Edit files under `skills/{skill-name}/`. Knowledge skills live in `references/`; action skills also have `scripts/`.
2. Keep `SKILL.md` under 500 lines — push detail into `references/` and link to it.
3. Run `pnpm validate:frontmatter` to catch frontmatter mistakes.
4. If you touched `xrpl-standards`, run `pnpm test:xrpl-standards`.

### Adding a new skill

1. Follow the directory structure and naming conventions in [AGENTS.md](./AGENTS.md#creating-a-new-skill).
2. Write a specific `description` in the `SKILL.md` frontmatter — include trigger phrases (symbol names, transaction types, library identifiers) so the agent activates the right skill.
3. Add the new skill to the README table and the relevant section of `README.md`.
4. Update `AGENTS.md` if the addition changes anything documented there.

### Updating amendment / XLS status

`xrpl-standards` tracks the live status (`Final` / `Draft` / `Stagnant`) of every XRPL Standard. If you spot a status that has changed, link to the source (XRPL.org amendments page, GitHub PR, or merged XLS) in your PR description.

## Style and Conventions

- **Markdown**: keep lines reasonable; no hard wrap requirement. Prefer ATX headers (`#`) and fenced code blocks with a language tag.
- **Scripts**: see the [Script Requirements](./AGENTS.md#script-requirements) section in AGENTS.md (Bash needs `set -e`, status to stderr, JSON to stdout; Go needs `gofmt` and `go vet`).
- **Context efficiency**: skills are loaded on demand. Favor progressive disclosure — short `SKILL.md`, detail in `references/`, scripts over inline code.
- **No invented facts**: cite the spec, repository, or RPC method. If you cannot find a source, mark it as uncertain rather than guess.

## Submitting a Pull Request

1. Fork the repo and create a branch from `main`:
   ```bash
   git checkout -b feat/<short-description>
   ```
2. Make your changes in focused commits. Use Conventional Commit prefixes when reasonable (`feat:`, `fix:`, `docs:`, `chore:`, `ci:`).
3. Run validations locally:
   ```bash
   pnpm validate:frontmatter
   ```
4. Push your branch and open a PR against `main`. The CI workflow (`.github/workflows/validate.yml`) runs the same checks.
5. In the PR description, include:
   - **What** changed and **why**.
   - Links to sources (XLS specs, RPC docs, library issues) for any factual claim.
   - For new skills: which agent footgun this addresses.
6. Be responsive to review comments. Squash or rebase if asked.

## Reporting Bugs and Inaccuracies

Open an issue with:

- The skill and file affected (e.g., `skills/xrpl/references/transactions/payment.md`).
- What is wrong, and the correct information with a source link.
- (Optional) The agent prompt or output that surfaced the issue.

For security-sensitive issues (e.g., a pattern in a skill that would lead to lost funds), please open a private security advisory rather than a public issue.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
