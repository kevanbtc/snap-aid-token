import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { api } from '../api';

export default function Merchant() {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('50');
  const [prepared, setPrepared] = useState<any>(null);

  const prepare = async () => {
    const res = await api.post('/merchant/redeem/prepare', { merchantAddress: merchant, amount });
    setPrepared(res.data.prepared);
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
    </div>
  );
}