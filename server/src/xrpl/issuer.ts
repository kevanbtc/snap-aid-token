import xrpl from 'xrpl';
import { CONFIG } from '../config.js';
import { getClient } from './client.js';

const CURRENCY = 'FSNAP';

export function getIssuerWallet() {
  if (!CONFIG.issuerSeed) throw new Error('ISSUER_SEED not configured');
  return xrpl.Wallet.fromSeed(CONFIG.issuerSeed);
}

export async function issue(amount: string) {
  const client = await getClient();
  const issuer = getIssuerWallet();

  const tx: xrpl.Payment = {
    TransactionType: 'Payment',
    Account: issuer.address,
    Destination: issuer.address,
    Amount: { currency: CURRENCY, value: amount, issuer: issuer.address },
  };

  const prepared = await client.autofill(tx);
  const signed = issuer.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);
  return result;
}

export async function distribute(destination: string, amount: string) {
  const client = await getClient();
  const issuer = getIssuerWallet();

  const tx: xrpl.Payment = {
    TransactionType: 'Payment',
    Account: issuer.address,
    Destination: destination,
    Amount: { currency: CURRENCY, value: amount, issuer: issuer.address },
  };

  const prepared = await client.autofill(tx);
  const signed = issuer.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);
  return result;
}

export async function redeem(merchantAddress: string, amount: string) {
  // Redemption modeled as Payment from merchant to issuer; in practice, merchant signs
  const client = await getClient();
  const issuer = getIssuerWallet();

  const tx: xrpl.Payment = {
    TransactionType: 'Payment',
    Account: merchantAddress,
    Destination: issuer.address,
    Amount: { currency: CURRENCY, value: amount, issuer: issuer.address },
  } as any; // merchant must sign; in API we would provide xumm/tx blob flow

  // For prototype simplicity, we return the prepared payload for client-side signing.
  const prepared = await client.autofill(tx);
  return prepared;
}

export function currencyCode() {
  return CURRENCY;
}