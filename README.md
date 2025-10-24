# SNAP Aid Token (XRPL)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![XRPL Testnet](https://img.shields.io/badge/XRPL-Testnet-23292F?logo=ripple&logoColor=white)](https://xrpl.org/)

An end-to-end prototype for an emergency food-aid token system on the XRP Ledger (XRPL) with a Node.js/Express TypeScript backend and a React (Vite) frontend.

## Table of Contents

- Overview
- Architecture
- Features
- Quick Start
- Configuration
- Run and Verify
- API (selected)
- Data and Reporting
- Security Notes
- Development
- License

## Overview

FSNAP is a demo token on XRPL Testnet designed to simulate emergency food benefits during disruptions. It supports issuance, distribution to families (trustline required), merchant redemption, and a transparent audit trail.

## Architecture

- Backend: Node.js + TypeScript + Express + better-sqlite3; XRPL JS SDK on testnet
- Frontend: React + Vite + TypeScript, React Router, Axios
- Data: Embedded per-state SNAP participation (JSON/CSV) and a state status tracker

```text
[React/Vite] ── Axios ──▶ [Express API] ──▶ [XRPL Testnet]
                    ╰────▶ [SQLite Audit]
                    ╰────▶ [Data Endpoints]
```

## Features

- Issue FSNAP to issuer account (self-issue) and track issuances
- Distribute FSNAP to recipient XRPL addresses (with trustline)
- Prepare merchant redemption payloads for signing
- Report per-state participation and issuance statuses (CSV export)

## Quick Start

Prereqs:

- Node.js 18+
- Windows PowerShell 5.1+ (commands below use PowerShell)

1) Copy env and configure issuer

- Copy `server/.env.sample` to `server/.env`
- Set `ISSUER_SEED` to an XRPL testnet seed for your issuer wallet
- Optionally set `ADMIN_API_TOKEN` for admin endpoints

1) Install dependencies

- Backend: run from anywhere

  ```powershell
  npm install --prefix "C:\snap-aid-token\server"
  ```

- Frontend: run from anywhere

  ```powershell
  npm install --prefix "C:\snap-aid-token\web"
  ```

## Run and Verify

Dev servers:
 
```powershell
npm run dev --prefix "C:\snap-aid-token\server"   # Backend on http://localhost:4000
npm run dev --prefix "C:\snap-aid-token\web"      # Frontend (proxies /api to 4000)
```

Health check:

```text
GET http://localhost:4000/health  ->  { ok: true }
```

## Configuration

Server `.env` keys:

- `XRPL_WS` (default testnet)
- `ISSUER_SEED` (issuer wallet seed for testnet)
- `ADMIN_API_TOKEN` (protects admin endpoints)
- `DB_PATH` (SQLite file path)

## API (selected)

- `POST /api/admin/issue` — issue FSNAP (header: `x-admin-token`)
- `POST /api/family/distribute` — send FSNAP to recipient address
- `POST /api/merchant/redeem/prepare` — prepare redemption payload
- `GET /api/data/snap-persons[?format=csv]` — per-state participation
- `GET /api/state-status[?format=csv]` — issuance progress by state
- `POST /api/state-status` — update state status (header: `x-admin-token`)

## Data and Reporting

- `web` includes pages for “SNAP by State” and “State Status” (also CSV exports)
- Admin page includes a quick status updater per state

## Security Notes

- Recipients and merchants must establish a trustline to the issuer for `FSNAP`
- Admin actions require `x-admin-token`
- XRPL testnet only; do not reuse secrets on mainnet

## Development

Builds from anywhere:

```powershell
npm run build --prefix "C:\snap-aid-token\server"
npm run build --prefix "C:\snap-aid-token\web"
```

## License

MIT — for demo purposes only. Review compliance, privacy, and eligibility verification before any real deployment.
