# Changelog

## Unreleased

### Added
- Role management audit logging events: ROLE_GRANTED, ROLE_REVOKED, ADMIN_TRANSFER_PROPOSED, ADMIN_TRANSFER_COMPLETED, REVOCATION_PENDING, REVOCATION_CANCELLED, ROLE_RENOUNCED, PROPOSAL_CREATED, PROPOSAL_VOTED, RECOVERY_ADMIN_TRANSFER_PROPOSED
- 24‑hour revocation cooldown periods for critical roles (ORACLE, SETTLEMENT_OPERATOR)
- emergency_revoke_role for immediate revocation bypassing cooldown
- finalize_revocation for completing revocation after cooldown
- cancel_revocation for canceling pending revocation
- get_pending_revocation to query pending revocation status
- initialize_with_recovery and set_recovery_key for emergency recovery key management
- recovery_initiate_admin_transfer for recovery‑initiated admin transfer with 30‑day lock‑in
- Multi‑signature support for critical admin functions: create_proposal, vote_proposal, execute_proposal, get_proposal
- set_multisig_config to update threshold and signer list
- get_multisig_config to query current multi‑sig config

## Contract Versions

Each contract exposes a `version() -> u32` function. Bump this value whenever a storage key or struct layout changes in a breaking way.

| Contract            | Current Version |
|---------------------|-----------------|
| `PaymentProcessor`  | 1               |
| `RefundManager`     | 1               |
| `FXOracle`          | 1               |
| `PaymentLinkManager`| 1               |
| `MerchantRegistry`  | 1               |

---

## Storage / Event Breaking Changes

### v1 — Initial release

**Storage keys (`DataKey`):**
- `Payment(String)` → `PaymentCharge`
- `MerchantPayments(Address)` → `Vec<String>`
- `MerchantRateLimit(Address)` → `MerchantCreateRateLimit`
- `Refund(String)` → `Refund`
- `PaymentRefunds(String)` → `Vec<String>`
- `RefundCounter` → `u64`
- `Dispute(String)` → `Dispute`
- `PaymentDisputes(String)` → `Vec<String>`
- `DisputeCounter` → `u64`
- `UsdcToken` → `Address`
- `Paused` → `bool`
- `MerchantRegistryAddress` → `Address`

**Oracle keys (`OracleDataKey`):**
- `Rate(Symbol)` → `RateData` (persistent)
- `StalenessThreshold` → `u64` (instance)

**Link keys (`LinkDataKey`):**
- `Link(String)` → `PaymentLink`

**Merchant keys (`MerchantDataKey`):**
- `Admin` → `Address`
- `Merchant(Address)` → `Merchant`
- `MerchantList` → `Vec<Address>`

**Events (topic tuple → data):**
- `(PAYMENT, CREATED, payment_id)` → `(merchant_id, amount)`
- `(PAYMENT, VERIFIED, payment_id)` → `(merchant_id, amount, amount_received)`
- `(PAYMENT, OVERPAID, payment_id)` → `(merchant_id, amount, amount_received)`
- `(PAYMENT, PARTIALLY_PAID, payment_id)` → `(merchant_id, amount, amount_received)`
- `(PAYMENT, CANCELLED, payment_id)` → `(merchant_id, amount)`
- `(PAYMENT, EXPIRED, payment_id)` → `(merchant_id, amount)`
- `(PAYMENT, SETTLED, payment_id)` → `(merchant_id, amount)`
- `(REFUND, CREATED)` → `(payment_id, refund_id, amount)`
- `(REFUND, COMPLETED)` → `(payment_id, refund_id, amount)`
- `(REFUND, REJECTED)` → `(payment_id, refund_id, amount)`
- `(DISPUTE, OPENED)` → `(payment_id, dispute_id, amount)`
- `(DISPUTE, UNDER_REVIEW)` → `(payment_id, dispute_id, amount)`
- `(DISPUTE, RESOLVED)` → `(payment_id, dispute_id, amount)`
- `(DISPUTE, REJECTED)` → `(payment_id, dispute_id, amount)`
- `(CONTRACT, PAUSED)` → `admin`
- `(CONTRACT, UNPAUSED)` → `admin`
- `(RATE, UPDATED)` → `pair`
- `(LINK, CREATED)` → `(link_id, merchant)`
- `(LINK, USED)` → `(link_id, payer, amount, payment_id)`
- `(LINK, DEACTIVATED)` → `link_id`

---

## Upgrade Checklist

When deploying a new contract version:

1. **Read old state** — call `get_payment`, `get_refund`, etc. on the live contract and confirm structs deserialise correctly with the new code before upgrading.
2. **Bump `version()`** — increment the constant in the relevant `impl` block.
3. **Migrate if needed** — if a `#[contracttype]` struct gains or loses fields, write a one-shot migration entry-point that reads the old layout and rewrites under the new key/struct before the upgrade goes live.
4. **Update this file** — add a new `## v<N>` section documenting every changed key, struct field, or event signature.
5. **Test** — run `cargo test --all-features` and the bounded property tests locally before opening a PR.
