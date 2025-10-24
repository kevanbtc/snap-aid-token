import { Router, Request, Response } from 'express';
import { loadStatuses, upsertStatus, StateStatus } from '../stateStatusStore.js';
import { requireAdmin } from '../middleware/auth.js';
import { parse } from 'url';

const router = Router();

router.get('/state-status', (req: Request, res: Response) => {
  const url = parse(req.url, true);
  const format = String(url.query.format || 'json').toLowerCase();
  const rows = loadStatuses();
  if (format === 'csv') {
    res.type('text/csv');
    const header = 'State,Status,LastConfirmed,Source\n';
    const body = rows
      .map((r) => `${escapeCsv(r.state)},${r.status},${r.last_confirmed ?? ''},${escapeCsv(r.source)}`)
      .join('\n');
    return res.send(header + body + '\n');
  }
  res.json({
    as_of: new Date().toISOString(),
    records: rows,
    statuses: ['unknown', 'normal', 'warning', 'on_hold', 'not_issuing'],
  });
});

// Alias under data namespace for compatibility: GET /api/data/state-status
router.get('/data/state-status', (req: Request, res: Response) => {
  const url = parse(req.url, true);
  const format = String(url.query.format || 'json').toLowerCase();
  const rows = loadStatuses();
  if (format === 'csv') {
    res.type('text/csv');
    const header = 'State,Status,LastConfirmed,Source\n';
    const body = rows
      .map((r) => `${escapeCsv(r.state)},${r.status},${r.last_confirmed ?? ''},${escapeCsv(r.source)}`)
      .join('\n');
    return res.send(header + body + '\n');
  }
  res.json({
    as_of: new Date().toISOString(),
    records: rows,
    statuses: ['unknown', 'normal', 'warning', 'on_hold', 'not_issuing'],
  });
});

function escapeCsv(s: string) {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

router.post('/state-status', requireAdmin, (req: Request, res: Response) => {
  const body = req.body as Partial<StateStatus> & { state: string; status: StateStatus['status'] };
  if (!body?.state || !body?.status) {
    return res.status(400).json({ error: 'state and status required' });
  }
  const updated = upsertStatus({
    state: body.state,
    status: body.status,
    source: body.source || '',
    last_confirmed: body.last_confirmed ?? new Date().toISOString(),
  });
  res.json({ ok: true, record: updated });
});

// Alias under admin namespace for compatibility: POST /api/admin/state-status
router.post('/admin/state-status', requireAdmin, (req: Request, res: Response) => {
  const body = req.body as Partial<StateStatus> & { state: string; status: StateStatus['status'] };
  if (!body?.state || !body?.status) {
    return res.status(400).json({ error: 'state and status required' });
  }
  const updated = upsertStatus({
    state: body.state,
    status: body.status,
    source: body.source || '',
    last_confirmed: body.last_confirmed ?? new Date().toISOString(),
  });
  res.json({ ok: true, record: updated });
});

export default router;
