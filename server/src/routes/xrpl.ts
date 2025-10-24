import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { getIssuerSettings, setIssuerSettings, setIssuerSignerList, anchorLegalHash, authorizeTrustline } from '../xrpl/governance.js';
import { currencyCode, getIssuerWallet } from '../xrpl/issuer.js';
import { hasTrustline, buildTrustSetTx } from '../xrpl/utils.js';

const router = Router();

router.get('/info', (_req: Request, res: Response) => {
  const issuer = getIssuerWallet();
  res.json({ issuer: issuer.address, currency: currencyCode() });
});

router.get('/trustline/:account', async (req: Request, res: Response) => {
  try {
    const account = String(req.params.account);
    const ok = await hasTrustline(account);
    res.json({ account, currency: currencyCode(), issuer: getIssuerWallet().address, has_trustline: ok });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'trustline error';
    res.status(400).json({ error: msg });
  }
});

router.post('/trustset/prepare', (req: Request, res: Response) => {
  const { account, limit } = req.body as { account: string; limit?: string };
  if (!account) return res.status(400).json({ error: 'account is required' });
  const tx = buildTrustSetTx(account, limit);
  res.json({ unsigned_tx: tx, note: 'Sign this TrustSet with your XRPL wallet (e.g., Xaman/XUMM), then submit to the XRPL.' });
});

// Optional XUMM integration routes: create sign requests for TrustSet/Payment if XUMM credentials are set.
async function xummCreatePayload(txjson: Record<string, unknown>) {
  const apiKey = process.env.XUMM_API_KEY;
  const apiSecret = process.env.XUMM_API_SECRET;
  if (!apiKey || !apiSecret) {
    return { configured: false as const, error: 'XUMM_API_KEY/SECRET not configured' };
  }
  const resp = await fetch('https://xumm.app/api/v1/platform/payload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'X-API-Secret': apiSecret,
    },
    body: JSON.stringify({ txjson }),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    return { configured: true as const, error: `XUMM request failed: ${resp.status} ${text}` };
  }
  const data = (await resp.json()) as unknown as {
    uuid?: string;
    next?: { always?: string };
    refs?: { qr_png?: string; qr_matrix?: string };
    [k: string]: unknown;
  };
  return {
    configured: true as const,
    uuid: data?.uuid,
    deepLink: data?.next?.always,
    qrPng: data?.refs?.qr_png,
    refs: data?.refs,
    raw: data,
  };
}

router.post('/xumm/trustset', async (req: Request, res: Response) => {
  try {
    const { account, limit } = req.body || {};
    if (!account) return res.status(400).json({ error: 'account is required' });
    const tx = buildTrustSetTx(String(account), limit ? String(limit) : undefined);
    const result = await xummCreatePayload(tx);
    res.json({ tx, ...result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'XUMM trustset error';
    res.status(500).json({ error: msg });
  }
});

router.post('/xumm/payment', async (req: Request, res: Response) => {
  try {
    const { account, destination, amount, currency, issuer, memos } = req.body || {};
    if (!account || !destination || !amount || !currency || !issuer) {
      return res.status(400).json({ error: 'Missing required fields: account, destination, amount, currency, issuer' });
    }
    const tx: Record<string, unknown> = {
      TransactionType: 'Payment',
      Account: String(account),
      Destination: String(destination),
      Amount: { currency: String(currency), issuer: String(issuer), value: String(amount) },
    };
    if (memos && Array.isArray(memos)) {
      (tx as Record<string, unknown>).Memos = (memos as unknown[]).map((m) => ({ Memo: m as Record<string, unknown> }));
    }
    const result = await xummCreatePayload(tx);
    res.json({ tx, ...result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'XUMM payment error';
    res.status(500).json({ error: msg });
  }
});

export default router;
// Governance and compliance endpoints
router.get('/issuer/settings', async (_req: Request, res: Response) => {
  try {
    const s = await getIssuerSettings();
    res.json(s);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'settings error';
    res.status(500).json({ error: msg });
  }
});

router.post('/issuer/settings', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { requireAuth, disallowXRP, defaultRipple, globalFreeze, transferRate, domain } = req.body || {};
    const result = await setIssuerSettings({ requireAuth, disallowXRP, defaultRipple, globalFreeze, transferRate, domain });
    res.json({ ok: true, result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'set settings error';
    res.status(500).json({ error: msg });
  }
});

router.post('/issuer/signerlist', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { quorum, signers } = req.body || {};
    if (!quorum || !Array.isArray(signers) || signers.length === 0) {
      return res.status(400).json({ error: 'quorum and signers[] required' });
    }
    const result = await setIssuerSignerList(Number(quorum), (signers as unknown[]).map((s) => {
      const o = s as Record<string, unknown>;
      return { account: String(o.account), weight: Number(o.weight ?? 1) };
    }));
    res.json({ ok: true, result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'signerlist error';
    res.status(500).json({ error: msg });
  }
});

router.post('/anchor/legal-hash', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { hash, memoType } = req.body || {};
    if (!hash) return res.status(400).json({ error: 'hash is required' });
    const result = await anchorLegalHash(String(hash), memoType ? String(memoType) : undefined);
    res.json({ ok: true, result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'anchor error';
    res.status(500).json({ error: msg });
  }
});

// Authorize a holder's trustline when RequireAuth is enabled.
// Body: { account: string, currency?: string }
router.post('/issuer/authorize-trustline', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { account, currency } = req.body || {};
    if (!account) return res.status(400).json({ error: 'account is required' });
    const code = currency ? String(currency) : currencyCode();
  const result = await authorizeTrustline(String(account), code);
  const r = result as unknown as Record<string, unknown>;
  const resObj = r['result'] as Record<string, unknown> | undefined;
  const txj = resObj?.['tx_json'] as Record<string, unknown> | undefined;
  const txHash = (txj?.['hash'] as string) ?? (resObj?.['hash'] as string) ?? null;
    res.json({ ok: true, tx: txHash, result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'authorize trustline error';
    res.status(500).json({ error: msg });
  }
});
