import { useState } from 'react';
import type { ChangeEvent } from 'react';
import './Admin.css';
import { api } from '../api';

export default function Admin() {
  const [amount, setAmount] = useState('1000000');
  const [token, setToken] = useState('');
  const [tx, setTx] = useState<string | null>(null);
  const [updateState, setUpdateState] = useState('');
  const [updateStatus, setUpdateStatus] = useState<'unknown'|'normal'|'warning'|'on_hold'|'not_issuing'>('unknown');
  const [updateSource, setUpdateSource] = useState('');

  const issue = async () => {
    const res = await api.post('/admin/issue', { amount }, { headers: { 'x-admin-token': token } });
    setTx(res.data.tx || null);
  };

  const saveStatus = async () => {
    await api.post('/state-status', { state: updateState, status: updateStatus, source: updateSource }, { headers: { 'x-admin-token': token } });
    alert('Status updated');
  };

  return (
  <div className="admin-container">
      <h2>Admin Panel</h2>
      <p>Issue FSNAP tokens (self-issue to issuer account)</p>
  <input placeholder="amount" value={amount} onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} />
  <input placeholder="admin API token" value={token} onChange={(e: ChangeEvent<HTMLInputElement>) => setToken(e.target.value)} />
      <button onClick={issue}>Issue</button>
      {tx && <p>TX: {tx}</p>}

      <hr />
      <h3>Update State Issuance Status</h3>
      <input placeholder="State (e.g., Texas)" value={updateState} onChange={(e: ChangeEvent<HTMLInputElement>) => setUpdateState(e.target.value)} />
      <label htmlFor="statusSelect">Status</label>
      <select id="statusSelect" value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value as any)}>
        <option value="unknown">unknown</option>
        <option value="normal">normal</option>
        <option value="warning">warning</option>
        <option value="on_hold">on_hold</option>
        <option value="not_issuing">not_issuing</option>
      </select>
      <input placeholder="Source URL" value={updateSource} onChange={(e: ChangeEvent<HTMLInputElement>) => setUpdateSource(e.target.value)} />
      <button onClick={saveStatus}>Save Status</button>
    </div>
  );
}