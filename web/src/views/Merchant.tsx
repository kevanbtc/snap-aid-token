import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { api } from '../api';

export default function Merchant() {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('50');
  const [prepared, setPrepared] = useState<any>(null);
  const [signedBlob, setSignedBlob] = useState('');
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [xummLink, setXummLink] = useState<string | null>(null);
  const [xummQr, setXummQr] = useState<string | null>(null);
  const [xummErr, setXummErr] = useState<string | null>(null);

  const prepare = async () => {
    const res = await api.post('/merchant/redeem/prepare', { merchantAddress: merchant, amount });
    setPrepared(res.data.prepared);
  };

  const submit = async () => {
    if (!signedBlob) return;
    const res = await api.post('/merchant/redeem/submit', { tx_blob: signedBlob });
    setSubmitResult(res.data);
  };

  const signWithXumm = async () => {
    try {
      setXummErr(null); setXummLink(null); setXummQr(null);
      const info = await api.get('/xrpl/info');
      const { issuer, currency } = info.data || {};
      if (!issuer || !currency) {
        setXummErr('Issuer/currency information unavailable');
        return;
      }
      const res = await api.post('/xrpl/xumm/payment', {
        account: merchant,
        destination: issuer,
        amount,
        currency,
        issuer,
      });
      if (res.data?.deepLink) setXummLink(res.data.deepLink);
      if (res.data?.qrPng) setXummQr(res.data.qrPng);
      if (!res.data?.configured && res.data?.error) setXummErr(String(res.data.error));
    } catch (e: any) {
      setXummErr(e?.message || 'Failed to create XUMM sign request');
    }
  };

  return (
    <div className="page">
      <h2>Merchant Portal</h2>
  <input placeholder="merchant r... address" value={merchant} onChange={(e: ChangeEvent<HTMLInputElement>) => setMerchant(e.target.value)} />
  <input placeholder="amount" value={amount} onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} />
      <button onClick={prepare}>Prepare Redemption</button>
      {prepared && (
        <pre className="prewrap">{JSON.stringify(prepared, null, 2)}</pre>
      )}

      <div className="section">
        <button onClick={signWithXumm}>Sign with Xaman/XUMM</button>
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

      <div className="section">
        <h3>Submit Signed TX</h3>
        <textarea placeholder="paste signed tx blob" value={signedBlob} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSignedBlob(e.target.value)} rows={4} cols={60} />
        <div>
          <button onClick={submit}>Submit</button>
        </div>
        {submitResult && (
          <pre className="prewrap">{JSON.stringify(submitResult, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}