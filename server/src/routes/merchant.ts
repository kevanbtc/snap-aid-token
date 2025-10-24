import { Router, Request, Response } from 'express';
import db from '../db.js';
import { redeem } from '../xrpl/issuer.js';
import { getClient } from '../xrpl/client.js';

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
// Submit a signed transaction blob (e.g., merchant-signed redemption)
router.post('/redeem/submit', async (req: Request, res: Response) => {
  try {
    const { tx_blob } = req.body as { tx_blob: string };
    if (!tx_blob) return res.status(400).json({ error: 'tx_blob required' });
    const client = await getClient();
    const result = await client.submitAndWait(tx_blob);
    const hash = (result as any).result?.tx_json?.hash || (result as any).result?.hash || null;
    res.json({ ok: true, result, hash });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});