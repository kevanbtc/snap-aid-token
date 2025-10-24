import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import multer from 'multer';
import db from '../db.js';
import { CONFIG } from '../config.js';
import { reviewApplication } from '../ai/review.js';
import { distribute } from '../xrpl/issuer.js';

const router = Router();

const uploadsDir = path.resolve('./uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage });

function requireAdmin(req: Request, res: Response): boolean {
  const token = req.header('x-admin-token') || '';
  if (!CONFIG.adminApiToken || token !== CONFIG.adminApiToken) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

// Create application
router.post('/', (req: Request, res: Response) => {
  try {
    const id = randomUUID();
    const { family_name, family_size, contact_email, state, wallet_address, requested_amount } = req.body || {};
    db.prepare(
      `INSERT INTO applications (id, family_name, family_size, contact_email, state, wallet_address, requested_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`
    ).run(
      id,
      family_name || null,
      family_size != null ? Number(family_size) : null,
      contact_email || null,
      state || null,
      wallet_address || null,
      requested_amount != null ? Number(requested_amount) : null
    );
    res.json({ id, status: 'pending' });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'create application error';
    res.status(400).json({ error: msg });
  }
});

// Upload document for application
router.post('/:id/documents', upload.single('file'), (req: Request, res: Response) => {
  try {
    const id = randomUUID();
    const appId = String(req.params.id);
    const doc_type = (req.body?.doc_type as string) || null;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const checksum = null; // could compute later if needed
    db.prepare(
      `INSERT INTO documents (id, application_id, doc_type, filename, path, checksum)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, appId, doc_type, file.originalname, file.path, checksum);
    res.json({ ok: true, document: { id, doc_type, filename: file.originalname, path: file.path } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'upload error';
    res.status(400).json({ error: msg });
  }
});

// List applications (optional status filter)
router.get('/', (req: Request, res: Response) => {
  const { status } = req.query as { status?: string };
  const rows = status
    ? db.prepare('SELECT * FROM applications WHERE status = ? ORDER BY created_at DESC').all(status)
    : db.prepare('SELECT * FROM applications ORDER BY created_at DESC').all();
  res.json({ applications: rows });
});

// Get single application with documents
router.get('/:id', (req: Request, res: Response) => {
  const appId = String(req.params.id);
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(appId);
  if (!app) return res.status(404).json({ error: 'Not found' });
  const docs = db.prepare('SELECT * FROM documents WHERE application_id = ? ORDER BY uploaded_at').all(appId);
  res.json({ application: app, documents: docs });
});

// AI verify application (back office)
router.post('/:id/ai/verify', (req: Request, res: Response) => {
  try {
    const appId = String(req.params.id);
    type AppRow = { id: string; family_name?: string; family_size?: number; contact_email?: string; state?: string; wallet_address?: string; requested_amount?: number };
    const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(appId) as AppRow | undefined;
    if (!app) return res.status(404).json({ error: 'Not found' });
    type DocRow = { id: string; doc_type?: string; filename: string; path: string; checksum?: string };
    const docs = db.prepare('SELECT * FROM documents WHERE application_id = ?').all(appId) as DocRow[];
    const result = reviewApplication({
      family_name: app.family_name || undefined,
      contact_email: app.contact_email || undefined,
      state: app.state || undefined,
      wallet_address: app.wallet_address || undefined,
      requested_amount: app.requested_amount != null ? Number(app.requested_amount) : undefined,
      documents: docs.map(d => ({ id: d.id, doc_type: d.doc_type || undefined, filename: d.filename, path: d.path, checksum: d.checksum || undefined })),
    });
    db.prepare('UPDATE applications SET ai_score = ?, ai_summary = ?, ai_flags = ?, status = ? WHERE id = ?')
      .run(result.score, result.summary, JSON.stringify(result.flags), 'verified', appId);
    res.json({ ok: true, result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'verify error';
    res.status(400).json({ error: msg });
  }
});

// Stats: totals and amounts grouped; flagged count (ai_score < 0.6)
router.get('/stats', (_req: Request, res: Response) => {
  type CountRow = { c?: number } | undefined;
  type NumRow = { s?: number; a?: number } | undefined;
  const total = (db.prepare('SELECT COUNT(1) as c FROM applications').get() as CountRow)?.c ?? 0;
  const pending = (db.prepare("SELECT COUNT(1) as c FROM applications WHERE status = 'pending'").get() as CountRow)?.c ?? 0;
  const verified = (db.prepare("SELECT COUNT(1) as c FROM applications WHERE status = 'verified'").get() as CountRow)?.c ?? 0;
  const approved = (db.prepare("SELECT COUNT(1) as c FROM applications WHERE status = 'approved'").get() as CountRow)?.c ?? 0;
  const rejected = (db.prepare("SELECT COUNT(1) as c FROM applications WHERE status = 'rejected'").get() as CountRow)?.c ?? 0;
  const flagged = (db.prepare('SELECT COUNT(1) as c FROM applications WHERE ai_score IS NOT NULL AND ai_score < 0.6').get() as CountRow)?.c ?? 0;
  const totalRequested = (db.prepare('SELECT IFNULL(SUM(requested_amount),0) as s FROM applications').get() as NumRow)?.s ?? 0;
  const avgRequested = (db.prepare('SELECT IFNULL(AVG(requested_amount),0) as a FROM applications').get() as NumRow)?.a ?? 0;
  res.json({ total, pending, verified, approved, rejected, flagged, totalRequested, avgRequested });
});

// Export CSV of applications
router.get('/export', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="applications.csv"');
  type AppRowFull = { [k: string]: unknown };
  const rows = db.prepare('SELECT * FROM applications ORDER BY created_at DESC').all() as AppRowFull[];
  const headers = ['id','created_at','family_name','family_size','contact_email','state','wallet_address','requested_amount','status','ai_score','ai_flags','ai_summary','approval_tx'];
  res.write(headers.join(',') + '\n');
  for (const r of rows) {
    const line = headers.map(h => JSON.stringify(r[h] ?? '')).join(',');
    res.write(line + '\n');
  }
  res.end();
});

// Validate: basic system validation checks
router.post('/validate', (_req: Request, res: Response) => {
  try {
    // Simple checks: tables exist and are queryable
    db.prepare('SELECT 1 FROM applications LIMIT 1').get();
    db.prepare('SELECT 1 FROM documents LIMIT 1').get();
    res.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'validation error';
    res.status(500).json({ ok: false, error: msg });
  }
});

// Approve and issue tokens (admin)
router.post('/:id/approve', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const appId = String(req.params.id);
    type AppRow = { id: string; wallet_address?: string; requested_amount?: number } | undefined;
    const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(appId) as AppRow;
    if (!app) return res.status(404).json({ error: 'Not found' });
    const amount = String(req.body?.amount ?? app.requested_amount ?? '50');
    if (!app.wallet_address) return res.status(400).json({ error: 'Missing wallet_address' });
    const result = await distribute(app.wallet_address, amount);
    // Extract tx hash safely
    let tx: string | null = null;
    const resObj = (result as unknown) as Record<string, unknown>;
    const r = resObj?.['result'] as Record<string, unknown> | undefined;
    if (r) {
      const txj = r['tx_json'] as Record<string, unknown> | undefined;
      tx = (txj?.['hash'] as string) ?? (r['hash'] as string) ?? null;
    }
    db.prepare('UPDATE applications SET status = ?, approval_tx = ? WHERE id = ?').run('approved', tx, appId);
    res.json({ ok: true, tx, amount });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'approve error';
    res.status(400).json({ error: msg });
  }
});

// Reject (admin)
router.post('/:id/reject', (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const appId = String(req.params.id);
  db.prepare('UPDATE applications SET status = ? WHERE id = ?').run('rejected', appId);
  res.json({ ok: true });
});

export default router;
