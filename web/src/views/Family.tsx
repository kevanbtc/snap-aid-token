import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { api } from '../api';
import QRCode from 'react-qr-code';

export default function Family() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('50');
  const [lastTx, setLastTx] = useState<string | null>(null);
  const [trustInfo, setTrustInfo] = useState<{has_trustline:boolean, issuer:string, currency:string} | null>(null);
  const [trustTx, setTrustTx] = useState<any | null>(null);
  const [showTrustQr, setShowTrustQr] = useState(false);
  const [xummLink, setXummLink] = useState<string | null>(null);
  const [xummQr, setXummQr] = useState<string | null>(null);
  const [xummErr, setXummErr] = useState<string | null>(null);

  const distribute = async () => {
    const res = await api.post('/family/distribute', { recipientAddress: recipient, amount });
    setLastTx(res.data.tx || null);
  };

  const checkTrustline = async () => {
    if (!recipient) return;
    const res = await api.get(`/xrpl/trustline/${encodeURIComponent(recipient)}`);
    setTrustInfo(res.data);
  };

  const prepareTrustset = async () => {
    if (!recipient) return;
    const res = await api.post('/xrpl/trustset/prepare', { account: recipient });
    setTrustTx(res.data.unsigned_tx);
  };

  const signTrustsetWithXumm = async () => {
    if (!recipient) return;
    setXummErr(null); setXummLink(null); setXummQr(null);
    try {
      const res = await api.post('/xrpl/xumm/trustset', { account: recipient });
      if (res.data?.deepLink) setXummLink(res.data.deepLink);
      if (res.data?.qrPng) setXummQr(res.data.qrPng);
      if (!res.data?.configured && res.data?.error) setXummErr(String(res.data.error));
    } catch (e: any) {
      setXummErr(e?.message || 'Failed to create XUMM sign request');
    }
  };

  return (
    <div className="page">
      <h2>Family Portal</h2>
      <p>Enter your XRPL address (trustline to issuer required) and request distribution.</p>
  <input placeholder="r... address" value={recipient} onChange={(e: ChangeEvent<HTMLInputElement>) => setRecipient(e.target.value)} />
  <input placeholder="amount" value={amount} onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} />
      <button onClick={distribute}>Request Distribution</button>

      <div className="section">
        <h3>Trustline</h3>
        <button onClick={checkTrustline}>Check trustline</button>
        <button onClick={prepareTrustset} className="ml-8">Prepare TrustSet</button>
        {trustInfo && (
          <p>
            Currency {trustInfo.currency} to issuer {trustInfo.issuer}: {trustInfo.has_trustline ? 'Present' : 'Missing'}
          </p>
        )}
        {trustTx && (
          <div className="section">
            <p>Unsigned TrustSet transaction (sign with your wallet, e.g., Xaman/XUMM):</p>
            <pre className="prewrap">{JSON.stringify(trustTx, null, 2)}</pre>
            <div className="section">
              <label><input type="checkbox" checked={showTrustQr} onChange={e => setShowTrustQr(e.target.checked)} /> Show QR</label>
              {showTrustQr && (
                <div className="section">
                  <QRCode value={JSON.stringify(trustTx)} size={160} />
                </div>
              )}
            </div>
            <div className="section">
              <button onClick={signTrustsetWithXumm}>Sign with Xaman/XUMM</button>
              {xummErr && <p className="error">{xummErr}</p>}
              {xummLink && (
                <p>
                  Deep link: <a href={xummLink} target="_blank" rel="noreferrer">Open in Xaman</a>
                </p>
              )}
              {xummQr && (
                <div className="section">
                  <img src={xummQr} alt="XUMM QR" className="qr180" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {lastTx && (
        <div>
          <p>Last TX: {lastTx}</p>
          <QRCode value={lastTx} size={128} />
        </div>
      )}
    </div>
  );
}