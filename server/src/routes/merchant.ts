import { Router, Request, Response } from 'express';
import db from '../db.js';
import { redeem } from '../xrpl/issuer.js';

const router = Router();

// Prototype: server prepares a redemption payload for merchant to sign client-side
router.post('/redeem/prepare', async (req: Request, res: Response) => {
  try {
    const { merchantAddress, amount } = req.body as { merchantAddress: string; amount: string };
    const prepared = await redeem(merchantAddress, String(amount));
    res.json({ prepared });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Record redemption after merchant signs and submits TX separately
router.post('/redeem/record', (req: Request, res: Response) => {
  const { merchantAddress, amount, tx } = req.body as {
    merchantAddress: string;
    amount: string;
    tx?: string;
  };
  db.prepare('INSERT INTO redemptions (merchant_address, amount, tx_hash) VALUES (?, ?, ?)')
    .run(merchantAddress, String(amount), tx || null);
  res.json({ ok: true });
});

export default router;