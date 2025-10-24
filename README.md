# Global Aid Token (GAT) — XRPL Gateway Pilot

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![XRPL Testnet](https://img.shields.io/badge/XRPL-Testnet-23292F?logo=ripple&logoColor=white)](https://xrpl.org/)
[![Compliance‑Ready](https://img.shields.io/badge/Compliance-Ready-0E7C7B)](#compliance--governance)
[![Windows](https://img.shields.io/badge/OS-Windows-0078D6?logo=windows&logoColor=white)](#quick-start-windows)
[![License: MIT](https://img.shields.io/badge/License-MIT-000000.svg)](#license)

An end‑to‑end aid token pilot on the XRP Ledger (XRPL) with a TypeScript/Express backend and a React (Vite) frontend. Public label: Global Aid Token (GAT). The existing FSNAP name is retained as a program alias for pilots.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Key Features](#key-features)
4. [Quick Start (Windows)](#quick-start-windows)
5. [Environment](#environment)
6. [Run and Verify](#run-and-verify)
7. [API (selected)](#api-selected)
8. [Compliance & Governance](#compliance--governance)
9. [Back Office](#back-office)
10. [Data & Reporting](#data--reporting)
11. [Security & Privacy](#security--privacy)
12. [Troubleshooting](#troubleshooting)
13. [Docs](#docs)
14. [License](#license)

---

## Overview

GAT is a gateway‑grade aid instrument: issuers mint and distribute to verified recipients; merchants redeem for fiat. It uses XRPL IOUs with trustlines, issuer flags, and multisig. All flows are auditable.

Terminology
- Currency code: `GAT` (on‑ledger). FSNAP remains a UI alias for the current program.
- Network: XRPL Testnet by default.

## Architecture

- Backend: Express + TypeScript + better‑sqlite3; XRPL JS SDK
- Frontend: React + Vite + TypeScript (React Router, Axios)
- Data: Embedded per‑state participation data and status tracker

```text
[React/Vite] ── Axios ──▶ [Express API] ──▶ [XRPL]
                    ╰────▶ [SQLite Audit]
                    ╰────▶ [Data Endpoints]
```

## Key Features

- Issuance, distribution, and merchant redemption prep
- Trustline tools and XUMM deep‑link signing
- Back Office: intake, docs upload, AI verify (stub), approve → issue
- Governance endpoints: flags, multisig, legal hash anchoring
- CSV/JSON exports and system validation

## Quick Start (Windows)

Prereqs: Node 18+, PowerShell 5.1+

1. Copy env

```powershell
Copy-Item C:\snap-aid-token\server\.env.sample C:\snap-aid-token\server\.env
```

Edit `server/.env` (do not commit secrets):

```
XRPL_WS=wss://s.altnet.rippletest.net:51233
ISSUER_SEED=your_testnet_seed
ADMIN_API_TOKEN=your_admin_token
PORT=4000

# Optional
# XUMM_API_KEY=...
# XUMM_API_SECRET=...
# OPENAI_API_KEY=...
# HF_API_TOKEN=...
```

2. Install deps

```powershell
npm install --prefix "C:\snap-aid-token\server"
npm install --prefix "C:\snap-aid-token\web"
```

## Environment

- `server/.env` keys: XRPL_WS, ISSUER_SEED, ADMIN_API_TOKEN, PORT, DB_PATH (optional)
- Optional AI: OPENAI_API_KEY, HF_API_TOKEN
- Optional XUMM: XUMM_API_KEY/SECRET

## Run and Verify

Dev servers:

```powershell
# Backend
npm run dev --prefix "C:\snap-aid-token\server"

# Frontend
npm run dev --prefix "C:\snap-aid-token\web"

# Or in VS Code: Tasks → Dev: both servers
```

Health:

```http
GET http://localhost:4000/health

HTTP/1.1 200 OK
{ "ok": true }
```

## API (selected)

- `POST /api/admin/issue` — issue GAT (header: `x-admin-token`)
- `POST /api/family/distribute` — send GAT to recipient
- `POST /api/merchant/redeem/prepare` — redemption payload
- `GET /api/data/snap-persons[?format=csv]` — participation data
- `GET /api/state-status[?format=csv]` — per‑state issuance status
- `POST /api/state-status` — update status (admin)
- Governance (admin):
  - `GET /api/xrpl/issuer/settings`
  - `POST /api/xrpl/issuer/settings`
  - `POST /api/xrpl/issuer/signerlist`
  - `POST /api/xrpl/anchor/legal-hash`
  - `POST /api/xrpl/issuer/authorize-trustline` (RequireAuth flow)

## Compliance & Governance

- Account flags: RequireAuth, DefaultRipple, DepositAuth; TransferRate=0; Domain set
- Multisig: SignerList (e.g., 2‑of‑3) for governance
- Legal hash: anchor policy hash on‑ledger and publish in `.well-known/xrp-ledger.toml`
- Trustline authorization: authorize after KYC/OFAC approval

See docs:

- `docs/smart-contracts-xrpl.md` — governance and controls
- `docs/spark-site-config.md` — integration and env mapping

## Back Office

- Intake → document upload → AI verify (stub) → approve → issue
- Compliance tab: issuer settings, signer list, legal anchor, audit

## Data & Reporting

- CSV/JSON exports for audit
- Per‑state participation and issuance status pages

## Security & Privacy

- No PII on‑ledger; trustline + compliance checks server‑side
- Admin routes require `x-admin-token`
- Testnet only by default; never reuse secrets on mainnet

## Troubleshooting

- Port 4000 in use: stop the process or set `PORT=4001` in `server/.env`.
- Dev server exits: ensure `.env` exists and Node ≥ 18.
- ESLint/Type errors: run `npm run build --prefix server` to pinpoint.

## Docs

- Smart contracts and governance: `docs/smart-contracts-xrpl.md`
- Spark/site config and endpoints: `docs/spark-site-config.md`

## License

MIT — for demo purposes only. Align compliance and privacy with counsel before production.
