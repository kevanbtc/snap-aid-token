import { Router, Request, Response } from 'express';
import db from '../db.js';

const router = Router();

// List recent issuances (transparency)
router.get('/ledger', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM issuances ORDER BY created_at DESC LIMIT 100').all();
  res.json({ issuances: rows });
});

export default router;