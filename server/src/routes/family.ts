import { Router, Request, Response } from 'express';
import db from '../db.js';
import { distribute } from '../xrpl/issuer.js';

const router = Router();

// For prototype: admin distributes to a family address via body
router.post('/distribute', async (req: Request, res: Response) => {
  try {
    const { recipientAddress, amount } = req.body as { recipientAddress: string; amount: string };
    const result = await distribute(recipientAddress, String(amount));
    const tx = (result as any).result?.tx_json?.hash || (result as any).result?.hash || null;
    db.prepare('INSERT INTO distributions (recipient_address, amount, tx_hash) VALUES (?, ?, ?)')
      .run(recipientAddress, String(amount), tx);
    res.json({ ok: true, tx });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;