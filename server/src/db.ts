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

-- Applications for assistance
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  family_name TEXT,
  family_size INTEGER,
  contact_email TEXT,
  state TEXT,
  wallet_address TEXT,
  requested_amount REAL,
  status TEXT DEFAULT 'pending',
  ai_score REAL,
  ai_flags TEXT,
  ai_summary TEXT,
  approval_tx TEXT
);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Documents linked to applications
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  doc_type TEXT,
  filename TEXT,
  path TEXT,
  checksum TEXT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(application_id) REFERENCES applications(id)
);
CREATE INDEX IF NOT EXISTS idx_documents_app ON documents(application_id);
`);

// Best-effort migrate existing DBs to include new columns (ignore errors if already exist)
try { db.exec(`ALTER TABLE applications ADD COLUMN family_size INTEGER;`); } catch (_e) { /* ignore if exists */ }
try { db.exec(`ALTER TABLE applications ADD COLUMN ai_flags TEXT;`); } catch (_e) { /* ignore if exists */ }

export default db;