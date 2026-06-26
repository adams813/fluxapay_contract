# Security Policy

FluxaPay takes the security of our smart contracts and user funds (USDC) extremely seriously. This document outlines our vulnerability disclosure policy, audit status, and mainnet readiness requirements.

## 🛡️ Vulnerability Disclosure Policy

If you discover a security vulnerability, we encourage you to report it to us responsibly. We will acknowledge receipt of your report and provide a status update as we investigate and address the issue.

### Reporting a Vulnerability

Please send an email to: **security@metrologic.com**

To help us prioritize and address your report, please include:

- A detailed description of the vulnerability.
- Steps to reproduce the issue (PoC code or clear instructions).
- Your assessment of the impact.

### Response SLA

- **Acknowledgment**: Within 48 hours of receipt.
- **Resolution**: Varies depending on severity; we aim for rapid patches of critical issues.

### Scope

- **In-Scope**: Core Soroban smart contracts (`fluxapay/src/*.rs`).
- **Out-of-Scope**: Third-party protocols (Stellar/Soroban platform), front-end interfaces (unless they impact contract security).

## 💰 Bug Bounty Program

A public bug bounty program is **planned for launch after the external audit completes** (issue #381). Until then, we may provide discretionary rewards for high-impact, responsibly disclosed vulnerabilities.

| Milestone | Status |
| --------- | ------ |
| External audit complete | Pending |
| Bug bounty platform selected | Pending |
| Public program launched | Pending |

## 🔍 Audit Status

| Audit Date | Auditor  | Scope           | Status               | Report Link        |
| ---------- | -------- | --------------- | -------------------- | ------------------ |
| 2026-03-27 | Internal | All Contracts   | Completed (Internal) | N/A                |
| TBD        | External | Mainnet Release | **In Progress**      | [Link Placeholder] |

### External Audit Engagement (issue #381)

An independent external audit is **required before mainnet deployment**. Current status:

| Milestone | Status |
| --------- | ------ |
| Audit firm selection | In progress |
| Engagement letter signed | Pending |
| [Audit scope document](audits/SCOPE.md) | Draft complete |
| Audit execution | Not started |
| Critical/High findings resolved | Pending |
| Report published | Pending |

**Candidate auditors** (under evaluation): OtterSec, Trail of Bits, Halborn, CertiK.

**Scope:** PaymentProcessor, RefundManager, FXOracle, MerchantRegistry, PaymentLinkManager — see [audits/SCOPE.md](audits/SCOPE.md) for full details.

**Mainnet gate:** Production deployments are blocked by CI until `audits/external-audit-status.json` confirms audit completion and remediation of all Critical/High findings. See [DEPLOYMENT.md](DEPLOYMENT.md).

> [!IMPORTANT]
> This project is currently in **active development**. Use with caution and only on Testnet for now. **Do not deploy to mainnet until the external audit is complete.**

## 🔐 Code Ownership

Security-critical files, such as `access_control.rs` and the main `lib.rs` payment logic, require mandatory review from the security team as defined in our [`CODEOWNERS`](.github/CODEOWNERS) file.

## 📊 FX Oracle Staleness Risk

The `FXOracle` contract (`fluxapay/src/fx_oracle.rs`) provides exchange rates used for fiat settlement calculations. Rate freshness is validated using the Stellar ledger close time and ledger sequence number.

### Threat Model

| Risk | Description | Mitigation |
| ---- | ----------- | ---------- |
| **Ledger timestamp manipulation** | Stellar validators can influence ledger close time within a small window (~±a few seconds). | Hard 24-hour staleness cap (`MAX_RATE_AGE_SECS`) enforced regardless of admin-configured threshold. |
| **Misconfigured threshold** | An admin could set an excessively long staleness threshold, allowing very old rates. | `effective_threshold = min(configured, MAX_RATE_AGE_SECS)` — hard cap always wins. |
| **Compromised oracle key** | A malicious or delayed oracle operator could stop updating rates while settlement continues. | Ledger-sequence circuit breaker (`MAX_LEDGER_GAP`): if no rate update occurs within ~24 h of ledgers, `get_rate` and `get_settlement_amount` reject the rate and emit a `RATE/STALE_ALERT` event. |
| **Timestamp-only false positives** | Legitimate rates could be rejected if ledger time drifts ahead of real time. | Accepted residual risk (~seconds). A dual timestamp+sequence AND-check is tracked as a follow-up (#384). |

### Operational Guidance

- Monitor `RATE/STALE_ALERT` events via the indexer or webhook pipeline.
- Rotate oracle operator keys promptly if compromise is suspected.
- Keep the off-chain rate feed latency well below the 24-hour hard cap.
- Do not raise the admin staleness threshold above 24 hours expecting longer tolerance — the hard cap cannot be bypassed.
