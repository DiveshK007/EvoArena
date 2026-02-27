# Contributing to EvoArena

## Commit Messages

Use short, human-like commit messages:

```
init: scaffold repo
feat: add EvoPool core swap
test: EvoPool swap edgecases
feat: add AgentController
feat(agent): add volatility calc + executor
chore: deploy testnet
feat: add dashboard
docs: add demo script
```

Format: `<type>(<scope>): <short description>`

Types: `feat`, `fix`, `test`, `docs`, `chore`, `refactor`

## Branches

- `main` — stable, demo-ready code only
- `feat/<name>` — feature branches for WIP

## Pull Requests

- Short bullet list of changes
- How to test
- Tag team lead for review

## Code Style

- Solidity: follow OpenZeppelin conventions, NatSpec comments
- TypeScript: strict mode, ESLint
- Agent: structured JSON logs

## Testing

All PRs must pass:
```bash
npx hardhat test
cd agent && npm test
```
