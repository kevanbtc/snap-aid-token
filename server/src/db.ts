import Database from 'better-sqlite3';
import { CONFIG } from './config.js';

const db = new Database(CONFIG.dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS distributions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_address TEXT NOT NULL,
  amount TEXT NOT NULL,
  tx_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS redemptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_address TEXT NOT NULL,
  amount TEXT NOT NULL,
  tx_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issuances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount TEXT NOT NULL,
  tx_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

export default db;