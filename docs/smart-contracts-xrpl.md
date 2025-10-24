# XRPL Smart-Contract Governance for FSNAP

This document outlines how FSNAP uses XRPL account-level controls, multisigning, and transaction metadata to achieve compliance-grade behavior while retaining fast execution and simple operational flows.

## Core primitives used

- Issued currency (IOU) with trustlines
- Account flags via AccountSet:
  - RequireAuth: authorize trustlines before funds can move
  - DefaultRipple: configure rippling as required by policy
  - DisallowXRP: optional
  - GlobalFreeze: emergency brake
- Multisignature via SignerListSet (quorum + weights)
- Memos as immutable legal anchors (hashes of agreements, approvals)
- Freeze/unfreeze trust lines selectively (clawback-like governance when necessary)

Note: XRPL Escrow and Payment Channels are XRP-native and not applied to IOUs directly. For FSNAP (an IOU), governance is enforced with RequireAuth, Freeze, and trustline authorization.

## Compliance controls

1) KYC/AML gating
   - Applications are verified (KYC/AML, OFAC) off-chain
   - Approved wallet trustlines are authorized (RequireAuth on; issuer authorizes)
   - Distribution only to authorized accounts

2) Multisig approvals
   - Issuer account has a signer list and quorum
   - Sensitive actions (flag changes, large issuances) require multisign

3) Legal anchoring
   - Hashes of policy versions, approvals, or due diligence packets are stored in Payment memos to the issuer itself (0.000001 XRP), creating an immutable anchor

4) Emergency response
   - GlobalFreeze can pause IOU movement
   - Individual trustlines can be frozen if risk is detected

## API surfaces

The backend exposes endpoints to control and audit these operations:

- GET /api/xrpl/issuer/settings
- POST /api/xrpl/issuer/settings { requireAuth?, defaultRipple?, disallowXRP?, globalFreeze?, transferRate?, domain? }
- POST /api/xrpl/issuer/signerlist { quorum, signers: [{account, weight}] }
- POST /api/xrpl/anchor/legal-hash { hash, memoType? }

These map to XRPL AccountSet, SignerListSet, and Payment (with Memos).

## Operational checklist

- [ ] Configure RequireAuth for issuer account
- [ ] Set and verify signer list and quorum
- [ ] Authorize trustlines only for verified applicants
- [ ] Log and anchor critical approvals with memoed Payment
- [ ] Document emergency freeze procedures
- [ ] Maintain audit logs tying app IDs to on-ledger hashes and transactions

## Legal posture

FSNAP uses deterministic policies enforced by account flags and a verified onboarding pipeline. Legal agreements and approvals are referenced by hash on-ledger and retained off-chain in secure storage. This hybrid model is designed to pass due diligence and regulatory review by demonstrating:

- Strict access control (RequireAuth)
- Clear delegation and approvals (multisig)
- Immutable anchoring of decision artifacts (memos)
- Audit trail linking off-chain records to on-ledger actions
