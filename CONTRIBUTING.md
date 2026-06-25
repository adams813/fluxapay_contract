# Contributing to FluxaPay

Thank you for your interest in contributing to FluxaPay!  
This document covers everything you need to get started: environment setup, build and test commands, code standards, branch and commit conventions, and the PR process.

For security vulnerabilities, see [SECURITY.md](SECURITY.md) instead of opening a public issue.

---

## Table of Contents

1. [Local Development Setup](#1-local-development-setup)
2. [Building the Contract](#2-building-the-contract)
3. [Running Tests](#3-running-tests)
4. [Linting, Formatting, and Auditing](#4-linting-formatting-and-auditing)
5. [Branch Naming Conventions](#5-branch-naming-conventions)
6. [Commit Message Format](#6-commit-message-format)
7. [Pull Request Requirements](#7-pull-request-requirements)
8. [Issue Workflow](#8-issue-workflow)

---

## 1. Local Development Setup

### Required Tools

| Tool | Version | Install |
|---|---|---|
| Rust (stable) | 1.78+ | `rustup toolchain install stable` |
| wasm32 target | — | `rustup target add wasm32-unknown-unknown` |
| Stellar CLI | 21.x | [stellar.org/docs](https://developers.stellar.org/docs/tools/developer-tools/stellar-cli) |
| cargo-audit | latest | `cargo install cargo-audit` |
| cargo-deny | latest | `cargo install cargo-deny` |

### Environment Variables

Copy the example and populate with your testnet credentials:

```bash
cp .env.example .env
# Edit .env — do NOT commit this file
```

See [docs/local-invoke.md](docs/local-invoke.md) for step-by-step recipes to invoke contract functions on Stellar testnet.

---

## 2. Building the Contract

```bash
cd fluxapay
stellar contract build
```

Or via the Makefile shortcut:

```bash
cd fluxapay && make build
```

---

## 3. Running Tests

### Unit and integration tests

```bash
cd fluxapay && cargo test --all-features
```

### Property-based tests (bounded)

```bash
PROPTEST_CASES=64 cargo test -p fluxapay proptests:: --all-features -- --test-threads=1
```

### All tests via Makefile

```bash
cd fluxapay && make test
```

For testnet testing, see [docs/local-invoke.md](docs/local-invoke.md).

---

## 4. Linting, Formatting, and Auditing

Run all of these before opening a PR:

```bash
# Format check
cd fluxapay && cargo fmt --check

# Lint (warnings are errors)
cargo clippy --all-targets --all-features -- -D warnings

# Security audit
cargo audit --deny warnings

# Dependency checks (bans, licenses, advisories)
cargo deny check bans licenses advisories
```

Or via Makefile:

```bash
cd fluxapay && make fmt && cargo clippy --all-targets --all-features
```

---

## 5. Branch Naming Conventions

| Prefix | Use case |
|---|---|
| `feat/` | New feature or capability |
| `fix/` | Bug fix |
| `chore/` | Build, CI, dependency, or tooling changes |
| `docs/` | Documentation-only changes |
| `security/` | Security patches or hardening |

**Examples:**

```
feat/stream-rate-decrease
fix/payment-id-validation
docs/contributing-guide
security/audit-remediation
```

---

## 6. Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer: Closes #<issue>]
```

**Types:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `security`

**Scope:** the contract or module affected (e.g. `payment-processor`, `stream`, `access-control`, `refund-manager`)

**Examples:**

```
feat(stream): implement decrease_rate_per_second with checkpoint and surplus refund
fix(payment-processor): add payment_id format validation in create_payment
docs: add CONTRIBUTING.md with setup, standards, and PR process
feat(access-control): expose get_role_members and has_role on public contract ABI
```

---

## 7. Pull Request Requirements

Before marking a PR ready for review:

- [ ] All tests pass (`make test`)
- [ ] No new Clippy warnings (`cargo clippy --all-targets --all-features -- -D warnings`)
- [ ] `CHANGELOG.md` updated under `## Unreleased` (or PR has the `skip-changelog` label for non-user-facing changes)
- [ ] New features and bug fixes include tests
- [ ] PR title follows Conventional Commits format
- [ ] PR description explains *what* changed, *why*, and how it was tested

### Changelog Format

Follow [Keep a Changelog](https://keepachangelog.com/) categories:

```markdown
## Unreleased

### Added
- `get_role_members` and `has_role` exposed on `PaymentProcessor` and `RefundManager` ABI

### Fixed
- `payment_id` format validation now enforces 3–64 alphanumeric/-/_ characters
```

Use the `skip-changelog` label only for CI/CD, docs, or internal refactors with no user-facing impact.

---

## 8. Issue Workflow

### Labels

| Label | Meaning |
|---|---|
| `bug` | Something is broken |
| `feat` | New feature request |
| `docs` | Documentation improvement |
| `security` | Security-related issue |
| `chore` | Maintenance, CI, or tooling |
| `skip-changelog` | PR exempt from changelog requirement |
| `breaking-change` | Requires a deprecation notice per [BREAKING_CHANGES.md](docs/BREAKING_CHANGES.md) |

### Reporting Bugs

Open an issue using the **Bug Report** template. Include:
- Contract function name and call arguments
- Expected vs. actual behaviour
- Network (testnet / devnet) and contract ID if applicable

### Feature Requests

Open an issue using the **Feature Request** template. Describe the use case before proposing a solution.

### Security Vulnerabilities

Do **not** open a public issue. Follow the responsible disclosure process in [SECURITY.md](SECURITY.md).

---

## Questions?

Join the community on [Telegram](https://t.me/+m23gN14007w0ZmQ0) or open a GitHub Discussion.
