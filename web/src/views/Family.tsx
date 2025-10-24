import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { api } from '../api';
import QRCode from 'react-qr-code';

export default function Family() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('50');
  const [lastTx, setLastTx] = useState<string | null>(null);

  const distribute = async () => {
    const res = await api.post('/family/distribute', { recipientAddress: recipient, amount });
    setLastTx(res.data.tx || null);
  };

  return (
    <div className="page">
      <h2>Family Portal</h2>
      <p>Enter your XRPL address (trustline to issuer required) and request distribution.</p>
  <input placeholder="r... address" value={recipient} onChange={(e: ChangeEvent<HTMLInputElement>) => setRecipient(e.target.value)} />
  <input placeholder="amount" value={amount} onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} />
      <button onClick={distribute}>Request Distribution</button>

      {lastTx && (
        <div>
          <p>Last TX: {lastTx}</p>
          <QRCode value={lastTx} size={128} />
        </div>
      )}
    </div>
  );
}