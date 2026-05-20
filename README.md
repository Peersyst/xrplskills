# XRPL Skills

A collection of [Agent Skills](https://agentskills.io/) for the XRP Ledger ecosystem. Use them with Claude Code, claude.ai, or any agent that supports the Agent Skills format.

## Available Skills

| Skill | Use when |
|---|---|
| [`xrpl`](skills/xrpl) | Building XRPL applications in JavaScript/TypeScript with [xrpl.js](https://github.com/XRPLF/xrpl.js) |
| [`xrpl-go`](skills/xrpl-go) | Building XRPL applications in Go with [Peersyst/xrpl-go](https://github.com/Peersyst/xrpl-go) |
| [`xrpl-standards`](skills/xrpl-standards) | Implementing or reviewing any XRPL Standard (XLS-1 … XLS-102) — transactions, ledger objects, amendments, RPC methods |
| [`xrplevm`](skills/xrplevm) | Building on the XRPL EVM sidechain — Solidity contracts, Axelar bridge, EVM tooling |

## Install

### Claude Code

```bash
# All skills
npx skills add peersyst/xrpl-skills

# A specific skill
npx skills add peersyst/xrpl-skills --skill xrpl-standards
npx skills add peersyst/xrpl-skills --skill xrpl-go
```

### claude.ai

Add the skill to project knowledge or paste the contents of the relevant `SKILL.md` into your conversation.

## Repository Layout

```
xrpl-skills/
├── skills/                  # The four skills
│   ├── xrpl/
│   ├── xrpl-go/
│   ├── xrpl-standards/
│   └── xrplevm/
├── packages/
│   └── skills-build/        # Shared build/validation tooling
├── landing/                 # Public landing page (framework TBD — see TODO.md)
├── AGENTS.md                # Guide for AI agents working in this repo
├── README.md                # You are here
└── skills-lock.json         # Locked external skill sources
```

## Contributing

See [AGENTS.md](./AGENTS.md) for skill format, build commands, and conventions.

## License

[MIT](./LICENSE)
