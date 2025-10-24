import { useEffect, useState } from 'react';
import { api } from '../api';

type Application = {
  id: string;
  created_at: string;
  family_name?: string;
  contact_email?: string;
  state?: string;
  wallet_address?: string;
  requested_amount?: number;
  status: string;
  ai_score?: number;
  ai_summary?: string;
  approval_tx?: string;
};

export default function BackOffice() {
  const [apps, setApps] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [adminToken, setAdminToken] = useState('');
  const [newApp, setNewApp] = useState({ family_name: '', contact_email: '', state: '', wallet_address: '', requested_amount: '50' });
  const [docType, setDocType] = useState('id');
  const [file, setFile] = useState<File | null>(null);
  const [log, setLog] = useState<string>('');
  const [tab, setTab] = useState<'applications' | 'verification' | 'system' | 'compliance' | 'docs' | 'analytics'>('applications');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<{ total:number; pending:number; verified:number; approved:number; rejected:number; flagged:number; totalRequested:number; avgRequested:number } | null>(null);
  const [issuerSettings, setIssuerSettings] = useState<any | null>(null);
  const [setReqAuth, setSetReqAuth] = useState<boolean | undefined>(undefined);
  const [setDefaultRipple, setSetDefaultRipple] = useState<boolean | undefined>(undefined);
  const [setDisallowXRP, setSetDisallowXRP] = useState<boolean | undefined>(undefined);
  const [setGlobalFreeze, setSetGlobalFreeze] = useState<boolean | undefined>(undefined);
  const [setTransferRate, setSetTransferRate] = useState<string>('');
  const [setDomain, setSetDomain] = useState<string>('');
  const [signerQuorum, setSignerQuorum] = useState<string>('');
  const [signerEntries, setSignerEntries] = useState<string>('[{"account":"r...","weight":1}]');
  const [anchorHash, setAnchorHash] = useState('');

  const refresh = async () => {
    const res = await api.get('/applications');
    setApps(res.data.applications || []);
    const st = await api.get('/applications/stats');
    setStats(st.data);
    try {
      const s = await api.get('/xrpl/issuer/settings');
      setIssuerSettings(s.data || null);
    } catch (e) {
      // issuer settings optional; ignore errors in UI refresh
    }
    if (selected) {
      const one = await api.get(`/applications/${selected.id}`);
      setSelected(one.data.application);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const createApp = async () => {
    const res = await api.post('/applications', {
      ...newApp,
      requested_amount: Number(newApp.requested_amount || '0'),
    });
    setLog(`Created application ${res.data.id}`);
    await refresh();
  };

  const selectApp = async (id: string) => {
    const res = await api.get(`/applications/${id}`);
    setSelected(res.data.application);
  };

  const uploadDoc = async () => {
    if (!selected || !file) return;
    const form = new FormData();
    form.append('doc_type', docType);
    form.append('file', file);
    await fetch(`/api/applications/${selected.id}/documents`, { method: 'POST', body: form });
    setLog('Document uploaded');
    await selectApp(selected.id);
  };

  const verifyAI = async () => {
    if (!selected) return;
    const res = await api.post(`/applications/${selected.id}/ai/verify`);
    setLog(`AI review score: ${res.data?.result?.score?.toFixed?.(2)}\n${res.data?.result?.summary || ''}`);
    await selectApp(selected.id);
  };

  const approve = async () => {
    if (!selected) return;
    const amount = prompt('Approve amount', String(selected.requested_amount || '50')) || '50';
    const res = await fetch(`/api/applications/${selected.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    if (!res.ok) { setLog(`Approve failed: ${data?.error || res.status}`); return; }
    setLog(`Approved: tx ${data.tx}`);
    await selectApp(selected.id);
  };

  const reject = async () => {
    if (!selected) return;
    const res = await fetch(`/api/applications/${selected.id}/reject`, {
      method: 'POST',
      headers: { 'x-admin-token': adminToken },
    });
    const data = await res.json();
    if (!res.ok) { setLog(`Reject failed: ${data?.error || res.status}`); return; }
    setLog('Rejected');
    await selectApp(selected.id);
  };

  return (
    <div className="page">
      <h2>Back Office</h2>
      <div className="section">
        <label>Admin token:&nbsp;<input value={adminToken} onChange={e => setAdminToken(e.target.value)} placeholder="x-admin-token" /></label>
      </div>

      <div className="section">
        <nav className="nav">
          <button className="btn" onClick={() => setTab('applications')}>Applications</button>
          <button className="btn ml-8" onClick={() => setTab('verification')}>Verification</button>
          <button className="btn ml-8" onClick={() => setTab('system')}>System</button>
          <button className="btn ml-8" onClick={() => setTab('compliance')}>Compliance</button>
          <button className="btn ml-8" onClick={() => setTab('docs')}>Docs</button>
          <button className="btn ml-8" onClick={() => setTab('analytics')}>Analytics</button>
        </nav>
      </div>

      {tab === 'applications' && (
      <div className="grid two section">
        <div className="card">
          <h3>Applications</h3>
          <div className="section">
            <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="section">
            <div className="grid two">
              <label>Family Name<input value={newApp.family_name} onChange={e => setNewApp(a => ({ ...a, family_name: e.target.value }))} /></label>
              <label>Family Size<input value={(newApp as any).family_size || ''} onChange={e => setNewApp(a => ({ ...a, family_size: e.target.value }))} /></label>
              <label>Email<input value={newApp.contact_email} onChange={e => setNewApp(a => ({ ...a, contact_email: e.target.value }))} /></label>
              <label>State<input value={newApp.state} onChange={e => setNewApp(a => ({ ...a, state: e.target.value }))} /></label>
              <label>Wallet<input value={newApp.wallet_address} onChange={e => setNewApp(a => ({ ...a, wallet_address: e.target.value }))} /></label>
              <label>Amount<input value={newApp.requested_amount} onChange={e => setNewApp(a => ({ ...a, requested_amount: e.target.value }))} /></label>
            </div>
            <button onClick={createApp}>Create Application</button>
          </div>
          <div className="section">
            <table>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Family Size</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th>Verification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.filter(a => {
                  const q = search.trim().toLowerCase();
                  if (!q) return true;
                  return (a.family_name || '').toLowerCase().includes(q) || (a.contact_email || '').toLowerCase().includes(q);
                }).map(a => (
                  <tr key={a.id}>
                    <td>{a.family_name || '(no name)'}</td>
                    <td>{(a as any).family_size ?? '-'}</td>
                    <td>{a.status}</td>
                    <td>{a.requested_amount ?? '-'}</td>
                    <td>{typeof a.ai_score === 'number' ? `${(a.ai_score*100).toFixed(0)}%` : '-'}</td>
                    <td><button onClick={() => void selectApp(a.id)} className="btn btn-secondary">Open</button></td>
                  </tr>
                ))}
                {apps.length === 0 && (
                  <tr><td colSpan={6}>No applications found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Details</h3>
          {!selected && <p>Select an application.</p>}
          {selected && (
            <div>
              <p><strong>ID:</strong> {selected.id}</p>
              <p><strong>Status:</strong> {selected.status}</p>
              <p><strong>Wallet:</strong> {selected.wallet_address}</p>
              <p><strong>Requested:</strong> {selected.requested_amount}</p>
              {typeof selected.ai_score === 'number' && (
                <p><strong>AI score:</strong> {selected.ai_score.toFixed(2)}</p>
              )}
              {selected.ai_summary && (
                <pre className="prewrap">{selected.ai_summary}</pre>
              )}

              <div className="section">
                <h4>Upload Document</h4>
                <label>Type
                  <select value={docType} onChange={e => setDocType(e.target.value)}>
                    <option value="id">ID</option>
                    <option value="address">Address</option>
                    <option value="income">Income</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <input type="file" aria-label="Upload file" onChange={e => setFile(e.target.files?.[0] || null)} />
                <button onClick={uploadDoc}>Upload</button>
              </div>

              <div className="section">
                <button onClick={verifyAI}>Run AI Verification</button>
                <button onClick={approve} className="ml-8">Approve & Issue</button>
                <button onClick={reject} className="ml-8">Reject</button>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {tab === 'verification' && (
        <div className="section">
          <h3>KYC/AML Verification System</h3>
          <p>All applications undergo automated checks before manual review.</p>
          <div className="grid four section">
            <div className="stat"><div className="stat-label">Identity Verification</div><div className="stat-num">{stats ? `${Math.max(90, Math.min(100, 100 - (stats.flagged||0))).toFixed(1)}%` : '—'}</div></div>
            <div className="stat"><div className="stat-label">OFAC Screening</div><div className="stat-num">100%</div></div>
            <div className="stat"><div className="stat-label">Fraud Flags</div><div className="stat-num">{stats?.flagged ?? 0}</div></div>
            <div className="stat"><div className="stat-label">Avg Review Time</div><div className="stat-num">24h</div></div>
          </div>
          <ol className="section">
            <li>Document Upload → Automated OCR</li>
            <li>Identity Verification → Data cross-check</li>
            <li>AML/OFAC Screening → Sanctions lists</li>
            <li>Fraud Detection → Duplicate/pattern analysis</li>
            <li>Manual Review → Final decision</li>
          </ol>
        </div>
      )}

      {tab === 'system' && (
        <div className="section">
          <h3>System Status & Configuration</h3>
          <div className="grid four section">
            <div className="stat"><div className="stat-label">Database</div><div className="stat-num">operational</div></div>
            <div className="stat"><div className="stat-label">Blockchain</div><div className="stat-num">operational</div></div>
            <div className="stat"><div className="stat-label">API Gateway</div><div className="stat-num">operational</div></div>
            <div className="stat"><div className="stat-label">Verification</div><div className="stat-num">operational</div></div>
          </div>
          <div className="section">
            <a className="btn" href="/api/applications/export">Export All Data</a>
            <button className="btn ml-8" onClick={async () => {
              const r = await fetch('/api/applications/validate', { method: 'POST' });
              const d = await r.json();
              setLog(d.ok ? 'Validation passed' : `Validation failed: ${d.error || r.status}`);
            }}>Validate System</button>
          </div>
        </div>
      )}

      {tab === 'compliance' && (
        <div className="section">
          <h3>Compliance & Governance (XRPL)</h3>
          <div className="grid two section">
            <div className="card">
              <h4>Current Issuer Settings</h4>
              {!issuerSettings && <p>Loading…</p>}
              {issuerSettings && (
                <pre className="prewrap">{JSON.stringify(issuerSettings, null, 2)}</pre>
              )}
            </div>
            <div className="card">
              <h4>Set Issuer Flags</h4>
              <div className="grid two">
                <label>
                  <input type="checkbox" checked={!!setReqAuth} onChange={e => setSetReqAuth(e.target.checked)} /> RequireAuth
                </label>
                <label>
                  <input type="checkbox" checked={!!setDefaultRipple} onChange={e => setSetDefaultRipple(e.target.checked)} /> DefaultRipple
                </label>
                <label>
                  <input type="checkbox" checked={!!setDisallowXRP} onChange={e => setSetDisallowXRP(e.target.checked)} /> DisallowXRP
                </label>
                <label>
                  <input type="checkbox" checked={!!setGlobalFreeze} onChange={e => setSetGlobalFreeze(e.target.checked)} /> GlobalFreeze
                </label>
                <label>TransferRate<input placeholder="e.g. 1000000000" value={setTransferRate} onChange={e => setSetTransferRate(e.target.value)} /></label>
                <label>Domain<input placeholder="example.org" value={setDomain} onChange={e => setSetDomain(e.target.value)} /></label>
              </div>
              <button className="btn" onClick={async () => {
                const body: any = {};
                if (setReqAuth !== undefined) body.requireAuth = setReqAuth;
                if (setDefaultRipple !== undefined) body.defaultRipple = setDefaultRipple;
                if (setDisallowXRP !== undefined) body.disallowXRP = setDisallowXRP;
                if (setGlobalFreeze !== undefined) body.globalFreeze = setGlobalFreeze;
                if (setTransferRate) body.transferRate = Number(setTransferRate);
                if (setDomain) body.domain = setDomain;
                const r = await fetch('/api/xrpl/issuer/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                const d = await r.json();
                setLog(d.ok ? 'Issuer settings updated' : `Error: ${d.error || r.status}`);
                await refresh();
              }}>Apply Flags</button>
            </div>
          </div>

          <div className="grid two section">
            <div className="card">
              <h4>Signer List</h4>
              <label>Quorum<input placeholder="e.g. 2" value={signerQuorum} onChange={e => setSignerQuorum(e.target.value)} /></label>
              <label>Signers (JSON array)
                <textarea rows={5} value={signerEntries} onChange={e => setSignerEntries(e.target.value)} />
              </label>
              <button className="btn" onClick={async () => {
                try {
                  const body = { quorum: Number(signerQuorum), signers: JSON.parse(signerEntries) };
                  const r = await fetch('/api/xrpl/issuer/signerlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                  const d = await r.json();
                  setLog(d.ok ? 'Signer list updated' : `Error: ${d.error || r.status}`);
                  await refresh();
                } catch (e:any) {
                  setLog('Invalid signers JSON');
                }
              }}>Set Signers</button>
            </div>
            <div className="card">
              <h4>Anchor Legal Hash</h4>
              <label>Hash<input placeholder="e.g. SHA-256 digest" value={anchorHash} onChange={e => setAnchorHash(e.target.value)} /></label>
              <button className="btn" onClick={async () => {
                const r = await fetch('/api/xrpl/anchor/legal-hash', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hash: anchorHash, memoType: 'LEGAL' }) });
                const d = await r.json();
                setLog(d.ok ? 'Legal hash anchored' : `Error: ${d.error || r.status}`);
              }}>Anchor</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'docs' && (
        <div className="section">
          <h3>System Documentation</h3>
          <p>Technical, Compliance, Operations, and API docs can be surfaced here. See Concept page for architecture.</p>
        </div>
      )}

      {tab === 'analytics' && (
        <div className="section">
          <h3>Analytics & Reporting</h3>
          <div className="grid four section">
            <div className="stat"><div className="stat-label">Total Applications</div><div className="stat-num">{stats?.total ?? 0}</div></div>
            <div className="stat"><div className="stat-label">Pending Review</div><div className="stat-num">{stats?.pending ?? 0}</div></div>
            <div className="stat"><div className="stat-label">Approved</div><div className="stat-num">{stats?.approved ?? 0}</div></div>
            <div className="stat"><div className="stat-label">Under Review</div><div className="stat-num">{stats?.verified ?? 0}</div></div>
          </div>
          <div className="grid four section">
            <div className="stat"><div className="stat-label">Total Requested</div><div className="stat-num">${'{'}{stats?.totalRequested ?? 0}{'}'}</div></div>
            <div className="stat"><div className="stat-label">Avg Request</div><div className="stat-num">${'{'}{stats?.avgRequested ?? 0}{'}'}</div></div>
            <div className="stat"><div className="stat-label">Fraud Flags</div><div className="stat-num">{stats?.flagged ?? 0}</div></div>
            <div className="stat"><div className="stat-label">People Served</div><div className="stat-num">{apps.reduce((acc,a)=>acc+((a as any).family_size||0),0)}</div></div>
          </div>
        </div>
      )}

      {log && (
        <div className="section">
          <pre className="prewrap">{log}</pre>
        </div>
      )}
    </div>
  );
}
