import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

export const CONFIG = {
  xrplWs: process.env.XRPL_WS || 'wss://s.altnet.rippletest.net:51233',
  issuerSeed: process.env.ISSUER_SEED || '',
  adminApiToken: process.env.ADMIN_API_TOKEN || '',
  dbPath: process.env.DB_PATH || './data/audit.db',
  port: Number(process.env.PORT || 4000),
};

// Ensure data directory exists if using relative DB path
const dbDir = path.dirname(CONFIG.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}