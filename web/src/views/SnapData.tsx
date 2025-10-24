import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

type RecordRow = { state: string; persons: number; estimated_households: number };

type ApiResponse = {
  as_of: string;
  source: string;
  notes: string[];
  total_persons: number;
  avg_persons_per_household: number;
  records: RecordRow[];
};

export default function SnapData() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    api.get('/data/snap-persons').then((r) => setData(r.data));
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [] as RecordRow[];
    const needle = q.trim().toLowerCase();
    if (!needle) return data.records;
    return data.records.filter((r) => r.state.toLowerCase().includes(needle));
  }, [data, q]);

  if (!data) return <div className="page">Loading…</div>;

  const downloadCsv = () => {
    window.open('/api/data/snap-persons?format=csv', '_blank');
  };

  return (
    <div className="page">
      <h2>SNAP Participation by State</h2>
      <p>
        As of: {data.as_of} — Source: {data.source}
      </p>
      <ul>
        {data.notes.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>

      <div>
        <input
          placeholder="Filter by state"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={downloadCsv}>Download CSV</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>State/Territory</th>
            <th className="right">Persons</th>
            <th className="right">Estimated households</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.state}>
              <td>{r.state}</td>
              <td className="right">{r.persons.toLocaleString()}</td>
              <td className="right">{r.estimated_households.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        Total persons: <strong>{data.total_persons.toLocaleString()}</strong>
      </p>
    </div>
  );
}
