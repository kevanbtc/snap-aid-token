import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

type RecordRow = { state: string; status: 'unknown'|'normal'|'warning'|'on_hold'|'not_issuing'; last_confirmed: string|null; source: string };

type ApiResponse = { as_of: string; records: RecordRow[]; statuses: string[] };

export default function SnapStatus() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [q, setQ] = useState('');
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  useEffect(() => { api.get('/state-status').then(r => setData(r.data)); }, []);

  const filtered = useMemo(() => {
    if (!data) return [] as RecordRow[];
    let rows = data.records;
    if (onlyAlerts) rows = rows.filter(r => r.status !== 'normal' && r.status !== 'unknown');
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(r => r.state.toLowerCase().includes(needle));
  }, [data, q, onlyAlerts]);

  if (!data) return <div className="page">Loading…</div>;

  const downloadCsv = () => { window.open('/api/state-status?format=csv', '_blank'); };

  return (
    <div className="page">
      <h2>State Issuance Status</h2>
      <p>As of: {data.as_of}</p>
      <div>
        <input placeholder="Filter by state" value={q} onChange={e => setQ(e.target.value)} />
        <label className="ml-8">
          <input type="checkbox" checked={onlyAlerts} onChange={e => setOnlyAlerts(e.target.checked)} /> Alerts only
        </label>
        <button onClick={downloadCsv} className="ml-8">Download CSV</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>State/Territory</th>
            <th>Status</th>
            <th>Last confirmed</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.state}>
              <td>{r.state}</td>
              <td>{r.status}</td>
              <td>{r.last_confirmed || '-'}</td>
              <td>{r.source ? <a href={r.source} target="_blank" rel="noreferrer">link</a> : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
