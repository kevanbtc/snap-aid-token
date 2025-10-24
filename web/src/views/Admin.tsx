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
  const [calc, setCalc] = useState<{ affectedHouseholds: number; estimate: number; factors: {onboarding:number; merchant:number; wallet:number; funding:number} } | null>(null);
  const [onboarding, setOnboarding] = useState(60);
  const [merchant, setMerchant] = useState(50);
  const [wallet, setWallet] = useState(80);
  const [funding, setFunding] = useState(70);

  const issue = async () => {
    const res = await api.post('/admin/issue', { amount }, { headers: { 'x-admin-token': token } });
    setTx(res.data.tx || null);
  };

  const saveStatus = async () => {
    await api.post('/state-status', { state: updateState, status: updateStatus, source: updateSource }, { headers: { 'x-admin-token': token } });
    alert('Status updated');
  };

  const runCoverage = async () => {
    // Fetch datasets
    const [personsRes, statusRes] = await Promise.all([
      api.get('/data/snap-persons'),
      api.get('/state-status'),
    ]);
    const persons: { records: { state: string; estimated_households: number }[] } = personsRes.data;
    const statuses: { records: { state: string; status: 'unknown'|'normal'|'warning'|'on_hold'|'not_issuing' }[] } = statusRes.data;
    const affectedStates = new Set(statuses.records.filter(r => r.status === 'on_hold' || r.status === 'not_issuing').map(r => r.state));
    const affectedHouseholds = persons.records
      .filter(r => affectedStates.has(r.state))
      .reduce((sum, r) => sum + (r.estimated_households || 0), 0);

    const fOn = onboarding / 100;
    const fMc = merchant / 100;
    const fWl = wallet / 100;
    const fFn = funding / 100;
    const estimate = Math.round(affectedHouseholds * fOn * fMc * fWl * fFn);

    setCalc({ affectedHouseholds, estimate, factors: { onboarding, merchant, wallet, funding } });
  };

  const downloadCoverageCsv = () => {
    if (!calc) return;
    const headers = 'affected_households,onboarding,merchant,wallet,funding,estimate\n';
    const line = `${calc.affectedHouseholds},${onboarding},${merchant},${wallet},${funding},${calc.estimate}\n`;
    const blob = new Blob([headers + line], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'coverage_estimate.csv';
    a.click();
    URL.revokeObjectURL(url);
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

      <hr />
      <h3>Coverage Calculator</h3>
      <p>Estimate how many affected households you can cover during a disruption.</p>
      <div className="section">
        <label>Onboarding (%): <input type="number" value={onboarding} onChange={e => setOnboarding(Math.min(100, Math.max(0, Number(e.target.value)||0)))} /></label>
        <label className="ml-8">Merchant coverage (%): <input type="number" value={merchant} onChange={e => setMerchant(Math.min(100, Math.max(0, Number(e.target.value)||0)))} /></label>
        <label className="ml-8">Wallet enablement (%): <input type="number" value={wallet} onChange={e => setWallet(Math.min(100, Math.max(0, Number(e.target.value)||0)))} /></label>
        <label className="ml-8">Funding coverage (%): <input type="number" value={funding} onChange={e => setFunding(Math.min(100, Math.max(0, Number(e.target.value)||0)))} /></label>
        <div className="section">
          <button onClick={runCoverage}>Run Estimate</button>
          {calc && (
            <div className="section">
              <p>Affected households (states on hold/not issuing): <strong>{calc.affectedHouseholds.toLocaleString()}</strong></p>
              <p>Estimated covered households: <strong>{calc.estimate.toLocaleString()}</strong></p>
              <button onClick={downloadCoverageCsv}>Download CSV</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}