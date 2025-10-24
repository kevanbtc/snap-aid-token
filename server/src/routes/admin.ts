import { Router, Request, Response } from 'express';
import db from '../db.js';
import { issue } from '../xrpl/issuer.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/issue', requireAdmin, async (req: Request, res: Response) => {
  try {
    const amount = String(req.body.amount || '0');
    const result = await issue(amount);
    const tx = (result as any).result?.tx_json?.hash || (result as any).result?.hash || null;
    db.prepare('INSERT INTO issuances (amount, tx_hash) VALUES (?, ?)').run(amount, tx);
    res.json({ ok: true, tx });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;