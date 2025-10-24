import xrpl from 'xrpl';
import { getClient } from './client.js';
import { getIssuerWallet } from './issuer.js';

// Minimal map of AccountSet asf flags we intend to use
const ASF = {
  RequireAuth: 2,
  DisallowXRP: 3,
  GlobalFreeze: 7,
  DefaultRipple: 8,
} as const;

export type IssuerSettings = {
  requireAuth?: boolean;
  disallowXRP?: boolean;
  defaultRipple?: boolean;
  globalFreeze?: boolean;
  transferRate?: number; // optional integer as per XRPL transfer rate (1_000_000_000 = 0%)
  domain?: string; // optional domain
};

export async function setIssuerSettings(opts: IssuerSettings) {
  const client = await getClient();
  const issuer = getIssuerWallet();

  const setFlags: number[] = [];
  const clearFlags: number[] = [];
  const apply = (flagVal: number, enable?: boolean) => {
    if (enable === undefined) return;
    if (enable) setFlags.push(flagVal); else clearFlags.push(flagVal);
  };

  apply(ASF.RequireAuth, opts.requireAuth);
  apply(ASF.DisallowXRP, opts.disallowXRP);
  apply(ASF.DefaultRipple, opts.defaultRipple);
  apply(ASF.GlobalFreeze, opts.globalFreeze);

  const tx: xrpl.AccountSet = {
    TransactionType: 'AccountSet',
    Account: issuer.address,
  } as xrpl.AccountSet;

  if (setFlags.length === 1) (tx as unknown as Record<string, unknown>).SetFlag = setFlags[0];
  if (clearFlags.length === 1) (tx as unknown as Record<string, unknown>).ClearFlag = clearFlags[0];
  // XRPL only supports one SetFlag/ClearFlag per AccountSet; send multiple tx if needed
  const results: Array<{ hash?: string; result: unknown }> = [];

  const toSend: Array<xrpl.AccountSet> = [];
  if (setFlags.length > 1 || clearFlags.length > 1) {
    for (const f of setFlags) {
      toSend.push({ TransactionType: 'AccountSet', Account: issuer.address, SetFlag: f } as unknown as xrpl.AccountSet);
    }
    for (const f of clearFlags) {
      toSend.push({ TransactionType: 'AccountSet', Account: issuer.address, ClearFlag: f } as unknown as xrpl.AccountSet);
    }
  } else {
    toSend.push(tx);
  }

  if (typeof opts.transferRate === 'number') {
    toSend.push({ TransactionType: 'AccountSet', Account: issuer.address, TransferRate: opts.transferRate } as unknown as xrpl.AccountSet);
  }
  if (opts.domain) {
    // Domain must be hex-encoded string
    const hexDomain = Buffer.from(opts.domain, 'ascii').toString('hex');
    toSend.push({ TransactionType: 'AccountSet', Account: issuer.address, Domain: hexDomain } as unknown as xrpl.AccountSet);
  }

  for (const t of toSend) {
    const prepared = await client.autofill(t);
    const signed = issuer.sign(prepared);
    const submitted = await client.submitAndWait(signed.tx_blob);
    const s = submitted as unknown as Record<string, unknown>;
    const r = s['result'] as Record<string, unknown> | undefined;
    const txj = r?.['tx_json'] as Record<string, unknown> | undefined;
    const hash = (txj?.['hash'] as string) ?? (r?.['hash'] as string);
    results.push({ hash, result: submitted });
  }
  return results;
}

export async function setIssuerSignerList(quorum: number, signers: Array<{ account: string; weight: number }>) {
  const client = await getClient();
  const issuer = getIssuerWallet();
  const tx: xrpl.SignerListSet = {
    TransactionType: 'SignerListSet',
    Account: issuer.address,
    SignerQuorum: quorum,
    SignerEntries: signers.map(s => ({ SignerEntry: { Account: s.account, SignerWeight: s.weight } })),
  } as unknown as xrpl.SignerListSet;
  const prepared = await client.autofill(tx);
  const signed = issuer.sign(prepared);
  return client.submitAndWait(signed.tx_blob);
}

export async function getIssuerSettings() {
  const client = await getClient();
  const issuer = getIssuerWallet();
  const info = (await client.request({ command: 'account_info', account: issuer.address, ledger_index: 'validated' } as any)) as unknown as { result?: Record<string, unknown> };
  const objs = (await client.request({ command: 'account_objects', account: issuer.address, type: 'signer_list', ledger_index: 'validated' } as any)) as unknown as { result?: { account_objects?: unknown[] } };
  return { info: info.result, signerLists: objs.result?.account_objects || [] };
}

export async function anchorLegalHash(hash: string, memoType?: string) {
  // Store a legal/doc hash in a Payment memo, Payment from issuer to issuer (min XRP) as an immutable anchor
  const client = await getClient();
  const issuer = getIssuerWallet();
  const memos: Array<{ Memo: { MemoType?: string; MemoData: string } }> = [
    { Memo: { MemoType: memoType ? Buffer.from(memoType, 'ascii').toString('hex') : undefined, MemoData: Buffer.from(hash, 'ascii').toString('hex') } },
  ];
  const tx: xrpl.Payment = {
    TransactionType: 'Payment',
    Account: issuer.address,
    Destination: issuer.address,
    Amount: xrpl.xrpToDrops('0.000001'),
    Memos: memos,
  } as unknown as xrpl.Payment;
  const prepared = await client.autofill(tx);
  const signed = issuer.sign(prepared);
  return client.submitAndWait(signed.tx_blob);
}

// Authorize a holder's trustline when RequireAuth is enabled on the issuer.
// This sets the tfSetfAuth flag on the trust line from issuer -> holder for the given currency.
// Note: The holder must have created a trustline to the issuer for this currency first.
export async function authorizeTrustline(holderAccount: string, currency: string) {
  const client = await getClient();
  const issuer = getIssuerWallet();
  // tfSetfAuth flag
  const TF_SET_F_AUTH = 0x00010000;

  const tx: xrpl.TrustSet = {
    TransactionType: 'TrustSet',
    Account: issuer.address,
    Flags: TF_SET_F_AUTH,
    LimitAmount: {
      currency,
      issuer: holderAccount,
      value: '0'
    }
  } as unknown as xrpl.TrustSet;

  const prepared = await client.autofill(tx);
  const signed = issuer.sign(prepared);
  return client.submitAndWait(signed.tx_blob);
}
