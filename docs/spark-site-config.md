# Spark GitHub Site Builder Integration

This project exposes a REST API and a frontend that can be surfaced in Spark. This guide maps endpoints, environment, and data so the Spark site and this backend stay in sync.

## Backend endpoints

- Applications API: /api/applications
  - POST /            → create application
  - POST /:id/documents  → upload document (multipart form: doc_type, file)
  - GET  /            → list applications (optional ?status=)
  - GET  /:id         → get application + documents
  - POST /:id/ai/verify  → run AI verification (MCP-ready stub)
  - POST /:id/approve    → approve and issue (admin header)
  - POST /:id/reject     → reject (admin header)
  - GET  /stats          → dashboard metrics
  - GET  /export         → CSV export
  - POST /validate       → system sanity check

- XRPL governance: /api/xrpl
  - GET  /info
  - GET  /issuer/settings
  - POST /issuer/settings
  - POST /issuer/signerlist
  - POST /anchor/legal-hash
  - Trustline helpers and XUMM sign flows are available under /api/xrpl/...

## Environment variables

Server (.env):

- PORT=4000
- DB_PATH=./data/audit.db
- XRPL_WS=wss://s.altnet.rippletest.net:51233
- ISSUER_SEED=...
- ADMIN_API_TOKEN=...
- XUMM_API_KEY=... (optional)
- XUMM_API_SECRET=... (optional)

## Uploads

- Uploaded files are stored under ./uploads (served at /uploads for preview). For production, place behind auth and consider encryption at rest.

## Spark integration points

- Use the Applications API to render admin dashboards and application lists.
- Use /api/applications/stats for KPI cards.
- Trigger AI verification via /api/applications/:id/ai/verify.
- Approve using admin token header to immediately issue FSNAP to verified wallets.
- For compliance pages, read governance endpoints and show current flags and signer list.

## Notes

- The AI review is a stub and is designed to be replaced by Spark’s MCP-backed pipeline. Keep the request/response shape to avoid UI changes.
- If Spark hosts the frontend, configure the proxy to route /api/* to this server.
