import { getClient } from './client.js';
import { currencyCode, getIssuerWallet } from './issuer.js';

export async function hasTrustline(account: string) {
  const client = await getClient();
  const issuer = getIssuerWallet();
  const ccy = currencyCode();
  const resp = await client.request({
    command: 'account_lines',
    account,
    ledger_index: 'validated',
  } as any);
  const lines = (((resp as any).result?.lines) || []) as Array<any>;
  const found = lines.some((l) => l.currency === ccy && (l.account === issuer.address || l.account === issuer.address));
  return found;
}

export function buildTrustSetTx(account: string, limit = '1000000000') {
  const issuer = getIssuerWallet();
  const ccy = currencyCode();
  return {
    TransactionType: 'TrustSet',
    Account: account,
    LimitAmount: {
      currency: ccy,
      issuer: issuer.address,
      value: String(limit),
    },
  };
}
